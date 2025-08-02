import "phaser";
import { Rocket, RocketControlType } from "./rocket";
import setPolygonBody from "../utils/set_polygon_body";
import Vector2 = Phaser.Math.Vector2;
import AnimationManager = Phaser.Animations.AnimationManager;
import * as Phaser from "phaser";

const MAX_TORQUE = 0.005;
const MAX_FORWARDS_ACCELERATION = 0.0005;
const MAX_BACKWARDS_ACCELERATION = 0.00025;

export default class ReversibleRocket implements Rocket {
  private sprite: Phaser.Physics.Matter.Sprite;

  constructor(scene: Phaser.Scene, initialX: number, initialY: number) {
    this.sprite = scene.matter.add.sprite(initialX, initialY, "rocket");
    scene.anims.createFromAseprite("rocket", undefined, this.sprite);

    const collisionShape = scene.cache.json.get("rocket_collision");
    setPolygonBody(this.sprite, collisionShape);
    this.sprite.setFrictionAir(0.02);
    this.sprite.setOrigin(0.5, 0.5);
  }

  public getRocketControlType(): RocketControlType {
    return RocketControlType.ROTATIONAL;
  }

  public applyInput(x: number, y: number) {
    const torqueInput = x;
    const accelerationInput = y;

    // Calculate torque and force.
    const appliedTorque = torqueInput * MAX_TORQUE;
    const maxAcceleration =
      accelerationInput > 0 ? MAX_FORWARDS_ACCELERATION : MAX_BACKWARDS_ACCELERATION;
    const appliedAcceleration = accelerationInput * maxAcceleration;
    const appliedForce = new Phaser.Math.Vector2(
      Math.cos(this.sprite.rotation - Math.PI / 2) * appliedAcceleration,
      Math.sin(this.sprite.rotation - Math.PI / 2) * appliedAcceleration,
    );

    // Apply torque and force.
    this.sprite.applyForce(appliedForce);
    const body = this.sprite.body as MatterJS.BodyType;
    body.torque += appliedTorque;

    if (appliedAcceleration > 0) {
      this.sprite.play({ key: "Foreward", repeat: -1 }, true);
    } else if (appliedAcceleration < 0) {
      this.sprite.play({ key: "Backward", repeat: -1 }, true);
    } else {
      this.sprite.play({ key: "Idle", repeat: -1 }, true);
    }
  }

  public finalizeLanding(finalPosition: Vector2, finalRotation: number) {
    // TODO
  }

  followWithCamera(camera: Phaser.Cameras.Scene2D.Camera) {
    camera.startFollow(this.sprite);
  }
}
