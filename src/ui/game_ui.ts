import "phaser";
import PlayerRocketController from "../rockets/player_rocket";
import Vector2Like = Phaser.Types.Math.Vector2Like;
import Text = Phaser.GameObjects.Text;
import Arc = Phaser.GameObjects.Arc;
import Image = Phaser.GameObjects.Image;
import { CYCLE_SECONDS, CYCLE_STEPS, TARGET_FRAMERATE } from "../constants";

export default class GameUI {
  private recordingText: Text;
  private returnToStartText: Text;
  private outstandingGoalsText: Text;
  private watchBody: Image;
  private watchArrow: Image;
  private recordingStartMarker: Arc;
  private instructionText: Text;

  constructor(scene: Phaser.Scene) {
    this.recordingText = scene.add
      .text(500, 5, "", { wordWrap: { width: 400 } })
      .setScrollFactor(0);
    this.returnToStartText = scene.add
      .text(5, 145, "", { wordWrap: { width: 160 }, align: "center" })
      .setScrollFactor(0);
    this.outstandingGoalsText = scene.add
      .text(5, 560, "", { wordWrap: { width: 800 } })
      .setScrollFactor(0);
    this.watchBody = scene.add.image(70, 70, "watch_body").setScrollFactor(0);
    this.watchArrow = scene.add.image(70, 70, "watch_arrow").setScrollFactor(0);

    const cam = scene.cameras.main;
    this.instructionText = scene.add
      .text(cam.centerX, cam.centerY - 120, "", { align: "center", fontSize: "24px" })
      .setOrigin(0.5)
      .setScrollFactor(0);
    this.recordingStartMarker = scene.add.circle(70, 70, 6, 0xff0000).setScrollFactor(0);
    this.recordingStartMarker.setVisible(false);
  }

  update(
    currentCycleStep: number,
    playerRocket: PlayerRocketController | null,
    cycleWhenRecordingStarted: number,
    lastSpawnPoint: Vector2Like | null,
    outstandingGoals: string[],
    hasMultipleSpawners: boolean,
  ) {
    this.recordingText.setText(playerRocket ? `Recording` : "");

    let returnMsg = "";
    if (
      playerRocket &&
      lastSpawnPoint &&
      playerRocket.getFootPosition().distance(lastSpawnPoint) !== 0
    ) {
      returnMsg = "Return to the start before the loop ends!";
    }
    this.returnToStartText.setText(returnMsg);

    const fractionOfCycle = currentCycleStep / TARGET_FRAMERATE / CYCLE_SECONDS;
    this.outstandingGoalsText.setText(outstandingGoals);
    this.watchArrow.setRotation(fractionOfCycle * Math.PI * 2);

    // Handle center instruction text
    this.instructionText.setText(
      playerRocket
        ? ""
        : `Press space to spawn a rocket${
            hasMultipleSpawners ? "\nPress tab to switch spawner" : ""
          }`,
    );
    if (playerRocket) {
      const blink = Math.floor(currentCycleStep / (TARGET_FRAMERATE / 2)) % 2 === 0;
      this.recordingText.setVisible(blink);
    } else {
      this.recordingText.setVisible(true);
    }
    if (playerRocket) {
      const recordingFraction = cycleWhenRecordingStarted / TARGET_FRAMERATE / CYCLE_SECONDS;
      const angle = recordingFraction * Math.PI * 2 - Math.PI / 2;
      const r = 50;
      const cx = this.watchBody.x;
      const cy = this.watchBody.y;
      this.recordingStartMarker.setPosition(cx + Math.cos(angle) * r, cy + Math.sin(angle) * r);
      this.recordingStartMarker.setVisible(true);
    } else {
      this.recordingStartMarker.setVisible(false);
    }
  }
}
