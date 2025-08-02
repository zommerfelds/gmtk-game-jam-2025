import "phaser";
import * as Phaser from "phaser";
import Island from "./island";
import IslandCacti from "./island_cacti";
import IslandDoom from "./island_doom";
import IslandIreland from "./island_ireland";
import { distancePointToSegment } from "../utils/geometry";
import { Rocket } from "../rockets/rocket";

export default class IslandManager {
  private readonly islands: Island[];
  private readonly mainIsland: Island;
  private readonly lastLandedMap = new WeakMap<Rocket, Island>();
  private readonly candidateMap = new WeakMap<Rocket, { island: Island; elapsed: number }>();
  constructor(scene: Phaser.Scene) {
    this.mainIsland = new IslandIreland(scene, 400, 400);
    const island2 = new IslandDoom(scene, 100, 500);
    const island3 = new IslandIreland(scene, 600, 600);
    const island4 = new IslandCacti(scene, 300, 100);
    this.islands = [this.mainIsland, island2, island3, island4];
  }

  getMainIsland(): Island {
    return this.mainIsland;
  }

  checkLandingStatus(rocket: Rocket, deltaMs: number) {
    const TOLERANCE = 2;
    const LEAVE_DISTANCE = 50;
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

    const lastIsland = this.lastLandedMap.get(rocket);

    // If currently over landing line and stationary, consider snap after delay.
    if (landedIsland && rocket.isStationary()) {
      const candidate = this.candidateMap.get(rocket);
      if (!candidate || candidate.island !== landedIsland) {
        this.candidateMap.set(rocket, { island: landedIsland, elapsed: deltaMs });
      } else {
        candidate.elapsed += deltaMs;
        if (candidate.elapsed >= 500) {
          if (landedIsland !== lastIsland) {
            this.snapToIsland(rocket, landedIsland);
            this.lastLandedMap.set(rocket, landedIsland);
          }
          this.candidateMap.delete(rocket);
        } else {
          this.candidateMap.set(rocket, candidate);
        }
      }
    } else {
      // Not a landing candidate anymore
      this.candidateMap.delete(rocket);
    }

    if (!landedIsland && lastIsland) {
      const [a, b] = lastIsland.getLandingLine();
      if (distancePointToSegment(footPos, a, b) > LEAVE_DISTANCE) {
        this.lastLandedMap.delete(rocket);
      }
    }
  }

  private snapToIsland(rocket: Rocket, island: Island) {
    const [a, b] = island.getLandingLine();
    const midpoint = new Phaser.Math.Vector2((a.x + b.x) * 0.5, (a.y + b.y) * 0.5);
    rocket.finalizeLanding(midpoint, 0);
  }
}
