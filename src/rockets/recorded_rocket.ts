import "phaser";
import RecordedState from "./recorded_state";
import { Rocket } from "./rocket";
import Landable from "../game_objects/Landable";

export default class RecordedRocketController implements Landable {
  private rocket: Rocket;
  private recordedStates: RecordedState[];
  private currentRecordedInputIndex = 0;
  private landed = false;

  constructor(rocket: Rocket, recordedStates: RecordedState[]) {
    this.rocket = rocket;
    this.recordedStates = recordedStates;
  }

  public advanceRecordedState() {
    this.currentRecordedInputIndex += 1;
    this.currentRecordedInputIndex %= this.recordedStates.length;

    const state = this.recordedStates[this.currentRecordedInputIndex];
    this.rocket.setPositionAndRotation(state.position, state.rotation);
    this.rocket.applyAnimation(state.inputX, state.inputY);
    if (!state.isReadyToLand && this.landed) {
      this.landed = false;
    }
  }

  public isLanded(): boolean {
    return this.landed;
  }

  public isReadyToLand(): boolean {
    return this.recordedStates[this.currentRecordedInputIndex].isReadyToLand;
  }

  public land() {
    this.landed = true;
  }

  public getRocket(): Rocket {
    return this.rocket;
  }
}
