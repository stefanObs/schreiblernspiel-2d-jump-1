import { describe, expect, it, beforeEach } from "vitest";
import {
  LETTER_POS_ITEMS,
  LETTER_POS_ROUNDS,
  applyLetterPosItem,
  exclusiveLetterPosition,
  isLetterPosPuzzle,
  itemKey,
  letterPosHearLabel,
  letterPosProgressLabel,
  pickLetterPosItem,
  pickLetterPosItems,
  realizeLetterPosPuzzle,
  resetLetterPosPick,
  rngForLetterPosIndex,
  startLetterPosSession,
} from "../src/logic/letterPositionPuzzle";
import { letterPosWordArt } from "../src/logic/letterPosWordArt";
import { matchPuzzle } from "../src/logic/matchPuzzle";
import { builtinPuzzles } from "../src/logic/puzzleStore";

describe("letter position puzzle pool", () => {
  it("has exactly 100 exclusive examples with word art, ~1/3 per zone", () => {
    expect(LETTER_POS_ITEMS).toHaveLength(100);
    const counts = { anfang: 0, mitte: 0, ende: 0 };
    const keys = new Set<string>();
    for (const it of LETTER_POS_ITEMS) {
      expect(exclusiveLetterPosition(it.letter, it.word)).toBe(it.position);
      expect(letterPosWordArt(it.word)).toBeTruthy();
      expect(letterPosWordArt(it.display)).toBeTruthy();
      expect(it.letter).toMatch(/^[a-zäöü]$/u);
      expect([...it.word].length).toBeGreaterThanOrEqual(2);
      counts[it.position] += 1;
      keys.add(itemKey(it));
    }
    expect(keys.size).toBe(100);
    expect(counts.anfang).toBe(34);
    expect(counts.mitte).toBe(33);
    expect(counts.ende).toBe(33);
  });
});

describe("letter position realize + match", () => {
  beforeEach(() => {
    resetLetterPosPick();
  });

  it("is a builtin letterPos station", () => {
    const raw = builtinPuzzles().find((p) => p.id === "bach-letter-pos")!;
    expect(raw.type).toBe("letterPos");
    expect(isLetterPosPuzzle(raw)).toBe(true);
    expect(letterPosHearLabel(raw)).toBe("Wort hören");
  });

  it("realizes prompt, spoken word and position solution", () => {
    const raw = builtinPuzzles().find((p) => p.id === "bach-letter-pos")!;
    const item = LETTER_POS_ITEMS[0]!;
    const realized = realizeLetterPosPuzzle(raw, rngForLetterPosIndex(0));
    expect(realized.letterPosLetter).toBe(item.letter);
    expect(realized.letterPosWord).toBe(item.word);
    expect(realized.voiceText).toBe(item.display);
    expect(realized.solution).toBe(item.position);
    expect(realized.prompt).toContain(item.letter.toLocaleUpperCase("de-DE"));
    expect(letterPosWordArt(realized.letterPosWord ?? "")).toBeTruthy();
    expect(matchPuzzle(realized, item.position).ok).toBe(true);
    expect(matchPuzzle(realized, "anfang").ok).toBe(item.position === "anfang");
    expect(matchPuzzle(realized, "mitte").ok).toBe(item.position === "mitte");
    expect(matchPuzzle(realized, "ende").ok).toBe(item.position === "ende");
  });

  it("picks from the pool and avoids the last item", () => {
    const a = pickLetterPosItem(() => 0.01);
    const b = pickLetterPosItem(() => 0.01);
    expect(LETTER_POS_ITEMS.some((it) => itemKey(it) === itemKey(a))).toBe(true);
    expect(itemKey(a)).not.toBe(itemKey(b));
  });

  it("starts a session with three distinct words", () => {
    expect(LETTER_POS_ROUNDS).toBe(3);
    const raw = builtinPuzzles().find((p) => p.id === "bach-letter-pos")!;
    const { puzzle, rounds } = startLetterPosSession(raw, rngForLetterPosIndex(0));
    expect(rounds).toHaveLength(3);
    const keys = rounds.map(itemKey);
    expect(new Set(keys).size).toBe(3);
    expect(puzzle.letterPosWord).toBe(rounds[0]!.word);
    expect(puzzle.solution).toBe(rounds[0]!.position);
    const second = applyLetterPosItem(puzzle, rounds[1]!);
    expect(second.letterPosWord).toBe(rounds[1]!.word);
    expect(matchPuzzle(second, rounds[1]!.position).ok).toBe(true);
    expect(letterPosProgressLabel(0)).toBe("Wort 1 von 3");
    expect(letterPosProgressLabel(2)).toBe("Wort 3 von 3");
  });

  it("pickLetterPosItems returns unique keys", () => {
    const items = pickLetterPosItems(LETTER_POS_ROUNDS, () => 0.42);
    expect(items).toHaveLength(3);
    expect(new Set(items.map(itemKey)).size).toBe(3);
  });
});
