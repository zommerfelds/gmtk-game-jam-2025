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

  constructor(scene: Phaser.Scene, initialX: number, initialY: number) {
    super(scene, initialX, initialY, "island_skull");
    this.scene = scene;
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
