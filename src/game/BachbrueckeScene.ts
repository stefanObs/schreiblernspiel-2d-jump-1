import Phaser from "phaser";
import { mergedPuzzles } from "../logic/puzzleStore";
import type { Puzzle } from "../logic/puzzleTypes";
import {
  RESPAWN,
  canJump,
  jumpVelocity,
  moveSpeed,
  type FormId,
} from "../logic/playerRules";
import { closePuzzle, isOverlayOpen, openPuzzle } from "../puzzleUi";

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
  private checkpoint = { ...RESPAWN };

  constructor() {
    super("bachbruecke");
  }

  create(): void {
    this.drawSkin("bolt-mech", 0xffd600, 56, 72);
    this.drawSkin("bolt-auto", 0xe53935, 72, 36);

    this.cameras.main.setBounds(0, 0, W, H);
    this.physics.world.setBounds(0, 0, W, H);
    this.add.rectangle(W / 2, H / 2, W, H, 0x4da3ff);

    const statics = this.physics.add.staticGroup();
    statics.add(this.block(380, GROUND + 40, 760, 80, 0x3dcc5a));
    statics.add(this.block(2320, GROUND + 40, 2560, 80, 0x3dcc5a));
    statics.add(this.block(1720, 380, 420, 36, 0x3dcc5a));
    this.add.rectangle(900, GROUND + 70, 280, 100, 0x29b6f6);

    this.hiddenParts = [
      this.block(900, GROUND, 280, 28, 0x8d6e63, false),
      this.block(1480, 500, 28, 220, 0x6d4c41, false),
      this.block(2080, 500, 36, 220, 0xffcc80, false),
      this.block(1980, 500, 200, 28, 0x81c784, false),
    ];
    for (const p of this.hiddenParts) statics.add(p);

    this.player = this.physics.add.sprite(RESPAWN.x, RESPAWN.y, "bolt-mech");
    this.player.setCollideWorldBounds(true);
    this.player.setBounce(0);
    this.physics.add.collider(this.player, statics, () => {
      this.grounded = Boolean(this.player.body?.blocked.down || this.player.body?.touching.down);
    });

    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);
    this.placeStations();
    this.add.text(80, 40, "Bachbrücke — Bolt", {
      fontFamily: "sans-serif",
      fontSize: "22px",
      color: "#1A1A1A",
    });
    this.add.rectangle(3480, GROUND - 80, 40, 80, 0xffd600).setStrokeStyle(3, 0x1a1a1a);
    this.wireHud();
  }

  private drawSkin(key: string, color: number, w: number, h: number): void {
    const g = this.add.graphics();
    g.fillStyle(color, 1);
    g.lineStyle(3, 0x1a1a1a, 1);
    g.fillRoundedRect(2, 2, w - 4, h - 4, 8);
    g.strokeRoundedRect(2, 2, w - 4, h - 4, 8);
    g.generateTexture(key, w, h);
    g.destroy();
  }

  private block(
    x: number,
    y: number,
    w: number,
    h: number,
    color: number,
    visible = true,
  ): Phaser.GameObjects.Rectangle {
    const r = this.add.rectangle(x, y, w, h, color);
    this.physics.add.existing(r, true);
    r.setVisible(visible);
    const body = r.body as Phaser.Physics.Arcade.StaticBody;
    body.enable = visible;
    return r;
  }

  private showPart(index: number): void {
    const r = this.hiddenParts[index];
    r.setVisible(true);
    const body = r.body as Phaser.Physics.Arcade.StaticBody;
    body.enable = true;
    body.updateFromGameObject();
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
      this.add.rectangle(pos.x, pos.y - 70, 24, 24, 0xffffff).setStrokeStyle(3, 0x1a1a1a);
    }
  }

  private wireHud(): void {
    const bind = (id: string, key: "left" | "right" | "jump") => {
      const el = document.getElementById(id);
      if (!el) return;
      const on = (e: Event) => {
        e.preventDefault();
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

    const speed = moveSpeed(this.form);
    if (this.cursors.left) this.player.setVelocityX(-speed);
    else if (this.cursors.right) this.player.setVelocityX(speed);
    else this.player.setVelocityX(0);

    if (this.cursors.jump && canJump(this.grounded, this.worldPaused)) {
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
        this.player.setTexture("bolt-auto");
        break;
      case "transform_mech":
        this.form = "mech";
        this.player.setTexture("bolt-mech");
        break;
      default:
        break;
    }
    this.worldPaused = false;
    this.physics.world.resume();
    closePuzzle();
  }
}
