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

    this.sprite.setFixedRotation();
  }

  public getRocketControlType(): RocketControlType {
    return RocketControlType.DIRECTIONAL;
  }

  applyAnimation(xInput: number, yInput: number) {
    if (yInput > 0 && xInput > 0) {
      this.sprite.play({ key: "Up-Right", repeat: -1 }, true);
    } else if (yInput > 0 && xInput == 0) {
      this.sprite.play({ key: "Up", repeat: -1 }, true);
    } else if (yInput > 0 && xInput < 0) {
      this.sprite.play({ key: "Up-Left", repeat: -1 }, true);
    } else if (yInput == 0 && xInput > 0) {
      this.sprite.play({ key: "Right", repeat: -1 }, true);
    } else if (yInput == 0 && xInput == 0) {
      this.sprite.play({ key: "Idle", repeat: -1 }, true);
    } else if (yInput == 0 && xInput < 0) {
      this.sprite.play({ key: "Left", repeat: -1 }, true);
    } else if (yInput < 0 && xInput > 0) {
      this.sprite.play({ key: "Down-Right", repeat: -1 }, true);
    } else if (yInput < 0 && xInput == 0) {
      this.sprite.play({ key: "Down", repeat: -1 }, true);
    } else if (yInput < 0 && xInput < 0) {
      this.sprite.play({ key: "Down-Left", repeat: -1 }, true);
    }
  }

  protected updateGoodsSprite() {
    if (this.goodsSprite) {
      this.goodsSprite.setPosition(this.sprite.x, this.sprite.y + 5, this.sprite.z, this.sprite.w);
      this.goodsSprite.setRotation(this.sprite.rotation);
    }
  }
}
