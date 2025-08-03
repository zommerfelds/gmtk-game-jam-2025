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
import Obstacle from "../obstacles/obstacle";
import IslandLake from "./island_lake";

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
      new SpawnerIsland(scene, 400, 400, true, onSpawnerDiscovered, OminRocket),
      new SpawnerIsland(scene, 1500, 0, false, onSpawnerDiscovered, ReversibleRocket),
    ];

    scene.add.text(-300, 200, "<- shop this way");

    new Obstacle(scene, -100, 500, "obstacle_meteor", 0);
    new Obstacle(scene, 0, 200, "obstacle_meteor", 30);
    new Obstacle(scene, -200, 400, "obstacle_meteor", 150);
    new Obstacle(scene, -215, 555, "obstacle_meteor", 220);

    new Obstacle(scene, 1900, 500, "obstacle_meteor", 0);
    new Obstacle(scene, 2000, 200, "obstacle_meteor", 30);
    new Obstacle(scene, 1800, 400, "obstacle_meteor", 150);
    new Obstacle(scene, 1815, 555, "obstacle_meteor", 220);

    this.islands = [
      new IslandCacti(scene, 1100, 100),
      new IslandShop(
        scene,
        800,
        500,
        ShopColor.RED,
        GoodsType.CACTUS,
        "There is a farm just above here.",
      ),
      new IslandShop(scene, 1800, 600, ShopColor.RED, GoodsType.CACTUS),
      new IslandShop(scene, 1900, -600, ShopColor.RED, GoodsType.CACTUS),
      new IslandShop(scene, -100, 1300, ShopColor.RED, GoodsType.WATER),
      new IslandShop(scene, 1000, -200, ShopColor.RED, GoodsType.WATER),
      new IslandDoom(scene, 100, -500),
      new IslandSkull(scene, -600, 1000),
      // new IslandCave(scene, 700, 300),
      new IslandLake(scene, 1400, 1200),
      new IslandShop(scene, -800, 300, ShopColor.BLUE, GoodsType.LAVA),
      new IslandShop(scene, 1200, 900, ShopColor.BLUE, GoodsType.LAVA),
      new IslandShop(scene, 700, -900, ShopColor.BLUE, GoodsType.LAVA),
      new IslandShop(scene, -200, 1000, ShopColor.BLUE, GoodsType.LAVA),
      ...spawnerIslands,
    ];

    new Obstacle(scene, 500, 1500, "obstacle_meteor", 0);
    new Obstacle(scene, 500, 1200, "obstacle_meteor", 30);
    new Obstacle(scene, 700, 1400, "obstacle_meteor", 150);
    new Obstacle(scene, 615, 1555, "obstacle_meteor", 220);

    const numObstacles = 1000;
    for (let i = 0; i < numObstacles; i++) {
      const angle = (i * 2 * Math.PI) / numObstacles;
      const radius = 2100;
      const hash = Math.sin(i * 12345.6789) * 10000;
      const noiseRadius = (hash % 200) - 100;
      const x = 600 + Math.cos(angle) * (radius + noiseRadius);
      const y = 200 + Math.sin(angle) * (radius + noiseRadius);
      new Obstacle(scene, x, y, "obstacle_meteor", (i * 33) % 360);
    }

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

  checkLandingStatus(landable: Landable, isPlayerRocket: boolean) {
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
        landable.land();
        landingIsland.interactWithRocket(landable.getRocket(), isPlayerRocket);
      }
      this.snapToIsland(landable.getRocket(), landingIsland);
      landingIsland.rocketStillOnIsland();
    }
  }

  getNumHappyIslands(): number {
    return this.islands.filter(island => island.isGoalToBeHappy() && island.isHappy()).length;
  }

  getNumIslandsToMakeHappy(): number {
    return this.islands.filter(island => island.isGoalToBeHappy()).length;
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
