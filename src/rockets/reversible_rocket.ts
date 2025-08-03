import "phaser";
import * as Phaser from "phaser";
import BaseRocket from "./base_rocket";
import { Rocket, RocketControlType } from "./rocket";

export default class ReversibleRocket extends BaseRocket {
  constructor(
    scene: Phaser.Scene,
    initialX: number,
    initialY: number,
    onRocketDestroyed: (r: Rocket) => void,
  ) {
    super(scene, initialX, initialY, "rocket", onRocketDestroyed);
  }

  public getRocketControlType(): RocketControlType {
    return RocketControlType.ROTATIONAL;
  }

  applyAnimation(xInput: number, yInput: number) {
    if (yInput > 0) {
      this.sprite.play({ key: "Foreward", repeat: -1 }, true);
    } else if (yInput < 0) {
      this.sprite.play({ key: "Backward", repeat: -1 }, true);
    } else {
      this.sprite.play({ key: "Idle", repeat: -1 }, true);
    }
  }
}
