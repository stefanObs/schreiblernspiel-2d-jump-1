import Phaser from "phaser";
import { freeTransformPuzzle, mergedPuzzles } from "../logic/puzzleStore";
import type { Puzzle, WorldEffect } from "../logic/puzzleTypes";
import {
  CATEGORIES_CHANGED_EVENT,
  BOARD_CATEGORIES,
  MINIGAME_CATEGORIES,
  isCategoryEnabled,
  resolvedStationSlots,
  pickRandomPuzzle,
  puzzleForSlot,
  signArtPathForCategory,
  signKeyForCategory,
  type StationSlotDef,
} from "../logic/puzzleCategories";
import {
  RESPAWN,
  canClimb,
  canJump,
  checkpointAtStation,
  climbVelocityY,
  combineMove,
  CLIMB_GRAB_DX,
  CLIMB_LATCH_MS,
  CLIMB_REGRAB_LOCK_MS,
  jumpVelocity,
  moveSpeed,
  type CharacterId,
  type ShapeId,
} from "../logic/playerRules";
import {
  landOverlay,
  playerPose,
  poseAngle,
  poseScale,
  spawnMotion,
  takeoffOverlay,
  type SpawnKind,
} from "../logic/animState";
import {
  BRIDGE_PROP,
  CHECKPOINT_AFTER_X,
  GOAL_X,
  LAYOUT_SCALE,
  SOLID_FLOORS,
  SPAWN_PARTS,
  STREET_CROSSING,
  TREEHOUSE,
  WALKABLE_HILLS,
  WATER_GAPS,
  WORLD,
  hillWalkY,
  spawnPartsForEffect,
  treehouseDeckTop,
  u,
  worldTop,
  type SpawnPartDef,
} from "../logic/bachbrueckeLayout";
import { MECH_ART, MECH_CHARS, alternateShape, artPublicPath, characterDisplayName, shapeDisplayName, textureFor } from "../logic/mechCatalog";
import { isAutoSolvePuzzles, isDebugMode } from "../logic/writingMode";
import { DEBUG_OPEN_PUZZLE_EVENT, type DebugOpenPuzzleDetail } from "../logic/debugPuzzles";
import { parsePuzzleQuery } from "../logic/puzzleQuery";
import { isOverlayOpen, openPuzzle } from "../puzzleUi";
import { openBallkanone } from "../minigames/ballkanone";
import { openBuchstabenstrasse } from "../minigames/buchstabenstrasse";
import { openBuchstabenflieger } from "../minigames/buchstabenflieger";
import { openKettenhochhaus } from "../minigames/kettenhochhaus";
import { unlockSpeech } from "../logic/speech";

type Station = StationSlotDef & {
  x: number;
  y: number;
};

type PartRuntime = {
  def: SpawnPartDef;
  /** Solid collider (bridges, platforms, ladder_top). */
  solid?: Phaser.GameObjects.Rectangle;
  /** Climb overlap sensor (rope, ladder). */
  climb?: Phaser.GameObjects.Rectangle;
  view?: Phaser.GameObjects.Image;
};

const W = u(WORLD.width);
const H = u(WORLD.height);
/** Top of scrollable world (negative = sky above the old y=0 band). */
const WORLD_TOP = u(worldTop());
const WORLD_H = H - WORLD_TOP;
const GROUND = u(WORLD.groundY);
/** Invisible collider top — a bit below the drawn grass edge so boots sit in the turf. */
const WALK_Y = GROUND + u(12);
/** Bottom of planted props (trees, signs, meadow) — matches walk surface, not the drawn edge. */
const PROP_FEET_Y = WALK_Y;
const MECH_SIZE = { w: u(96), h: u(134) };
const AUTO_SIZE = { w: u(150), h: u(86) };
const CLIMB_DETACH_VY = -360;

