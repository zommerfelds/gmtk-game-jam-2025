import "phaser";
import Vector2 = Phaser.Math.Vector2;
import Landable from "../game_objects/Landable";
import Camera = Phaser.Cameras.Scene2D.Camera;
import { GoodsType } from "../islands/goods";

export enum RocketControlType {
  /** Rockets that can move in multiple directions directly. */
  DIRECTIONAL,

  /** Rockets that need to rotate to move in different directions. */
  ROTATIONAL,
}

export interface Rocket extends Landable {
  getRocketControlType(): RocketControlType;

  /**
   * Applies input based on the provided x and y values.
   * All Values are numbers between -1.0 and 1.0.
   *
   * @param {number} x - The value for the x-axis.
   * @param {number} y - The value for the y-axis.
   */
  applyInput(x: number, y: number, selfDestructKeyPressed?: boolean): void;

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
  /** Returns true if the rocket's linear and angular velocity are near zero. */
  isStationary(): boolean;
  /** Returns true if no player input occurred this frame. */
  isIdle(): boolean;
}
