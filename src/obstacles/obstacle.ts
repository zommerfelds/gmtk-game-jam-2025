import "phaser";
import { setPolygonBody } from "../utils/polygon_body";
import * as Phaser from "phaser"

export default class Obstacle {
    private readonly sprite: Phaser.Physics.Matter.Sprite;

    constructor(scene: Phaser.Scene, initialX: number, initialY: number, name: string) {
        this.sprite = scene.matter.add.sprite(initialX, initialY, name);
        scene.anims.createFromAseprite(name, undefined, this.sprite);

        const collisionShape = scene.cache.json.get(`${name}_collision`);
        setPolygonBody(this.sprite, collisionShape);
        this.sprite.setStatic(true);
    }
}