export class BachbrueckeScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private cursors = { left: false, right: false, jump: false };
  private character: CharacterId = "bolt";
  private shape: ShapeId = "mech";
  /** Auto jumps as walking mech, then morphs back on land. */
  private jumpAsMech = false;
  private worldPaused = false;
  private grounded = false;
  private climbing = false;
  private climbAnchorX = 0;
  private climbSensor: Phaser.GameObjects.Rectangle | null = null;
  /** After leaving a rope/ladder, ignore grab briefly so the mech can walk/jump away. */
  private climbLockUntil = 0;
  /** After grabbing, stay hanging until this time — no jump/walk-off yet. */
  private climbLatchUntil = 0;
  private solved = new Set<string>();
  private stations: Station[] = [];
  private activeSlotId: string | null = null;
  private partsById = new Map<string, PartRuntime>();
  private stationViews: Phaser.GameObjects.Image[] = [];
  private streetCrossingDone = false;
  private pendingStreetCrossing = false;
  private streetSign: Phaser.GameObjects.Image | null = null;
  private onCategoriesChanged = (): void => {
    this.rebuildStations();
  };
  private baseScale = { x: 1, y: 1 };
  private wasGrounded = true;
  private transforming = false;
  private landAt = -9999;
  private jumpAt = -9999;
  private goalShown = false;
  private titleLabel!: Phaser.GameObjects.Text;
  private keys!: {
    left: Phaser.Input.Keyboard.Key;
    right: Phaser.Input.Keyboard.Key;
    up: Phaser.Input.Keyboard.Key;
    down: Phaser.Input.Keyboard.Key;
    space: Phaser.Input.Keyboard.Key;
    a: Phaser.Input.Keyboard.Key;
    d: Phaser.Input.Keyboard.Key;
    w: Phaser.Input.Keyboard.Key;
    s: Phaser.Input.Keyboard.Key;
  };
  private checkpoint = { ...RESPAWN };
  /** Once a minigame sets the checkpoint, the early X advance must not overwrite it. */
  private checkpointFromSolve = false;

  constructor() {
    super("bachbruecke");
  }

  preload(): void {
    for (const id of MECH_CHARS) {
      const art = MECH_ART[id];
      this.load.image(art.mechKey, art.mechFile);
      this.load.image(art.autoKey, art.autoFile);
      art.walkFrames.forEach((key, i) => this.load.image(key, art.walkFiles[i]!));
    }
    this.load.image("prop-bridge", "art/prop_bridge.png");
    this.load.image("prop-rope", "art/prop_rope.png");
    this.load.image("prop-rope-world", "art/prop_rope_world.png");
    this.load.image("prop-ladder", "art/prop_ladder.png");
    this.load.image("prop-treehouse", "art/prop_treehouse.png");
    this.load.image("prop-hochhaus", "art/prop_hochhaus.png");
    this.load.image("station-sign", "art/station_sign.png");
    for (const category of [...BOARD_CATEGORIES, ...MINIGAME_CATEGORIES]) {
      const path = signArtPathForCategory(category);
      if (path) this.load.image(signKeyForCategory(category), path);
    }
    this.load.image("prop-tree", "art/prop_tree.png");
    this.load.image("prop-house", "art/prop_house.png");
    this.load.image("prop-far-ridge", "art/prop_far_ridge.png");
    this.load.image("prop-grass-tuft", "art/prop_grass_tuft.png");
    this.load.image("prop-flowers", "art/prop_flowers.png");
  }

  create(): void {
    this.cameras.main.setBounds(0, WORLD_TOP, W, WORLD_H);
    this.physics.world.setBounds(0, WORLD_TOP, W, WORLD_H);
    this.createAnims();
    this.drawBackdrop();
    this.placeFarRidge();
    this.placeHills();
    this.placeSkyline();
    this.placeClouds();
    this.placeWater();
    this.placeTreehouse();
    this.placeTown();
    this.placeMeadowDecor();
    const statics = this.physics.add.staticGroup();

    for (const floor of SOLID_FLOORS) {
      statics.add(
        this.block(
          u(floor.x),
          this.solidCenterY(floor.y, floor.h),
          u(floor.w),
          u(floor.h),
          0x3dcc5a,
          false,
          true,
        ),
      );
    }
    statics.add(
      this.block(
        u(TREEHOUSE.floor.x),
        this.solidCenterY(TREEHOUSE.floor.y, TREEHOUSE.floor.h),
        u(TREEHOUSE.floor.w),
        u(TREEHOUSE.floor.h),
        0x8d6e63,
        false,
        true,
      ),
    );

    this.partsById.clear();
    for (const def of SPAWN_PARTS) {
      const part: PartRuntime = { def };
      const cx = u(def.x);
      const cy = this.solidCenterY(def.y, def.h);
      const bw = u(def.w);
      const bh = u(def.h);

      if (def.kind === "rope" || def.kind === "ladder") {
        const sensor = this.block(cx, u(def.y), bw, bh, 0x6d4c41, false, false);
        part.climb = sensor;
      } else {
        const solid = this.block(cx, cy, bw, bh, 0x8d6e63, false, false);
        statics.add(solid);
        part.solid = solid;
      }

      // Street deck is invisible (road already drawn); bridges/ropes get props.
      if (def.kind !== "street" && !("withParent" in def && def.withParent)) {
        part.view = this.makePropView(def);
      }
      this.partsById.set(def.id, part);
    }

    this.player = this.physics.add.sprite(RESPAWN.x, RESPAWN.y, MECH_ART.bolt.mechKey);
    this.player.setOrigin(0.5, 1);
    this.applyPlayerLook();
    this.player.setCollideWorldBounds(true);
    this.player.setBounce(0);
    this.player.setDepth(12);
    this.physics.add.collider(this.player, statics, () => {
      this.grounded = Boolean(this.player.body?.blocked.down || this.player.body?.touching.down);
    });

    this.cameras.main.startFollow(this.player, true, 0.12, 0.14);
    // Bias follow slightly upward so climbing into the treehouse reads clearly.
    this.cameras.main.setFollowOffset(0, u(40));
    this.placeStations();
    this.placeStreetSign();
    const plateShadow = this.add.rectangle(u(256), u(64), u(460), u(72), 0x1a1a1a);
    plateShadow.setScrollFactor(0).setDepth(20);
    const plate = this.add.rectangle(u(250), u(58), u(460), u(72), 0xffffff).setStrokeStyle(4, 0x1a1a1a);
    plate.setScrollFactor(0).setDepth(20);
    this.titleLabel = this.add
      .text(u(40), u(28), `Bachbrücke — ${characterDisplayName(this.character)}`, {
        fontFamily: "Arial Black, sans-serif",
        fontSize: `${u(22)}px`,
        color: "#1A1A1A",
      })
      .setScrollFactor(0)
      .setDepth(21);
    this.add
      .text(u(40), u(56), "Pfeile/WASD · Leertaste · Transformieren", {
        fontFamily: "sans-serif",
        fontSize: `${u(14)}px`,
        color: "#1A1A1A",
      })
      .setScrollFactor(0)
      .setDepth(21);
    this.add
      .image(u(GOAL_X), PROP_FEET_Y, "station-sign")
      .setOrigin(0.5, 1)
      .setDisplaySize(u(78), u(110))
      .setDepth(2);
    this.wireHud();
    this.wireKeyboard();
    this.wireDebugOpeners();
    window.addEventListener(CATEGORIES_CHANGED_EVENT, this.onCategoriesChanged);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      window.removeEventListener(CATEGORIES_CHANGED_EVENT, this.onCategoriesChanged);
    });
    this.openQueryPuzzle();
  }

  /**
   * Ground-aligned layout y values are the walk surface (groundY+12);
   * elevated platforms use true center y.
   */
  private solidCenterY(layoutY: number, layoutH: number): number {
    if (layoutY >= WORLD.groundY) {
      return WALK_Y + u(layoutH) / 2;
    }
    return u(layoutY);
  }

  /** Follow smooth hill profile so walking rises/falls without jumping. */
  private applyHillSurface(): void {
    if (this.climbing || this.transforming) return;
    const xUnscaled = this.player.x / LAYOUT_SCALE;
    const walkUnscaled = hillWalkY(xUnscaled);
    if (walkUnscaled == null) return;
    const surface = u(walkUnscaled);
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    // Only stick while falling/standing — leave upward jumps free.
    if (body.velocity.y < 0) return;
    if (this.player.y < surface - u(10)) return;
    this.player.y = surface;
    this.player.setVelocityY(0);
    this.grounded = true;
  }

  private makePropView(def: SpawnPartDef): Phaser.GameObjects.Image {
    const cx = u(def.x);
    if (def.kind === "bridge") {
      // Anchor the measured deck top on WALK_Y (= solid top / bank walk line).
      const displayH = u(Math.round(def.w * BRIDGE_PROP.aspect));
      return this.add
        .image(cx, WALK_Y, "prop-bridge")
        .setOrigin(0.5, BRIDGE_PROP.deckFromTop)
        .setDisplaySize(u(def.w), displayH)
        .setVisible(false)
        .setDepth(6);
    }
    if (def.kind === "rope") {
      const ropeH = u(def.h);
      // Top of rope = underside of the treehouse deck.
      return this.add
        .image(cx, u(def.y) - ropeH / 2, "prop-rope-world")
        .setOrigin(0.5, 0)
        .setDisplaySize(u(14), ropeH)
        .setVisible(false)
        .setDepth(5);
    }
    if (def.kind === "ladder") {
      return this.add
        .image(cx, u(def.y), "prop-ladder")
        .setDisplaySize(u(70), u(def.h))
        .setVisible(false)
        .setDepth(6);
    }
    return this.add
      .image(cx, u(def.y), "prop-bridge")
      .setDisplaySize(u(def.w + 20), u(50))
      .setVisible(false)
      .setDepth(6);
  }

  private wireDebugOpeners(): void {
    window.addEventListener(DEBUG_OPEN_PUZZLE_EVENT, ((e: CustomEvent<DebugOpenPuzzleDetail>) => {
      if (!isDebugMode()) return;
      const id = e.detail?.puzzleId?.trim();
      if (!id) return;
      if (id === "free-transform") {
        this.openFreeTransform();
        return;
      }
      const puzzle = mergedPuzzles().find((p) => p.id === id);
      if (puzzle) this.tryOpenPuzzleDirect(puzzle);
    }) as EventListener);
  }

  private openQueryPuzzle(): void {
    const { puzzleId } = parsePuzzleQuery(window.location.search);
    if (!puzzleId) return;
    this.time.delayedCall(80, () => {
      const puzzle = mergedPuzzles().find((p) => p.id === puzzleId);
      if (puzzle) this.tryOpenPuzzleDirect(puzzle);
    });
  }

  private tryOpenPuzzleDirect(puzzle: Puzzle): void {
    if (this.worldPaused || isOverlayOpen() || this.transforming) return;
    unlockSpeech();
    this.activeSlotId = null;
    this.openPuzzleNow(puzzle);
  }

  private tryOpenSlot(slot: Station): void {
    if (this.worldPaused || isOverlayOpen() || this.transforming) return;
    if (this.solved.has(slot.id)) return;
    const template = pickRandomPuzzle(mergedPuzzles(), slot.category);
    if (!template) return;
    this.activeSlotId = slot.id;
    const puzzle = puzzleForSlot(slot, template);
    if (isAutoSolvePuzzles()) {
      this.applyEffect(puzzle);
      return;
    }
    unlockSpeech();
    this.openPuzzleNow(puzzle);
  }

  private tryOpenStreetCrossing(): void {
    if (this.streetCrossingDone || this.pendingStreetCrossing) return;
    if (this.worldPaused || isOverlayOpen() || this.transforming || this.climbing) return;
    if (!isCategoryEnabled("buchstabenstrasse")) return;
    const tx = u(STREET_CROSSING.triggerX);
    const half = u(STREET_CROSSING.triggerW) / 2;
    if (Math.abs(this.player.x - tx) > half) return;
    if (Math.abs(this.player.y - WALK_Y) > u(80)) return;

    const puzzle =
      mergedPuzzles().find((p) => p.id === STREET_CROSSING.puzzleId) ??
      mergedPuzzles().find((p) => p.type === "buchstabenstrasse");
    if (!puzzle) return;

    this.activeSlotId = null;
    this.pendingStreetCrossing = true;
    if (isAutoSolvePuzzles()) {
      this.applyEffect(puzzle);
      return;
    }
    unlockSpeech();
    this.openPuzzleNow(puzzle);
  }

  private createAnims(): void {
    for (const id of MECH_CHARS) {
      const art = MECH_ART[id];
      if (this.anims.exists(art.walkAnim)) continue;
      this.anims.create({
        key: art.walkAnim,
        frames: art.walkFrames.map((key) => ({ key })),
        // ~8 fps: readable comic walk without stuttering between frames
        frameRate: 8,
        repeat: -1,
      });
    }
  }

  private drawBackdrop(): void {
    const g = this.add.graphics().setDepth(0);
    g.fillStyle(0x4da3ff, 1);
    g.fillRect(0, WORLD_TOP, W, WORLD_H);
    g.fillStyle(0x6bb5ff, 1);
    g.fillRect(0, WORLD_TOP, W, u(170) - WORLD_TOP);

    for (const gap of WATER_GAPS) {
      if (gap.kind === "stream") this.drawStream(g, gap.x0, gap.x1);
      else if (gap.kind === "lake") this.drawLake(g, gap.x0, gap.x1);
      else if (gap.kind === "street") this.drawStreet(g, gap.x0, gap.x1);
    }

    let cursor = 0;
    const edges = WATER_GAPS.flatMap((g) => [g.x0, g.x1]).sort((a, b) => a - b);
    const bankEnds = [...edges, WORLD.width];
    for (const end of bankEnds) {
      if (end > cursor) {
        const inGap = WATER_GAPS.some((g) => cursor >= g.x0 && cursor < g.x1);
        if (!inGap) this.drawGrassBank(g, u(cursor), u(end - cursor));
      }
      cursor = end;
    }
  }

  /**
   * Draw grassy hill mounds above the far ridge (depth 2) so they stay visible,
   * following the same sine profile as hillWalkY.
   */
  private placeHills(): void {
    const g = this.add.graphics().setDepth(2);
    for (const hill of WALKABLE_HILLS) {
      const samples = 40;
      const span = hill.x1 - hill.x0;
      const crest: { x: number; y: number }[] = [];
      for (let i = 0; i <= samples; i++) {
        const x0 = hill.x0 + (span * i) / samples;
        const walk = hillWalkY(x0) ?? WORLD.groundY + 12;
        // Drawn grass edge sits u(12) above the walk/feet line.
        crest.push({ x: u(x0), y: u(walk) - u(12) });
      }
      const left = crest[0]!;
      const right = crest[crest.length - 1]!;

      g.fillStyle(0x2faa48, 1);
      g.beginPath();
      g.moveTo(left.x, GROUND + u(40));
      g.lineTo(left.x, left.y);
      for (let i = 1; i < crest.length; i++) g.lineTo(crest[i]!.x, crest[i]!.y);
      g.lineTo(right.x, GROUND + u(40));
      g.closePath();
      g.fillPath();

      g.fillStyle(0x3dcc5a, 1);
      g.beginPath();
      g.moveTo(left.x, GROUND + u(8));
      g.lineTo(left.x, left.y);
      for (let i = 1; i < crest.length; i++) g.lineTo(crest[i]!.x, crest[i]!.y);
      g.lineTo(right.x, GROUND + u(8));
      g.closePath();
      g.fillPath();

      g.fillStyle(0x7af08a, 1);
      g.beginPath();
      const mid = Math.floor(crest.length / 2);
      g.moveTo(crest[Math.floor(mid * 0.55)]!.x, crest[Math.floor(mid * 0.55)]!.y + u(18));
      for (let i = Math.floor(mid * 0.55); i <= Math.ceil(mid * 1.45); i++) {
        g.lineTo(crest[i]!.x, crest[i]!.y + u(6));
      }
      g.lineTo(crest[Math.ceil(mid * 1.45)]!.x, crest[Math.ceil(mid * 1.45)]!.y + u(28));
      g.closePath();
      g.fillPath();

      g.fillStyle(0x2e9a44, 1);
      for (let i = 2; i < crest.length - 2; i += 3) {
        const p = crest[i]!;
        g.fillTriangle(p.x, p.y, p.x + u(5), p.y - u(12), p.x + u(10), p.y);
      }

      // Hide the flat meadow edge under the mound so only one continuous contour remains.
      g.fillStyle(0x3dcc5a, 1);
      g.fillRect(left.x, GROUND - u(3), right.x - left.x, u(7));

      // Same weight/color as drawGrassBank's top edge (u(5) / #1A1A1A).
      g.lineStyle(u(5), 0x1a1a1a, 1);
      for (let i = 0; i < crest.length - 1; i++) {
        g.lineBetween(crest[i]!.x, crest[i]!.y, crest[i + 1]!.x, crest[i + 1]!.y);
      }
    }
  }

  private placeFarRidge(): void {
    const ridges: [number, number, number][] = [
      [u(520), u(720), u(160)],
      [u(1500), u(640), u(140)],
      [u(2500), u(700), u(150)],
      [u(3600), u(680), u(145)],
      [u(4600), u(640), u(130)],
    ];
    for (const [x, w, h] of ridges) {
      this.add
        .image(x, GROUND - h * 0.42, "prop-far-ridge")
        .setDisplaySize(w, h)
        .setAlpha(0.92)
        .setDepth(1);
    }
  }

  private placeSkyline(): void {
    const scroll = 0.42;
    const buildings: [number, number, number, number][] = [
      [280, 160, 300, 0.88],
      [720, 190, 340, 0.82],
      [1280, 170, 310, 0.9],
      [1900, 210, 380, 0.78],
      [2600, 180, 330, 0.85],
      [3300, 200, 360, 0.8],
      [4000, 175, 320, 0.88],
      [4700, 195, 350, 0.82],
    ];
    for (const [x0, w0, h0, alpha] of buildings) {
      this.add
        .image(u(x0), GROUND - u(8), "prop-hochhaus")
        .setOrigin(0.5, 1)
        .setDisplaySize(u(w0), u(h0))
        .setScrollFactor(scroll, 1)
        .setAlpha(alpha)
        .setDepth(0.5);
    }
  }

  private placeTreehouse(): void {
    // Sink trunk into the turf so roots read as planted, not floating.
    this.add
      .image(u(TREEHOUSE.propX), PROP_FEET_Y + u(TREEHOUSE.plantSink), "prop-treehouse")
      .setOrigin(0.5, 1)
      .setDisplaySize(u(TREEHOUSE.propW), u(TREEHOUSE.propH))
      .setDepth(1);
  }

  private inGapUnscaled(xUnscaled: number, kinds?: Array<"stream" | "lake" | "street">): boolean {
    return WATER_GAPS.some(
      (g) => (!kinds || kinds.includes(g.kind)) && xUnscaled >= g.x0 && xUnscaled <= g.x1,
    );
  }

  private placeMeadowDecor(): void {
    const lineTufts: [number, number, number][] = [
      [90, 52, 38],
      [210, 46, 34],
      [400, 56, 42],
      [580, 50, 36],
      [700, 48, 36],
      [1100, 54, 40],
      [1260, 46, 34],
      [1520, 58, 44],
      [1760, 50, 38],
      [2050, 52, 40],
      [2340, 48, 36],
      [2950, 50, 38],
      [3480, 48, 36],
      [3800, 54, 40],
      [4200, 50, 38],
      [4600, 52, 40],
      [4900, 48, 36],
    ];
    for (const [x0, w0, h0] of lineTufts) {
      if (this.inGapUnscaled(x0)) continue;
      this.add
        .image(u(x0), PROP_FEET_Y, "prop-grass-tuft")
        .setOrigin(0.5, 1)
        .setDisplaySize(u(w0), u(h0))
        .setDepth(4);
    }

    const lineFlowers: [number, number, number][] = [
      [150, 42, 42],
      [340, 40, 40],
      [520, 44, 44],
      [1180, 42, 42],
      [1420, 46, 46],
      [1920, 40, 40],
      [2200, 44, 44],
      [3020, 42, 42],
      [3600, 46, 46],
      [4100, 40, 40],
      [4550, 44, 44],
    ];
    for (const [x0, w0, h0] of lineFlowers) {
      if (this.inGapUnscaled(x0)) continue;
      const bloom = this.add
        .image(u(x0), PROP_FEET_Y, "prop-flowers")
        .setOrigin(0.5, 1)
        .setDisplaySize(u(w0), u(h0))
        .setDepth(5);
      this.tweens.add({
        targets: bloom,
        angle: { from: -3, to: 3 },
        duration: 2200 + (x0 % 7) * 90,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
    }

    const belowTufts: [number, number, number, number][] = [
      [160, 36, 26, 36],
      [450, 34, 24, 48],
      [640, 38, 28, 40],
      [1200, 36, 26, 52],
      [1600, 34, 24, 44],
      [2100, 38, 28, 56],
      [3000, 34, 24, 50],
      [3600, 36, 26, 42],
      [4300, 34, 24, 48],
      [4800, 36, 26, 40],
    ];
    for (const [x0, w0, h0, dy0] of belowTufts) {
      if (this.inGapUnscaled(x0)) continue;
      this.add
        .image(u(x0), GROUND + u(dy0), "prop-grass-tuft")
        .setOrigin(0.5, 1)
        .setDisplaySize(u(w0), u(h0))
        .setAlpha(0.9)
        .setDepth(2);
    }
    const belowFlowers: [number, number, number, number][] = [
      [280, 32, 32, 58],
      [620, 30, 30, 70],
      [1300, 34, 34, 62],
      [1850, 30, 30, 48],
      [3500, 32, 32, 66],
      [4400, 30, 30, 54],
    ];
    for (const [x0, w0, h0, dy0] of belowFlowers) {
      if (this.inGapUnscaled(x0)) continue;
      this.add
        .image(u(x0), GROUND + u(dy0), "prop-flowers")
        .setOrigin(0.5, 1)
        .setDisplaySize(u(w0), u(h0))
        .setAlpha(0.88)
        .setDepth(2);
    }
  }

  private drawStream(g: Phaser.GameObjects.Graphics, x0: number, x1: number): void {
    const left = u(x0);
    const width = u(x1 - x0);
    const mid = left + width / 2;
    g.fillStyle(0x1e88c8, 1);
    g.fillRect(left, GROUND - u(6), width, H - GROUND + u(6));
    g.fillStyle(0x42b6ef, 1);
    g.fillEllipse(mid, GROUND + u(40), width + u(20), u(90));
    g.fillStyle(0xffffff, 1);
    g.fillRoundedRect(left + u(12), GROUND - u(4), width - u(24), u(8), u(4));
    g.lineStyle(u(4), 0x1a1a1a, 1);
    g.strokeRoundedRect(left + u(12), GROUND - u(4), width - u(24), u(8), u(4));
    g.fillStyle(0xffffff, 0.35);
    g.fillEllipse(mid - u(80), GROUND + u(36), u(70), u(14));
    g.fillEllipse(mid + u(50), GROUND + u(64), u(90), u(16));
    g.fillStyle(0x3dcc5a, 1);
    g.fillEllipse(left - u(2), GROUND + u(8), u(58), u(42));
    g.fillEllipse(left + width + u(2), GROUND + u(8), u(58), u(42));
    g.lineStyle(u(4), 0x1a1a1a, 1);
    g.strokeEllipse(left - u(2), GROUND + u(8), u(58), u(42));
    g.strokeEllipse(left + width + u(2), GROUND + u(8), u(58), u(42));
  }

  private drawLake(g: Phaser.GameObjects.Graphics, x0: number, x1: number): void {
    const left = u(x0);
    const width = u(x1 - x0);
    const mid = left + width / 2;
    g.fillStyle(0x1565a0, 1);
    g.fillRect(left, GROUND - u(4), width, H - GROUND + u(4));
    g.fillStyle(0x2e9fd6, 1);
    g.fillEllipse(mid, GROUND + u(50), width + u(40), u(120));
    g.fillStyle(0xffffff, 0.9);
    g.fillRoundedRect(left + u(20), GROUND - u(2), width - u(40), u(10), u(5));
    g.lineStyle(u(4), 0x1a1a1a, 1);
    g.strokeRoundedRect(left + u(20), GROUND - u(2), width - u(40), u(10), u(5));
    g.fillStyle(0xffffff, 0.3);
    g.fillEllipse(mid - u(120), GROUND + u(44), u(110), u(18));
    g.fillEllipse(mid + u(90), GROUND + u(78), u(130), u(22));
    g.fillStyle(0x3dcc5a, 1);
    g.fillEllipse(left - u(4), GROUND + u(10), u(70), u(48));
    g.fillEllipse(left + width + u(4), GROUND + u(10), u(70), u(48));
    g.lineStyle(u(4), 0x1a1a1a, 1);
    g.strokeEllipse(left - u(4), GROUND + u(10), u(70), u(48));
    g.strokeEllipse(left + width + u(4), GROUND + u(10), u(70), u(48));
  }

  private drawStreet(g: Phaser.GameObjects.Graphics, x0: number, x1: number): void {
    const left = u(x0);
    const width = u(x1 - x0);
    const top = GROUND - u(2);
    const roadH = H - GROUND + u(2);
    g.fillStyle(0x4a4a4a, 1);
    g.fillRect(left, top, width, roadH);
    g.fillStyle(0x5c5c5c, 1);
    g.fillRect(left, top, width, u(18));
    g.fillStyle(0xf5f5f5, 1);
    const dashW = u(36);
    const gap = u(28);
    const midY = GROUND + u(28);
    for (let x = left + u(16); x < left + width - u(16); x += dashW + gap) {
      g.fillRect(x, midY, dashW, u(6));
    }
    g.lineStyle(u(4), 0x1a1a1a, 1);
    g.lineBetween(left, GROUND, left + width, GROUND);
  }

  private drawGrassBank(g: Phaser.GameObjects.Graphics, x: number, width: number): void {
    if (width <= 0) return;
    // Drawn grass edge at GROUND; physics walk / prop feet use WALK_Y below it.
    g.fillStyle(0x4a7a28, 1);
    g.fillRect(x, GROUND + u(14), width, H - GROUND - u(14));

    g.fillStyle(0x3dcc5a, 1);
    g.fillRect(x, GROUND, width, H - GROUND);

    g.fillStyle(0x58e070, 1);
    const scallop = u(16);
    for (let i = -scallop; i < width + scallop; i += scallop) {
      // Scallops sit under the walk line so the top edge stays flat for feet.
      g.fillCircle(x + i, GROUND + scallop * 0.55, scallop);
    }

    g.fillStyle(0x7af08a, 1);
    g.fillRect(x, GROUND, width, u(6));

    g.fillStyle(0x2faa48, 0.35);
    for (const [ox, oy, rw, rh] of [
      [u(50), u(34), u(100), u(26)],
      [u(190), u(48), u(78), u(22)],
      [u(340), u(38), u(120), u(28)],
      [u(520), u(52), u(88), u(24)],
      [u(700), u(42), u(96), u(26)],
    ] as const) {
      if (ox > width - u(40)) continue;
      g.fillEllipse(x + ox, GROUND + oy, rw, rh);
    }

    // Short grass blades grow from the walk surface (decoration only).
    g.fillStyle(0x2e9a44, 1);
    for (let i = u(16); i < width; i += u(28)) {
      const hx = x + i;
      g.fillTriangle(hx, GROUND, hx + u(5), GROUND - u(12), hx + u(10), GROUND);
      g.fillTriangle(hx + u(8), GROUND, hx + u(14), GROUND - u(9), hx + u(18), GROUND);
    }

    g.lineStyle(u(5), 0x1a1a1a, 1);
    g.lineBetween(x, GROUND, x + width, GROUND);
  }

  private placeClouds(): void {
    for (const [x0, y0, r0] of [
      [180, 80, 36],
      [420, 60, 44],
      [900, 70, 40],
      [1400, 55, 38],
      [2100, 75, 42],
      [2800, 62, 36],
      [3400, 80, 40],
      [4000, 68, 38],
      [4600, 74, 42],
      [5000, 60, 36],
    ] as const) {
      const x = u(x0);
      const y = u(y0);
      const r = u(r0);
      const g = this.add.graphics().setDepth(1);
      g.fillStyle(0xffffff, 1);
      g.fillCircle(0, 0, r);
      g.fillCircle(r, u(8), r * 0.75);
      g.fillCircle(-r * 0.7, u(10), r * 0.7);
      g.setPosition(x, y);
      this.tweens.add({
        targets: g,
        x: x + u(36),
        duration: 7000 + r * 40,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
    }
  }

  private placeWater(): void {
    for (const gap of WATER_GAPS) {
      if (gap.kind === "street") continue;
      const mid = (gap.x0 + gap.x1) / 2;
      const span = gap.x1 - gap.x0;
      const ripples: [number, number, number][] =
        gap.kind === "lake"
          ? [
              [mid - span * 0.28, 28, 64],
              [mid, 56, 72],
              [mid + span * 0.22, 82, 58],
              [mid - span * 0.1, 100, 50],
            ]
          : [
              [mid - 40, 28, 52],
              [mid + 40, 56, 58],
              [mid, 82, 44],
            ];
      for (const [x0, yOff, w0] of ripples) {
        const x = u(x0);
        const ripple = this.add.rectangle(x, GROUND + u(yOff), u(w0), u(8), 0xffffff, 0.45).setDepth(2);
        this.tweens.add({
          targets: ripple,
          x: x + u(28),
          alpha: 0.12,
          duration: 1600,
          yoyo: true,
          repeat: -1,
          ease: "Sine.easeInOut",
        });
      }
    }
  }

  private placeTown(): void {
    const deco = [
      [48, "prop-house", 140, 120],
      [320, "prop-tree", 145, 172],
      [1180, "prop-tree", 158, 185],
      [1320, "prop-house", 130, 110],
      [2200, "prop-house", 150, 125],
      [2980, "prop-tree", 142, 168],
      [4000, "prop-house", 140, 118],
      [4300, "prop-tree", 150, 178],
      [4700, "prop-house", 145, 122],
      [5000, "prop-tree", 148, 172],
    ] as const;
    for (const [i, [x0, key, w0, h0]] of deco.entries()) {
      if (this.inGapUnscaled(x0)) continue;
      const w = u(w0);
      const h = u(h0);
      const img = this.add
        .image(u(x0), PROP_FEET_Y, key)
        .setOrigin(0.5, 1)
        .setDisplaySize(w, h)
        .setDepth(3);
      if (key === "prop-house" && i % 3 === 0) img.setTint(0xfff3e0);
      if (key === "prop-tree") {
        img.setAngle(i % 2 === 0 ? -2 : 2);
        this.tweens.add({
          targets: img,
          angle: i % 2 === 0 ? 2.5 : -2.5,
          duration: 2200 + i * 120,
          yoyo: true,
          repeat: -1,
          ease: "Sine.easeInOut",
        });
      }
    }
  }

  private applyPlayerLook(): void {
    this.applyLookFor(this.character, this.visualShape());
    this.titleLabel?.setText(`Bachbrücke — ${characterDisplayName(this.character)}`);
    this.syncTransformButton();
  }

  /** Show the other form of the current mech on the Verwandeln pad. */
  private syncTransformButton(): void {
    const target = alternateShape(this.shape);
    const name = shapeDisplayName(target);
    const img = document.getElementById("pad-transform-img") as HTMLImageElement | null;
    const label = document.getElementById("pad-transform-label");
    const btn = document.getElementById("pad-transform");
    if (img) img.src = artPublicPath(this.character, target);
    if (label) label.textContent = name;
    if (btn) btn.setAttribute("aria-label", `Verwandeln zu ${name}`);
  }

  /** Shape used for sprites / poses (auto can look like mech while jumping). */
  private visualShape(): ShapeId {
    return this.jumpAsMech ? "mech" : this.shape;
  }

  private applyLookFor(character: CharacterId, shape: ShapeId): void {
    this.player.anims.stop();
    const key = textureFor(character, shape);
    this.player.setTexture(key);
    const size = shape === "auto" ? AUTO_SIZE : MECH_SIZE;
    this.player.setDisplaySize(size.w, size.h);
    this.player.setOrigin(0.5, 1);
    this.baseScale = { x: this.player.scaleX, y: this.player.scaleY };
    this.syncPlayerBody();
  }

  /** Body bottom == sprite origin (feet). Stable world size despite walk-frame crops. */
  private syncPlayerBody(): void {
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    const size = this.visualShape() === "auto" ? AUTO_SIZE : MECH_SIZE;
    const sx = Math.abs(this.player.scaleX) || 1;
    const sy = Math.abs(this.player.scaleY) || 1;
    const fw = this.player.frame.realWidth;
    const fh = this.player.frame.realHeight;
    const bw = Math.max(8, Math.round((size.w * 0.48) / sx));
    const bh = Math.max(8, Math.round(size.h / sy));
    body.setSize(bw, bh, false);
    body.setOffset(Math.round((fw - bw) / 2), Math.round(fh - bh));
  }

  private block(
    x: number,
    y: number,
    w: number,
    h: number,
    color: number,
    visible = true,
    enable = visible,
  ): Phaser.GameObjects.Rectangle {
    const r = this.add.rectangle(x, y, w, h, color);
    this.physics.add.existing(r, true);
    r.setVisible(visible);
    const body = r.body as Phaser.Physics.Arcade.StaticBody;
    body.enable = enable;
    return r;
  }

  private spawnKindFor(def: SpawnPartDef): SpawnKind {
    if (def.kind === "bridge") return "bridge";
    if (def.kind === "rope") return "rope";
    if (def.kind === "ladder") return "ladder";
    if (def.kind === "street") return "platform";
    return "platform";
  }

  private revealPart(id: string): void {
    const part = this.partsById.get(id);
    if (!part) return;
    const kind = this.spawnKindFor(part.def);

    if (part.solid) {
      part.solid.setVisible(false);
      const body = part.solid.body as Phaser.Physics.Arcade.StaticBody;
      body.enable = true;
      body.updateFromGameObject();
    }
    if (part.climb) {
      part.climb.setVisible(false);
      const body = part.climb.body as Phaser.Physics.Arcade.StaticBody;
      // Rope/ladder: climb sensors only (never solid floors).
      body.enable = true;
      body.updateFromGameObject();
    }

    const view = part.view;
    if (!view) return;
    const destY = view.y;
    const motion = spawnMotion(kind);
    view.setVisible(true).setAlpha(0);
    view.y = destY + Math.round(motion.fromY * LAYOUT_SCALE);
    this.tweens.add({
      targets: view,
      y: destY,
      alpha: 1,
      duration: motion.duration,
      ease: kind === "bridge" || kind === "platform" ? "Bounce.easeOut" : "Cubic.easeOut",
    });
  }

  private revealEffect(effect: WorldEffect): void {
    for (const def of spawnPartsForEffect(effect)) {
      this.revealPart(def.id);
    }
  }

  private enterClimb(anchorX: number, sensor: Phaser.GameObjects.Rectangle): void {
    this.climbing = true;
    this.climbAnchorX = anchorX;
    this.climbSensor = sensor;
    this.climbLatchUntil = this.time.now + CLIMB_LATCH_MS;
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    body.allowGravity = false;
    // Platforms must not block vertical travel along the rope/ladder.
    body.checkCollision.none = true;
    this.player.setVelocity(0, 0);
    this.player.x = anchorX;
  }

  /**
   * Leave rope/ladder. `dir` pushes horizontally so the mech clears the grab zone;
   * `hop` adds an upward jump. Always sets a short re-grab lock.
   */
  private exitClimb(hop: boolean, dir: -1 | 0 | 1 = 0): void {
    if (!this.climbing) return;
    this.climbing = false;
    this.climbSensor = null;
    this.climbLatchUntil = 0;
    this.climbLockUntil = this.time.now + CLIMB_REGRAB_LOCK_MS;
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    body.allowGravity = true;
    body.checkCollision.none = false;
    if (dir !== 0) {
      this.player.x = this.climbAnchorX + dir * u(40);
      this.player.setFlipX(dir < 0);
      this.player.setVelocityX(dir * moveSpeed("mech"));
    }
    if (hop) this.player.setVelocityY(CLIMB_DETACH_VY);
  }

  private climbLatched(): boolean {
    return this.climbing && this.time.now < this.climbLatchUntil;
  }

  private climbSensorActive(part: PartRuntime): boolean {
    if (!part.climb) return false;
    return (part.climb.body as Phaser.Physics.Arcade.StaticBody).enable;
  }

  private clampClimbToSensor(): void {
    if (!this.climbSensor) return;
    const body = this.climbSensor.body as Phaser.Physics.Arcade.StaticBody;
    // Feet stay inside the climb span (top = deck, bottom = meadow grab).
    const minY = body.top + u(4);
    const maxY = body.bottom - u(4);
    if (this.player.y < minY) {
      this.player.y = minY;
      this.player.setVelocityY(0);
    } else if (this.player.y > maxY) {
      this.player.y = maxY;
      this.player.setVelocityY(0);
    }
  }

  /** True when feet are at the top of the current climb sensor (deck height). */
  private atClimbTop(): boolean {
    if (!this.climbSensor) return false;
    const body = this.climbSensor.body as Phaser.Physics.Arcade.StaticBody;
    return this.player.y <= body.top + u(16);
  }

  private tryGrabClimb(): void {
    if (this.climbing || !canClimb(this.shape, this.worldPaused) || this.transforming) return;
    if (this.time.now < this.climbLockUntil) return;
    for (const part of this.partsById.values()) {
      if (!part.climb || !this.climbSensorActive(part)) continue;
      const sensor = part.climb;
      const body = sensor.body as Phaser.Physics.Arcade.StaticBody;
      if (Math.abs(this.player.x - sensor.x) > CLIMB_GRAB_DX) continue;
      const feet = this.player.y;
      const head = this.player.y - this.player.displayHeight;
      // Generous vertical band — grab while jumping past the rope.
      if (feet < body.top - u(48) || head > body.bottom + u(48)) continue;
      this.enterClimb(sensor.x, sensor);
      return;
    }
  }

  private placeStations(): void {
    this.stations = [];
    this.stationViews = [];
    for (const slot of resolvedStationSlots()) {
      const x = u(slot.x);
      // slot.y for elevated boards is feet Y on that platform (e.g. treehouse deck).
      const feetY = slot.elevated ? u(slot.y) : PROP_FEET_Y;
      const y = feetY - u(50);
      const station: Station = { ...slot, x, y };
      this.stations.push(station);
      const tex = signKeyForCategory(slot.category);
      const key = this.textures.exists(tex) ? tex : "station-sign";
      const sign = this.add
        .image(x, feetY, key)
        .setOrigin(0.5, 1)
        .setDisplaySize(u(78), u(110))
        .setDepth(7);
      if (this.solved.has(slot.id)) sign.setAlpha(0.35);
      this.stationViews.push(sign);
    }
  }

  /** Visual cue for the Buchstabenstraße gate (not a random board slot). */
  private placeStreetSign(): void {
    this.streetSign?.destroy();
    this.streetSign = null;
    if (!isCategoryEnabled("buchstabenstrasse")) return;
    const tex = signKeyForCategory("buchstabenstrasse");
    const key = this.textures.exists(tex) ? tex : "station-sign";
    this.streetSign = this.add
      .image(u(STREET_CROSSING.signX), PROP_FEET_Y, key)
      .setOrigin(0.5, 1)
      .setDisplaySize(u(78), u(110))
      .setDepth(7);
    if (this.streetCrossingDone) this.streetSign.setAlpha(0.35);
  }

  /** Rebuild boards when Settings toggles categories (keeps solved state). */
  private rebuildStations(): void {
    for (const view of this.stationViews) {
      this.tweens.killTweensOf(view);
      view.destroy();
    }
    this.stationViews = [];
    this.stations = [];
    this.placeStations();
    this.placeStreetSign();
  }

  private wireHud(): void {
    const bind = (id: string, key: "left" | "right" | "jump") => {
      const el = document.getElementById(id);
      if (!el) return;
      const on = (e: Event) => {
        e.preventDefault();
        unlockSpeech();
        this.cursors[key] = true;
      };
      const off = () => {
        this.cursors[key] = false;
      };
      el.addEventListener("pointerdown", on);
      el.addEventListener("pointerup", off);
      el.addEventListener("pointerleave", off);
    };
    bind("pad-left", "left");
    bind("pad-right", "right");
    bind("pad-jump", "jump");
    const transformBtn = document.getElementById("pad-transform");
    transformBtn?.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      unlockSpeech();
      this.openFreeTransform();
    });
  }

  private wireKeyboard(): void {
    const kb = this.input.keyboard;
    if (!kb) return;
    this.keys = {
      // enableCapture=false so A/D/W/Space still type into puzzle letter slots.
      left: kb.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT, false),
      right: kb.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT, false),
      up: kb.addKey(Phaser.Input.Keyboard.KeyCodes.UP, false),
      down: kb.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN, false),
      space: kb.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE, false),
      a: kb.addKey(Phaser.Input.Keyboard.KeyCodes.A, false),
      d: kb.addKey(Phaser.Input.Keyboard.KeyCodes.D, false),
      w: kb.addKey(Phaser.Input.Keyboard.KeyCodes.W, false),
      s: kb.addKey(Phaser.Input.Keyboard.KeyCodes.S, false),
    };
    window.addEventListener("keydown", (e) => {
      if (isOverlayOpen() || isTypingField()) return;
      if (e.code === "Space" || e.code.startsWith("Arrow")) e.preventDefault();
      if (e.code === "Space" || e.code === "ArrowUp") unlockSpeech();
    });
  }

  private keyboardMove(): {
    left: boolean;
    right: boolean;
    jump: boolean;
    up: boolean;
    down: boolean;
  } {
    if (!this.keys || isOverlayOpen() || isTypingField()) {
      return { left: false, right: false, jump: false, up: false, down: false };
    }
    return {
      left: this.keys.left.isDown || this.keys.a.isDown,
      right: this.keys.right.isDown || this.keys.d.isDown,
      jump: this.keys.space.isDown,
      up: this.keys.up.isDown || this.keys.w.isDown,
      down: this.keys.down.isDown || this.keys.s.isDown,
    };
  }

  update(time: number): void {
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    this.grounded = body.blocked.down || body.touching.down;
    if (this.player.y > H + u(40)) {
      this.exitClimb(false);
      this.player.setVelocity(0, 0);
      this.player.setPosition(this.checkpoint.x, this.checkpoint.y);
      if (this.jumpAsMech) {
        this.jumpAsMech = false;
        this.applyPlayerLook();
      }
    }

    if (this.worldPaused || isOverlayOpen()) {
      this.player.setVelocityX(0);
      if (this.climbing) this.player.setVelocityY(0);
      this.applyPose(time, true);
      return;
    }

    if (this.climbing && !canClimb(this.shape, this.worldPaused)) {
      this.exitClimb(false);
    }

    const move = combineMove(this.cursors, this.keyboardMove());

    if (this.climbing) {
      const anchorX = this.climbAnchorX;
      this.player.x = anchorX;
      this.player.setVelocityX(0);
      const keyUp = Boolean(this.keys && (this.keys.up.isDown || this.keys.w.isDown));
      const keyDown = Boolean(this.keys && (this.keys.down.isDown || this.keys.s.isDown));
      const keySpace = Boolean(this.keys?.space.isDown);
      const latched = this.climbLatched();
      // While latched: hang/climb only — no walk-off or jump-off yet.
      if (!latched && (move.left || move.right)) {
        const dir: -1 | 1 = move.left && !move.right ? -1 : 1;
        this.exitClimb(false, dir);
      } else if (!latched && keySpace && !keyUp) {
        this.exitClimb(true, 0);
        this.playJump();
      } else {
        // Touch jump-pad / W / ↑ = climb up; S / ↓ = climb down.
        const climbUp = keyUp || this.cursors.jump;
        const climbDown = keyDown;
        this.player.setVelocityY(climbVelocityY({ up: climbUp, down: climbDown, jump: false }));
        this.clampClimbToSensor();
        // Reaching the top plants the mech on the treehouse deck (allowed during latch).
        if (this.atClimbTop() && !climbDown) {
          this.exitClimb(false, 0);
          this.player.y = u(treehouseDeckTop());
          this.player.setVelocity(0, 0);
        }
      }
    } else {
      this.applyHillSurface();
      const speed = moveSpeed(this.shape);
      if (move.left && !move.right) {
        this.player.setVelocityX(-speed);
        this.player.setFlipX(true);
      } else if (move.right && !move.left) {
        this.player.setVelocityX(speed);
        this.player.setFlipX(false);
      } else this.player.setVelocityX(0);

      const wantJump = move.jump || Boolean(move.up);
      if (wantJump && canJump(this.grounded, this.worldPaused) && !this.transforming) {
        // Auto morphs into walking mech for the jump (higher leap), then back on land.
        const jumpShape: ShapeId = this.shape === "auto" ? "mech" : this.shape;
        this.player.setVelocityY(jumpVelocity(jumpShape));
        this.playJump();
      }
      // Grab in air or on ground — including while holding jump toward the rope.
      this.tryGrabClimb();
    }

    if (!this.wasGrounded && this.grounded) this.playLand();
    this.wasGrounded = this.grounded;
    this.applyPose(time, false);

    if (!this.checkpointFromSolve && this.player.x > u(CHECKPOINT_AFTER_X)) {
      this.checkpoint = { x: u(CHECKPOINT_AFTER_X + 20), y: RESPAWN.y };
    }

    this.tryOpenStreetCrossing();

    for (const s of this.stations) {
      if (this.solved.has(s.id) || this.worldPaused) continue;
      if (Math.abs(this.player.x - s.x) < u(50) && Math.abs(this.player.y - s.y) < u(80)) {
        this.tryOpenSlot(s);
        break;
      }
    }

    if (this.player.x > u(GOAL_X) && !this.goalShown) {
      this.goalShown = true;
      document.getElementById("goal-banner")?.classList.remove("hidden");
    }
  }

  private applyPose(time: number, paused: boolean): void {
    if (this.transforming) return;
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    const pose = playerPose(this.grounded, body.velocity.x, paused, this.climbing);
    const look = this.visualShape();
    this.syncWalkAnim(pose, look);
    let scale = poseScale(pose, time, look, body.velocity.y);
    const takeoff = takeoffOverlay(time - this.jumpAt);
    if (takeoff && pose === "air") {
      scale = { x: scale.x * takeoff.x, y: scale.y * takeoff.y };
    }
    const land = landOverlay(time - this.landAt);
    if (land) {
      scale = { x: scale.x * land.x, y: scale.y * land.y };
    }
    // Keep display size locked — walk frames differ in crop and would otherwise jump.
    const size = look === "mech" ? MECH_SIZE : AUTO_SIZE;
    this.player.setDisplaySize(size.w, size.h);
    this.player.setOrigin(0.5, 1);
    this.baseScale = { x: this.player.scaleX, y: this.player.scaleY };
    this.player.setScale(this.baseScale.x * scale.x, this.baseScale.y * scale.y);
    this.player.setAngle(poseAngle(pose, this.player.flipX, time, look, body.velocity.y));
    this.syncPlayerBody();
  }

  private syncWalkAnim(pose: ReturnType<typeof playerPose>, look: ShapeId): void {
    const art = MECH_ART[this.character];
    if (look !== "mech") {
      if (this.player.anims.isPlaying) this.player.anims.stop();
      this.ensurePlayerTexture(art.autoKey, AUTO_SIZE.w, AUTO_SIZE.h);
      return;
    }
    if (pose === "walk") {
      const alreadyWalking =
        this.player.anims.isPlaying && this.player.anims.currentAnim?.key === art.walkAnim;
      if (!alreadyWalking) {
        // Size once before play so frame swaps keep a stable display box.
        this.ensurePlayerTexture(art.walkFrames[0]!, MECH_SIZE.w, MECH_SIZE.h);
        this.player.play(art.walkAnim, true);
      }
      return;
    }
    if (this.player.anims.isPlaying) this.player.anims.stop();
    this.ensurePlayerTexture(art.mechKey, MECH_SIZE.w, MECH_SIZE.h);
  }

  /** Apply texture + display size only when they change (avoids idle↔walk jitter). */
  private ensurePlayerTexture(key: string, w: number, h: number): void {
    const sameTex = this.player.texture.key === key;
    const sameSize =
      Math.round(this.player.displayWidth) === w && Math.round(this.player.displayHeight) === h;
    if (sameTex && sameSize) return;
    this.player.setTexture(key);
    this.player.setDisplaySize(w, h);
    this.player.setOrigin(0.5, 1);
    this.baseScale = { x: this.player.scaleX, y: this.player.scaleY };
    this.syncPlayerBody();
  }

  private playJump(): void {
    if (this.transforming) return;
    this.jumpAt = this.time.now;
    this.spawnJumpDust(0.7);
    if (this.shape === "auto" && !this.jumpAsMech) {
      this.jumpAsMech = true;
      this.playQuickMorph("mech");
    }
  }

  private playLand(): void {
    if (this.transforming) return;
    this.landAt = this.time.now;
    this.spawnJumpDust(1);
    if (this.jumpAsMech && this.shape === "auto") {
      this.jumpAsMech = false;
      this.playQuickMorph("auto");
    }
  }

  /** Small comic dirt puffs at the feet on jump / land. */
  private spawnJumpDust(strength: number): void {
    const x = this.player.x;
    const y = this.player.y - u(4);
    const n = Math.round(4 + strength * 3);
    const colors = [0xc4a574, 0xe8d4a8, 0xffd600, 0xffffff];
    for (let i = 0; i < n; i++) {
      const side = i % 2 === 0 ? -1 : 1;
      const spread = u(18) + i * u(6);
      const puff = this.add
        .circle(x, y, u(5) + strength * u(2), colors[i % colors.length])
        .setStrokeStyle(u(2), 0x1a1a1a)
        .setDepth(8)
        .setAlpha(0.9);
      this.tweens.add({
        targets: puff,
        x: x + side * spread,
        y: y - u(10) - i * u(3),
        alpha: 0,
        scale: 0.35,
        duration: 220 + i * 30,
        ease: "Cubic.easeOut",
        onComplete: () => puff.destroy(),
      });
    }
  }

  private openPuzzleNow(puzzle: Puzzle): void {
    this.worldPaused = true;
    this.physics.world.pause();
    this.player.setVelocity(0, 0);
    if (puzzle.type === "ballkanone") {
      openBallkanone(puzzle, {
        onSolved: (p) => this.applyEffect(p),
      });
      return;
    }
    if (puzzle.type === "buchstabenstrasse") {
      openBuchstabenstrasse(puzzle, {
        onSolved: (p) => this.applyEffect(p),
        character: this.character,
      });
      return;
    }
    if (puzzle.type === "buchstabenflieger") {
      openBuchstabenflieger(puzzle, {
        onSolved: (p) => this.applyEffect(p),
        character: this.character,
      });
      return;
    }
    if (puzzle.type === "kettenhochhaus") {
      openKettenhochhaus(puzzle, {
        onSolved: (p) => this.applyEffect(p),
      });
      return;
    }
    openPuzzle(puzzle, {
      onSolved: (p) => this.applyEffect(p),
    });
  }

  private openFreeTransform(): void {
    if (this.worldPaused || this.transforming || isOverlayOpen() || this.jumpAsMech) return;
    this.worldPaused = true;
    this.physics.world.pause();
    this.player.setVelocity(0, 0);
    openPuzzle(freeTransformPuzzle(), {
      onSolved: (p) => this.applyFreeTransform(p),
    });
  }

  private applyFreeTransform(puzzle: Puzzle): void {
    this.playSolveBurst(false);
    this.applyTransformEffect(puzzle.effect);
    this.worldPaused = false;
    this.physics.world.resume();
  }

  private applyTransformEffect(effect: WorldEffect): void {
    switch (effect) {
      case "transform_auto":
        this.playTransform(undefined, "auto");
        break;
      case "transform_mech":
        this.playTransform(undefined, "mech");
        break;
      case "transform_bolt":
        this.playTransform("bolt", "mech");
        break;
      case "transform_marina":
        this.playTransform("marina", "mech");
        break;
      case "transform_rush":
        this.playTransform("rush", "mech");
        break;
      default:
        break;
    }
  }

  private applyEffect(puzzle: Puzzle): void {
    const slotId = this.activeSlotId;
    if (slotId) this.solved.add(slotId);
    else this.solved.add(puzzle.id);
    const isTransform = puzzle.effect.startsWith("transform_");
    this.playSolveBurst(!isTransform);

    if (this.pendingStreetCrossing) {
      this.pendingStreetCrossing = false;
      this.streetCrossingDone = true;
      this.exitClimb(false);
      this.player.setPosition(u(STREET_CROSSING.exitX), STREET_CROSSING.exitY);
      this.player.setVelocity(0, 0);
      this.setCheckpoint(u(STREET_CROSSING.exitX), STREET_CROSSING.exitY);
      if (this.streetSign) {
        this.tweens.killTweensOf(this.streetSign);
        this.tweens.add({ targets: this.streetSign, alpha: 0.35, duration: 220 });
      }
    } else if (slotId) {
      const station = this.stations.find((s) => s.id === slotId);
      if (station) this.setCheckpointFromStation(station);
    }

    switch (puzzle.effect) {
      case "spawn_bridge":
      case "spawn_rope":
      case "spawn_ladder":
      case "spawn_platform":
      case "spawn_lake_bridge":
      case "spawn_street_crossing":
        this.revealEffect(puzzle.effect);
        break;
      case "transform_auto":
      case "transform_mech":
      case "transform_bolt":
      case "transform_marina":
      case "transform_rush":
        this.applyTransformEffect(puzzle.effect);
        break;
      default:
        break;
    }
    const idx = slotId
      ? this.stations.findIndex((s) => s.id === slotId)
      : -1;
    const sign = idx >= 0 ? this.stationViews[idx] : undefined;
    if (sign) {
      this.tweens.killTweensOf(sign);
      this.tweens.add({ targets: sign, alpha: 0.35, duration: 220 });
    }
    this.activeSlotId = null;
    this.worldPaused = false;
    this.physics.world.resume();
  }

  /** Soft-respawn target after falling — last cleared minigame (or early bank). */
  private setCheckpoint(x: number, y: number): void {
    this.checkpoint = checkpointAtStation(x, y, 0);
    this.checkpointFromSolve = true;
  }

  private setCheckpointFromStation(station: Station): void {
    // Elevated boards use station.y = feetY - u(50); ground boards use walk Y.
    const feetY = station.elevated ? station.y + u(50) : RESPAWN.y;
    this.checkpoint = checkpointAtStation(station.x, feetY, u(60));
    this.checkpointFromSolve = true;
  }

  /** Short celebration burst at the player after a puzzle is solved. */
  private playSolveBurst(bouncePlayer = true): void {
    const x = this.player.x;
    const y = this.player.y - this.player.displayHeight * 0.55;
    const colors = [0xffd600, 0xff8a65, 0x4da3ff, 0xffffff];
    for (let i = 0; i < 10; i++) {
      const ang = (i / 10) * Math.PI * 2;
      const dist = u(40) + (i % 3) * u(12);
      const dot = this.add
        .circle(x, y, u(7), colors[i % colors.length])
        .setStrokeStyle(u(3), 0x1a1a1a)
        .setDepth(20);
      this.tweens.add({
        targets: dot,
        x: x + Math.cos(ang) * dist,
        y: y + Math.sin(ang) * dist,
        alpha: 0,
        scale: 0.4,
        duration: 420 + i * 20,
        ease: "Cubic.easeOut",
        onComplete: () => dot.destroy(),
      });
    }
    if (!bouncePlayer) return;
    this.tweens.add({
      targets: this.player,
      scaleX: this.baseScale.x * 1.12,
      scaleY: this.baseScale.y * 0.9,
      duration: 120,
      yoyo: true,
      ease: "Back.easeOut",
    });
  }

  /** Fast morph used when auto jumps as mech (and back on land). Does not change committed shape. */
  private playQuickMorph(look: ShapeId): void {
    this.transforming = true;
    this.tweens.killTweensOf(this.player);
    this.spawnTransformSparks(6);
    const spin = this.player.flipX ? 28 : -28;
    this.tweens.add({
      targets: this.player,
      scaleX: this.baseScale.x * 0.25,
      scaleY: this.baseScale.y * 1.2,
      angle: spin,
      duration: 70,
      ease: "Quad.easeIn",
      onComplete: () => {
        this.applyLookFor(this.character, look);
        this.player.setAngle(-spin * 0.4);
        this.player.setScale(this.baseScale.x * 1.2, this.baseScale.y * 0.78);
        this.tweens.add({
          targets: this.player,
          scaleX: this.baseScale.x,
          scaleY: this.baseScale.y,
          angle: 0,
          duration: 110,
          ease: "Back.easeOut",
          onComplete: () => {
            this.transforming = false;
          },
        });
      },
    });
  }

  private playTransform(nextCharacter: CharacterId | undefined, nextShape: ShapeId): void {
    this.jumpAsMech = false;
    if (this.climbing) this.exitClimb(false);
    this.transforming = true;
    this.tweens.killTweensOf(this.player);
    this.spawnTransformSparks(12);
    const spin = this.player.flipX ? 40 : -40;
    this.tweens.add({
      targets: this.player,
      scaleX: this.baseScale.x * 1.15,
      scaleY: this.baseScale.y * 0.75,
      duration: 90,
      ease: "Quad.easeOut",
      onComplete: () => {
        this.tweens.add({
          targets: this.player,
          scaleX: this.baseScale.x * 0.12,
          scaleY: this.baseScale.y * 1.35,
          angle: spin,
          duration: 140,
          ease: "Quad.easeIn",
          onComplete: () => {
            if (nextCharacter) this.character = nextCharacter;
            this.shape = nextShape;
            this.applyPlayerLook();
            this.spawnTransformSparks(10);
            this.player.setAngle(-spin * 0.5);
            this.player.setScale(this.baseScale.x * 1.35, this.baseScale.y * 0.65);
            this.tweens.add({
              targets: this.player,
              scaleX: this.baseScale.x,
              scaleY: this.baseScale.y,
              angle: 0,
              duration: 220,
              ease: "Back.easeOut",
              onComplete: () => {
                this.transforming = false;
              },
            });
          },
        });
      },
    });
  }

  private spawnTransformSparks(count: number): void {
    const x = this.player.x;
    const y = this.player.y - this.player.displayHeight * 0.45;
    const colors = [0xffd600, 0xffffff, 0x4da3ff, 0xff8a65];
    for (let i = 0; i < count; i++) {
      const ang = (i / count) * Math.PI * 2 + Math.random() * 0.4;
      const dist = u(28) + (i % 4) * u(14);
      const spark = this.add
        .rectangle(x, y, u(10), u(10), colors[i % colors.length])
        .setStrokeStyle(u(2), 0x1a1a1a)
        .setDepth(22)
        .setAngle(i * 25);
      this.tweens.add({
        targets: spark,
        x: x + Math.cos(ang) * dist,
        y: y + Math.sin(ang) * dist - u(20),
        alpha: 0,
        scale: 0.3,
        angle: i * 25 + 120,
        duration: 280 + i * 18,
        ease: "Cubic.easeOut",
        onComplete: () => spark.destroy(),
      });
    }
  }
}

function isTypingField(): boolean {
  const el = document.activeElement;
  if (!el) return false;
  const tag = el.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || (el as HTMLElement).isContentEditable;
}
