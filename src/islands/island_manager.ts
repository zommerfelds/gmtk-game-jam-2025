import "phaser";
import * as Phaser from "phaser";
import Island from "./island";
import IslandCacti from "./island_cacti";
import IslandDoom from "./island_doom";
import SpawnerIsland from "./island_spawner";
import { distancePointToSegment } from "../utils/geometry";
import { Rocket } from "../rockets/rocket";
import IslandSkull from "./island_skull";
import IslandCave from "./island_cave";

export default class IslandManager {
  private readonly islands: Island[];
  private readonly discoveredSpawnerIslands: Set<SpawnerIsland> = new Set();
  private readonly undiscoveredSpawnerIslands: Set<SpawnerIsland> = new Set();
  private selectedSpawnerIsland: SpawnerIsland;
  constructor(scene: Phaser.Scene) {
    const onSpawnerDiscovered = (spawner: SpawnerIsland) => {
      this.discoveredSpawnerIslands.add(spawner);
      this.undiscoveredSpawnerIslands.delete(spawner);
    };

    const spawnerIslands: SpawnerIsland[] = [
      new SpawnerIsland(scene, 400, 400, true, onSpawnerDiscovered),
      new SpawnerIsland(scene, 1200, 0, false, onSpawnerDiscovered),
    ];

    for (const sp of spawnerIslands) {
      if (sp.getIsDiscovered()) {
        this.discoveredSpawnerIslands.add(sp);
      } else {
        this.undiscoveredSpawnerIslands.add(sp);
      }
    }

    const firstDiscovered = this.discoveredSpawnerIslands.values().next().value as
      | SpawnerIsland
      | undefined;
    this.selectedSpawnerIsland = firstDiscovered ?? spawnerIslands[0];

    this.islands = [
      new IslandDoom(scene, 100, 500),
      new IslandCacti(scene, 300, 100),
      new IslandSkull(scene, 0, 0),
      new IslandCave(scene, 700, 300),
      new Island(scene, 1400, 200, "island_lake"),
      ...spawnerIslands,
    ];
  }

  getSelectedSpawnerIsland(): SpawnerIsland {
    return this.selectedSpawnerIsland;
  }

  selectNextSpawnerIsland() {
    const available = Array.from(this.discoveredSpawnerIslands);
    if (available.length === 0) return;

    const currentIndex = available.indexOf(this.selectedSpawnerIsland);
    const nextIndex = (currentIndex + 1) % available.length;
    this.selectedSpawnerIsland = available[nextIndex];
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
      if (!rocket.isLanded()) {
        landedIsland.interactWithRocket(rocket);
      }
      this.snapToIsland(rocket, landedIsland);
    }
  }

  private snapToIsland(rocket: Rocket, island: Island) {
    const [a, b] = island.getLandingLine();
    const midpoint = new Phaser.Math.Vector2((a.x + b.x) * 0.5, (a.y + b.y) * 0.5);
    rocket.finalizeLanding(midpoint, 0);
  }
}
