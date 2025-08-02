import "phaser";
import * as Phaser from "phaser";
import Island from "./island";

export default class IslandCacti extends Island {
    constructor(scene: Phaser.Scene, initialX: number, initialY: number) {
        super(scene, initialX, initialY, "island_cacti")
    }
}
