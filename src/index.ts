import "phaser";

class MyGame extends Phaser.Scene {
  private rocket: Phaser.Physics.Matter.Image;
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;

  constructor() {
    super();
  }

  preload() {
    this.load.path = "assets/";
    this.load.aseprite("rocket", "sprite_rocket.png", "sprite_rocket.json");
  }

  create() {
    this.cursors = this.input.keyboard.createCursorKeys();

    this.rocket = this.matter.add.image(400, 300, "rocket");
    this.rocket.setFrictionAir(0.02);
    this.rocket.setRectangle(this.rocket.width * 0.5, this.rocket.height * 0.8);
    this.rocket.setOrigin(0.5, 0.5);

    this.cameras.main.startFollow(this.rocket);

    const platform = this.add.rectangle(400, 580, 200, 20, 0xffffff);
    this.matter.add.gameObject(platform, { isStatic: true });
  }

  update() {
    const torqueAmount = 0.01;
    const body = this.rocket.body as MatterJS.BodyType;
    if (this.cursors.left?.isDown) body.torque -= torqueAmount;
    else if (this.cursors.right?.isDown) body.torque += torqueAmount;

    const baseThrust = 0.0005;
    let thrustDir = 0;
    if (this.cursors.up?.isDown) thrustDir = 1;
    else if (this.cursors.down?.isDown) thrustDir = -0.5; // half strength backwards

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
