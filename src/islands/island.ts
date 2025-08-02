import "phaser";
import { setPolygonBody, getLandingLine } from "../utils/polygon_body";
import Vector2 = Phaser.Math.Vector2;
import * as Phaser from "phaser";
import { Rocket } from "../rockets/rocket";

export default class Island {
  private readonly sprite: Phaser.Physics.Matter.Sprite;
  private readonly landingLine: Vector2[]
  private readonly spawnPoint: Vector2

  constructor(scene: Phaser.Scene, initialX: number, initialY: number, name: string) {
    this.sprite = scene.matter.add.sprite(initialX, initialY, name);
    scene.anims.createFromAseprite(name, undefined, this.sprite);

    const collisionShape = scene.cache.json.get(`${name}_collision`);
    setPolygonBody(this.sprite, collisionShape);
    this.sprite.setStatic(true);
    this.landingLine = getLandingLine(collisionShape).map(
      l =>
        new Vector2(
          l.x + this.sprite.x - this.sprite.width * this.sprite.originX,
          l.y + this.sprite.y - this.sprite.height * this.sprite.originY,
        ),
    );
    this.spawnPoint = this.landingLine[0].clone().add(this.landingLine[1]).scale(0.5);

    this.sprite.play({ key: "Idle", repeat: -1 });
  }

  getLandingLine(): Vector2[] {
    return this.landingLine
  }

  getSpawnPoint(): Vector2 {
    return this.spawnPoint
  }

  interactWithRocket(rocket: Rocket) {
    console.log("Just landed!");
    // Do nothing by default. This should be overwritten by specific islands.
  }
}
