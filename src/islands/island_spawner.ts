import "phaser";
import * as Phaser from "phaser";
import Island from "./island";
import { Rocket, RocketClass } from "../rockets/rocket";
import ReversibleRocket from "../rockets/reversible_rocket";
import OminRocket from "../rockets/omin_rocket";

export default class SpawnerIsland extends Island {
  private isDiscovered: boolean = false;
  private readonly scene: Phaser.Scene;
  private readonly text: Phaser.GameObjects.Text;
  private readonly onDiscovered?: (spawner: SpawnerIsland) => void;
  private readonly rocketClass: RocketClass;

  constructor(
    scene: Phaser.Scene,
    initialX: number,
    initialY: number,
    isDiscovered: boolean,
    onDiscovered: (spawner: SpawnerIsland) => void,
    rocketClass: RocketClass,
  ) {
    super(scene, initialX, initialY, "island_ireland");
    this.scene = scene;
    this.onDiscovered = onDiscovered;
    this.rocketClass = rocketClass;
    this.text = this.scene.add
      .text(initialX - 20, initialY + 15, "Land to activate")
      .setOrigin(0.5)
      .setAlign("center");

    if (isDiscovered) {
      this.discoverIsland();
    }
  }

  getIsDiscovered(): boolean {
    return this.isDiscovered;
  }

  interactWithRocket(rocket: Rocket) {
    super.interactWithRocket(rocket);
    this.discoverIsland();
  }

  discoverIsland() {
    if (this.isDiscovered) return;

    let spawnerName = "";
    switch (this.rocketClass) {
      case ReversibleRocket:
        spawnerName = "Turbo MR rocket";
        break;
      case OminRocket:
        spawnerName = "SLT rocket v3";
        break;
    }

    this.isDiscovered = true;
    this.text.setText(spawnerName + "\n- launcher -");

    if (this.onDiscovered) {
      this.onDiscovered(this);
    }
  }

  spawnRocket(onRocketDestroyed: (r: Rocket) => void): Rocket {
    return new this.rocketClass(
      this.scene,
      this.getSpawnPoint().x,
      this.getSpawnPoint().y,
      onRocketDestroyed,
    );
  }
}
