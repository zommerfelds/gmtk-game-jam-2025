import "phaser";
import * as Phaser from "phaser";
import Island from "./island";
import { Rocket } from "../rockets/rocket";
import { GoodsType } from "./goods";

export default class IslandSkull extends Island {

  private cycleSteps: number;
  private targetFramerate: number;
  private hasCactusCountdown = -1;
  private hasLavaCountdown = -1;

  constructor(scene: Phaser.Scene, initialX: number, initialY: number, cycleSteps: number, targetFramerate: number) {
    super(scene, initialX, initialY, "island_skull");
    this.cycleSteps = cycleSteps;
    this.targetFramerate = targetFramerate;
  }

  interactWithRocket(rocket: Rocket) {
    super.interactWithRocket(rocket);
    if (rocket.tryTakeGood(GoodsType.CACTUS)) {
      this.hasCactusCountdown = this.cycleSteps;
    }
    if (rocket.tryTakeGood(GoodsType.LAVA)) {
      this.hasLavaCountdown = this.cycleSteps;
    }
  }

  processCycleStep() {
    this.hasLavaCountdown = Math.max(-1, this.hasLavaCountdown - 1);
    this.hasCactusCountdown = Math.max(-1, this.hasCactusCountdown - 1);
  }

  isGoalToBeHappy(): boolean {
    return true;
  }

  isHappy(): boolean {
    return this.hasCactusCountdown > -1 && this.hasLavaCountdown > -1;
  }

  getDescriptionToBeHappy(): string {
    if (this.isHappy()) {
      const remainingTime =
        Math.min(this.hasCactusCountdown, this.hasLavaCountdown) / this.targetFramerate;
      return `Skull Island is happy! (still for ${remainingTime.toFixed(1)} seconds)`;
    }
    if (this.hasCactusCountdown > -1) {
      const remainingTime = (this.hasCactusCountdown / this.targetFramerate).toFixed(1);
      return `Skull Island wants Lava (still has Cactus for ${remainingTime} seconds)`;
    }
    if (this.hasLavaCountdown > -1) {
      const remainingTime = (this.hasLavaCountdown / this.targetFramerate).toFixed(1);
      return `Skull Island wants Cactus (still has Lava for ${remainingTime} seconds)`;
    }
    return "Skull Island wants Cactus and Lava";
  }
}
