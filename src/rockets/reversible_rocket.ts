import "phaser";
import { Rocket, RocketControlType } from "./rocket";
import { setPolygonBody } from "../utils/polygon_body";
import Vector2 = Phaser.Math.Vector2;
import * as Phaser from "phaser";
import CollisionStartEvent = Phaser.Physics.Matter.Events.CollisionStartEvent;

const MAX_TORQUE = 0.005;
const MAX_FORWARDS_ACCELERATION = 0.0005;
const MAX_BACKWARDS_ACCELERATION = 0.00025;

export default class ReversibleRocket implements Rocket {
  private sprite: Phaser.Physics.Matter.Sprite;
  private footLocal = new Phaser.Math.Vector2(0, 0);
  private isDestroyed = false;
  private linearVelocityAbs: number = 0;
  private angularVelocityAbs: number = 0;

  constructor(scene: Phaser.Scene, initialX: number, initialY: number, onRocketDestroyed: (r: Rocket) => void) {
    this.sprite = scene.matter.add.sprite(initialX, initialY, "rocket");
    scene.anims.createFromAseprite("rocket", undefined, this.sprite);

    const collisionShape = scene.cache.json.get("rocket_collision");
    setPolygonBody(this.sprite, collisionShape);
    this.sprite.setFrictionAir(0.02);
    this.sprite.setOrigin(0.5, 0.5);

    // Compute local foot position so it rotates with the sprite.
    const body = this.sprite.body as MatterJS.BodyType;
    if (body && body.vertices?.length) {
      let lowestVertex = body.vertices[0];
      for (const v of body.vertices) {
        if (v.y > lowestVertex.y) lowestVertex = v;
      }
      const local = this.sprite.getLocalPoint(lowestVertex.x, lowestVertex.y);
      this.footLocal.set(0, local.y - this.sprite.height * this.sprite.originY);
      this.sprite.setPosition(initialX - this.footLocal.x, initialY - this.footLocal.y);
    }

    body.label = "rocket";

    // Add collision detection
    scene.matter.world.on("collisionstart", (event: CollisionStartEvent) => {
      event.pairs.forEach((pair) => {
        const bodyA = pair.bodyA.parent;
        const bodyB = pair.bodyB.parent;
        if (bodyA.id == body.id || bodyB.id == body.id) {
          if (this.isDestroyed) {
            return;
          }
          let shouldExplode = false;
          if (bodyA.label == "rocket" && bodyB.label == "rocket") {
            // Two rockets colliding always explode each rocket.
            shouldExplode = true;
          } else {
            console.log("angular:", 15 * this.angularVelocityAbs, "linear", this.linearVelocityAbs);
            const combinedVelocity = 15 * this.angularVelocityAbs + this.linearVelocityAbs;
            if (combinedVelocity > 0.5) {
              shouldExplode = true;
            }
          }
          if (shouldExplode) {
            this.isDestroyed = true;
            // TODO: Play explosion animation.
            this.sprite.destroy(true);
            onRocketDestroyed(this);
          }
        }
      });
    });
  }

  public getRocketControlType(): RocketControlType {
    return RocketControlType.ROTATIONAL;
  }

  public applyInput(x: number, y: number) {
    const torqueInput = x;
    const accelerationInput = y;

    this.linearVelocityAbs = new Vector2(this.sprite.getVelocity()).length();
    this.angularVelocityAbs = Math.abs(this.sprite.getAngularVelocity());

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
    this.sprite.setPosition(finalPosition.x, finalPosition.y);
    this.sprite.setRotation(finalRotation);
  }

  public getFootPosition(): Vector2 {
    const rad = this.sprite.rotation;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    const worldX = this.sprite.x + this.footLocal.x * cos - this.footLocal.y * sin;
    const worldY = this.sprite.y + this.footLocal.x * sin + this.footLocal.y * cos;
    return new Phaser.Math.Vector2(worldX, worldY);
  }

  followWithCamera(camera: Phaser.Cameras.Scene2D.Camera) {
    camera.startFollow(this.sprite);
  }
}
