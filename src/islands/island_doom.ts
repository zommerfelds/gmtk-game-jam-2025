import "phaser";
import * as Phaser from "phaser";
import Island from "./island";
import { Rocket } from "../rockets/rocket";
import { GoodsType } from "./goods";
import Sign from "../obstacles/sign";

export default class IslandDoom extends Island {
  constructor(scene: Phaser.Scene, initialX: number, initialY: number) {
    super(scene, initialX, initialY, "island_doom");
    new Sign(scene, initialX, initialY + 86, GoodsType.LAVA)
  }

  interactWithRocket(rocket: Rocket) {
    super.interactWithRocket(rocket);
    rocket.tryStoreGood(GoodsType.LAVA);
  }
}
