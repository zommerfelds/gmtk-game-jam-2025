import "phaser";
import RecordedState from "./recorded_state";
import Landable from "../game_objects/Landable";
import { Rocket, RocketControlType } from "./rocket";
import Vector2 = Phaser.Math.Vector2;
import RecordedRocket from "./recorded_rocket";
import Camera = Phaser.Cameras.Scene2D.Camera;

export default class PlayerRocketController implements Landable {
  private rocket: Rocket;
  private recordedStates: RecordedState[];
  private mainCamera: Camera;
  private cycleSteps: number;
  private idle = true;
  private landed = false;

  constructor(rocket: Rocket, mainCamera: Camera, cycleSteps: number) {
    this.rocket = rocket;
    this.recordedStates = [];
    this.mainCamera = mainCamera;
    this.cycleSteps = cycleSteps;

    this.rocket.followWithCamera(mainCamera);
  }

  public getRocketControlType(): RocketControlType {
    return this.rocket.getRocketControlType();
  }

  /**
   * Applies input based on the provided x and y values.
   * All Values are numbers between -1.0 and 1.0.
   *
   * @param {number} x - The value for the x-axis.
   * @param {number} y - The value for the y-axis.
   * @param {boolean} selfDestruct - Whether the rocket should destroy itself.
   */
  public applyInput(x: number, y: number, selfDestruct: boolean) {
    this.idle = x === 0 && y === 0;
    if (!this.idle) {
      this.landed = false;
    }
    this.rocket.applyInput(x, y, selfDestruct);
    if (!selfDestruct) {
      this.recordedStates.push({
        position: this.rocket.getPosition(),
        rotation: this.rocket.getRotation(),
        isLanded: this.landed,
        isReadyToLand: this.isReadyToLand(),
        inputX: x,
        inputY: y,
      });
    }
  }

  public shouldFinishRecording(): boolean {
    return this.recordedStates.length == this.cycleSteps;
  }

  public getRocket(): Rocket {
    return this.rocket;
  }

  /**
   * Completes the recording process and returns a RecordedRocket.
   *
   * @return {RecordedRocket} An instance of RecordedRocket containing the rocket and its recorded inputs.
   */
  public finishRecording(): RecordedRocket {
    this.mainCamera.stopFollow();
    return new RecordedRocket(this.rocket, this.recordedStates);
  }

  public isReadyToLand(): boolean {
    const body = this.getRocket().getBody();
    if (!body) return false;
    const linearSpeed = body.speed ?? 0;
    const angularSpeed = Math.abs(body.angularVelocity ?? 0);
    const stationary = linearSpeed < 0.05 && angularSpeed < 0.05;
    return stationary && this.idle;
  }

  public land() {
    this.landed = true;
  }

  public isLanded(): boolean {
    return this.landed;
  }

  public getFootPosition(): Vector2 {
    return this.rocket.getFootPosition();
  }
}
