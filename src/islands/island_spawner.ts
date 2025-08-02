import "phaser";
import * as Phaser from "phaser";
import Island from "./island";
import { Rocket } from "../rockets/rocket";

export default class SpawnerIsland extends Island {
  private isDiscovered: boolean = false;
  private readonly scene: Phaser.Scene;
  private readonly text: Phaser.GameObjects.Text;
  private readonly onDiscovered?: (spawner: SpawnerIsland) => void;

  constructor(
    scene: Phaser.Scene,
    initialX: number,
    initialY: number,
    isDiscovered: boolean,
    onDiscovered?: (spawner: SpawnerIsland) => void,
  ) {
    super(scene, initialX, initialY, "island_ireland");
    this.scene = scene;
    this.onDiscovered = onDiscovered;

    this.text = this.scene.add.text(initialX - 85, initialY + 5, "Land to activate");

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

    this.isDiscovered = true;
    this.text.setText("Spawner ready");

    if (this.onDiscovered) {
      this.onDiscovered(this);
    }
  }
}
