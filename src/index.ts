import "phaser";
import PlayerRocketController from "./rockets/player_rocket";
import ReversibleRocket from "./rockets/reversible_rocket";
import RecordedRocketController from "./rockets/recorded_rocket";
import IslandManager from "./islands/island_manager";
import GameUI from "./ui/game_ui";
import { Rocket } from "./rockets/rocket";
import Vector2Like = Phaser.Types.Math.Vector2Like;
import InputHandler from "./utils/input_handler";
import { preloadAssets } from "./utils/asset_loader";

const TARGET_FRAMERATE = 60;
const CYCLE_SECONDS = 30;
const FIXED_DT_MS = 1000 / TARGET_FRAMERATE;

const CYCLE_STEPS = TARGET_FRAMERATE * CYCLE_SECONDS;

class MyGame extends Phaser.Scene {
  private inputHandler: InputHandler;
  private playerRocketController?: PlayerRocketController;
  private recordedRockets: RecordedRocketController[] = [];
  private currentCycleStep = 0;
  private cycleWhenRecordingStarted = 0;
  private ui: GameUI;
  private islandManager: IslandManager;
  private lastSpawnPoint?: Vector2Like = null;
  private allowCameraMovement = false;

  constructor() {
    super();
  }

  preload() {
    preloadAssets(this);
  }

  create() {
    this.inputHandler = new InputHandler(this);
    this.islandManager = new IslandManager(this, CYCLE_STEPS, TARGET_FRAMERATE);
    const spawn = this.islandManager.getSelectedSpawnerIsland().getSpawnPoint();
    this.cameras.main.centerOn(spawn.x, spawn.y);
    this.ui = new GameUI(this, CYCLE_SECONDS, TARGET_FRAMERATE);
  }

  update() {
    this.inputHandler.update();

    // After the physics simulation we need to snap as the first thing. Otherwise the recording
    // check will be off.
    this.recordedRockets.forEach(recordedRocket => {
      this.islandManager.checkLandingStatus(recordedRocket.getRocket(), FIXED_DT_MS);
    });
    if (this.playerRocketController) {
      this.islandManager.checkLandingStatus(this.playerRocketController.getRocket(), FIXED_DT_MS);
    }

    if (this.playerRocketController && this.playerRocketController.shouldFinishRecording()) {
      if (this.playerRocketController.getFootPosition().distance(this.lastSpawnPoint) != 0) {
        this.playerRocketController.getRocket().explode();
        this.cameras.main.stopFollow();
      } else {
        this.recordedRockets.push(this.playerRocketController.finishRecording());
      }
      this.playerRocketController = null;
      this.allowCameraMovement = false;
      this.lastSpawnPoint = null;
    } else if (this.playerRocketController) {
      const rocketInput = this.inputHandler.getRocketControlInput();
      this.playerRocketController.applyInput(rocketInput.x, rocketInput.y);
    } else {
      if (this.inputHandler.isTabButtonJustDown()) {
        this.islandManager.selectNextSpawnerIsland();
        const spawn = this.islandManager.getSelectedSpawnerIsland().getSpawnPoint();
        const cam = this.cameras.main;
        if (cam.panEffect && cam.panEffect.isRunning) cam.panEffect.reset();
        this.cameras.main.pan(spawn.x, spawn.y, 500, "Sine.easeInOut");
      }
      const cameraInput = this.inputHandler.getCameraControlInput();
      if (!this.allowCameraMovement) {
        if (cameraInput.x === 0 && cameraInput.y === 0) {
          this.allowCameraMovement = true;
        }
      } else if (cameraInput.x !== 0 || cameraInput.y !== 0) {
        const cam = this.cameras.main;
        if (cam.panEffect && cam.panEffect.isRunning) cam.panEffect.reset();
        const CAMERA_SCROLL_SPEED = 10;
        cam.scrollX += cameraInput.x * CAMERA_SCROLL_SPEED;
        cam.scrollY -= cameraInput.y * CAMERA_SCROLL_SPEED;
      }

      if (this.inputHandler.isPrimaryActionButtonJustDown()) {
        this.lastSpawnPoint = this.islandManager.getSelectedSpawnerIsland().getSpawnPoint();
        console.log("Spawn point: " + this.lastSpawnPoint.x + " " + this.lastSpawnPoint.y);
        this.playerRocketController = new PlayerRocketController(
          new ReversibleRocket(
            this,
            this.lastSpawnPoint.x,
            this.lastSpawnPoint.y,
            this.onRocketDestroyed.bind(this),
          ),
          this.cameras.main,
          CYCLE_STEPS,
        );
        this.cycleWhenRecordingStarted = this.currentCycleStep;
      }
    }

    this.recordedRockets.forEach(recordedRocket => {
      recordedRocket.applyNextRecordedInput();
    });

    this.islandManager.processCycleStep();

    this.currentCycleStep += 1;
    this.currentCycleStep %= CYCLE_STEPS;
    this.ui.update(
      this.currentCycleStep,
      this.playerRocketController ?? null,
      this.cycleWhenRecordingStarted,
      this.lastSpawnPoint,
      this.islandManager.getOutstandingGoals(),
    );
  }

  private onRocketDestroyed(rocket: Rocket) {
    if (rocket == this.playerRocketController?.getRocket()) {
      this.cameras.main.stopFollow();
      const spawn = this.islandManager.getSelectedSpawnerIsland().getSpawnPoint();
      this.cameras.main.pan(spawn.x, spawn.y, 1000, "Sine.easeInOut");
      this.playerRocketController = null;
      this.allowCameraMovement = false;
    }
    this.recordedRockets = this.recordedRockets.filter(el => el.getRocket() != rocket);
  }
}

const config = {
  type: Phaser.AUTO,
  physics: {
    default: "matter",
    matter: {
      gravity: { x: 0, y: 0.1 },
      runner: {
        // Use fixed time step for reproducible physics. However this means that the speed of the game
        // will be tied to the frame rate.
        isFixed: true,
        fps: TARGET_FRAMERATE,
      },
      debug: true, // Uncomment to see physics shapes
    },
  },
  input: {
    gamepad: true,
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
