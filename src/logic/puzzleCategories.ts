import type { Puzzle, PuzzleType, WorldEffect } from "./puzzleTypes";
import { TREEHOUSE } from "./bachbrueckeLayout";

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
  "buchstabenflieger",
  "kettenhochhaus",
];

/** Textfeld-Holztafeln — remappable among themselves. Not minigame gates. */
export const BOARD_CATEGORIES: PuzzleType[] = [
  "word",
  "math",
  "transform",
  "trace",
  "letterPos",
  "letterPick",
];

/** Overlay minigames — only at special world places (treehouse, street, hangar, …). */
export const MINIGAME_CATEGORIES: PuzzleType[] = [
  "ballkanone",
  "buchstabenstrasse",
  "buchstabenflieger",
  "kettenhochhaus",
];

export function isMinigameCategory(category: PuzzleType): boolean {
  return (MINIGAME_CATEGORIES as string[]).includes(category);
}

export function isBoardCategory(category: PuzzleType): boolean {
  return (BOARD_CATEGORIES as string[]).includes(category);
}

/** Phaser texture key for a category’s Holztafel (fallback: generic station-sign). */
export function signKeyForCategory(category: PuzzleType): string {
  const map: Partial<Record<PuzzleType, string>> = {
    word: "station-sign-word",
    math: "station-sign-math",
    transform: "station-sign-transform",
    trace: "station-sign-trace",
    letterPos: "station-sign-letter-pos",
    letterPick: "station-sign-letter-pick",
    ballkanone: "station-sign-ballkanone",
    buchstabenstrasse: "station-sign-buchstabenstrasse",
  };
  return map[category] ?? "station-sign";
}

/** Public art path for a category sign (for preload). */
export function signArtPathForCategory(category: PuzzleType): string | null {
  const map: Partial<Record<PuzzleType, string>> = {
    word: "art/station_sign_word.png",
    math: "art/station_sign_math.png",
    transform: "art/station_sign_transform.png",
    trace: "art/station_sign_trace.png",
    letterPos: "art/station_sign_letter_pos.png",
    letterPick: "art/station_sign_letter_pick.png",
    ballkanone: "art/station_sign_ballkanone.png",
    buchstabenstrasse: "art/station_sign_buchstabenstrasse.png",
  };
  return map[category] ?? null;
}

export const PUZZLE_CATEGORY_LABELS: Record<PuzzleType, string> = {
  word: "Wörter",
  math: "Mathe",
  transform: "Transformieren",
  trace: "Zeichnen",
  letterPos: "Buchstaben-Position",
  letterPick: "Buchstaben-Bildwahl",
  ballkanone: "Ballkanone",
  buchstabenstrasse: "Buchstabenstraße",
  buchstabenflieger: "Buchstaben-Flieger",
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
  /** If true, board sits on the treehouse deck (or other elevated solid). */
  elevated?: boolean;
};

/**
 * Boards on Bachbrücke (buchstabenstrasse is the world street gate, not a board).
 * Progression: stream → rope/treehouse → meadow → lake → far side.
 * Disabled *board* categories are remapped onto other enabled board types; slots stay.
 * Minigame slots (e.g. Ballkanone in the treehouse) are omitted when their category is off.
 */
export const STATION_SLOTS: StationSlotDef[] = [
  { id: "slot-word", category: "word", x: 620, y: 570, effect: "spawn_bridge" },
  { id: "slot-letter-pos", category: "letterPos", x: 1480, y: 570, effect: "spawn_rope" },
  {
    id: "slot-ballkanone",
    category: "ballkanone",
    x: TREEHOUSE.floor.x,
    y: TREEHOUSE.stationY,
    effect: "none",
    elevated: true,
  },
  { id: "slot-math", category: "math", x: 2100, y: 570, effect: "none" },
  { id: "slot-letter-pick", category: "letterPick", x: 2280, y: 570, effect: "spawn_lake_bridge" },
  { id: "slot-transform", category: "transform", x: 4100, y: 570, effect: "none" },
  { id: "slot-trace", category: "trace", x: 4500, y: 570, effect: "none" },
];

export type EnabledCategories = Record<PuzzleType, boolean>;

export function defaultEnabledCategories(): EnabledCategories {
  const out = {} as EnabledCategories;
  for (const c of PUZZLE_CATEGORIES) out[c] = true;
  // Play disabled until Querkette / Axt UX is ready enough for kids.
  out.kettenhochhaus = false;
  // No Hangar-Sonderort yet — keep off so it never appears as a ground board.
  out.buchstabenflieger = false;
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
 * Board slots stay at fixed x/y. Disabled board categories remap onto other
 * enabled *board* types only (never minigames). Minigame slots are dropped when off.
 */
export function resolvedStationSlots(
  storage: Storage | null = defaultStorage(),
): StationSlotDef[] {
  const enabled = loadEnabledCategories(storage);
  const enabledBoards = BOARD_CATEGORIES.filter((c) => enabled[c]);
  let fill = 0;

  const out: StationSlotDef[] = [];
  for (const slot of STATION_SLOTS) {
    if (isMinigameCategory(slot.category)) {
      if (enabled[slot.category]) out.push({ ...slot });
      continue;
    }
    if (enabled[slot.category]) {
      out.push({ ...slot });
      continue;
    }
    if (enabledBoards.length === 0) {
      // No board types left — still keep the slot with its home category so
      // progression positions exist; pickRandomPuzzle will no-op if empty pool.
      out.push({ ...slot });
      continue;
    }
    const category = enabledBoards[fill % enabledBoards.length]!;
    fill += 1;
    out.push({ ...slot, category });
  }
  return out;
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
