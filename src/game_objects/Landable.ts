import "phaser";
import { Rocket } from "../rockets/rocket";

export default interface Landable {
  /** Returns true if this object is currently landed. */
  isLanded(): boolean;

  /** Returns true if the rocket is ready to land (stationary and idle). */
  isReadyToLand(): boolean;

  /** Changes the state to landed. */
  land(): void;

  getRocket(): Rocket;
}
