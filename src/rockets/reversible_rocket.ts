import "phaser";
import {Rocket, RocketControlType} from "./rocket";
import Vector2 = Phaser.Math.Vector2;
import MatterPhysics = Phaser.Physics.Matter.MatterPhysics;
import AnimationManager = Phaser.Animations.AnimationManager;
import * as Phaser from "phaser";

const MAX_TORQUE = 0.01;
const MAX_FORWARDS_ACCELERATION = 0.0005
const MAX_BACKWARDS_ACCELERATION = 0.00025

export default class ReversibleRocket implements Rocket {
  private image: Phaser.Physics.Matter.Sprite;

  constructor(matter: MatterPhysics, anims: AnimationManager, initialX: number, initialY: number) {
    this.image = matter.add.sprite(initialX, initialY, "rocket");
    anims.createFromAseprite("rocket", undefined, this.image);
    this.image.setFrictionAir(0.02);
    this.image.setRectangle(this.image.width * 0.5, this.image.height * 0.8);
    this.image.setOrigin(0.5, 0.5);
  }

  public getRocketControlType(): RocketControlType {
    return RocketControlType.ROTATIONAL;
  }

  public applyInput(x: number, y: number) {
    const torqueInput = x;
    const accelerationInput = y;

    // Calculate torque and force.
    const appliedTorque = torqueInput * MAX_TORQUE
    const maxAcceleration =
      accelerationInput > 0 ? MAX_FORWARDS_ACCELERATION : MAX_BACKWARDS_ACCELERATION;
    const appliedAcceleration = accelerationInput * maxAcceleration;
    const appliedForce = new Phaser.Math.Vector2(
      Math.cos(this.image.rotation - Math.PI / 2) * appliedAcceleration,
      Math.sin(this.image.rotation - Math.PI / 2) * appliedAcceleration
    );

    // Apply torque and force.
    this.image.applyForce(appliedForce);
    const body = this.image.body as MatterJS.BodyType;
    body.torque += appliedTorque;

    if (appliedAcceleration > 0) {
      this.image.play({ key: "Foreward", repeat: -1 }, true);
    } else if (appliedAcceleration < 0) {
      this.image.play({ key: "Backward", repeat: -1 }, true);
    } else {
      this.image.play({ key: "Idle", repeat: -1 }, true);
    }
  }

  public finalizeLanding(finalPosition: Vector2, finalRotation: number) {
    // TODO
  }

  followWithCamera(camera: Phaser.Cameras.Scene2D.Camera) {
    camera.startFollow(this.image);
  }
}