import Phaser from "phaser";
import { mergedPuzzles } from "../logic/puzzleStore";
import type { Puzzle } from "../logic/puzzleTypes";
import {
  RESPAWN,
  canJump,
  combineMove,
  jumpVelocity,
  moveSpeed,
  type FormId,
} from "../logic/playerRules";
import { closePuzzle, isOverlayOpen, openPuzzle } from "../puzzleUi";
import { unlockSpeech } from "../logic/speech";

const W = 3600;
const H = 720;
const GROUND = 620;

export class BachbrueckeScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private cursors = { left: false, right: false, jump: false };
  private form: FormId = "mech";
  private worldPaused = false;
  private grounded = false;
  private solved = new Set<string>();
  private stations: { x: number; y: number; puzzle: Puzzle }[] = [];
  private hiddenParts: Phaser.GameObjects.Rectangle[] = [];
  private propViews: Phaser.GameObjects.Image[] = [];
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
    this.load.image("bolt-mech", "art/bolt_mech_side.png");
    this.load.image("bolt-auto", "art/bolt_vehicle_side.png");
    this.load.image("prop-bridge", "art/prop_bridge.png");
    this.load.image("prop-rope", "art/prop_rope.png");
    this.load.image("prop-ladder", "art/prop_ladder.png");
    this.load.image("station-sign", "art/station_sign.png");
    this.load.image("prop-tree", "art/prop_tree.png");
    this.load.image("prop-house", "art/prop_house.png");
  }

  create(): void {
    this.cameras.main.setBounds(0, 0, W, H);
    this.physics.world.setBounds(0, 0, W, H);
    this.drawBackdrop();
    this.placeTown();

    const statics = this.physics.add.staticGroup();
    statics.add(this.block(380, GROUND + 40, 760, 80, 0x3dcc5a, false, true));
    statics.add(this.block(2320, GROUND + 40, 2560, 80, 0x3dcc5a, false, true));
    statics.add(this.block(1720, 380, 420, 36, 0x3dcc5a, false, true));

    this.hiddenParts = [
      this.block(900, GROUND, 280, 28, 0x8d6e63, false),
      this.block(1480, 500, 28, 220, 0x6d4c41, false),
      this.block(2080, 500, 36, 220, 0xffcc80, false),
      this.block(1980, 500, 200, 28, 0x81c784, false),
    ];
    for (const p of this.hiddenParts) statics.add(p);

    this.propViews = [
      this.add.image(900, GROUND - 8, "prop-bridge").setDisplaySize(320, 90).setVisible(false).setDepth(6),
      this.add.image(1480, 500, "prop-rope").setDisplaySize(40, 250).setVisible(false).setDepth(6),
      this.add.image(2080, 500, "prop-ladder").setDisplaySize(70, 250).setVisible(false).setDepth(6),
      this.add.image(1980, 500, "prop-bridge").setDisplaySize(220, 50).setVisible(false).setDepth(6),
    ];

    this.player = this.physics.add.sprite(RESPAWN.x, RESPAWN.y, "bolt-mech");
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
    const plateShadow = this.add.rectangle(256, 64, 460, 72, 0x1a1a1a);
    plateShadow.setScrollFactor(0).setDepth(20);
    const plate = this.add.rectangle(250, 58, 460, 72, 0xffffff).setStrokeStyle(4, 0x1a1a1a);
    plate.setScrollFactor(0).setDepth(20);
    this.add
      .text(40, 28, "Bachbrücke — Bolt", {
        fontFamily: "Arial Black, sans-serif",
        fontSize: "22px",
        color: "#1A1A1A",
      })
      .setScrollFactor(0)
      .setDepth(21);
    this.add
      .text(40, 56, "Pfeile oder WASD · Leertaste springen", {
        fontFamily: "sans-serif",
        fontSize: "14px",
        color: "#1A1A1A",
      })
      .setScrollFactor(0)
      .setDepth(21);
    this.add.image(3480, GROUND - 90, "station-sign").setDisplaySize(70, 70).setDepth(8);
    this.wireHud();
    this.wireKeyboard();
  }

  private drawBackdrop(): void {
    const g = this.add.graphics().setDepth(0);
    g.fillStyle(0x4da3ff, 1);
    g.fillRect(0, 0, W, H);
    g.fillStyle(0x7ec8ff, 1);
    g.fillRect(0, 0, W, 120);
    for (const [x, y, r] of [
      [180, 80, 36],
      [420, 60, 44],
      [900, 70, 40],
      [1400, 55, 38],
      [2100, 75, 42],
      [2800, 62, 36],
      [3300, 80, 40],
    ] as const) {
      this.drawCloud(g, x, y, r);
    }
    g.fillStyle(0x2e9e45, 1);
    g.fillEllipse(480, 510, 720, 240);
    g.fillEllipse(1680, 500, 680, 220);
    g.fillEllipse(2920, 515, 820, 250);
    g.fillStyle(0xffd600, 1);
    g.fillEllipse(980, 530, 360, 120);
    g.fillEllipse(2480, 535, 300, 100);
    g.fillStyle(0x29b6f6, 1);
    g.fillRect(760, GROUND - 8, 280, H - GROUND + 8);
    g.fillStyle(0xffffff, 1);
    g.fillRect(770, GROUND - 4, 260, 6);
    g.fillStyle(0x4da3ff, 0.45);
    g.fillRect(800, GROUND + 28, 48, 10);
    g.fillRect(880, GROUND + 56, 56, 10);
    g.fillStyle(0x2e9e45, 1);
    g.fillRect(0, GROUND + 20, 760, H - GROUND - 20);
    g.fillRect(1040, GROUND + 20, W - 1040, H - GROUND - 20);
    g.fillStyle(0x3dcc5a, 1);
    g.fillRect(0, GROUND, 760, 22);
    g.fillRect(1040, GROUND, W - 1040, 22);
  }

  private drawCloud(g: Phaser.GameObjects.Graphics, x: number, y: number, r: number): void {
    g.fillStyle(0xffffff, 1);
    g.fillCircle(x, y, r);
    g.fillCircle(x + r, y + 8, r * 0.75);
    g.fillCircle(x - r * 0.7, y + 10, r * 0.7);
  }

  private placeTown(): void {
    const deco = [
      [48, "prop-house", 140, 120],
      [320, "prop-tree", 110, 130],
      [1180, "prop-tree", 120, 140],
      [1320, "prop-house", 130, 110],
      [1880, "prop-tree", 100, 120],
      [2400, "prop-house", 150, 125],
      [2550, "prop-tree", 115, 135],
      [3000, "prop-house", 140, 118],
      [3180, "prop-tree", 108, 128],
    ] as const;
    for (const [i, [x, key, w, h]] of deco.entries()) {
      const img = this.add
        .image(x, GROUND - h / 2 + 8, key)
        .setDisplaySize(w, h)
        .setDepth(3);
      if (key === "prop-house" && i % 3 === 0) img.setTint(0xffe082);
    }
  }

  private applyPlayerLook(): void {
    if (this.form === "auto") {
      this.player.setTexture("bolt-auto");
      this.player.setDisplaySize(118, 68);
    } else {
      this.player.setTexture("bolt-mech");
      this.player.setDisplaySize(78, 108);
    }
    this.player.setOrigin(0.5, 1);
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    body.setSize(this.player.width * 0.55, this.player.height * 0.78, false);
    body.setOffset(this.player.width * 0.225, this.player.height * 0.22);
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

  private showPart(index: number): void {
    const r = this.hiddenParts[index];
    r.setVisible(false);
    const body = r.body as Phaser.Physics.Arcade.StaticBody;
    body.enable = true;
    body.updateFromGameObject();
    this.propViews[index]?.setVisible(true);
  }

  private placeStations(): void {
    const xs: Record<string, { x: number; y: number }> = {
      "bach-bruecke-hear": { x: 620, y: GROUND - 50 },
      "bach-seil-motif": { x: 1280, y: GROUND - 50 },
      "bach-plus": { x: 1680, y: 320 },
      "bach-compare": { x: 2140, y: GROUND - 50 },
      "bach-auto": { x: 2500, y: GROUND - 50 },
      "bach-mech": { x: 2780, y: GROUND - 50 },
      "bach-trace-bridge": { x: 3100, y: GROUND - 50 },
    };
    for (const puzzle of mergedPuzzles()) {
      const pos = xs[puzzle.id] ?? { x: 600, y: GROUND - 50 };
      this.stations.push({ ...pos, puzzle });
      this.add.image(pos.x, pos.y - 78, "station-sign").setDisplaySize(56, 56).setDepth(8);
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

  update(): void {
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    this.grounded = body.blocked.down || body.touching.down;
    if (this.player.y > H + 40) {
      this.player.setVelocity(0, 0);
      this.player.setPosition(this.checkpoint.x, this.checkpoint.y);
    }

    if (this.worldPaused || isOverlayOpen()) {
      this.player.setVelocityX(0);
      return;
    }

    const move = combineMove(this.cursors, this.keyboardMove());
    const speed = moveSpeed(this.form);
    if (move.left && !move.right) {
      this.player.setVelocityX(-speed);
      this.player.setFlipX(true);
    } else if (move.right && !move.left) {
      this.player.setVelocityX(speed);
      this.player.setFlipX(false);
    } else this.player.setVelocityX(0);

    if (move.jump && canJump(this.grounded, this.worldPaused)) {
      this.player.setVelocityY(jumpVelocity(this.form));
    }

    if (this.player.x > 500) this.checkpoint = { x: 520, y: RESPAWN.y };

    for (const s of this.stations) {
      if (this.solved.has(s.puzzle.id) || this.worldPaused) continue;
      if (Math.abs(this.player.x - s.x) < 50 && Math.abs(this.player.y - s.y) < 80) {
        this.openStation(s.puzzle);
        break;
      }
    }

    if (this.player.x > 3400) {
      document.getElementById("goal-banner")?.classList.remove("hidden");
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

  private applyEffect(puzzle: Puzzle): void {
    this.solved.add(puzzle.id);
    switch (puzzle.effect) {
      case "spawn_bridge":
        this.showPart(0);
        break;
      case "spawn_rope":
        this.showPart(1);
        break;
      case "spawn_ladder":
        this.showPart(2);
        break;
      case "spawn_platform":
        this.showPart(3);
        break;
      case "transform_auto":
        this.form = "auto";
        this.applyPlayerLook();
        break;
      case "transform_mech":
        this.form = "mech";
        this.applyPlayerLook();
        break;
      default:
        break;
    }
    this.worldPaused = false;
    this.physics.world.resume();
    closePuzzle();
  }
}

function isTypingField(): boolean {
  const el = document.activeElement;
  if (!el) return false;
  const tag = el.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || (el as HTMLElement).isContentEditable;
}
