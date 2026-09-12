import type { Puzzle, PuzzleType, WorldEffect } from "./puzzleTypes";

/** Categories that can be toggled in Settings. Boards keep their world positions. */
export const PUZZLE_CATEGORIES: PuzzleType[] = [
  "word",
  "math",
  "transform",
  "trace",
  "letterPos",
  "letterPick",
  "ballkanone",
  "buchstabenstrasse",
  "kettenhochhaus",
];

/** Categories that use Holztafel boards (not world gates like buchstabenstrasse). */
export const BOARD_CATEGORIES: PuzzleType[] = PUZZLE_CATEGORIES.filter(
  (c) => c !== "buchstabenstrasse",
);

export const PUZZLE_CATEGORY_LABELS: Record<PuzzleType, string> = {
  word: "Wörter",
  math: "Mathe",
  transform: "Transformieren",
  trace: "Zeichnen",
  letterPos: "Buchstaben-Position",
  letterPick: "Buchstaben-Bildwahl",
  ballkanone: "Ballkanone",
  buchstabenstrasse: "Buchstabenstraße",
  kettenhochhaus: "Kettenhochhaus",
};

export const PUZZLE_CATEGORY_STORAGE_KEY = "schreiblernspiel.enabledPuzzleCategories";

export const CATEGORIES_CHANGED_EVENT = "schreiblern:puzzle-categories-changed";

export type StationSlotDef = {
  id: string;
  category: PuzzleType;
  /** Unscaled level x (scene applies `u()`). */
  x: number;
  /** Unscaled level y (scene applies `u()` / GROUND). */
  y: number;
  /** Fixed world effect for progression (transform uses the picked puzzle’s effect). */
  effect: WorldEffect;
  /** If true, board sits on the elevated mid-platform. */
  elevated?: boolean;
};

/**
 * Boards on Bachbrücke (buchstabenstrasse is the world street gate, not a board).
 * Progression: stream → rope/treehouse → ladder heights → lake → far side.
 * Disabled categories are remapped onto other enabled types; slots stay.
 */
export const STATION_SLOTS: StationSlotDef[] = [
  { id: "slot-word", category: "word", x: 620, y: 570, effect: "spawn_bridge" },
  { id: "slot-letter-pos", category: "letterPos", x: 1480, y: 570, effect: "spawn_rope" },
  {
    id: "slot-ballkanone",
    category: "ballkanone",
    x: 1780,
    y: 280,
    effect: "none",
    elevated: true,
  },
  { id: "slot-math", category: "math", x: 2100, y: 260, effect: "spawn_ladder", elevated: true },
  { id: "slot-letter-pick", category: "letterPick", x: 2280, y: 570, effect: "spawn_lake_bridge" },
  {
    id: "slot-kettenhochhaus",
    category: "kettenhochhaus",
    x: 3600,
    y: 570,
    effect: "spawn_platform",
  },
  { id: "slot-transform", category: "transform", x: 3800, y: 570, effect: "none" },
  { id: "slot-trace", category: "trace", x: 4500, y: 570, effect: "none" },
];

export type EnabledCategories = Record<PuzzleType, boolean>;

export function defaultEnabledCategories(): EnabledCategories {
  const out = {} as EnabledCategories;
  for (const c of PUZZLE_CATEGORIES) out[c] = true;
  return out;
}

export function isPuzzleType(value: unknown): value is PuzzleType {
  return typeof value === "string" && (PUZZLE_CATEGORIES as string[]).includes(value);
}

export function parseEnabledCategories(raw: string | null | undefined): EnabledCategories {
  const defaults = defaultEnabledCategories();
  if (!raw) return defaults;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return defaults;
    const obj = parsed as Record<string, unknown>;
    const out = { ...defaults };
    for (const c of PUZZLE_CATEGORIES) {
      if (typeof obj[c] === "boolean") out[c] = obj[c];
    }
    if (!PUZZLE_CATEGORIES.some((c) => out[c])) return defaults;
    return out;
  } catch {
    return defaults;
  }
}

export function loadEnabledCategories(
  storage: Storage | null = defaultStorage(),
): EnabledCategories {
  if (!storage) return defaultEnabledCategories();
  try {
    return parseEnabledCategories(storage.getItem(PUZZLE_CATEGORY_STORAGE_KEY));
  } catch {
    return defaultEnabledCategories();
  }
}

export function saveEnabledCategories(
  enabled: EnabledCategories,
  storage: Storage | null = defaultStorage(),
): void {
  if (!storage) return;
  const next = { ...enabled };
  if (!PUZZLE_CATEGORIES.some((c) => next[c])) {
    next[PUZZLE_CATEGORIES[0]!] = true;
  }
  try {
    storage.setItem(PUZZLE_CATEGORY_STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* private mode / quota */
  }
}

export function isCategoryEnabled(
  category: PuzzleType,
  storage: Storage | null = defaultStorage(),
): boolean {
  return loadEnabledCategories(storage)[category];
}

/**
 * Every world board stays. If a slot’s home category is off, it gets another
 * enabled type so the position still offers a puzzle.
 */
export function resolvedStationSlots(
  storage: Storage | null = defaultStorage(),
): StationSlotDef[] {
  const enabled = loadEnabledCategories(storage);
  const enabledList = PUZZLE_CATEGORIES.filter((c) => enabled[c]);
  if (enabledList.length === 0) return STATION_SLOTS.map((slot) => ({ ...slot }));

  let fill = 0;
  return STATION_SLOTS.map((slot) => {
    if (enabled[slot.category]) return slot;
    const category = enabledList[fill % enabledList.length]!;
    fill += 1;
    return { ...slot, category };
  });
}

export function puzzlesInCategory(
  puzzles: readonly Puzzle[],
  category: PuzzleType,
): Puzzle[] {
  return puzzles.filter((p) => p.type === category);
}

/** Pick a random template from the category pool (uniform). */
export function pickRandomPuzzle(
  puzzles: readonly Puzzle[],
  category: PuzzleType,
  random: () => number = Math.random,
): Puzzle | null {
  const pool = puzzlesInCategory(puzzles, category);
  if (pool.length === 0) return null;
  const idx = Math.floor(random() * pool.length);
  return pool[Math.min(idx, pool.length - 1)] ?? null;
}

/**
 * Progression slots keep their world effect (bridge, rope, ladder, …).
 * Transform puzzles on a `none` slot keep the template’s own effect.
 */
export function puzzleForSlot(slot: StationSlotDef, template: Puzzle): Puzzle {
  if (template.type === "transform" && slot.effect === "none") return { ...template };
  return { ...template, effect: slot.effect };
}

export function dispatchCategoriesChanged(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(CATEGORIES_CHANGED_EVENT));
}

function defaultStorage(): Storage | null {
  try {
    return typeof localStorage !== "undefined" ? localStorage : null;
  } catch {
    return null;
  }
}
