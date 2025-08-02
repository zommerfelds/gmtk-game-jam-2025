import "phaser";
import { setPolygonBody, getLandingLine } from "../utils/polygon_body";
import Vector2 = Phaser.Math.Vector2;
import * as Phaser from "phaser";

export default class Island {
    private sprite: Phaser.Physics.Matter.Sprite;
    private landingLine: Vector2[]
    private spawnPoint: Vector2

    constructor(scene: Phaser.Scene, initialX: number, initialY: number, name: string) {
        this.sprite = scene.matter.add.sprite(initialX, initialY, name);
        scene.anims.createFromAseprite(name, undefined, this.sprite);

        const collisionShape = scene.cache.json.get(`${name}_collision`);
        setPolygonBody(this.sprite, collisionShape);
        this.sprite.setStatic(true);
        this.landingLine = getLandingLine(collisionShape).map(
            l =>
                new Phaser.Math.Vector2(
                    l.x + this.sprite.x - this.sprite.width * this.sprite.originX,
                    l.y + this.sprite.y - this.sprite.height * this.sprite.originY,
                ),
        );
        const spawn = this.landingLine[0].add(this.landingLine[1]).scale(0.5);
        this.spawnPoint = new Phaser.Math.Vector2(
            spawn.x + this.sprite.x - this.sprite.width * this.sprite.originX,
            spawn.y + this.sprite.y - this.sprite.height * this.sprite.originY,
        )

        this.sprite.play({ key: "Idle", repeat: -1 });
    }

    getLandingLine(): Vector2[] {
        return this.landingLine
    }

    getSpawnPoint(): Vector2 {
        return this.spawnPoint
    }
}
