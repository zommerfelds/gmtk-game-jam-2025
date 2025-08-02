import "phaser";
import * as Phaser from "phaser";
import Island from "./island";

export default class SpawnerIsland extends Island {
  private isDiscovered: boolean;
  private scene: Phaser.Scene;
  private text: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, initialX: number, initialY: number, isDiscovered: boolean) {
    super(scene, initialX, initialY, "island_ireland");
    this.scene = scene;

    this.text = this.scene.add.text(initialX - 85, initialY + 5, "Land to activate");
    if (isDiscovered) {
      this.discoverIsland();
    }
  }

  getIsDiscovered(): boolean {
    return this.isDiscovered;
  }

  discoverIsland() {
    if (this.isDiscovered) {
      return;
    }
    this.isDiscovered = true;
    this.text.setText("Spawner ready");
  }
}
