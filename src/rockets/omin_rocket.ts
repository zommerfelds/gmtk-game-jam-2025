import "phaser";
import * as Phaser from "phaser";
import BaseRocket from "./base_rocket";
import { Rocket, RocketControlType } from "./rocket";
import { DRAW_PARTICLES } from "../constants";

export default class OminRocket extends BaseRocket {
  private particles?: Phaser.GameObjects.Particles.ParticleEmitter;

  constructor(
    scene: Phaser.Scene,
    initialX: number,
    initialY: number,
    onRocketDestroyed: (r: Rocket) => void,
  ) {
    super(scene, initialX, initialY, "rocket_omin", onRocketDestroyed);

    this.sprite.setFixedRotation();
    if (DRAW_PARTICLES) {
      this.particles = scene.add.particles(0, 0, "particle_smoke", {
        speed: { min: 20, max: 50 },
        angle: { min: 0, max: 360 },
        scale: { start: 0.2, end: 1 },
        alpha: { start: 1, end: 0 },
        blendMode: "ADD",
        lifespan: 800,
        gravityY: 0,
      });
      this.particles.startFollow(this.sprite);
      this.particles.stop();
    }
  }

  public getRocketControlType(): RocketControlType {
    return RocketControlType.DIRECTIONAL;
  }

  public destroy() {
    if (this.particles) {
      this.particles.destroy();
    }
    super.destroy();
  }

  applyAnimation(xInput: number, yInput: number) {
    let angle = 0;
    if (yInput > 0 && xInput > 0) {
      this.sprite.play({ key: "Up-Right", repeat: -1 }, true);
      angle = 315;
    } else if (yInput > 0 && xInput == 0) {
      this.sprite.play({ key: "Up", repeat: -1 }, true);
      angle = 270;
    } else if (yInput > 0 && xInput < 0) {
      this.sprite.play({ key: "Up-Left", repeat: -1 }, true);
      angle = 225;
    } else if (yInput == 0 && xInput > 0) {
      this.sprite.play({ key: "Right", repeat: -1 }, true);
      angle = 0;
    } else if (yInput == 0 && xInput == 0) {
      this.sprite.play({ key: "Idle", repeat: -1 }, true);
      if (this.particles) {
        this.particles.stop();
      }
      return;
    } else if (yInput == 0 && xInput < 0) {
      this.sprite.play({ key: "Left", repeat: -1 }, true);
      angle = 180;
    } else if (yInput < 0 && xInput > 0) {
      this.sprite.play({ key: "Down-Right", repeat: -1 }, true);
      angle = 45;
    } else if (yInput < 0 && xInput == 0) {
      this.sprite.play({ key: "Down", repeat: -1 }, true);
      angle = 90;
    } else if (yInput < 0 && xInput < 0) {
      this.sprite.play({ key: "Down-Left", repeat: -1 }, true);
      angle = 135;
    }
    if (this.particles) {
      this.particles.setConfig({
        angle: { min: angle - 30, max: angle + 30 },
      });
      this.particles.start();
    }
  }
}
