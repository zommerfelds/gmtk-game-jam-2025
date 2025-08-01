import "phaser";
import RecordedInput from "./recorded_input";
import {Rocket} from "./rocket";
import Landable from "../game_objects/Landable";
import Vector2 = Phaser.Math.Vector2;

export default class RecordedRocket implements Landable {
  private rocket: Rocket;
  private recordedInputs: RecordedInput[];
  private currentRecordedInputIndex = 0;

  constructor(rocket: Rocket, recordedInputs: RecordedInput[]) {
    this.rocket = rocket;
    this.recordedInputs = recordedInputs;
  }

  public applyNextRecordedInput() {
    const nextRecordedInput = this.recordedInputs[this.currentRecordedInputIndex]
    this.rocket.applyInput(nextRecordedInput.x, nextRecordedInput.y);
    this.currentRecordedInputIndex += 1
    this.currentRecordedInputIndex %= this.recordedInputs.length;
  }

  public finalizeLanding(finalPosition: Vector2, finalRotation: number) {
    this.rocket.finalizeLanding(finalPosition, finalRotation);
  }
}