import "phaser";
import * as Phaser from "phaser";
import Island from "./island";

export default class IslandSkull extends Island {
    constructor(scene: Phaser.Scene, initialX: number, initialY: number) {
        super(scene, initialX, initialY, "island_skull")
    }
}
