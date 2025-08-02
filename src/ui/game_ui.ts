import "phaser";
import PlayerRocketController from "../rockets/player_rocket";
import Vector2Like = Phaser.Types.Math.Vector2Like;
import Text = Phaser.GameObjects.Text;

export default class GameUI {
  private cycleText: Text;
  private recordingText: Text;
  private returnToStartText: Text;
  private outstandingGoalsText: Text;

  constructor(scene: Phaser.Scene, private cycleSeconds: number, private targetFramerate: number) {
    this.cycleText = scene.add.text(5, 5, "").setScrollFactor(0);
    this.recordingText = scene.add.text(500, 5, "").setScrollFactor(0);
    this.returnToStartText = scene.add.text(5, 35, "").setScrollFactor(0);
    this.outstandingGoalsText = scene.add.text(5, 580, "").setScrollFactor(0);
  }

  update(
    currentCycleStep: number,
    playerRocket: PlayerRocketController | null,
    cycleWhenRecordingStarted: number,
    lastSpawnPoint: Vector2Like | null,
    outstandingGoals: string[],
  ) {
    this.cycleText.setText(
      `Current time in cycle: ${(currentCycleStep / this.targetFramerate).toFixed(1)}/${
        this.cycleSeconds
      }`,
    );

    this.recordingText.setText(
      playerRocket
        ? `Recording (started at ${(cycleWhenRecordingStarted / this.targetFramerate).toFixed(1)})`
        : `Press space to spawn a rocket\nPress tab to switch spawner`,
    );

    let returnMsg = "";
    if (playerRocket && lastSpawnPoint) {
      returnMsg =
        playerRocket.getFootPosition().distance(lastSpawnPoint) !== 0
          ? "Return to start before the loop ends!"
          : "All good, you're back at the start :)";
    }
    this.returnToStartText.setText(returnMsg);

    this.outstandingGoalsText.setText(outstandingGoals);
  }
}
