import { describe, expect, it } from "vitest";
import { debugPuzzleOptions } from "../src/logic/debugPuzzles";
import { builtinPuzzles, mergedPuzzles } from "../src/logic/puzzleStore";

describe("debug puzzle picker", () => {
  it("lists every merged level puzzle with a non-empty label", () => {
    const puzzles = mergedPuzzles();
    const options = debugPuzzleOptions(puzzles);
    expect(options.length).toBe(puzzles.length);
    expect(options.length).toBeGreaterThan(0);
    const ids = new Set(options.map((o) => o.id));
    for (const p of puzzles) {
      expect(ids.has(p.id)).toBe(true);
    }
    for (const o of options) {
      expect(o.label.length).toBeGreaterThan(3);
      expect(o.label).toContain("·");
    }
  });

  it("covers all builtin bachbruecke puzzles", () => {
    const builtins = builtinPuzzles().filter((p) => p.levelId === "bachbruecke");
    const ids = new Set(debugPuzzleOptions(builtins).map((o) => o.id));
    expect(ids.size).toBe(builtins.length);
  });
});
