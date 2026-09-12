import type { Puzzle } from "./puzzleTypes";

export type MathPair = { a: number; b: number };

export type ComparePair = { left: number; right: number };

/** ASCII comparison sign for `left □ right` (NFC-safe for textContent). */
export type CompareSign = "<" | ">" | "=";

/** All a,b ∈ 1…10 → 100 tasks, sum ≤ 20. */
export const PLUS_OPTIONS: readonly MathPair[] = (() => {
  const out: MathPair[] = [];
  for (let a = 1; a <= 10; a++) {
    for (let b = 1; b <= 10; b++) out.push({ a, b });
  }
  return out;
})();

/**
 * Minuend up to 20, subtrahend 0…minuend, result ≥ 0.
 * 230 valid pairs → 100 evenly spaced options.
 */
export const MINUS_OPTIONS: readonly MathPair[] = (() => {
  const all: MathPair[] = [];
  for (let a = 1; a <= 20; a++) {
    for (let b = 0; b <= a; b++) all.push({ a, b });
  }
  const target = 100;
  const out: MathPair[] = [];
  for (let i = 0; i < target; i++) {
    const idx = Math.floor((i * all.length) / target);
    out.push(all[idx]!);
  }
  return out;
})();

/**
 * 200 comparison pairs covering größer, kleiner, gleich.
 * Base grid a,b ∈ 0…13 (196) plus four pads with 14/15.
 */
export const COMPARE_OPTIONS: readonly ComparePair[] = (() => {
  const out: ComparePair[] = [];
  for (let left = 0; left <= 13; left++) {
    for (let right = 0; right <= 13; right++) {
      out.push({ left, right });
    }
  }
  out.push({ left: 14, right: 14 });
  out.push({ left: 15, right: 15 });
  out.push({ left: 14, right: 15 });
  out.push({ left: 15, right: 14 });
  return out;
})();

/** Correct sign between left and right (encoding: smaller → `<`, greater → `>`). */
export function compareSign(left: number, right: number): CompareSign {
  if (left < right) return "<";
  if (left > right) return ">";
  return "=";
}

export function compareRelation(left: number, right: number): "greater" | "smaller" | "equal" {
  if (left > right) return "greater";
  if (left < right) return "smaller";
  return "equal";
}

function indexFromRng(rng: () => number, length: number): number {
  if (length <= 0) return 0;
  const n = Math.floor(rng() * length);
  return Math.min(length - 1, Math.max(0, n));
}

let lastPlusKey = "";
let lastMinusKey = "";
let lastCompareKey = "";

function pairKey(p: MathPair): string {
  return `${p.a}+${p.b}`;
}

function compareKey(p: ComparePair): string {
  return `${p.left}?${p.right}`;
}

export function resetMathPick(): void {
  lastPlusKey = "";
  lastMinusKey = "";
  lastCompareKey = "";
}

export function isRandomMathPuzzle(puzzle: Puzzle): boolean {
  return (
    puzzle.mathSubtype === "plus" ||
    puzzle.mathSubtype === "minus" ||
    puzzle.mathSubtype === "compare"
  );
}

export function pickPlusOption(
  rng: () => number = Math.random,
  avoidKey: string = lastPlusKey,
): MathPair {
  const pool = avoidKey
    ? PLUS_OPTIONS.filter((p) => pairKey(p) !== avoidKey)
    : PLUS_OPTIONS;
  const list = pool.length > 0 ? pool : PLUS_OPTIONS;
  const picked = list[indexFromRng(rng, list.length)]!;
  lastPlusKey = pairKey(picked);
  return picked;
}

export function pickMinusOption(
  rng: () => number = Math.random,
  avoidKey: string = lastMinusKey,
): MathPair {
  const pool = avoidKey
    ? MINUS_OPTIONS.filter((p) => pairKey(p) !== avoidKey)
    : MINUS_OPTIONS;
  const list = pool.length > 0 ? pool : MINUS_OPTIONS;
  const picked = list[indexFromRng(rng, list.length)]!;
  lastMinusKey = pairKey(picked);
  return picked;
}

export function pickCompareOption(
  rng: () => number = Math.random,
  avoidKey: string = lastCompareKey,
): ComparePair {
  const pool = avoidKey
    ? COMPARE_OPTIONS.filter((p) => compareKey(p) !== avoidKey)
    : COMPARE_OPTIONS;
  const list = pool.length > 0 ? pool : COMPARE_OPTIONS;
  const picked = list[indexFromRng(rng, list.length)]!;
  lastCompareKey = compareKey(picked);
  return picked;
}

/** Deterministic pick by absolute index into a math pool. */
export function rngForMathIndex(
  index: number,
  pool: "plus" | "minus" | "compare" = "plus",
): () => number {
  const len =
    pool === "plus"
      ? PLUS_OPTIONS.length
      : pool === "minus"
        ? MINUS_OPTIONS.length
        : COMPARE_OPTIONS.length;
  const i = ((index % len) + len) % len;
  return () => (i + 0.5) / len;
}

/** Kid-facing prompt; signs stay ASCII so textContent never mangled them. */
export function comparePrompt(left: number, right: number): string {
  return `${left} □ ${right}  (schreib < , > oder = oder die größere Zahl)`;
}

/** Fill operands, prompt and solution from a random pool item. */
export function realizeMathPuzzle(
  puzzle: Puzzle,
  rng: () => number = Math.random,
): Puzzle {
  if (puzzle.mathSubtype === "plus") {
    const { a, b } = pickPlusOption(rng);
    return {
      ...puzzle,
      plusA: a,
      plusB: b,
      solution: String(a + b),
      prompt: `${a} + ${b} = ?`,
    };
  }
  if (puzzle.mathSubtype === "minus") {
    const { a, b } = pickMinusOption(rng);
    return {
      ...puzzle,
      plusA: a,
      plusB: b,
      solution: String(a - b),
      prompt: `${a} − ${b} = ?`,
    };
  }
  if (puzzle.mathSubtype === "compare") {
    const { left, right } = pickCompareOption(rng);
    const sign = compareSign(left, right);
    return {
      ...puzzle,
      compareLeft: left,
      compareRight: right,
      solution: sign,
      prompt: comparePrompt(left, right),
    };
  }
  return puzzle;
}
