import "phaser";
import * as Phaser from "phaser";
import BaseRocket from "./base_rocket";
import { Rocket, RocketControlType } from "./rocket";

export default class OminRocket extends BaseRocket {
  constructor(
    scene: Phaser.Scene,
    initialX: number,
    initialY: number,
    onRocketDestroyed: (r: Rocket) => void,
  ) {
    super(scene, initialX, initialY, "rocket_omin", onRocketDestroyed);
  }

  public getRocketControlType(): RocketControlType {
    return RocketControlType.DIRECTIONAL;
  }
}
