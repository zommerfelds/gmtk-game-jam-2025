import "phaser";
import * as Phaser from "phaser";
import Island from "./island";
import { Rocket } from "../rockets/rocket";
import { GoodsType } from "./goods";

export default class CaptureFlag {
    private sprite: Phaser.GameObjects.Sprite
    private captured: boolean

    constructor(scene: Phaser.Scene, initialX: number, initialY: number, captured: boolean) {
        this.sprite = scene.add.sprite(initialX, initialY, "flag_green");
        scene.anims.createFromAseprite("flag_green", undefined, this.sprite);
        this.captured = captured
        this.sprite.play({ key: captured ? "Captured" : "Uncaptured", repeat: -1 });
    }

    capture() {
        if (this.captured) {
            return;
        }

        this.captured = true
        this.sprite.play({ key: "Capture", repeat: 0 });
    }

    getSprite() {
        return this.sprite
    }
}
