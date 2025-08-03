import "phaser";
import * as Phaser from "phaser";
import Island from "./island";
import { Rocket } from "../rockets/rocket";
import { GoodsType } from "./goods";
import { SCREEN_HEIGHT, SCREEN_WIDTH } from "../constants";

export enum ShopColor {
  RED = "red",
  BLUE = "blue",
}

export default class IslandShop extends Island {
  private good: GoodsType;
  private scene: Phaser.Scene;
  private helpText?: Phaser.GameObjects.Text;

  constructor(
    scene: Phaser.Scene,
    initialX: number,
    initialY: number,
    shopColor: ShopColor,
    good: GoodsType,
  ) {
    super(scene, initialX, initialY, `shop_${shopColor}`);
    this.scene = scene;
    this.good = good;
    scene.add.sprite(initialX + 102, initialY - 87, good);
    this.getSprite().play({ key: "Closed", repeat: -1 });
  }

  interactWithRocket(rocket: Rocket) {
    super.interactWithRocket(rocket);
    if (rocket.tryTakeGood(this.good)) {
      this.getSprite().play({ key: "Open", repeat: -1 });
    } else {
      // TODO: currently this is shown for all rockets, even recorded rockets.
      if (!this.helpText) {
        const text = `Hey! I'm out of ${this.getGoodName()}!\nCould you create a supply loop for me?`;
        this.helpText = this.scene.add
          .text(SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2 - 100, text, {
            wordWrap: { width: 600 },
            fontSize: "20px",
            align: "center",
          })
          .setOrigin(0.5, 0.5)
          .setScrollFactor(0);

        setTimeout(() => {
          this.helpText?.destroy();
          this.helpText = undefined;
        }, 6000);
      }
    }
  }

  getGoodName(): string {
    switch (this.good) {
      case GoodsType.CACTUS:
        return "cactus";
      case GoodsType.LAVA:
        return "lava";
      case GoodsType.WATER:
        return "water";
      case GoodsType.NONE:
        return "none";
    }
  }
}
