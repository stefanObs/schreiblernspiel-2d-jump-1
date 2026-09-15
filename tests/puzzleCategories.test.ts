import { describe, expect, it } from "vitest";
import {
  BOARD_CATEGORIES,
  MINIGAME_CATEGORIES,
  PUZZLE_CATEGORIES,
  STATION_SLOTS,
  defaultEnabledCategories,
  isBoardCategory,
  isMinigameCategory,
  resolvedStationSlots,
  loadEnabledCategories,
  parseEnabledCategories,
  pickRandomPuzzle,
  puzzleForSlot,
  puzzlesInCategory,
  saveEnabledCategories,
  signArtPathForCategory,
  signKeyForCategory,
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
  it("defaults playable categories on (kettenhochhaus and flieger off)", () => {
    const enabled = defaultEnabledCategories();
    for (const c of PUZZLE_CATEGORIES) {
      if (c === "kettenhochhaus" || c === "buchstabenflieger") expect(enabled[c]).toBe(false);
      else expect(enabled[c]).toBe(true);
    }
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
    expect(parsed).toEqual(defaultEnabledCategories());
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

  it("keeps board positions when a board category is disabled; drops minigame slots", () => {
    const storage = memoryStorage();
    const enabled = defaultEnabledCategories();
    enabled.math = false;
    enabled.ballkanone = false;
    saveEnabledCategories(enabled, storage);
    const slots = resolvedStationSlots(storage);
    const boardHomes = STATION_SLOTS.filter((s) => isBoardCategory(s.category));
    expect(slots.filter((s) => isBoardCategory(s.category))).toHaveLength(boardHomes.length);
    expect(slots.some((s) => s.category === "ballkanone")).toBe(false);
    expect(slots.every((s) => s.category !== "math")).toBe(true);
    for (const resolved of slots) {
      if (isBoardCategory(resolved.category)) expect(enabled[resolved.category]).toBe(true);
      const home = STATION_SLOTS.find((h) => h.id === resolved.id)!;
      expect(resolved.x).toBe(home.x);
      expect(resolved.y).toBe(home.y);
      expect(resolved.effect).toBe(home.effect);
    }
    const wordHome = slots.find((s) => s.id === "slot-word");
    expect(wordHome?.category).toBe("word");
  });

  it("never remaps minigames onto board slots", () => {
    const storage = memoryStorage();
    const enabled = defaultEnabledCategories();
    for (const c of BOARD_CATEGORIES) enabled[c] = false;
    enabled.ballkanone = true;
    enabled.buchstabenstrasse = true;
    enabled.kettenhochhaus = false;
    // Force at least one board on via save guard — enable only ballkanone-ish:
    // leave word on so save accepts; then remapping should still never put ballkanone on boards.
    enabled.word = true;
    for (const c of BOARD_CATEGORIES) if (c !== "word") enabled[c] = false;
    saveEnabledCategories(enabled, storage);
    const slots = resolvedStationSlots(storage);
    for (const slot of slots) {
      if (isBoardCategory(STATION_SLOTS.find((h) => h.id === slot.id)!.category)) {
        expect(isMinigameCategory(slot.category)).toBe(false);
      }
    }
  });

  it("uses the only enabled board category on every board slot", () => {
    const storage = memoryStorage();
    const enabled = defaultEnabledCategories();
    for (const c of PUZZLE_CATEGORIES) enabled[c] = c === "trace";
    saveEnabledCategories(enabled, storage);
    const slots = resolvedStationSlots(storage);
    const boards = slots.filter((s) => {
      const home = STATION_SLOTS.find((h) => h.id === s.id)!;
      return isBoardCategory(home.category);
    });
    expect(boards.length).toBe(BOARD_CATEGORIES.length);
    expect(boards.every((s) => s.category === "trace")).toBe(true);
    expect(slots.some((s) => s.category === "ballkanone")).toBe(false);
  });

  it("has exactly one home slot per board category; minigames are not boards", () => {
    const cats = STATION_SLOTS.map((s) => s.category);
    expect(new Set(cats).size).toBe(cats.length);
    for (const c of BOARD_CATEGORIES) expect(cats).toContain(c);
    expect(BOARD_CATEGORIES.includes("ballkanone")).toBe(false);
    expect(BOARD_CATEGORIES.includes("buchstabenstrasse")).toBe(false);
    expect(BOARD_CATEGORIES.includes("buchstabenflieger")).toBe(false);
    expect(MINIGAME_CATEGORIES).toContain("ballkanone");
    expect(MINIGAME_CATEGORIES).toContain("buchstabenflieger");
    expect(cats.includes("buchstabenstrasse")).toBe(false);
    expect(cats.includes("buchstabenflieger")).toBe(false);
    expect(cats).toContain("ballkanone");
  });

  it("maps each playable type to a dedicated sign art key", () => {
    for (const c of [...BOARD_CATEGORIES, "ballkanone", "buchstabenstrasse"] as PuzzleType[]) {
      expect(signKeyForCategory(c)).not.toBe("station-sign");
      expect(signArtPathForCategory(c)).toMatch(/^art\/station_sign_/);
    }
    expect(signKeyForCategory("kettenhochhaus")).toBe("station-sign");
    expect(signKeyForCategory("buchstabenflieger")).toBe("station-sign");
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
