import "phaser";
import * as Phaser from "phaser";
import Obstacle from "./obstacle";
import { GoodsType } from "../islands/goods";

export default class Sign extends Obstacle {
    constructor(scene: Phaser.Scene, initialX: number, initialY: number, good: GoodsType) {
        super(scene, initialX, initialY, "island_sign")
        scene.add.sprite(initialX, initialY + 15, good);
    }
}
