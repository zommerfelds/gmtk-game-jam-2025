import "phaser";
import * as Phaser from "phaser";
import Island from "./island";
import { Rocket } from "../rockets/rocket";
import { GoodsType } from "./goods";

export default class IslandSkull extends Island {
    constructor(scene: Phaser.Scene, initialX: number, initialY: number) {
        super(scene, initialX, initialY, "island_skull")
    }

  interactWithRocket(rocket: Rocket) {
    super.interactWithRocket(rocket);
    rocket.tryTakeGood(GoodsType.CACTUS);
  }
}
