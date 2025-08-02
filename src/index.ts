import "phaser";
import PlayerRocketController from "./rockets/player_rocket";
import ReversibleRocket from "./rockets/reversible_rocket";
import RecordedRocketController from "./rockets/recorded_rocket";
import IslandManager from "./islands/island_manager";
import Text = Phaser.GameObjects.Text;
import { Rocket } from "./rockets/rocket";
import Vector2Like = Phaser.Types.Math.Vector2Like;

const TARGET_FRAMERATE = 60;
const CYCLE_SECONDS = 30;
const FIXED_DT_MS = 1000 / TARGET_FRAMERATE;

const CYCLE_STEPS = TARGET_FRAMERATE * CYCLE_SECONDS;

class MyGame extends Phaser.Scene {
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private playerRocketController?: PlayerRocketController;
  private tabKey: Phaser.Input.Keyboard.Key;
  private recordedRockets: RecordedRocketController[] = [];
  private currentCycleStep = 0;
  private cycleText: Text;
  private cycleWhenRecordingStarted = 0;
  private recordingText: Text;
  private returnToStartText: Text;
  private islandManager: IslandManager;
  private lastSpawnPoint?: Vector2Like = null;
  private allowCameraMovement = false;
  private debugEnabled = false;

  constructor() {
    super();
  }

  preload() {
    this.load.path = "assets/";
    this.load_sprite("rocket");
    this.load_sprite("island_cacti");
    this.load_sprite("island_cave");
    this.load_sprite("island_doom");
    this.load_sprite("island_ireland");
    this.load_sprite("island_lake");
    this.load_sprite("island_skull");
    this.load_sprite("effect_explosion", /* skipCollision= */ true);
    this.load_sprite("icon_cactus", /* skipCollision= */ true);
    this.load_sprite("icon_lava", /* skipCollision= */ true);
  }

  load_sprite(name: string, skipCollision: boolean = false) {
    this.load.aseprite(name, `sprite_${name}.png`, `sprite_${name}.json`);
    if (!skipCollision) {
      this.load.json(`${name}_collision`, `sprite_${name}-collision.json`);
    }
  }

  create() {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.tabKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TAB);
    this.islandManager = new IslandManager(this);
    const spawn = this.islandManager.getSelectedSpawnerIsland().getSpawnPoint();
    this.cameras.main.centerOn(spawn.x, spawn.y);
    this.cycleText = this.add.text(5, 5, "").setScrollFactor(0);
    this.recordingText = this.add.text(500, 5, "").setScrollFactor(0);
    this.returnToStartText = this.add.text(5, 35, "").setScrollFactor(0);
  }

  update() {
    const yAxis = this.cursors.up?.isDown ? 1.0 : this.cursors.down?.isDown ? -1.0 : 0;
    const xAxis = this.cursors.right?.isDown ? 1.0 : this.cursors.left?.isDown ? -1.0 : 0;

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
      this.playerRocketController.applyInput(xAxis, yAxis);
    } else {
      if (Phaser.Input.Keyboard.JustDown(this.tabKey)) {
        this.islandManager.selectNextSpawnerIsland();
        const spawn = this.islandManager.getSelectedSpawnerIsland().getSpawnPoint();
        const cam = this.cameras.main;
        if (cam.panEffect && cam.panEffect.isRunning) cam.panEffect.reset();
        this.cameras.main.pan(spawn.x, spawn.y, 500, "Sine.easeInOut");
      }
      if (!this.allowCameraMovement) {
        if (xAxis === 0 && yAxis === 0) {
          this.allowCameraMovement = true;
        }
      } else if (xAxis !== 0 || yAxis !== 0) {
        const cam = this.cameras.main;
        if (cam.panEffect && cam.panEffect.isRunning) cam.panEffect.reset();
        const CAMERA_SCROLL_SPEED = 10;
        cam.scrollX += xAxis * CAMERA_SCROLL_SPEED;
        cam.scrollY -= yAxis * CAMERA_SCROLL_SPEED;
      }

      if (this.cursors.space?.isDown) {
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
        : `Press space to spawn a rocket\nPress tab to switch spawner`,
    );
    this.returnToStartText.setText(
      this.playerRocketController
        ? this.playerRocketController.getFootPosition().distance(this.lastSpawnPoint) != 0
          ? "Return to start before the loop ends!"
          : "All good, you're back at the start :)"
        : "",
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
