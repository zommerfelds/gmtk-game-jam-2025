import "phaser";
import RecordedState from "./recorded_state";
import { Rocket } from "./rocket";
import Landable from "../game_objects/Landable";

export default class RecordedRocketController implements Landable {
  private rocket: Rocket;
  private recordedStates: RecordedState[];
  private currentRecordedInputIndex = 0;

  constructor(rocket: Rocket, recordedStates: RecordedState[]) {
    this.rocket = rocket;
    this.recordedStates = recordedStates;
  }

  public advanceRecordedState() {
    this.currentRecordedInputIndex += 1;
    this.currentRecordedInputIndex %= this.recordedStates.length;

    const state = this.recordedStates[this.currentRecordedInputIndex];
    this.rocket.setPositionAndRotation(state.position, state.rotation);
  }

  public isLanded(): boolean {
    return this.recordedStates[this.currentRecordedInputIndex].isLanded;
  }

  public isReadyToLand(): boolean {
    return this.recordedStates[this.currentRecordedInputIndex].isReadyToLand;
  }

  public land() {
    // Do nothing.
  }

  public getRocket(): Rocket {
    return this.rocket;
  }
}
