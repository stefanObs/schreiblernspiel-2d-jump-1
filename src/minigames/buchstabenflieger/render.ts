import { artPublicPath } from "../../logic/mechCatalog";
import type { CharacterId } from "../../logic/playerRules";
import {
  createSim,
  progressLabel,
  shoot,
  tick,
  tryMovePlane,
  type ArrivalResult,
  type PromptResult,
  type Rng,
  type ShotResult,
  answerLane,
  answerRadar,
  spawnNext,
} from "./sim";
import type { LetterPosition } from "../../logic/letterPositionPuzzle";
import type { BuchstabenfliegerConfig, BuchstabenfliegerSimState, Lane } from "./types";
import { LANE_TO_ZONE } from "./types";

export type FliegerHud = {
  onHud: (info: {
    phase: BuchstabenfliegerSimState["phase"];
    progress: string;
    wrongAttempts: number;
    word: string;
    radarLetter: string;
    positionLetter: string;
    radarInWord: boolean;
  }) => void;
  onPrompt: (result: PromptResult) => void;
  onShot: (result: ShotResult) => void;
  onArrival: (result: ArrivalResult) => void;
  onWon: (wrongAttempts: number) => void;
};

const SKY_TOP = "#5BAEFF";
const SKY_BOT = "#B8E0FF";
const LANE_COLORS = ["#FFE082", "#80CBC4", "#F48FB1"];

function easeOutCubic(t: number): number {
  const u = 1 - Math.min(1, Math.max(0, t));
  return 1 - u * u * u;
}

export class BuchstabenfliegerApp {
  private readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;
  private readonly hud: FliegerHud;
  private readonly rng: Rng;
  private state: BuchstabenfliegerSimState;
  private planeImg: HTMLImageElement | null = null;
  private raf = 0;
  private lastTs = 0;
  private disposed = false;
  private wonReported = false;
  private visualLane = 1;
  private laneFrom = 1;
  private laneTo = 1;
  private laneAnimT = 1;
  private scroll = 0;
  private flashT = 0;

  constructor(
    canvas: HTMLCanvasElement,
    config: BuchstabenfliegerConfig,
    character: CharacterId,
    hud: FliegerHud,
    rng: Rng = Math.random,
  ) {
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Buchstabenflieger: 2d context unavailable");
    this.canvas = canvas;
    this.ctx = ctx;
    this.hud = hud;
    this.rng = rng;
    this.state = createSim(config, rng);
    this.visualLane = this.state.planeLane;
    this.laneFrom = this.state.planeLane;
    this.laneTo = this.state.planeLane;
    this.loadPlane(character);
    this.emitHud();
  }

  private loadPlane(character: CharacterId): void {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => {
      if (!this.disposed) this.planeImg = img;
    };
    img.src = artPublicPath(character, "mech");
    this.planeImg = img;
  }

  private emitHud(): void {
    this.hud.onHud({
      phase: this.state.phase,
      progress: progressLabel(this.state),
      wrongAttempts: this.state.wrongAttempts,
      word: this.state.displayWord,
      radarLetter: this.state.radarLetterDisplay,
      positionLetter: this.state.positionLetterDisplay,
      radarInWord: this.state.radarInWord,
    });
  }

  start(): void {
    this.resize();
    this.lastTs = performance.now();
    const loop = (ts: number) => {
      if (this.disposed) return;
      const dt = Math.min(0.05, (ts - this.lastTs) / 1000);
      this.lastTs = ts;
      this.update(dt);
      this.draw();
      this.raf = requestAnimationFrame(loop);
    };
    this.raf = requestAnimationFrame(loop);
  }

