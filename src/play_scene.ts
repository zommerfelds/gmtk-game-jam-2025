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
    this.createBackgroundLayer("background", 0.1, 0.1, 0.5);
    this.createBackgroundLayer("background", 0.2, 0.3, 0.5);
    this.createBackgroundLayer("background", 0.3, 0.5, 0.5);

    this.inputHandler = new InputHandler(this);
    this.islandManager = new IslandManager(this, CYCLE_STEPS, TARGET_FRAMERATE);
    const spawn = this.islandManager.getSelectedSpawnerIsland().getSpawnPoint();
    this.cameras.main.centerOn(spawn.x, spawn.y);
    this.ui = new GameUI(this);
  }

  private createBackgroundLayer(
    textureKey: string,
    scrollFactor: number,
    alpha: number,
    scale: number,
  ) {
    // Note: tileSprite would be more efficient and unlimited in size,
    // but can't rotate/flip tiles randomly.
    const texture = this.textures.get(textureKey);
    const tileSize = texture.getSourceImage().width;
    const RANGE = tileSize * 10;

    const container = this.add
      .container(0, 0)
      .setScrollFactor(scrollFactor)
      .setAlpha(alpha)
      .setDepth(-100)
      .setScale(scale);

    for (let x = -RANGE; x < RANGE; x += tileSize) {
      for (let y = -RANGE; y < RANGE; y += tileSize) {
        const tile = this.add.image(x, y, textureKey).setOrigin(0);
        tile.setFlipX(Math.random() < 0.5);
        tile.setFlipY(Math.random() < 0.5);
        tile.setAngle(90 * Phaser.Math.Between(0, 3));
        container.add(tile);
      }
    }
  }

  update() {
    this.inputHandler.update();

    this.recordedRockets.forEach(recordedRocket => {
      this.islandManager.checkLandingStatus(recordedRocket.getRocket());
    });
    if (this.playerRocketController) {
      this.islandManager.checkLandingStatus(this.playerRocketController.getRocket());
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
        const rocket =
          Math.random() < 0.5
            ? new ReversibleRocket(
                this,
                this.lastSpawnPoint.x,
                this.lastSpawnPoint.y,
                this.onRocketDestroyed.bind(this),
              )
            : new OminRocket(
                this,
                this.lastSpawnPoint.x,
                this.lastSpawnPoint.y,
                this.onRocketDestroyed.bind(this),
              );
        this.playerRocketController = new PlayerRocketController(
          rocket,
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
