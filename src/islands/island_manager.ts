import "phaser";
import * as Phaser from "phaser";
import Island from "./island";
import IslandCacti from "./island_cacti";
import IslandDoom from "./island_doom";
import SpawnerIsland from "./island_ireland";
import { distancePointToSegment } from "../utils/geometry";
import { Rocket } from "../rockets/rocket";
import IslandSkull from "./island_skull";
import IslandCave from "./island_cave";

export default class IslandManager {
  private readonly islands: Island[];
  private readonly selectedSpawnerIsland: Island;
  constructor(scene: Phaser.Scene) {
    this.selectedSpawnerIsland = new SpawnerIsland(scene, 400, 400);
    const island2 = new IslandDoom(scene, 100, 500);
    const island3 = new SpawnerIsland(scene, 600, 600);
    const island4 = new IslandCacti(scene, 300, 100);
    const island5 = new IslandSkull(scene, 0, 0);
    const island6 = new IslandCave(scene, 700, 300);
    this.islands = [this.selectedSpawnerIsland, island2, island3, island4, island5, island6];
  }

  getSelectedSpawnerIsland(): Island {
    return this.selectedSpawnerIsland;
  }

  checkLandingStatus(rocket: Rocket, _deltaMs: number) {
    const TOLERANCE = 3;
    const footPos = rocket.getFootPosition();

    // Determine current island under rocket.
    let landedIsland: Island | undefined;
    for (const island of this.islands) {
      const [a, b] = island.getLandingLine();
      if (distancePointToSegment(footPos, a, b) < TOLERANCE) {
        landedIsland = island;
        break;
      }
    }

    if (landedIsland && rocket.isStationary() && rocket.isIdle()) {
      this.snapToIsland(rocket, landedIsland);
    }
  }

  private snapToIsland(rocket: Rocket, island: Island) {
    const [a, b] = island.getLandingLine();
    const midpoint = new Phaser.Math.Vector2((a.x + b.x) * 0.5, (a.y + b.y) * 0.5);
    rocket.finalizeLanding(midpoint, 0);
  }
}
