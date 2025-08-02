import "phaser";
import RecordedInput from "./recorded_input";
import Landable from "../game_objects/Landable";
import { Rocket, RocketControlType } from "./rocket";
import Vector2 = Phaser.Math.Vector2;
import RecordedRocket from "./recorded_rocket";
import Camera = Phaser.Cameras.Scene2D.Camera;

export default class PlayerRocket implements Landable {
  private rocket: Rocket;
  private recordedInputs: RecordedInput[];
  private mainCamera: Camera;
  private cycleSteps: number;

  constructor(rocket: Rocket, mainCamera: Camera, cycleSteps: number) {
    this.rocket = rocket;
    this.recordedInputs = [];
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
   */
  public applyInput(x: number, y: number) {
    this.rocket.applyInput(x, y);
    this.recordedInputs.push({ x, y });
  }

  public shouldFinishRecording(): boolean {
    return this.recordedInputs.length == this.cycleSteps;
  }

  /**
   * Completes the recording process and returns a RecordedRocket.
   *
   * @return {RecordedRocket} An instance of RecordedRocket containing the rocket and its recorded inputs.
   */
  public finishRecording(): RecordedRocket {
    this.mainCamera.stopFollow();
    return new RecordedRocket(this.rocket, this.recordedInputs);
  }

  public finalizeLanding(finalPosition: Vector2, finalRotation: number) {
    this.rocket.finalizeLanding(finalPosition, finalRotation);
  }

  public getFootPosition(): Vector2 {
    return this.rocket.getFootPosition();
  }
}
