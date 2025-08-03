import Vector2 = Phaser.Math.Vector2;

export default interface RecordedState {
  position: Vector2;
  rotation: number;
  isReadyToLand: boolean;
  isLanded: boolean;
  inputX: number; // Just for animations.
  inputY: number; // Just for animations.
}
