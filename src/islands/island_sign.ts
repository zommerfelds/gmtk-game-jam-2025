import "phaser";
import * as Phaser from "phaser";
import Island from "./island";
import { Rocket } from "../rockets/rocket";
import { GoodsType } from "./goods";

export default class IslandSign extends Island {
  private goods: GoodsType

  constructor(scene: Phaser.Scene, initialX: number, initialY: number, goods: GoodsType) {
    super(scene, initialX, initialY, "island_sign");
    this.goods = goods
  }
}
