import "phaser";
import PlayerRocketController from "../rockets/player_rocket";
import Vector2Like = Phaser.Types.Math.Vector2Like;
import Text = Phaser.GameObjects.Text;
import Arc = Phaser.GameObjects.Arc;
import Image = Phaser.GameObjects.Image;
import {
  CYCLE_SECONDS,
  CYCLE_STEPS,
  SCREEN_HEIGHT,
  SCREEN_WIDTH,
  TARGET_FRAMERATE,
} from "../constants";

export default class GameUI {
  private recordingText: Text;
  private watchBody: Image;
  private watchArrow: Image;
  private recordingStartMarker: Arc;
  private instructionText: Text;
  private objectiveText: Text;
  private rocketCountText: Text;
  private scene: Phaser.Scene;

  private hasWon = false;
  private stepsLeftToWin = -1;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;

    this.addPanel(0, SCREEN_HEIGHT - 60, SCREEN_WIDTH, 60);
    this.instructionText = scene.add
      .text(15, SCREEN_HEIGHT - 48, "", { lineSpacing: 5 })
      .setScrollFactor(0)
      .setDepth(100);
    this.rocketCountText = scene.add
      .text(SCREEN_WIDTH - 300, SCREEN_HEIGHT - 48, "", {})
      .setScrollFactor(0)
      .setDepth(100);

    this.watchBody = scene.add
      .image(SCREEN_WIDTH - 80, SCREEN_HEIGHT - 80, "watch_body")
      .setScrollFactor(0)
      .setDepth(100);
    this.watchArrow = scene.add
      .image(SCREEN_WIDTH - 80, SCREEN_HEIGHT - 80, "watch_arrow")
      .setScrollFactor(0)
      .setDepth(100);
    this.recordingStartMarker = scene.add
      .circle(0, 0, 6, 0xff0000)
      .setScrollFactor(0)
      .setDepth(100);
    this.recordingStartMarker.setVisible(false);

    this.recordingText = scene.add
      .text(SCREEN_WIDTH - 15, 5, "", { wordWrap: { width: 400 }, align: "right" })
      .setScrollFactor(0)
      .setOrigin(1, 0)
      .setDepth(100);

    this.addPanel(0, 0, 410, 60);
    this.objectiveText = scene.add
      .text(15, 12, "", { lineSpacing: 5 })
      .setScrollFactor(0)
      .setDepth(100);
  }

  private addPanel(x: number, y: number, w: number, h: number) {
    const n = this.scene.add
      .nineslice(x, y, "ui", "ui_panel_frame", w, h, 10, 10, 10, 10)
      .setScrollFactor(0)
      .setDepth(100);
    n.setOrigin(0, 0);
    return n;
  }

  update(
    currentCycleStep: number,
    playerRocket: PlayerRocketController | null,
    cycleWhenRecordingStarted: number,
    lastSpawnPoint: Vector2Like | null,
    numHappyIslands: number,
    numIslandsToMakeHappy: number,
    numRecordedRockets: number,
    hasMultipleSpawners: boolean,
    isTrackingRecordedRocket: boolean,
  ) {
    this.rocketCountText.setText(`Active loops: ${numRecordedRockets}`);
    this.recordingText.setText(playerRocket ? `Recording` : "");

    if (this.stepsLeftToWin == 0) {
      this.hasWon = true;
    }
    if (numHappyIslands < numIslandsToMakeHappy) {
      this.hasWon = false;
    }

    let currentObjectiveStateText = "";
    if (this.hasWon) {
      currentObjectiveStateText = "All shops are supplied sustainably!\nThe universe is happy :)";
    } else if (numHappyIslands < numIslandsToMakeHappy) {
      currentObjectiveStateText = `${numHappyIslands} of ${numIslandsToMakeHappy} shops are currently supplied\nRecord loops to supply them sustainably`;
      this.stepsLeftToWin = -1;
    } else {
      if (this.stepsLeftToWin == -1) {
        this.stepsLeftToWin = CYCLE_STEPS + 5 * TARGET_FRAMERATE;
      }
      const secondsLeft = Math.ceil(this.stepsLeftToWin / TARGET_FRAMERATE).toFixed(0);
      currentObjectiveStateText = `All shops are supplied\nKeep them supplied for ${secondsLeft} more seconds`;
      this.stepsLeftToWin--;
    }
    this.objectiveText.setText(currentObjectiveStateText);

    let returnMsg = "Ready for takeoff!";
    if (
      playerRocket &&
      lastSpawnPoint &&
      playerRocket.getFootPosition().distance(lastSpawnPoint) !== 0
    ) {
      returnMsg = "Return to the start before the loop ends!\nPress enter to self destruct";
    } else if (playerRocket && playerRocket.getHasMoved()) {
      returnMsg = "You're back at the start.\nWait here until the loop ends.";
    }
    // this.returnToStartText.setText(returnMsg);

    const fractionOfCycle = currentCycleStep / TARGET_FRAMERATE / CYCLE_SECONDS;
    // this.outstandingGoalsText.setText(outstandingGoals);
    this.watchArrow.setRotation(fractionOfCycle * Math.PI * 2);

    let instruction: string = "";
    if (playerRocket) {
      instruction = returnMsg;
    } else if (isTrackingRecordedRocket) {
      instruction = "Press tab to stop following this rocket.\nPress left/right to switch rockets.";
    } else {
      instruction = `Press space to spawn a rocket.${
        hasMultipleSpawners ? " Press tab to switch spawner." : ""
      }${numRecordedRockets > 0 ? "\nPress left/right to follow your rockets." : ""}`;
    }
    this.instructionText.setText(instruction);
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
