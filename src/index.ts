import "phaser";
import PlayScene from "./play_scene";
import { SCREEN_HEIGHT, SCREEN_WIDTH, TARGET_FRAMERATE } from "./constants";

const config = {
  type: Phaser.AUTO,
  physics: {
    default: "matter",
    matter: {
      autoUpdate: false,
      gravity: { x: 0, y: 0.1 },
      // runner: {
      //   // Use fixed time step for reproducible physics. However this means that the speed of the game
      //   // will be tied to the frame rate.
      //   isFixed: true,
      //   fps: TARGET_FRAMERATE,
      // },
      // debug: true, // Uncomment to see physics shapes
    },
  },
  input: {
    gamepad: true,
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  width: SCREEN_WIDTH,
  height: SCREEN_HEIGHT,
  zoom: 5,
  pixelArt: true,
  antialias: false,
  autoRound: true,
  roundPixels: true,
  scene: PlayScene,
};

new Phaser.Game(config);
