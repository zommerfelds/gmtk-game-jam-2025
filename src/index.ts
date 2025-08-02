import "phaser";
import PlayerRocket from "./rockets/player_rocket";
import ReversibleRocket from "./rockets/reversible_rocket";
import RecordedRocket from "./rockets/recorded_rocket";
import { distancePointToSegment } from "./utils/geometry";
import Island from "./islands/island";
import IslandIreland from "./islands/island_ireland";
import Text = Phaser.GameObjects.Text;

const TARGET_FRAMERATE = 60;
const CYCLE_SECONDS = 30;

const CYCLE_STEPS = TARGET_FRAMERATE * CYCLE_SECONDS;

class MyGame extends Phaser.Scene {
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private playerRocket?: PlayerRocket;
  private recordedRockets: RecordedRocket[] = [];
  private currentCycleStep = 0;
  private cycleText: Text;
  private cycleWhenRecordingStarted = 0;
  private recordingText: Text;
  private landingStatusText: Text;
  private spawnPoint?: Phaser.Math.Vector2;
  private lowestPoint?: Phaser.GameObjects.Arc;
  private landingLine: Phaser.Math.Vector2[];
  private rocketFootPoint: Phaser.GameObjects.Arc;
  private mainIsland: Island

  constructor() {
    super();
  }

  preload() {
    this.load.path = "assets/";
    this.load_sprite("rocket")
    this.load_sprite("island_ireland")
  }

  load_sprite(name: string) {
    this.load.aseprite(name, `sprite_${name}.png`, `sprite_${name}.json`);
    this.load.json(`${name}_collision`, `sprite_${name}-collision.json`);
  }



  create() {
    this.cursors = this.input.keyboard.createCursorKeys();

    this.playerRocket = new PlayerRocket(
      new ReversibleRocket(this, 400, 300),
      this.cameras.main,
      CYCLE_STEPS,
    );

    this.mainIsland = new IslandIreland(this, 400, 400)
    this.spawnPoint = this.mainIsland.getSpawnPoint()
    this.cycleText = this.add.text(5, 5, "").setScrollFactor(0);
    this.recordingText = this.add.text(500, 5, "").setScrollFactor(0);
    this.landingStatusText = this.add.text(5, 30, "").setScrollFactor(0);

    // Temp: draw spawn point and rocket foot. Romve once no longer needed.
    var landingLine = this.mainIsland.getLandingLine()
    this.add.circle(landingLine[0].x, landingLine[0].y, 5, 0x0000ff, 1);
    this.add.circle(landingLine[1].x, landingLine[1].y, 5, 0x0000ff, 1);
    this.rocketFootPoint = this.add.circle();
  }

  update() {
    if (this.playerRocket && this.playerRocket.shouldFinishRecording()) {
      this.recordedRockets.push(this.playerRocket.finishRecording());
      this.playerRocket = null;
    } else if (this.playerRocket) {
      const yAxis = this.cursors.up?.isDown ? 1.0 : this.cursors.down?.isDown ? -1.0 : 0;
      const xAxis = this.cursors.right?.isDown ? 1.0 : this.cursors.left?.isDown ? -1.0 : 0;
      this.playerRocket.applyInput(xAxis, yAxis);
    } else if (this.cursors.space?.isDown) {
      this.cycleWhenRecordingStarted = this.currentCycleStep;
      const spawnPoint = this.getSpawnPoint();
      this.playerRocket = new PlayerRocket(
        new ReversibleRocket(this, spawnPoint.x, spawnPoint.y),
        this.cameras.main,
        CYCLE_STEPS,
      );
    }

    if (this.playerRocket && this.landingLine) {
      const pos = this.playerRocket.getFootPosition();
      this.rocketFootPoint.setPosition(pos.x, pos.y);
      const distance = distancePointToSegment(pos, this.landingLine[0], this.landingLine[1]);
      this.landingStatusText?.setText(
        distance < 3 ? "Landing status: The Eagle has landed" : "Landing status: outer space",
      );
    } else {
      this.landingStatusText?.setText("Landing status: outer space");
    }

    this.recordedRockets.forEach(recordedRocket => {
      recordedRocket.applyNextRecordedInput();
    });

    this.currentCycleStep += 1;
    this.currentCycleStep %= CYCLE_STEPS;
    this.cycleText.setText(
      `Current time in cycle: ${(this.currentCycleStep / TARGET_FRAMERATE).toFixed(
        1,
      )}/${CYCLE_SECONDS}`,
    );
    this.recordingText.setText(
      this.playerRocket
        ? `Recording (started at ${(this.cycleWhenRecordingStarted / TARGET_FRAMERATE).toFixed(1)})`
        : `Press space to spawn a rocket`,
    );
  }

  private getSpawnPoint(): Phaser.Math.Vector2 {
    return this.landingLine[0].clone().add(this.landingLine[1]).scale(0.5);
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
