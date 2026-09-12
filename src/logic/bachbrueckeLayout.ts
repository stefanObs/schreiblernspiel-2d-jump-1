/** Unscaled Bachbrücke layout (scene applies `u(n) = round(n * 1.5)`). */

export const LAYOUT_SCALE = 1.5;

export function u(n: number): number {
  return Math.round(n * LAYOUT_SCALE);
}

export const WORLD = {
  /** Design width before scale. */
  width: 5200,
  height: 720,
  groundY: 620,
} as const;

export type RectSpec = {
  id: string;
  /** Center x (unscaled). */
  x: number;
  /** Center y (unscaled). */
  y: number;
  w: number;
  h: number;
};

/** Always-on solid floors (grass banks + ledges). */
export const SOLID_FLOORS: RectSpec[] = [
  // Left bank before stream (0–760).
  { id: "bank-start", x: 380, y: 632, w: 760, h: 80 },
  // Meadow after stream until lake (1040–2400).
  { id: "bank-meadow", x: 1720, y: 632, w: 1360, h: 80 },
  // Mid height ledge (jumpable / climb destination).
  { id: "ledge-mid", x: 1700, y: 400, w: 480, h: 36 },
  // Upper ledge near ladder top.
  { id: "ledge-high", x: 2100, y: 300, w: 280, h: 32 },
  // Strip after lake until street (2900–3100).
  { id: "bank-pre-street", x: 3000, y: 632, w: 200, h: 80 },
  // Far side after street (3400–5200).
  { id: "bank-far", x: 4300, y: 632, w: 1800, h: 80 },
  // Far mid platform for late elevated play.
  { id: "ledge-far", x: 4000, y: 420, w: 360, h: 32 },
];

/** Water gaps: fall through → respawn (no collider). */
export const WATER_GAPS = [
  { id: "stream", x0: 760, x1: 1040, kind: "stream" as const },
  { id: "lake", x0: 2400, x1: 2900, kind: "lake" as const },
  { id: "street", x0: 3100, x1: 3400, kind: "street" as const },
];

/** Hidden spawn parts (enabled after puzzle). Indices match scene propViews order. */
export const SPAWN_PARTS = [
  {
    id: "stream_bridge",
    effect: "spawn_bridge" as const,
    x: 900,
    y: 632,
    w: 340,
    h: 80,
    kind: "bridge" as const,
  },
  {
    id: "climb_rope",
    effect: "spawn_rope" as const,
    x: 1580,
    y: 310,
    w: 10,
    h: 620,
    kind: "rope" as const,
    climb: true,
  },
  {
    id: "ladder",
    effect: "spawn_ladder" as const,
    x: 2080,
    y: 460,
    w: 28,
    h: 320,
    kind: "ladder" as const,
    climb: true,
  },
  {
    id: "ladder_top",
    effect: "spawn_ladder" as const,
    x: 2080,
    y: 300,
    w: 120,
    h: 28,
    kind: "platform" as const,
    /** Shown with ladder; solid landing pad. */
    withParent: "ladder",
  },
  {
    id: "extra_platform",
    effect: "spawn_platform" as const,
    x: 1980,
    y: 500,
    w: 200,
    h: 28,
    kind: "platform" as const,
  },
  {
    id: "lake_bridge",
    effect: "spawn_lake_bridge" as const,
    x: 2650,
    y: 632,
    w: 520,
    h: 80,
    kind: "bridge" as const,
  },
] as const;

export type SpawnPartDef = (typeof SPAWN_PARTS)[number];

/** Street crossing: trigger near near-side edge; exit on far side. */
export const STREET_CROSSING = {
  triggerX: 3050,
  triggerW: 80,
  exitX: 3480,
  exitY: 948,
  /** Builtin puzzle used when entering the street zone. */
  puzzleId: "bach-buchstabenstrasse-ball",
} as const;

/** Treehouse visual + elevated station anchor (unscaled). */
export const TREEHOUSE = {
  propX: 1780,
  propY: 280,
  propW: 220,
  propH: 200,
  /** Solid floor inside canopy (always on once level loads). */
  floor: { x: 1780, y: 320, w: 200, h: 28 },
  ropeX: 1580,
} as const;

export const GOAL_X = 5000;
export const CHECKPOINT_AFTER_X = 500;

export function spawnPartsForEffect(effect: string): SpawnPartDef[] {
  return SPAWN_PARTS.filter((p) => p.effect === effect);
}

export function waterGapAt(xUnscaled: number): (typeof WATER_GAPS)[number] | undefined {
  return WATER_GAPS.find((g) => xUnscaled >= g.x0 && xUnscaled <= g.x1);
}

export function isStreetTrigger(xUnscaled: number): boolean {
  const half = STREET_CROSSING.triggerW / 2;
  return Math.abs(xUnscaled - STREET_CROSSING.triggerX) <= half;
}
