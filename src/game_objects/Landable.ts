import "phaser";
import Vector2 = Phaser.Math.Vector2;

export default interface Landable {
  /**
   * Completes the landing process by setting the final position and rotation of the rocket.
   *
   * @param {Vector2} finalPosition The final position of the rocket.
   * @param {number} finalRotation The final rotation of the rocket.
   */
  finalizeLanding(finalPosition: Vector2, finalRotation: number): void;
}
