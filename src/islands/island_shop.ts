import "phaser";
import * as Phaser from "phaser";
import Island from "./island";
import { Rocket } from "../rockets/rocket";
import { GoodsType } from "./goods";
import { CYCLE_STEPS } from "../constants";

export enum ShopColor {
  RED = "red",
  BLUE = "blue",
}

export default class IslandShop extends Island {
  private good: GoodsType;
  private suppliedCountdown: number = -1;

  constructor(scene: Phaser.Scene, initialX: number, initialY: number, shopColor: ShopColor, good: GoodsType) {
    super(scene, initialX, initialY, `shop_${shopColor}`);
    this.good = good
    scene.add.sprite(initialX + 102, initialY - 87, good);
    this.getSprite().play({ key: "Closed", repeat: -1 });
  }

  interactWithRocket(rocket: Rocket) {
    super.interactWithRocket(rocket);
    if (rocket.tryTakeGood(this.good)) {
      this.getSprite().play({ key: "Open", repeat: -1 });
      this.suppliedCountdown = CYCLE_STEPS;
    }
  }

  processCycleStep() {
    this.suppliedCountdown = Math.max(-1, this.suppliedCountdown - 1);
    if (!this.isHappy()) {
      this.getSprite().play({ key: "Closed", repeat: -1 }, true);
    }
  }

  isGoalToBeHappy(): boolean {
    return true;
  }

  isHappy(): boolean {
    return this.suppliedCountdown > -1;
  }
}