  resize(): void {
    const parent = this.canvas.parentElement;
    const w = parent?.clientWidth || window.innerWidth;
    const h = parent?.clientHeight || window.innerHeight;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    this.canvas.width = Math.max(1, Math.floor(w * dpr));
    this.canvas.height = Math.max(1, Math.floor(h * dpr));
    this.canvas.style.width = `${w}px`;
    this.canvas.style.height = `${h}px`;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  dispose(): void {
    this.disposed = true;
    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = 0;
  }

  moveUp(): void {
    const r = tryMovePlane(this.state, -1);
    if (r.kind === "moved") this.beginLaneAnim(r.lane);
  }

  moveDown(): void {
    const r = tryMovePlane(this.state, 1);
    if (r.kind === "moved") this.beginLaneAnim(r.lane);
  }

  fire(): void {
    const result = shoot(this.state, this.rng);
    this.hud.onShot(result);
    this.emitHud();
    if (result.kind === "hit" && result.won) {
      this.reportWon();
    } else if (result.kind === "miss") {
      this.flashT = 0.45;
    }
  }

  answerRadarYes(): void {
    this.handlePrompt(answerRadar(this.state, true));
  }

  answerRadarNo(): void {
    this.handlePrompt(answerRadar(this.state, false));
  }

  answerZone(zone: LetterPosition): void {
    this.handlePrompt(answerLane(this.state, zone));
  }

  private handlePrompt(result: PromptResult): void {
    this.hud.onPrompt(result);
    if (result.kind === "correct") {
      if (result.phase === "radar_wave" || result.phase === "armor_wave") {
        spawnNext(this.state, this.rng);
      }
    } else if (result.kind === "wrong") {
      this.flashT = 0.45;
    }
    this.emitHud();
  }

  private beginLaneAnim(lane: Lane): void {
    this.laneFrom = this.visualLane;
    this.laneTo = lane;
    this.laneAnimT = 0;
  }

  private reportWon(): void {
    if (this.wonReported) return;
    this.wonReported = true;
    this.hud.onWon(this.state.wrongAttempts);
  }

  private update(dt: number): void {
    this.scroll += dt * 80;
    if (this.flashT > 0) this.flashT = Math.max(0, this.flashT - dt);

    if (this.laneAnimT < 1) {
      this.laneAnimT = Math.min(1, this.laneAnimT + dt / 0.22);
      const t = easeOutCubic(this.laneAnimT);
      this.visualLane = this.laneFrom + (this.laneTo - this.laneFrom) * t;
    } else {
      this.visualLane = this.state.planeLane;
    }

    const result = tick(this.state, dt, this.rng);
    if (result.kind === "crash" || result.kind === "dodge") {
      this.hud.onArrival(result);
      if (result.kind === "crash") this.flashT = 0.45;
      this.emitHud();
    } else if (result.kind === "spawned") {
      this.emitHud();
    }

    if (this.state.won) this.reportWon();
  }

  private laneY(lane: number, h: number): number {
    const top = h * 0.22;
    const gap = h * 0.22;
    return top + lane * gap;
  }

  private draw(): void {
    const w = this.canvas.clientWidth;
    const h = this.canvas.clientHeight;
    const ctx = this.ctx;
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, SKY_TOP);
    g.addColorStop(1, SKY_BOT);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    // Clouds
    ctx.fillStyle = "rgba(255,255,255,0.55)";
    for (let i = 0; i < 6; i++) {
      const x = ((i * 220 - this.scroll * (0.4 + i * 0.05)) % (w + 200)) - 100;
      const y = 40 + (i % 3) * 50;
      this.drawCloud(x, y, 50 + (i % 3) * 10);
    }

    // Lane guides
    for (let lane = 0; lane < 3; lane++) {
      const y = this.laneY(lane, h);
      ctx.strokeStyle = LANE_COLORS[lane]!;
      ctx.globalAlpha = 0.35;
      ctx.lineWidth = 4;
      ctx.setLineDash([16, 12]);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.globalAlpha = 1;
      ctx.fillStyle = "rgba(0,0,0,0.35)";
      ctx.font = "bold 14px system-ui,sans-serif";
      const label = LANE_TO_ZONE[lane as Lane];
      const labelText = label === "anfang" ? "Anfang" : label === "mitte" ? "Mitte" : "Ende";
      ctx.fillText(labelText, 12, y - 10);
    }

    // Enemy
    const enemy = this.state.active;
    if (enemy) {
      const ey = this.laneY(enemy.lane, h);
      const ex = w * (0.92 - enemy.progress * 0.72);
      this.drawEnemy(ex, ey, enemy.letter, enemy.kind, enemy.membership);
    }

    // Plane
    const py = this.laneY(this.visualLane, h);
    const px = w * 0.18;
    this.drawPlane(px, py);

    if (this.flashT > 0) {
      ctx.fillStyle = `rgba(220,40,40,${0.25 * (this.flashT / 0.45)})`;
      ctx.fillRect(0, 0, w, h);
    }
  }

  private drawCloud(x: number, y: number, r: number): void {
    const ctx = this.ctx;
    ctx.beginPath();
    ctx.arc(x, y, r * 0.55, 0, Math.PI * 2);
    ctx.arc(x + r * 0.5, y - r * 0.15, r * 0.45, 0, Math.PI * 2);
    ctx.arc(x + r * 0.95, y, r * 0.5, 0, Math.PI * 2);
    ctx.fill();
  }

  private drawEnemy(
    x: number,
    y: number,
    letter: string,
    kind: "bird" | "armor",
    membership: boolean,
  ): void {
    const ctx = this.ctx;
    const r = kind === "armor" ? 36 : 28;
    ctx.fillStyle = kind === "armor" ? "#78909C" : membership ? "#66BB6A" : "#EF5350";
    ctx.beginPath();
    ctx.ellipse(x, y, r * 1.15, r * 0.85, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#1A1A1A";
    ctx.lineWidth = 3;
    ctx.stroke();
    if (kind === "armor") {
      ctx.strokeStyle = "#FFD600";
      ctx.lineWidth = 4;
      ctx.strokeRect(x - r * 0.7, y - r * 0.55, r * 1.4, r * 1.1);
    }
    ctx.fillStyle = "#1A1A1A";
    ctx.font = `bold ${kind === "armor" ? 28 : 24}px system-ui,sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(letter, x, y);
    ctx.textAlign = "start";
    ctx.textBaseline = "alphabetic";
  }

  private drawPlane(x: number, y: number): void {
    const ctx = this.ctx;
    const img = this.planeImg;
    const size = 88;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(-0.2);
    if (img && img.complete && img.naturalWidth > 0) {
      ctx.drawImage(img, -size * 0.55, -size * 0.55, size, size);
    } else {
      ctx.fillStyle = "#FFD600";
      ctx.strokeStyle = "#1A1A1A";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(40, 0);
      ctx.lineTo(-30, -22);
      ctx.lineTo(-18, 0);
      ctx.lineTo(-30, 22);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();
  }
}
