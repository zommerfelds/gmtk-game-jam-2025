import "phaser";

class MyGame extends Phaser.Scene {
  private rocket: Phaser.Physics.Matter.Sprite;
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;

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
    this.anims.createFromAseprite("rocket");
    this.anims.createFromAseprite("island_ireland");

    this.cursors = this.input.keyboard.createCursorKeys();

    this.rocket = this.matter.add.sprite(400, 300, "rocket");
    this.rocket.setFrictionAir(0.02);
    this.rocket.setRectangle(this.rocket.width * 0.5, this.rocket.height * 0.8);
    this.rocket.setOrigin(0.5, 0.5);

    const island = this.matter.add.sprite(400, 380, "island_ireland");
    island.play({ key: "", repeat: -1 });
    island.setRectangle(island.width * 0.8, island.height * 0.3);
    island.setOrigin(0.5, 0.7);
    island.setStatic(true);

    this.cameras.main.startFollow(this.rocket);
  }

  update() {
    const torqueAmount = 0.01;
    const body = this.rocket.body as MatterJS.BodyType;
    if (this.cursors.left?.isDown) body.torque -= torqueAmount;
    else if (this.cursors.right?.isDown) body.torque += torqueAmount;

    const baseThrust = 0.0005;
    let thrustDir = 0;
    if (this.cursors.up?.isDown) {
      thrustDir = 1;
      this.rocket.play({ key: "Foreward", repeat: -1 }, true);
    } else if (this.cursors.down?.isDown) {
      thrustDir = -0.5; // half strength backwards
      this.rocket.play({ key: "Backward", repeat: -1 }, true);
    } else {
      this.rocket.play({ key: "Idle", repeat: -1 }, true);
    }

    if (thrustDir !== 0) {
      const f = baseThrust * thrustDir;
      const force = new Phaser.Math.Vector2(
        Math.cos(this.rocket.rotation - Math.PI / 2) * f,
        Math.sin(this.rocket.rotation - Math.PI / 2) * f
      );
      this.rocket.applyForce(force);
    }
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
