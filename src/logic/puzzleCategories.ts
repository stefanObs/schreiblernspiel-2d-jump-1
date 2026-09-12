import type { Puzzle, PuzzleType, WorldEffect } from "./puzzleTypes";

/** Categories that can be toggled in Settings (one board each). */
export const PUZZLE_CATEGORIES: PuzzleType[] = [
  "word",
  "math",
  "transform",
  "trace",
  "letterPos",
  "letterPick",
  "ballkanone",
  "buchstabenstrasse",
];

export const PUZZLE_CATEGORY_LABELS: Record<PuzzleType, string> = {
  word: "Wörter",
  math: "Mathe",
  transform: "Transformieren",
  trace: "Zeichnen",
  letterPos: "Buchstaben-Position",
  letterPick: "Buchstaben-Bildwahl",
  ballkanone: "Ballkanone",
  buchstabenstrasse: "Buchstabenstraße",
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
 * One board per category. Positions roughly follow the old 1:1 layout
 * (stream → meadow → elevated math → late transforms → goal).
 */
export const STATION_SLOTS: StationSlotDef[] = [
  { id: "slot-word", category: "word", x: 620, y: 570, effect: "spawn_bridge" },
  { id: "slot-ballkanone", category: "ballkanone", x: 1480, y: 570, effect: "spawn_rope" },
  {
    id: "slot-buchstabenstrasse",
    category: "buchstabenstrasse",
    x: 1680,
    y: 570,
    effect: "spawn_platform",
  },
  { id: "slot-math", category: "math", x: 1780, y: 320, effect: "spawn_ladder", elevated: true },
  { id: "slot-letter-pos", category: "letterPos", x: 2020, y: 570, effect: "spawn_platform" },
  { id: "slot-letter-pick", category: "letterPick", x: 2180, y: 570, effect: "spawn_platform" },
  { id: "slot-transform", category: "transform", x: 2740, y: 570, effect: "none" },
  { id: "slot-trace", category: "trace", x: 3160, y: 570, effect: "none" },
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

export function enabledStationSlots(
  storage: Storage | null = defaultStorage(),
): StationSlotDef[] {
  const enabled = loadEnabledCategories(storage);
  return STATION_SLOTS.filter((s) => enabled[s.category]);
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

/** Attach the slot’s progression effect (transform keeps the template effect). */
export function puzzleForSlot(slot: StationSlotDef, template: Puzzle): Puzzle {
  if (slot.category === "transform") return { ...template };
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
