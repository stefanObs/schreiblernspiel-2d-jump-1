import {
  exclusiveLetterPosition,
  pickLetterPosItem,
  type LetterPosItem,
} from "../../logic/letterPositionPuzzle";
import { normalizeAnswer } from "../../logic/normalizeAnswer";
import type { Puzzle } from "../../logic/puzzleTypes";
import type { BuchstabenfliegerConfig } from "./types";

export type Rng = () => number;

const ALPHABET = [..."abcdefghijklmnopqrstuvwxyzäöüß"];

function wordChars(word: string): string[] {
  return [...word.trim().toLowerCase().normalize("NFC")];
}

function pickDistractor(word: string, rng: Rng): string {
  const have = new Set(wordChars(word));
  const pool = ALPHABET.filter((c) => !have.has(c));
  if (pool.length === 0) return "q";
  return pool[Math.floor(rng() * pool.length)]!;
}

function pickMember(word: string, prefer: string, rng: Rng): string {
  const chars = [...new Set(wordChars(word))];
  if (chars.includes(prefer)) return prefer;
  if (chars.length === 0) return "a";
  return chars[Math.floor(rng() * chars.length)]!;
}

/** Build mission from a letterPos pool item (+ optional radar membership coin-flip). */
export function configFromLetterPosItem(
  item: LetterPosItem,
  rng: Rng = Math.random,
): BuchstabenfliegerConfig {
  const word = item.word;
  const radarInWord = rng() < 0.5;
  const radarLetter = radarInWord
    ? pickMember(word, item.letter, rng)
    : pickDistractor(word, rng);

  return {
    word,
    displayWord: item.display,
    radarLetter,
    radarInWord,
    positionLetter: item.letter,
    positionZone: item.position,
    voiceText: item.display,
    prompt: `Fliege und nutze die Buchstaben-Booster für ${item.display}.`,
  };
}

export function configFromPuzzle(
  puzzle: Puzzle,
  rng: Rng = Math.random,
): BuchstabenfliegerConfig {
  const word = normalizeAnswer(puzzle.solution || puzzle.letterPosWord || "haus");
  const display = (puzzle.voiceText || word).trim();
  const posLetter = normalizeAnswer(puzzle.letterPosLetter || word[0] || "h");
  const zone =
    exclusiveLetterPosition(posLetter, word) ??
    ("anfang" as const);

  // Prefer puzzle fields when present; otherwise derive a playable mission.
  if (puzzle.letterPosLetter && puzzle.letterPosWord) {
    const item: LetterPosItem = {
      letter: posLetter,
      word: normalizeAnswer(puzzle.letterPosWord),
      display,
      position: zone,
    };
    const base = configFromLetterPosItem(item, rng);
    return {
      ...base,
      prompt: puzzle.prompt || base.prompt,
      voiceText: puzzle.voiceText || base.voiceText,
      effect: puzzle.effect,
      distractors: puzzle.buchstabenstrasseDistractors,
    };
  }

  const item = pickLetterPosItem(rng);
  const base = configFromLetterPosItem(item, rng);
  return {
    ...base,
    word: word || base.word,
    displayWord: display || base.displayWord,
    prompt: puzzle.prompt || base.prompt,
    voiceText: puzzle.voiceText || base.voiceText,
    effect: puzzle.effect,
    distractors: puzzle.buchstabenstrasseDistractors,
  };
}

/** Apply a fresh letterPos-based mission onto the puzzle for this open. */
export function applyFliegerMission(puzzle: Puzzle, rng: Rng = Math.random): Puzzle {
  const item = pickLetterPosItem(rng);
  const upper = item.letter.toLocaleUpperCase("de-DE");
  return {
    ...puzzle,
    solution: item.word,
    voiceText: item.display,
    prompt: puzzle.prompt || `Fliege und nutze die Buchstaben-Booster für ${item.display}.`,
    letterPosLetter: item.letter,
    letterPosWord: item.word,
    // Keep position on puzzle for debug readability (not used as typed solution).
    syllables: [upper, item.position],
  };
}
