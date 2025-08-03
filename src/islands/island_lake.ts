import "phaser";
import * as Phaser from "phaser";
import Island from "./island";
import { Rocket } from "../rockets/rocket";
import { GoodsType } from "./goods";
import Sign from "../obstacles/sign";

export default class IslandLake extends Island {
  constructor(scene: Phaser.Scene, initialX: number, initialY: number) {
    super(scene, initialX, initialY, "island_lake");
    new Sign(scene, initialX, initialY + 66, GoodsType.WATER);
  }

  interactWithRocket(rocket: Rocket, isPlayerRocket: boolean) {
    super.interactWithRocket(rocket, isPlayerRocket);
    rocket.tryStoreGood(GoodsType.WATER);
  }
}
