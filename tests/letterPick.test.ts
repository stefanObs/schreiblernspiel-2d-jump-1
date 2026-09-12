import { beforeEach, describe, expect, it } from "vitest";
import {
  LETTER_PICK_ITEMS,
  LETTER_PICK_ROUNDS,
  applyLetterPickRound,
  isLetterPickPuzzle,
  letterPickHitId,
  letterPickItemsForKey,
  letterPickProgressLabel,
  realizeLetterPickPuzzle,
  resetLetterPickPick,
  rngForLetterPickIndex,
  startLetterPickSession,
  wordContainsLetter,
} from "../src/logic/letterPickPuzzle";
import { matchPuzzle } from "../src/logic/matchPuzzle";
import { builtinPuzzles } from "../src/logic/puzzleStore";

describe("letterPick catalog", () => {
  it("has exactly 780 entries, 30 per a–z key", () => {
    expect(LETTER_PICK_ITEMS).toHaveLength(780);
    for (const key of "abcdefghijklmnopqrstuvwxyz") {
      expect(letterPickItemsForKey(key)).toHaveLength(30);
    }
  });

  it("every pool word contains its key; paths and slugs look right", () => {
    for (const it of LETTER_PICK_ITEMS) {
      expect(it.key).toMatch(/^[a-z]$/);
      expect(wordContainsLetter(it.display, it.key)).toBe(true);
      expect(it.slug).toMatch(/^[a-z0-9]+$/);
      expect(it.artPath).toBe(`art/letterpick/${it.key}/${it.slug}.png`);
    }
  });

  it("treats ä/ö/ü/ß as distinct from a/o/u/s", () => {
    expect(wordContainsLetter("Bär", "a")).toBe(false);
    expect(wordContainsLetter("Bär", "b")).toBe(true);
    expect(wordContainsLetter("groß", "s")).toBe(false);
    expect(wordContainsLetter("Öl", "o")).toBe(false);
    expect(wordContainsLetter("Tür", "u")).toBe(false);
    expect(wordContainsLetter("Affe", "a")).toBe(true);
  });
});

describe("letterPick realize + match", () => {
  beforeEach(() => {
    resetLetterPickPick();
  });

  it("is a builtin letterPick station", () => {
    const raw = builtinPuzzles().find((p) => p.id === "bach-letter-pick")!;
    expect(raw.type).toBe("letterPick");
    expect(isLetterPickPuzzle(raw)).toBe(true);
  });

  it("realizes five options with exactly one hit and matches that id", () => {
    const raw = builtinPuzzles().find((p) => p.id === "bach-letter-pick")!;
    const realized = realizeLetterPickPuzzle(raw, rngForLetterPickIndex(0));
    const letter = realized.letterPickLetter!;
    const options = realized.letterPickOptions!;
    expect(options).toHaveLength(5);
    const hits = options.filter((o) => wordContainsLetter(o.display, letter));
    expect(hits).toHaveLength(1);
    expect(realized.solution).toBe(hits[0]!.id);
    expect(realized.prompt).toContain(letter.toLocaleUpperCase("de-DE"));
    expect(matchPuzzle(realized, realized.solution).ok).toBe(true);
    const wrong = options.find((o) => o.id !== realized.solution)!;
    expect(matchPuzzle(realized, wrong.id).ok).toBe(false);
  });

  it("hit id is key|slug of the catalog entry", () => {
    const first = LETTER_PICK_ITEMS[0]!;
    expect(letterPickHitId(first)).toBe(`${first.key}|${first.slug}`);
  });

  it("starts a session with three distinct hit rounds", () => {
    expect(LETTER_PICK_ROUNDS).toBe(3);
    const raw = builtinPuzzles().find((p) => p.id === "bach-letter-pick")!;
    const { puzzle, rounds } = startLetterPickSession(raw, rngForLetterPickIndex(0));
    expect(rounds).toHaveLength(3);
    const ids = rounds.map((r) => r.solution);
    expect(new Set(ids).size).toBe(3);
    expect(puzzle.solution).toBe(rounds[0]!.solution);
    expect(puzzle.letterPickLetter).toBe(rounds[0]!.letter);
    const second = applyLetterPickRound(puzzle, rounds[1]!);
    expect(second.solution).toBe(rounds[1]!.solution);
    expect(matchPuzzle(second, rounds[1]!.solution).ok).toBe(true);
    expect(letterPickProgressLabel(0)).toBe("Wort 1 von 3");
    expect(letterPickProgressLabel(2)).toBe("Wort 3 von 3");
    for (const round of rounds) {
      expect(round.options).toHaveLength(5);
      const hits = round.options.filter((o) => wordContainsLetter(o.display, round.letter));
      expect(hits).toHaveLength(1);
      expect(hits[0]!.id).toBe(round.solution);
    }
  });
});
