import "phaser";

class MyGame extends Phaser.Scene {
  constructor() {
    super();
  }

  preload() {
    this.load.path = "assets/";
    this.load.image("rocket", "sprite_rocket.png");
  }

  create() {
    const rocket = this.add.image(400, 300, "rocket");
  }
}

const config = {
  type: Phaser.AUTO,
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
