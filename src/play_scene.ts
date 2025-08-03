import "phaser";
import PlayerRocketController from "./rockets/player_rocket";
import ReversibleRocket from "./rockets/reversible_rocket";
import OminRocket from "./rockets/omin_rocket";
import RecordedRocketController from "./rockets/recorded_rocket";
import IslandManager from "./islands/island_manager";
import GameUI from "./ui/game_ui";
import { Rocket } from "./rockets/rocket";
import Vector2Like = Phaser.Types.Math.Vector2Like;
import InputHandler from "./utils/input_handler";
import { preloadAssets, prepareAssets } from "./utils/asset_loader";
import { TARGET_FRAMERATE, CYCLE_SECONDS, CYCLE_STEPS } from "./constants";
import { createBackground } from "./utils/background";

export default class PlayScene extends Phaser.Scene {
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
    super("PlayScene");
  }

  preload() {
    preloadAssets(this);
  }

  create() {
    prepareAssets(this);
    createBackground(this, "background");

    this.inputHandler = new InputHandler(this);
    this.islandManager = new IslandManager(this, CYCLE_STEPS, TARGET_FRAMERATE);
    const spawn = this.islandManager.getSelectedSpawnerIsland().getSpawnPoint();
    this.cameras.main.centerOn(spawn.x, spawn.y);
    this.ui = new GameUI(this);
  }

  update() {
    this.inputHandler.update();

    this.recordedRockets.forEach(recordedRocket => {
      this.islandManager.checkLandingStatus(recordedRocket);
    });
    if (this.playerRocketController) {
      this.islandManager.checkLandingStatus(this.playerRocketController);
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
      const rocketInput = this.inputHandler.getRocketControlInput(
        this.playerRocketController.getRocket().getRocketControlType(),
      );
      const selfDestruct = this.inputHandler.isSelfDestructButtonJustDown();
      this.playerRocketController.applyInput(rocketInput.x, rocketInput.y, selfDestruct);
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
      } // Camera movement is disabled for now, to allow for exploration through the rocket.
      /*else if (cameraInput.x !== 0 || cameraInput.y !== 0) {
        const cam = this.cameras.main;
        if (cam.panEffect && cam.panEffect.isRunning) cam.panEffect.reset();
        const CAMERA_SCROLL_SPEED = 10;
        cam.scrollX += cameraInput.x * CAMERA_SCROLL_SPEED;
        cam.scrollY -= cameraInput.y * CAMERA_SCROLL_SPEED;
      } */

      if (this.inputHandler.isPrimaryActionButtonJustDown()) {
        this.lastSpawnPoint = this.islandManager.getSelectedSpawnerIsland().getSpawnPoint();
        console.log("Spawn point: " + this.lastSpawnPoint.x + " " + this.lastSpawnPoint.y);
        const rocket = this.islandManager
          .getSelectedSpawnerIsland()
          .spawnRocket(this.onRocketDestroyed.bind(this));
        this.playerRocketController = new PlayerRocketController(
          rocket,
          this.cameras.main,
          CYCLE_STEPS,
        );
        this.cycleWhenRecordingStarted = this.currentCycleStep;
      }
    }

    this.recordedRockets.forEach(recordedRocket => {
      recordedRocket.advanceRecordedState();
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
      this.islandManager.hasMultipleSpawners(),
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
