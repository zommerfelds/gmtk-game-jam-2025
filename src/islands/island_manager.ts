import "phaser";
import * as Phaser from "phaser";
import Island from "./island";
import IslandIreland from "./island_ireland";
import { distancePointToSegment } from "../utils/geometry";

interface RocketLike {
  getFootPosition(): Phaser.Math.Vector2;
}

export default class IslandManager {
  private readonly islands: Island[];
  private readonly mainIsland: Island;

  constructor(scene: Phaser.Scene) {
    this.mainIsland = new IslandIreland(scene, 400, 400);
    const island2 = new IslandIreland(scene, 200, 600);
    const island3 = new IslandIreland(scene, 600, 600);
    this.islands = [this.mainIsland, island2, island3];
  }

  getMainIsland(): Island {
    return this.mainIsland;
  }

  checkLandingStatus(rocket: RocketLike): boolean {
    const TOLERANCE = 3;
    const footPos = rocket.getFootPosition();
    return this.islands.some(island => {
      const [a, b] = island.getLandingLine();
      return distancePointToSegment(footPos, a, b) < TOLERANCE;
    });
  }
}
