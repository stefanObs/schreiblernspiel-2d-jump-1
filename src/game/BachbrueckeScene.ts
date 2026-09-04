import Phaser from "phaser";
import { freeTransformPuzzle, mergedPuzzles } from "../logic/puzzleStore";
import type { Puzzle, WorldEffect } from "../logic/puzzleTypes";
import {
  RESPAWN,
  canJump,
  combineMove,
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
import { MECH_ART, MECH_CHARS, characterDisplayName, textureFor } from "../logic/mechCatalog";
import { isOverlayOpen, openPuzzle } from "../puzzleUi";
import { unlockSpeech } from "../logic/speech";

const S = 1.5;
const u = (n: number) => Math.round(n * S);
const W = u(3600);
const H = u(720);
const GROUND = u(620);
/** Invisible collider top — a bit below the drawn grass edge so boots sit in the turf. */
const WALK_Y = GROUND + u(12);
const MECH_SIZE = { w: u(96), h: u(134) };
const AUTO_SIZE = { w: u(150), h: u(86) };

export class BachbrueckeScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private cursors = { left: false, right: false, jump: false };
  private character: CharacterId = "bolt";
  private shape: ShapeId = "mech";
  /** Auto jumps as walking mech, then morphs back on land. */
  private jumpAsMech = false;
  private worldPaused = false;
  private grounded = false;
  private solved = new Set<string>();
  private stations: { x: number; y: number; puzzle: Puzzle }[] = [];
  private hiddenParts: Phaser.GameObjects.Rectangle[] = [];
  private propViews: Phaser.GameObjects.Image[] = [];
  private stationViews: Phaser.GameObjects.Image[] = [];
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
    space: Phaser.Input.Keyboard.Key;
    a: Phaser.Input.Keyboard.Key;
    d: Phaser.Input.Keyboard.Key;
    w: Phaser.Input.Keyboard.Key;
  };
  private checkpoint = { ...RESPAWN };

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
    this.load.image("prop-ladder", "art/prop_ladder.png");
    this.load.image("station-sign", "art/station_sign.png");
    this.load.image("prop-tree", "art/prop_tree.png");
    this.load.image("prop-house", "art/prop_house.png");
    this.load.image("prop-far-ridge", "art/prop_far_ridge.png");
    this.load.image("prop-grass-tuft", "art/prop_grass_tuft.png");
    this.load.image("prop-flowers", "art/prop_flowers.png");
  }

  create(): void {
    this.cameras.main.setBounds(0, 0, W, H);
    this.physics.world.setBounds(0, 0, W, H);
    this.createAnims();
    this.drawBackdrop();
    this.placeFarRidge();
    this.placeClouds();
    this.placeWater();
    this.placeTown();
    this.placeMeadowDecor();
    const statics = this.physics.add.staticGroup();
    statics.add(this.block(u(380), WALK_Y + u(40), u(760), u(80), 0x3dcc5a, false, true));
    statics.add(this.block(u(2320), WALK_Y + u(40), u(2560), u(80), 0x3dcc5a, false, true));
    statics.add(this.block(u(1720), u(380), u(420), u(36), 0x3dcc5a, false, true));

    this.hiddenParts = [
      // Same thickness as grass banks; span the full stream gap (u(760)→u(1040)).
      this.block(u(900), WALK_Y + u(40), u(340), u(80), 0x8d6e63, false),
      this.block(u(1480), u(500), u(28), u(220), 0x6d4c41, false),
      this.block(u(2080), u(500), u(36), u(220), 0xffcc80, false),
      this.block(u(1980), u(500), u(200), u(28), 0x81c784, false),
    ];
    for (const p of this.hiddenParts) statics.add(p);
    // staticGroup add can leave bodies in the tree; keep hidden until showPart.
    for (const p of this.hiddenParts) {
      (p.body as Phaser.Physics.Arcade.StaticBody).enable = false;
    }

    this.propViews = [
      this.add
        .image(u(900), WALK_Y, "prop-bridge")
        .setOrigin(0.5, 0.42)
        .setDisplaySize(u(340), u(100))
        .setVisible(false)
        .setDepth(6),
      this.add.image(u(1480), u(500), "prop-rope").setDisplaySize(u(40), u(250)).setVisible(false).setDepth(6),
      this.add.image(u(2080), u(500), "prop-ladder").setDisplaySize(u(70), u(250)).setVisible(false).setDepth(6),
      this.add.image(u(1980), u(500), "prop-bridge").setDisplaySize(u(220), u(50)).setVisible(false).setDepth(6),
    ];

    this.player = this.physics.add.sprite(RESPAWN.x, RESPAWN.y, MECH_ART.bolt.mechKey);
    this.player.setOrigin(0.5, 1);
    this.applyPlayerLook();
    this.player.setCollideWorldBounds(true);
    this.player.setBounce(0);
    this.player.setDepth(12);
    this.physics.add.collider(this.player, statics, () => {
      this.grounded = Boolean(this.player.body?.blocked.down || this.player.body?.touching.down);
    });

    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);
    this.placeStations();
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
    const goal = this.add
      .image(u(3480), GROUND + u(4), "station-sign")
      .setOrigin(0.5, 1)
      .setDisplaySize(u(78), u(110))
      .setDepth(2);
    this.bob(goal, u(4), 900);
    this.wireHud();
    this.wireKeyboard();
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
    g.fillRect(0, 0, W, H);
    g.fillStyle(0x6bb5ff, 1);
    g.fillRect(0, 0, W, u(170));
    this.drawStream(g);
    this.drawGrassBank(g, 0, u(760));
    this.drawGrassBank(g, u(1040), W - u(1040));
  }

  private placeFarRidge(): void {
    const ridges: [number, number, number][] = [
      [u(520), u(720), u(160)],
      [u(1500), u(640), u(140)],
      [u(2500), u(700), u(150)],
      [u(3300), u(620), u(130)],
    ];
    for (const [x, w, h] of ridges) {
      this.add
        .image(x, GROUND - h * 0.42, "prop-far-ridge")
        .setDisplaySize(w, h)
        .setAlpha(0.92)
        .setDepth(1);
    }
  }

  private placeMeadowDecor(): void {
    const tufts: [number, number, number][] = [
      [u(120), u(54), u(40)],
      [u(260), u(48), u(36)],
      [u(480), u(58), u(44)],
      [u(640), u(50), u(38)],
      [u(1120), u(56), u(42)],
      [u(1340), u(46), u(34)],
      [u(1680), u(60), u(46)],
      [u(1960), u(50), u(38)],
      [u(2280), u(54), u(40)],
      [u(2680), u(48), u(36)],
      [u(2980), u(58), u(44)],
      [u(3320), u(52), u(40)],
    ];
    for (const [x, w, h] of tufts) {
      this.add
        .image(x, GROUND, "prop-grass-tuft")
        .setOrigin(0.5, 1)
        .setDisplaySize(w, h)
        .setDepth(4);
    }

    const flowers: [number, number, number][] = [
      [u(200), u(44), u(44)],
      [u(560), u(40), u(40)],
      [u(1240), u(46), u(46)],
      [u(1840), u(42), u(42)],
      [u(2420), u(48), u(48)],
      [u(3160), u(44), u(44)],
    ];
    for (const [x, w, h] of flowers) {
      const bloom = this.add
        .image(x, GROUND, "prop-flowers")
        .setOrigin(0.5, 1)
        .setDisplaySize(w, h)
        .setDepth(5);
      this.tweens.add({
        targets: bloom,
        angle: { from: -3, to: 3 },
        duration: 2200 + (x % 7) * 90,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
    }
  }

  private drawStream(g: Phaser.GameObjects.Graphics): void {
    g.fillStyle(0x1e88c8, 1);
    g.fillRect(u(760), GROUND - u(6), u(280), H - GROUND + u(6));
    g.fillStyle(0x42b6ef, 1);
    g.fillEllipse(u(900), GROUND + u(40), u(300), u(90));
    g.fillStyle(0xffffff, 1);
    g.fillRoundedRect(u(772), GROUND - u(4), u(256), u(8), u(4));
    g.lineStyle(u(4), 0x1a1a1a, 1);
    g.strokeRoundedRect(u(772), GROUND - u(4), u(256), u(8), u(4));
    g.fillStyle(0xffffff, 0.35);
    g.fillEllipse(u(820), GROUND + u(36), u(70), u(14));
    g.fillEllipse(u(950), GROUND + u(64), u(90), u(16));
    g.fillStyle(0x3dcc5a, 1);
    g.fillEllipse(u(758), GROUND + u(8), u(58), u(42));
    g.fillEllipse(u(1042), GROUND + u(8), u(58), u(42));
    g.lineStyle(u(4), 0x1a1a1a, 1);
    g.strokeEllipse(u(758), GROUND + u(8), u(58), u(42));
    g.strokeEllipse(u(1042), GROUND + u(8), u(58), u(42));
  }

  private drawGrassBank(g: Phaser.GameObjects.Graphics, x: number, width: number): void {
    // Drawn grass edge and physics walk line share y = GROUND.
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
      [3300, 80, 40],
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
    for (const [x0, yOff, w0] of [
      [800, 28, 52],
      [880, 56, 58],
      [840, 82, 44],
    ] as const) {
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

  private bob(target: Phaser.GameObjects.Image, amp: number, duration: number): void {
    this.tweens.add({
      targets: target,
      y: target.y - amp,
      duration,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
  }

  private placeTown(): void {
    const deco = [
      [48, "prop-house", 140, 120],
      [320, "prop-tree", 145, 172],
      [1180, "prop-tree", 158, 185],
      [1320, "prop-house", 130, 110],
      [1880, "prop-tree", 132, 158],
      [2400, "prop-house", 150, 125],
      [2550, "prop-tree", 150, 178],
      [3000, "prop-house", 140, 118],
      [3180, "prop-tree", 142, 168],
    ] as const;
    for (const [i, [x0, key, w0, h0]] of deco.entries()) {
      const w = u(w0);
      const h = u(h0);
      const img = this.add
        .image(u(x0), GROUND - h / 2 + u(8), key)
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

  private showPart(index: number, kind: SpawnKind): void {
    const r = this.hiddenParts[index];
    r.setVisible(false);
    const body = r.body as Phaser.Physics.Arcade.StaticBody;
    body.enable = true;
    // refreshBody/updateFromGameObject re-inserts into the static R-tree correctly;
    // never mutate position/width by hand (that desyncs the tree AABB).
    body.updateFromGameObject();
    const view = this.propViews[index];
    if (!view) return;
    const destY = view.y;
    const motion = spawnMotion(kind);
    view.setVisible(true).setAlpha(0);
    view.y = destY + Math.round(motion.fromY * S);
    this.tweens.add({
      targets: view,
      y: destY,
      alpha: 1,
      duration: motion.duration,
      ease: kind === "bridge" || kind === "platform" ? "Bounce.easeOut" : "Cubic.easeOut",
    });
  }

  private placeStations(): void {
    const xs: Record<string, { x: number; y: number }> = {
      "bach-bruecke-hear": { x: u(620), y: GROUND - u(50) },
      "bach-seil-motif": { x: u(1280), y: GROUND - u(50) },
      "bach-plus": { x: u(1680), y: u(320) },
      "bach-compare": { x: u(2140), y: GROUND - u(50) },
      "bach-bolt-name": { x: u(2360), y: GROUND - u(50) },
      "bach-auto": { x: u(2500), y: GROUND - u(50) },
      "bach-marina-name": { x: u(2640), y: GROUND - u(50) },
      "bach-mech": { x: u(2780), y: GROUND - u(50) },
      "bach-rush-name": { x: u(2920), y: GROUND - u(50) },
      "bach-transform-marina": { x: u(3060), y: GROUND - u(50) },
      "bach-transform-rush": { x: u(3200), y: GROUND - u(50) },
      "bach-trace-bridge": { x: u(3340), y: GROUND - u(50) },
    };
    for (const puzzle of mergedPuzzles()) {
      const pos = xs[puzzle.id] ?? { x: u(600), y: GROUND - u(50) };
      this.stations.push({ ...pos, puzzle });
      const feetY = pos.y + u(50); // station trigger is above feet; signs stand on the surface
      const sign = this.add
        .image(pos.x, feetY, "station-sign")
        .setOrigin(0.5, 1)
        .setDisplaySize(u(78), u(110))
        .setDepth(2);
      this.bob(sign, u(4), 640 + this.stations.length * 40);
      this.stationViews.push(sign);
    }
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
      left: kb.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT),
      right: kb.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT),
      up: kb.addKey(Phaser.Input.Keyboard.KeyCodes.UP),
      space: kb.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
      a: kb.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      d: kb.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      w: kb.addKey(Phaser.Input.Keyboard.KeyCodes.W),
    };
    window.addEventListener("keydown", (e) => {
      if (isOverlayOpen() || isTypingField()) return;
      if (e.code === "Space" || e.code.startsWith("Arrow")) e.preventDefault();
      if (e.code === "Space" || e.code === "ArrowUp") unlockSpeech();
    });
  }

  private keyboardMove(): { left: boolean; right: boolean; jump: boolean } {
    if (!this.keys || isOverlayOpen() || isTypingField()) {
      return { left: false, right: false, jump: false };
    }
    return {
      left: this.keys.left.isDown || this.keys.a.isDown,
      right: this.keys.right.isDown || this.keys.d.isDown,
      jump: this.keys.up.isDown || this.keys.space.isDown || this.keys.w.isDown,
    };
  }

  update(time: number): void {
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    this.grounded = body.blocked.down || body.touching.down;
    if (this.player.y > H + u(40)) {
      this.player.setVelocity(0, 0);
      this.player.setPosition(this.checkpoint.x, this.checkpoint.y);
      if (this.jumpAsMech) {
        this.jumpAsMech = false;
        this.applyPlayerLook();
      }
    }

    if (this.worldPaused || isOverlayOpen()) {
      this.player.setVelocityX(0);
      this.applyPose(time, true);
      return;
    }

    const move = combineMove(this.cursors, this.keyboardMove());
    const speed = moveSpeed(this.shape);
    if (move.left && !move.right) {
      this.player.setVelocityX(-speed);
      this.player.setFlipX(true);
    } else if (move.right && !move.left) {
      this.player.setVelocityX(speed);
      this.player.setFlipX(false);
    } else this.player.setVelocityX(0);

    if (move.jump && canJump(this.grounded, this.worldPaused) && !this.transforming) {
      // Auto morphs into walking mech for the jump (higher leap), then back on land.
      const jumpShape: ShapeId = this.shape === "auto" ? "mech" : this.shape;
      this.player.setVelocityY(jumpVelocity(jumpShape));
      this.playJump();
    }

    if (!this.wasGrounded && this.grounded) this.playLand();
    this.wasGrounded = this.grounded;
    this.applyPose(time, false);

    if (this.player.x > u(500)) this.checkpoint = { x: u(520), y: RESPAWN.y };

    for (const s of this.stations) {
      if (this.solved.has(s.puzzle.id) || this.worldPaused) continue;
      if (Math.abs(this.player.x - s.x) < u(50) && Math.abs(this.player.y - s.y) < u(80)) {
        this.openStation(s.puzzle);
        break;
      }
    }

    if (this.player.x > u(3400) && !this.goalShown) {
      this.goalShown = true;
      document.getElementById("goal-banner")?.classList.remove("hidden");
    }
  }

  private applyPose(time: number, paused: boolean): void {
    if (this.transforming) return;
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    const pose = playerPose(this.grounded, body.velocity.x, paused);
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

  private openStation(puzzle: Puzzle): void {
    this.worldPaused = true;
    this.physics.world.pause();
    this.player.setVelocity(0, 0);
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
    this.solved.add(puzzle.id);
    const isTransform = puzzle.effect.startsWith("transform_");
    this.playSolveBurst(!isTransform);
    switch (puzzle.effect) {
      case "spawn_bridge":
        this.showPart(0, "bridge");
        break;
      case "spawn_rope":
        this.showPart(1, "rope");
        break;
      case "spawn_ladder":
        this.showPart(2, "ladder");
        break;
      case "spawn_platform":
        this.showPart(3, "platform");
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
    const idx = this.stations.findIndex((s) => s.puzzle.id === puzzle.id);
    const sign = this.stationViews[idx];
    if (sign) {
      this.tweens.killTweensOf(sign);
      this.tweens.add({ targets: sign, alpha: 0.35, duration: 220 });
    }
    this.worldPaused = false;
    this.physics.world.resume();
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
