import { describe, expect, it } from "vitest";
import {
  BOARD_CATEGORIES,
  PUZZLE_CATEGORIES,
  STATION_SLOTS,
  defaultEnabledCategories,
  resolvedStationSlots,
  loadEnabledCategories,
  parseEnabledCategories,
  pickRandomPuzzle,
  puzzleForSlot,
  puzzlesInCategory,
  saveEnabledCategories,
} from "../src/logic/puzzleCategories";
import { builtinPuzzles } from "../src/logic/puzzleStore";
import type { PuzzleType } from "../src/logic/puzzleTypes";

function memoryStorage(initial: Record<string, string> = {}): Storage {
  const map = new Map(Object.entries(initial));
  return {
    get length() {
      return map.size;
    },
    clear: () => map.clear(),
    getItem: (k: string) => (map.has(k) ? map.get(k)! : null),
    key: (i: number) => [...map.keys()][i] ?? null,
    removeItem: (k: string) => {
      map.delete(k);
    },
    setItem: (k: string, v: string) => {
      map.set(k, v);
    },
  };
}

describe("puzzleCategories", () => {
  it("defaults all categories on", () => {
    const enabled = defaultEnabledCategories();
    for (const c of PUZZLE_CATEGORIES) expect(enabled[c]).toBe(true);
  });

  it("parses partial storage and keeps defaults for missing keys", () => {
    const parsed = parseEnabledCategories(JSON.stringify({ word: false, math: true }));
    expect(parsed.word).toBe(false);
    expect(parsed.math).toBe(true);
    expect(parsed.ballkanone).toBe(true);
  });

  it("falls back when all categories would be off", () => {
    const allOff = Object.fromEntries(PUZZLE_CATEGORIES.map((c) => [c, false]));
    const parsed = parseEnabledCategories(JSON.stringify(allOff));
    expect(PUZZLE_CATEGORIES.every((c) => parsed[c])).toBe(true);
  });

  it("persists and loads enabled categories", () => {
    const storage = memoryStorage();
    const next = defaultEnabledCategories();
    next.transform = false;
    next.trace = false;
    saveEnabledCategories(next, storage);
    const loaded = loadEnabledCategories(storage);
    expect(loaded.transform).toBe(false);
    expect(loaded.trace).toBe(false);
    expect(loaded.word).toBe(true);
  });

  it("forces at least one category when saving all-off", () => {
    const storage = memoryStorage();
    const allOff = defaultEnabledCategories();
    for (const c of PUZZLE_CATEGORIES) allOff[c] = false;
    saveEnabledCategories(allOff, storage);
    const loaded = loadEnabledCategories(storage);
    expect(PUZZLE_CATEGORIES.some((c) => loaded[c])).toBe(true);
  });

  it("keeps every station position when categories are disabled", () => {
    const storage = memoryStorage();
    const enabled = defaultEnabledCategories();
    enabled.math = false;
    enabled.ballkanone = false;
    saveEnabledCategories(enabled, storage);
    const slots = resolvedStationSlots(storage);
    expect(slots).toHaveLength(STATION_SLOTS.length);
    for (let i = 0; i < STATION_SLOTS.length; i++) {
      const home = STATION_SLOTS[i]!;
      const resolved = slots[i]!;
      expect(resolved.id).toBe(home.id);
      expect(resolved.x).toBe(home.x);
      expect(resolved.y).toBe(home.y);
      expect(resolved.effect).toBe(home.effect);
      expect(enabled[resolved.category]).toBe(true);
    }
    expect(slots.every((s) => s.category !== "math" && s.category !== "ballkanone")).toBe(true);
    const wordHome = slots.find((s) => s.id === "slot-word");
    expect(wordHome?.category).toBe("word");
  });

  it("uses the only enabled category on every board", () => {
    const storage = memoryStorage();
    const enabled = defaultEnabledCategories();
    for (const c of PUZZLE_CATEGORIES) enabled[c] = c === "trace";
    saveEnabledCategories(enabled, storage);
    const slots = resolvedStationSlots(storage);
    expect(slots).toHaveLength(STATION_SLOTS.length);
    expect(slots.every((s) => s.category === "trace")).toBe(true);
  });

  it("has exactly one board slot per board category", () => {
    const cats = STATION_SLOTS.map((s) => s.category);
    expect(new Set(cats).size).toBe(cats.length);
    for (const c of BOARD_CATEGORIES) expect(cats).toContain(c);
    expect(cats.includes("buchstabenstrasse")).toBe(false);
  });

  it("picks a random puzzle from the same category", () => {
    const puzzles = builtinPuzzles();
    const wordPool = puzzlesInCategory(puzzles, "word");
    expect(wordPool.length).toBeGreaterThan(1);
    const picks = new Set<string>();
    for (let i = 0; i < 40; i++) {
      const p = pickRandomPuzzle(puzzles, "word", () => i / 40);
      expect(p?.type).toBe("word");
      if (p) picks.add(p.id);
    }
    expect(picks.size).toBeGreaterThan(1);
  });

  it("applies slot effect except for transform on none-slots", () => {
    const slot = STATION_SLOTS.find((s) => s.category === "word")!;
    const template = builtinPuzzles().find((p) => p.type === "word")!;
    const opened = puzzleForSlot(slot, template);
    expect(opened.effect).toBe(slot.effect);

    const tSlot = STATION_SLOTS.find((s) => s.category === "transform")!;
    const tTemplate = builtinPuzzles().find((p) => p.type === "transform")!;
    expect(puzzleForSlot(tSlot, tTemplate).effect).toBe(tTemplate.effect);
  });

  it("keeps a remapped progression slot’s world effect", () => {
    const bridgeSlot = {
      ...STATION_SLOTS.find((s) => s.id === "slot-word")!,
      category: "transform" as const,
    };
    const tTemplate = builtinPuzzles().find((p) => p.type === "transform")!;
    expect(puzzleForSlot(bridgeSlot, tTemplate).effect).toBe("spawn_bridge");
  });

  it("every builtin puzzle type has a pool for its category", () => {
    const puzzles = builtinPuzzles();
    const types = new Set(puzzles.map((p) => p.type));
    for (const t of types) {
      expect(puzzlesInCategory(puzzles, t as PuzzleType).length).toBeGreaterThan(0);
    }
  });
});
