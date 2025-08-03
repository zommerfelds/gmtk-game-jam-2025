import "phaser";
import * as Phaser from "phaser";
import Island from "./island";
import { Rocket } from "../rockets/rocket";
import { GoodsType } from "./goods";
import { CYCLE_STEPS, SCREEN_HEIGHT, SCREEN_WIDTH } from "../constants";

export default class IslandSkull extends Island {

  private scene: Phaser.Scene;
  private helpText?: Phaser.GameObjects.Text;
  private hasCactusCountdown = -1;
  private hasLavaCountdown = -1;
  private rocketPresent = false;

  private cactusStock: Phaser.GameObjects.Sprite;
  private lavaStock: Phaser.GameObjects.Sprite;

  constructor(scene: Phaser.Scene, initialX: number, initialY: number) {
    super(scene, initialX, initialY, "island_skull");
    this.scene = scene;

    this.lavaStock = scene.add.sprite(initialX - 85, initialY + 55, "island_stock");
    scene.anims.createFromAseprite("island_stock", undefined, this.lavaStock);
    this.lavaStock.play({ key: "0", repeat: -1 });

    const lava_icon = scene.add.sprite(initialX - 85, initialY + 78, "icon_lava");
    scene.anims.createFromAseprite("icon_lava", undefined, lava_icon);
    lava_icon.setScale(2);

    this.cactusStock = scene.add.sprite(initialX + 100, initialY + 5, "island_stock");
    scene.anims.createFromAseprite("island_stock", undefined, this.cactusStock);
    this.cactusStock.play({ key: "0", repeat: -1 });
    this.cactusStock.flipX = true;

    const cactus_icon = scene.add.sprite(initialX + 100, initialY + 28, "icon_cactus");
    scene.anims.createFromAseprite("icon_cactus", undefined, cactus_icon);
    cactus_icon.setScale(2);
  }

  interactWithRocket(rocket: Rocket, isPlayerRocket: boolean) {
    super.interactWithRocket(rocket, isPlayerRocket);
    if (rocket.tryTakeGood(GoodsType.CACTUS)) {
      this.hasCactusCountdown = CYCLE_STEPS;
    } else if (rocket.tryTakeGood(GoodsType.LAVA)) {
      this.hasLavaCountdown = CYCLE_STEPS;
    } else if (isPlayerRocket && !this.isHappy()) {
      if (!this.helpText) {
        const hasCactus = this.hasCactusCountdown > -1
        const hasLava = this.hasLavaCountdown > -1
        let text = "Hey! I'm out of cacti and lava!\nCould you create a supply loop for me?";
        if (hasCactus) {
          text = "Hey! I'm still missing lava!\nCould you create a supply loop for me?";
        } else if (hasLava) {
          text = "Hey! I'm still missing cacti!\nCould you create a supply loop for me?";
        }
        this.helpText = this.scene.add
          .text(SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2 - 100, text, {
            wordWrap: { width: 600 },
            fontSize: "20px",
            align: "center",
          })
          .setOrigin(0.5, 0.5)
          .setScrollFactor(0);
      }
    }
  }

  rocketStillOnIsland() {
    this.rocketPresent = true;
  }

  processCycleStep() {
    this.hasLavaCountdown = Math.max(-1, this.hasLavaCountdown - 1);
    this.hasCactusCountdown = Math.max(-1, this.hasCactusCountdown - 1);

    const lavaAnimationKey = Math.ceil((this.hasLavaCountdown / CYCLE_STEPS) * 10).toString();
    this.lavaStock.play({ key: lavaAnimationKey, repeat: -1 });

    const cactusAnimationKey = Math.ceil((this.hasCactusCountdown / CYCLE_STEPS) * 10).toString();
    this.cactusStock.play({ key: cactusAnimationKey, repeat: -1 });

    if (!this.rocketPresent) {
      this.helpText?.destroy();
      this.helpText = undefined;
    }
    this.rocketPresent = false;
  }

  isGoalToBeHappy(): boolean {
    return true;
  }

  isHappy(): boolean {
    return this.hasCactusCountdown > -1 && this.hasLavaCountdown > -1;
  }
}
