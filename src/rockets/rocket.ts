import "phaser";
import Vector2 = Phaser.Math.Vector2;
import Camera = Phaser.Cameras.Scene2D.Camera;
import { GoodsType } from "../islands/goods";
import { BodyType } from "matter";

export enum RocketControlType {
  /** Rockets that can move in multiple directions directly. */
  DIRECTIONAL,

  /** Rockets that need to rotate to move in different directions. */
  ROTATIONAL,
}

// Constructor for a rocket.
export type RocketClass = {
  new (
    scene: Phaser.Scene,
    initialX: number,
    initialY: number,
    onRocketDestroyed: (r: Rocket) => void,
  ): Rocket;
};

export interface Rocket {
  getRocketControlType(): RocketControlType;

  /**
   * Applies input based on the provided x and y values.
   * All Values are numbers between -1.0 and 1.0.
   *
   * @param {number} x - The value for the x-axis.
   * @param {number} y - The value for the y-axis.
   */
  applyInput(x: number, y: number, selfDestructKeyPressed?: boolean): void;

  applyAnimation(xInput: number, yInput: number): void;

  explode(): void;

  /**
   * Attempts to store the given good into the rocket. May fail if the rocket is already full.
   * @param {GoodsType} good - The good to store.
   * @return {boolean} Whether the good was stored.
   */
  tryStoreGood(good: GoodsType): boolean;

  /**
   * Attempts to take the given good from the rocket. May fail if the rocket doesn't have that good on board.
   * @param {GoodsType} good - The good to take.
   * @return {boolean} Whether the good was taken.
   */
  tryTakeGood(good: GoodsType): boolean;

  /**
   * Makes the specified camera follow this rocket.
   *
   * @param {Camera} camera - The camera that should follow the target.
   */
  followWithCamera(camera: Camera): void;

  /** Returns foot position (lowest point) of the rocket. */
  getFootPosition(): Vector2;

  getBody(): BodyType;

  getPosition(): Vector2;

  getRotation(): number;

  /** Explicitly sets the foot position with 0 rotation, removing any linear or rotational velocity. */
  setFootPositionZeroRotation(position: Vector2): void;

  /** Explicitly sets the position and rotation, removing any linear or rotational velocity. */
  setPositionAndRotation(position: Vector2, rotation: number): void;
}
