import "phaser";
import PlayerRocket from "./rockets/player_rocket";
import ReversibleRocket from "./rockets/reversible_rocket";
import RecordedRocket from "./rockets/recorded_rocket";
import { distancePointToSegment } from "./utils/geometry";
import Text = Phaser.GameObjects.Text;
import { setPolygonBody, getLandingLine } from "./utils/polygon_body";

const TARGET_FRAMERATE = 60;
const CYCLE_SECONDS = 60;

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
  private landingLine: Phaser.Math.Vector2[];
  private rocketFootPoint: Phaser.GameObjects.Arc;

  constructor() {
    super();
  }

  preload() {
    this.load.path = "assets/";
    this.load.aseprite("rocket", "sprite_rocket.png", "sprite_rocket.json");
    this.load.json("rocket_collision", "sprite_rocket-collision.json");
    this.load.aseprite("island_ireland", "sprite_island_ireland.png", "sprite_island_ireland.json");
    this.load.json("island_ireland_collision", "sprite_island_ireland-collision.json");
  }

  create() {
    this.cursors = this.input.keyboard.createCursorKeys();

    this.playerRocket = new PlayerRocket(
      new ReversibleRocket(this, 400, 300),
      this.cameras.main,
      CYCLE_STEPS,
    );

    const island = this.matter.add.sprite(400, 400, "island_ireland");
    this.anims.createFromAseprite("island_ireland", undefined, island);
    island.play({ key: "Idle", repeat: -1 });
    const islandCollision = this.cache.json.get("island_ireland_collision");
    setPolygonBody(island, islandCollision);
    island.setStatic(true);
    const landingLineRaw = getLandingLine(islandCollision);
    this.landingLine = landingLineRaw.map(
      l =>
        new Phaser.Math.Vector2(
          l.x + island.x - island.width * island.originX,
          l.y + island.y - island.height * island.originY,
        ),
    );
    this.cycleText = this.add.text(5, 5, "").setScrollFactor(0);
    this.recordingText = this.add.text(500, 5, "").setScrollFactor(0);
    this.landingStatusText = this.add.text(5, 30, "").setScrollFactor(0);

    // Temp: draw spawn point and rocket foot. Romve once no longer needed.
    this.add.circle(this.landingLine[0].x, this.landingLine[0].y, 5, 0x0000ff, 1);
    this.add.circle(this.landingLine[1].x, this.landingLine[1].y, 5, 0x0000ff, 1);
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
      this.playerRocket = new PlayerRocket(
        new ReversibleRocket(this, 400, 300),
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
        : `Press space to spawn another rocket.`,
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
