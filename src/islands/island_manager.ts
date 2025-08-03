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
import Landable from "../game_objects/Landable";
import OminRocket from "../rockets/omin_rocket";
import ReversibleRocket from "../rockets/reversible_rocket";
import IslandShop, { ShopColor } from "./island_shop";
import { GoodsType } from "./goods";

export default class IslandManager {
  private readonly islands: Island[];
  private readonly discoveredSpawnerIslands: Set<SpawnerIsland> = new Set();
  private readonly undiscoveredSpawnerIslands: Set<SpawnerIsland> = new Set();
  private selectedSpawnerIsland: SpawnerIsland;

  constructor(scene: Phaser.Scene, cycleSteps: number, targetFramerate: number) {
    const onSpawnerDiscovered = (spawner: SpawnerIsland) => {
      this.discoveredSpawnerIslands.add(spawner);
      this.undiscoveredSpawnerIslands.delete(spawner);
    };

    const spawnerIslands: SpawnerIsland[] = [
      new SpawnerIsland(scene, 400, 400, true, onSpawnerDiscovered, OminRocket),
      new SpawnerIsland(scene, 1200, 0, false, onSpawnerDiscovered, ReversibleRocket),
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
      new IslandSkull(scene, 0, 0, cycleSteps, targetFramerate),
      new IslandCave(scene, 700, 300),
      new Island(scene, 1400, 200, "island_lake"),
      new IslandShop(scene, 1400, 600, ShopColor.RED, GoodsType.CACTUS),
      new IslandShop(scene, -500, 300, ShopColor.BLUE, GoodsType.LAVA),
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

  checkLandingStatus(landable: Landable) {
    const TOLERANCE = 3;
    const footPos = landable.getRocket().getFootPosition();

    // Determine current island under rocket.
    let landingIsland: Island | undefined;
    for (const island of this.islands) {
      const [a, b] = island.getLandingLine();
      if (distancePointToSegment(footPos, a, b) < TOLERANCE) {
        landingIsland = island;
        break;
      }
    }

    if (landingIsland && landable.isReadyToLand()) {
      if (!landable.isLanded()) {
        landingIsland.interactWithRocket(landable.getRocket());
      }
      this.snapToIsland(landable.getRocket(), landingIsland);
    }
  }

  getOutstandingGoals(): string[] {
    return this.islands
      .filter(island => island.isGoalToBeHappy())
      .map(island => island.getDescriptionToBeHappy());
  }

  getNumHappyIslands(): number {
    return this.islands
      .filter(island => island.isGoalToBeHappy() && island.isHappy())
      .length;
  }

  processCycleStep() {
    this.islands.forEach(island => island.processCycleStep());
  }

  hasMultipleSpawners(): boolean {
    return this.discoveredSpawnerIslands.size > 1;
  }

  private snapToIsland(rocket: Rocket, island: Island) {
    const [a, b] = island.getLandingLine();
    const midpoint = new Phaser.Math.Vector2((a.x + b.x) * 0.5, (a.y + b.y) * 0.5);
    rocket.setFootPositionZeroRotation(midpoint);
  }
}
