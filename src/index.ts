import "phaser";
import PlayerRocketController from "./rockets/player_rocket";
import ReversibleRocket from "./rockets/reversible_rocket";
import RecordedRocketController from "./rockets/recorded_rocket";
import IslandManager from "./islands/island_manager";
import Text = Phaser.GameObjects.Text;
import {Rocket} from "./rockets/rocket";
import Vector2Like = Phaser.Types.Math.Vector2Like;

const TARGET_FRAMERATE = 60;
const CYCLE_SECONDS = 30;
const FIXED_DT_MS = 1000 / TARGET_FRAMERATE;

const CYCLE_STEPS = TARGET_FRAMERATE * CYCLE_SECONDS;

class MyGame extends Phaser.Scene {
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private playerRocketController?: PlayerRocketController;
  private recordedRockets: RecordedRocketController[] = [];
  private currentCycleStep = 0;
  private cycleText: Text;
  private cycleWhenRecordingStarted = 0;
  private recordingText: Text;
  private returnToStartText: Text;
  private islandManager: IslandManager;
  private spawnPoint?: Vector2Like = null;

  constructor() {
    super();
  }

  preload() {
    this.load.path = "assets/";
    this.load_sprite("rocket");
    this.load_sprite("island_cacti");
    this.load_sprite("island_doom");
    this.load_sprite("island_ireland");
    this.load_sprite("island_skull");
    this.load_sprite("effect_explosion");
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
    this.returnToStartText = this.add.text(5, 35, "").setScrollFactor(0);
  }

  update() {
    if (this.playerRocketController && this.playerRocketController.shouldFinishRecording()) {
      if (this.playerRocketController.getFootPosition().distance(this.spawnPoint) != 0) {
        this.playerRocketController.getRocket().explode(this, () => {
          this.cameras.main.stopFollow();
        });
      } else {
        this.recordedRockets.push(this.playerRocketController.finishRecording());
      }
      this.playerRocketController = null;
      this.spawnPoint = null;
    } else if (this.playerRocketController) {
      const yAxis = this.cursors.up?.isDown ? 1.0 : this.cursors.down?.isDown ? -1.0 : 0;
      const xAxis = this.cursors.right?.isDown ? 1.0 : this.cursors.left?.isDown ? -1.0 : 0;
      this.playerRocketController.applyInput(xAxis, yAxis);
    } else if (this.cursors.space?.isDown) {
      this.spawnPoint = this.islandManager.getMainIsland().getSpawnPoint();
      console.log("Spawn point: " + this.spawnPoint.x + " " + this.spawnPoint.y);
      this.playerRocketController = new PlayerRocketController(
        new ReversibleRocket(this, this.spawnPoint.x, this.spawnPoint.y, this.onRocketDestroyed.bind(this)),
        this.cameras.main,
        CYCLE_STEPS,
      );
      this.cycleWhenRecordingStarted = this.currentCycleStep;
    }

    this.recordedRockets.forEach(recordedRocket => {
      recordedRocket.applyNextRecordedInput();
      this.islandManager.checkLandingStatus(recordedRocket.getRocket(), FIXED_DT_MS);
    });

    if (this.playerRocketController) {
      this.islandManager.checkLandingStatus(this.playerRocketController.getRocket(), FIXED_DT_MS);
    }

    this.currentCycleStep += 1;
    this.currentCycleStep %= CYCLE_STEPS;
    this.cycleText.setText(
      `Current time in cycle: ${(this.currentCycleStep / TARGET_FRAMERATE).toFixed(
        1,
      )}/${CYCLE_SECONDS}`,
    );
    this.recordingText.setText(
      this.playerRocketController
        ? `Recording (started at ${(this.cycleWhenRecordingStarted / TARGET_FRAMERATE).toFixed(1)})`
        : `Press space to spawn a rocket`,
    );
    this.returnToStartText.setText(
      this.playerRocketController
        ? (this.playerRocketController.getFootPosition().distance(this.spawnPoint) != 0
          ? "Return to start before the loop ends!"
          : "All good, you're back at the start :)")
        : ""
    );
  }

  private onRocketDestroyed(rocket: Rocket) {
    if (rocket == this.playerRocketController?.getRocket()) {
      this.cameras.main.stopFollow();
      this.playerRocketController = null;
    }
    this.recordedRockets = this.recordedRockets.filter(el => el.getRocket() != rocket);
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
