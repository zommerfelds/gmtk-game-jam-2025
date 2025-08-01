import "phaser";
import PlayerRocket from "./rockets/player_rocket";
import ReversibleRocket from "./rockets/reversible_rocket";
import RecordedRocket from "./rockets/recorded_rocket";

class MyGame extends Phaser.Scene {
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private playerRocket?: PlayerRocket;
  private recordedRockets: RecordedRocket[];

  constructor() {
    super();
  }

  preload() {
    this.load.path = "assets/";
    this.load.aseprite("rocket", "sprite_rocket.png", "sprite_rocket.json");
    this.load.aseprite(
      "island_ireland",
      "sprite_island_ireland.png",
      "sprite_island_ireland.json"
    );
  }

  create() {
    this.cursors = this.input.keyboard.createCursorKeys();

    this.playerRocket = new PlayerRocket(
      new ReversibleRocket(this.matter, this.anims, 400, 300),
      this.cameras.main
    );

    const island = this.matter.add.sprite(400, 380, "island_ireland");
    this.anims.createFromAseprite("island_ireland", undefined, island);
    island.play({ key: "Idle", repeat: -1 });
    island.setRectangle(island.width * 0.8, island.height * 0.3);
    island.setOrigin(0.5, 0.7);
    island.setStatic(true);
  }

  update() {
    const yAxis = this.cursors.up?.isDown ? 1.0 : (this.cursors.down?.isDown ? -1.0 : 0);
    const xAxis = this.cursors.right?.isDown ? 1.0 : (this.cursors.left?.isDown ? -1.0 : 0);

    this.playerRocket.applyInput(xAxis, yAxis);
  }
}

const config = {
  type: Phaser.AUTO,
  physics: {
    default: "matter",
    matter: {
      gravity: { x: 0, y: 0 },
      runner: {
        // Use fixed time step for reproducible physics. However this means that the speed of the game
        // will be tied to the frame rate.
        isFixed: true,
        fps: 60,
      },
      // debug: true, // Uncomment to see physics shapes
    },
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  width: 800,
  height: 600,
  zoom: 5,
  pixelArt: true,
  antialias: false,
  autoRound: true,
  roundPixels: true,
  scene: MyGame,
};

const game = new Phaser.Game(config);
