import "phaser";
import Vector2 = Phaser.Math.Vector2;
import { RocketControlType } from "../rockets/rocket";

export default class InputHandler {
  private scene: Phaser.Scene;
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private tabKey: Phaser.Input.Keyboard.Key;

  private rocketRotationalInput = new Vector2();
  private rocketDirectionalInput = new Vector2();
  private cameraInput = new Vector2();

  private primaryJustDown = false;
  private tabJustDown = false;

  private prevPrimaryPressed = false;
  private prevRightTriggerPressed = false;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.cursors = scene.input.keyboard.createCursorKeys();
    this.tabKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TAB);
  }

  update() {
    const pad = this.scene.input.gamepad?.total ? this.scene.input.gamepad.getPad(0) : null;
    const joystickThreshold = 0.1;

    const yAxisKeyboard = this.cursors.up?.isDown ? 1.0 : this.cursors.down?.isDown ? -1.0 : 0;
    const xAxisKeyboard = this.cursors.right?.isDown ? 1.0 : this.cursors.left?.isDown ? -1.0 : 0;

    let yAxisJoystick = 0;
    let xAxisJoystick = 0;
    let triggerAxisGamepad = 0;
    let rightTriggerPressed = false;
    let primaryPressed = this.cursors.space?.isDown ?? false;

    if (pad) {
      const axisX = pad.axes.length > 0 ? pad.axes[0].getValue() : 0;
      if (Math.abs(axisX) > joystickThreshold) xAxisJoystick = axisX;

      const axisY = pad.axes.length > 1 ? pad.axes[1].getValue() : 0;
      if (Math.abs(axisY) > joystickThreshold) yAxisJoystick = -axisY;

      if (pad.buttons.length > 6 && pad.buttons[6].value > joystickThreshold) {
        triggerAxisGamepad = -1.0;
      } else if (pad.buttons.length > 7 && pad.buttons[7].value > joystickThreshold) {
        triggerAxisGamepad = 1.0;
      }

      rightTriggerPressed = pad.buttons.length > 7 && pad.buttons[7].value > joystickThreshold;
      primaryPressed = primaryPressed || (pad.buttons.length > 0 && pad.buttons[0].pressed);
    }

    this.rocketRotationalInput.set(
      xAxisJoystick !== 0 ? xAxisJoystick : xAxisKeyboard,
      triggerAxisGamepad !== 0 ? triggerAxisGamepad : yAxisKeyboard,
    );
    this.rocketDirectionalInput.set(
      xAxisJoystick !== 0 ? xAxisJoystick : xAxisKeyboard,
      yAxisJoystick !== 0 ? yAxisJoystick : yAxisKeyboard,
    );

    this.cameraInput.set(
      xAxisJoystick !== 0 ? xAxisJoystick : xAxisKeyboard,
      yAxisJoystick !== 0 ? yAxisJoystick : yAxisKeyboard,
    );

    this.primaryJustDown = primaryPressed && !this.prevPrimaryPressed;
    this.prevPrimaryPressed = primaryPressed;

    const tabKeyJustDown = Phaser.Input.Keyboard.JustDown(this.tabKey);
    this.tabJustDown = tabKeyJustDown || (rightTriggerPressed && !this.prevRightTriggerPressed);
    this.prevRightTriggerPressed = rightTriggerPressed;
  }

  getRocketControlInput(controlType: RocketControlType): Vector2 {
    return controlType === RocketControlType.ROTATIONAL
      ? this.rocketRotationalInput.clone()
      : this.rocketDirectionalInput.clone();
  }

  getCameraControlInput(): Vector2 {
    return this.cameraInput.clone();
  }

  isPrimaryActionButtonJustDown(): boolean {
    return this.primaryJustDown;
  }

  isTabButtonJustDown(): boolean {
    return this.tabJustDown;
  }
}
