import { answersMatch, normalizeAnswer } from "./normalizeAnswer";
import type { Puzzle } from "./puzzleTypes";

export type MatchResult = { ok: boolean; effect: Puzzle["effect"] | "none" };

export function matchPuzzle(puzzle: Puzzle, input: string): MatchResult {
  const fail: MatchResult = { ok: false, effect: "none" };
  if (puzzle.type === "word" || puzzle.type === "transform") {
    return answersMatch(input, puzzle.solution)
      ? { ok: true, effect: puzzle.effect }
      : fail;
  }
  if (puzzle.type === "math") {
    return matchMath(puzzle, input) ? { ok: true, effect: puzzle.effect } : fail;
  }
  return fail;
}

function matchMath(puzzle: Puzzle, input: string): boolean {
  const n = normalizeAnswer(input);
  if (puzzle.mathSubtype === "plus") {
    const a = puzzle.plusA ?? 0;
    const b = puzzle.plusB ?? 0;
    return n === String(a + b);
  }
  if (puzzle.mathSubtype === "compare") {
    const left = puzzle.compareLeft ?? 0;
    const right = puzzle.compareRight ?? 0;
    const larger = Math.max(left, right);
    const expectedSign = left < right ? ">" : left > right ? "<" : "=";
    return n === expectedSign || n === String(larger);
  }
  if (puzzle.mathSubtype === "countdown") {
    const from = puzzle.countdownFrom ?? 1;
    return n === String(from - 1);
  }
  return answersMatch(input, puzzle.solution);
}
