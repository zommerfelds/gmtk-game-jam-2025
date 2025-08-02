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
  private idle = true;
  private isDestroyed = false;
  private linearVelocityAbs: number = 0;
  private angularVelocityAbs: number = 0;

  constructor(
    scene: Phaser.Scene,
    initialX: number,
    initialY: number,
    onRocketDestroyed: (r: Rocket) => void,
  ) {
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
      event.pairs.forEach(pair => {
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
            if (combinedVelocity > 0.8) {
              shouldExplode = true;
            }
          }
          if (shouldExplode) {
            this.isDestroyed = true;
            const positionX = this.sprite.x;
            const positionY = this.sprite.y;
            this.sprite.destroy(true);

            // Play explosion animation.
            const explosion= scene.add.sprite(positionX, positionY, "effect_explosion");
            scene.anims.createFromAseprite("effect_explosion", undefined, explosion);
            explosion.play({ key: "Idle", repeat: 0 }, true);
            setTimeout(() => {
              explosion.destroy(true);
            }, 10_000);
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
    this.idle = x === 0 && y === 0;
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
    this.sprite.setPosition(finalPosition.x - this.footLocal.x, finalPosition.y - this.footLocal.y);
    this.sprite.setRotation(finalRotation);
    this.sprite.setVelocity(0, 0);
    this.sprite.setAngularVelocity(0);
    console.log("Landed!");
  }

  public getFootPosition(): Vector2 {
    const rad = this.sprite.rotation;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    const worldX = this.sprite.x + this.footLocal.x * cos - this.footLocal.y * sin;
    const worldY = this.sprite.y + this.footLocal.x * sin + this.footLocal.y * cos;
    return new Phaser.Math.Vector2(worldX, worldY);
  }

  public isStationary(): boolean {
    const body = this.sprite.body as MatterJS.BodyType;
    if (!body) return false;
    const linearSpeed = body.speed ?? 0;
    const angularSpeed = Math.abs(body.angularVelocity ?? 0);
    return linearSpeed < 0.01 && angularSpeed < 0.01;
  }

  public isIdle(): boolean {
    return this.idle;
  }

  followWithCamera(camera: Phaser.Cameras.Scene2D.Camera) {
    camera.startFollow(this.sprite);
  }
}
