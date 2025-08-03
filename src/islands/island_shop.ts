import "phaser";
import * as Phaser from "phaser";
import Island from "./island";
import { Rocket } from "../rockets/rocket";
import { GoodsType } from "./goods";

export enum ShopColor {
    RED = "red",
    BLUE = "blue",
}

export default class IslandShop extends Island {
    private good: GoodsType

    constructor(scene: Phaser.Scene, initialX: number, initialY: number, shopColor: ShopColor, good: GoodsType) {
        super(scene, initialX, initialY, `shop_${shopColor}`);
        this.good = good
        scene.add.sprite(initialX + 102, initialY - 87, good);
        this.getSprite().play({ key: "Closed", repeat: -1 });
    }

    interactWithRocket(rocket: Rocket) {
        super.interactWithRocket(rocket);
        if (rocket.tryTakeGood(this.good)) {
            this.getSprite().play({ key: "Open", repeat: -1 });
        }
    }
}
