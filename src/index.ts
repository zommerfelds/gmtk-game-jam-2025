import "phaser";
import PlayerRocketController from "./rockets/player_rocket";
import ReversibleRocket from "./rockets/reversible_rocket";
import RecordedRocketController from "./rockets/recorded_rocket";
import IslandManager from "./islands/island_manager";
import Text = Phaser.GameObjects.Text;

const TARGET_FRAMERATE = 60;
const CYCLE_SECONDS = 30;
const FIXED_DT_MS = 1000 / TARGET_FRAMERATE;

const CYCLE_STEPS = TARGET_FRAMERATE * CYCLE_SECONDS;

class MyGame extends Phaser.Scene {
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private PlayerRocketController?: PlayerRocketController;
  private recordedRockets: RecordedRocketController[] = [];
  private currentCycleStep = 0;
  private cycleText: Text;
  private cycleWhenRecordingStarted = 0;
  private recordingText: Text;
  private islandManager: IslandManager;

  constructor() {
    super();
  }

  preload() {
    this.load.path = "assets/";
    this.load_sprite("rocket");
    this.load_sprite("island_ireland");
    this.load_sprite("island_doom");
  }

  load_sprite(name: string) {
    this.load.aseprite(name, `sprite_${name}.png`, `sprite_${name}.json`);
    this.load.json(`${name}_collision`, `sprite_${name}-collision.json`);
  }

  create() {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.islandManager = new IslandManager(this);
    this.cycleText = this.add.text(5, 5, "").setScrollFactor(0);
    this.recordingText = this.add.text(500, 5, "").setScrollFactor(0);
  }

  update() {
    if (this.PlayerRocketController && this.PlayerRocketController.shouldFinishRecording()) {
      this.recordedRockets.push(this.PlayerRocketController.finishRecording());
      this.PlayerRocketController = null;
    } else if (this.PlayerRocketController) {
      const yAxis = this.cursors.up?.isDown ? 1.0 : this.cursors.down?.isDown ? -1.0 : 0;
      const xAxis = this.cursors.right?.isDown ? 1.0 : this.cursors.left?.isDown ? -1.0 : 0;
      this.PlayerRocketController.applyInput(xAxis, yAxis);
    } else if (this.cursors.space?.isDown) {
      const spawnPoint = this.islandManager.getMainIsland().getSpawnPoint();
      console.log("Spawn point: " + spawnPoint.x + " " + spawnPoint.y);
      this.PlayerRocketController = new PlayerRocketController(
        new ReversibleRocket(this, spawnPoint.x, spawnPoint.y),
        this.cameras.main,
        CYCLE_STEPS,
      );
      this.cycleWhenRecordingStarted = this.currentCycleStep;
    }

    this.recordedRockets.forEach(recordedRocket => {
      recordedRocket.applyNextRecordedInput();
      this.islandManager.checkLandingStatus(recordedRocket.getRocket(), FIXED_DT_MS);
    });

    if (this.PlayerRocketController) {
      this.islandManager.checkLandingStatus(this.PlayerRocketController.getRocket(), FIXED_DT_MS);
    }

    this.currentCycleStep += 1;
    this.currentCycleStep %= CYCLE_STEPS;
    this.cycleText.setText(
      `Current time in cycle: ${(this.currentCycleStep / TARGET_FRAMERATE).toFixed(
        1,
      )}/${CYCLE_SECONDS}`,
    );
    this.recordingText.setText(
      this.PlayerRocketController
        ? `Recording (started at ${(this.cycleWhenRecordingStarted / TARGET_FRAMERATE).toFixed(1)})`
        : `Press space to spawn a rocket`,
    );
  }
}

const config = {
  type: Phaser.AUTO,
  physics: {
    default: "matter",
    matter: {
      gravity: { x: 0, y: 0 },
      runner: {
        // Use fixed time step for reproducible physics. However this means that the speed of the game
        // will be tied to the frame rate.
        isFixed: true,
        fps: TARGET_FRAMERATE,
      },
      debug: true, // Uncomment to see physics shapes
    },
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  width: 800,
  height: 600,
  zoom: 5,
  pixelArt: true,
  antialias: false,
  autoRound: true,
  roundPixels: true,
  scene: MyGame,
};

const game = new Phaser.Game(config);
