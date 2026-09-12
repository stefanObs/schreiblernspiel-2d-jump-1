import { describe, expect, it, beforeEach } from "vitest";
import {
  LETTER_POS_ITEMS,
  exclusiveLetterPosition,
  isLetterPosPuzzle,
  itemKey,
  letterPosHearLabel,
  pickLetterPosItem,
  realizeLetterPosPuzzle,
  resetLetterPosPick,
  rngForLetterPosIndex,
} from "../src/logic/letterPositionPuzzle";
import { matchPuzzle } from "../src/logic/matchPuzzle";
import { builtinPuzzles } from "../src/logic/puzzleStore";

describe("letter position puzzle pool", () => {
  it("has exactly 100 exclusive examples, ~1/3 per zone", () => {
    expect(LETTER_POS_ITEMS).toHaveLength(100);
    const counts = { anfang: 0, mitte: 0, ende: 0 };
    const keys = new Set<string>();
    for (const it of LETTER_POS_ITEMS) {
      expect(exclusiveLetterPosition(it.letter, it.word)).toBe(it.position);
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
});
