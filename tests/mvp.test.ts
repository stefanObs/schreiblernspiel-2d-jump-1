import { describe, expect, it } from "vitest";
import { shouldSpeakSolution } from "../src/logic/speech";
import { shouldKeepWorldPaused } from "../src/logic/pause";
import { answersMatch, normalizeAnswer } from "../src/logic/normalizeAnswer";
import { matchPuzzle } from "../src/logic/matchPuzzle";
import { canJump, jumpVelocity, moveSpeed, RESPAWN } from "../src/logic/playerRules";
import { ANLAUT_TILES } from "../src/logic/anlaut";
import { TRACE_PASS, templatePath, traceScore } from "../src/logic/traceScore";
import { builtinPuzzles, exportPuzzlesJson, parsePuzzlesJson } from "../src/logic/puzzleStore";
import type { Puzzle } from "../src/logic/puzzleTypes";

const word: Puzzle = builtinPuzzles()[0];

describe("normalizeAnswer", () => {
  it("trims, lowercases, maps ue to ü", () => {
    expect(normalizeAnswer("  Bruecke ")).toBe("brücke");
    expect(answersMatch("SEIL", "seil")).toBe(true);
  });
});

describe("playerRules", () => {
  it("allows jump only when grounded and not paused", () => {
    expect(canJump(true, false)).toBe(true);
    expect(canJump(false, false)).toBe(false);
    expect(canJump(true, true)).toBe(false);
  });
  it("keeps respawn and auto vs mech speeds", () => {
    expect(RESPAWN.x).toBe(120);
    expect(moveSpeed("auto")).toBeGreaterThan(moveSpeed("mech"));
    expect(Math.abs(jumpVelocity("auto"))).toBeLessThan(Math.abs(jumpVelocity("mech")));
  });
});

describe("matchPuzzle", () => {
  it("spawns bridge only on match", () => {
    expect(matchPuzzle(word, "brücke").ok).toBe(true);
    expect(matchPuzzle(word, "brücke").effect).toBe("spawn_bridge");
    expect(matchPuzzle(word, "seil").ok).toBe(false);
  });
  it("plus and compare", () => {
    const plus = builtinPuzzles().find((p) => p.id === "bach-plus")!;
    const cmp = builtinPuzzles().find((p) => p.id === "bach-compare")!;
    expect(matchPuzzle(plus, "3").ok).toBe(true);
    expect(matchPuzzle(plus, "4").ok).toBe(false);
    expect(matchPuzzle(cmp, ">").ok).toBe(true);
    expect(matchPuzzle(cmp, "7").ok).toBe(true);
    expect(matchPuzzle(cmp, "<").ok).toBe(false);
  });
  it("transform auto", () => {
    const auto = builtinPuzzles().find((p) => p.id === "bach-auto")!;
    expect(matchPuzzle(auto, "Auto").effect).toBe("transform_auto");
  });
});

describe("speech policy", () => {
  it("speaks in hear mode and not for motif solution", () => {
    expect(shouldSpeakSolution("hear", false)).toBe(true);
    expect(shouldSpeakSolution("motif", false)).toBe(false);
  });
});

describe("anlaut", () => {
  it("does not include a field that would autofill", () => {
    expect(ANLAUT_TILES.every((t) => t.letters && t.speak)).toBe(true);
  });
});

describe("trace", () => {
  it("passes near template and fails empty stroke", () => {
    const tmpl = templatePath("bridge");
    expect(traceScore([], tmpl)).toBe(0);
    expect(traceScore(tmpl, tmpl)).toBeGreaterThanOrEqual(TRACE_PASS);
  });
});

describe("pause", () => {
  it("keeps the world paused on a wrong answer", () => {
    expect(shouldKeepWorldPaused(false)).toBe(true);
    expect(shouldKeepWorldPaused(true)).toBe(false);
  });
});

describe("puzzle json", () => {
  it("roundtrips export/parse", () => {
    const json = exportPuzzlesJson(builtinPuzzles());
    expect(parsePuzzlesJson(json).length).toBe(builtinPuzzles().length);
  });
});
