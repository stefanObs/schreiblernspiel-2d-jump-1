import type { Puzzle } from "./puzzleTypes";

export type LetterPosition = "anfang" | "mitte" | "ende";

export type LetterPosItem = {
  /** Single lowercase letter (NFC). */
  letter: string;
  /** Lowercase NFC word. */
  word: string;
  /** Display form for speech (usually noun capitalization). */
  display: string;
  /** Exclusive position of `letter` in `word`. */
  position: LetterPosition;
};

export const LETTER_POS_LABELS: Record<LetterPosition, string> = {
  anfang: "Anfang",
  mitte: "Mitte",
  ende: "Ende",
};

/** 100 grade-1 examples: 34 Anfang, 33 Mitte, 33 Ende. Letter occurs in exactly one zone. */
const RAW: readonly { letter: string; display: string; position: LetterPosition }[] = [
  // —— Anfang (34): letter only as first character ——
  { letter: "a", display: "Apfel", position: "anfang" },
  { letter: "b", display: "Ball", position: "anfang" },
  { letter: "b", display: "Baum", position: "anfang" },
  { letter: "b", display: "Biene", position: "anfang" },
  { letter: "b", display: "Blume", position: "anfang" },
  { letter: "b", display: "Brot", position: "anfang" },
  { letter: "b", display: "Buch", position: "anfang" },
  { letter: "d", display: "Dach", position: "anfang" },
  { letter: "d", display: "Dose", position: "anfang" },
  { letter: "e", display: "Eis", position: "anfang" },
  { letter: "f", display: "Feder", position: "anfang" },
  { letter: "f", display: "Fisch", position: "anfang" },
  { letter: "f", display: "Fuchs", position: "anfang" },
  { letter: "g", display: "Gabel", position: "anfang" },
  { letter: "g", display: "Gras", position: "anfang" },
  { letter: "h", display: "Haus", position: "anfang" },
  { letter: "h", display: "Honig", position: "anfang" },
  { letter: "h", display: "Hund", position: "anfang" },
  { letter: "j", display: "Jacke", position: "anfang" },
  { letter: "k", display: "Katze", position: "anfang" },
  { letter: "k", display: "Kind", position: "anfang" },
  { letter: "k", display: "Kiste", position: "anfang" },
  { letter: "l", display: "Lampe", position: "anfang" },
  { letter: "m", display: "Maus", position: "anfang" },
  { letter: "m", display: "Mond", position: "anfang" },
  { letter: "n", display: "Nase", position: "anfang" },
  { letter: "n", display: "Nuss", position: "anfang" },
  { letter: "o", display: "Ofen", position: "anfang" },
  { letter: "p", display: "Pilz", position: "anfang" },
  { letter: "r", display: "Regen", position: "anfang" },
  { letter: "s", display: "Sand", position: "anfang" },
  { letter: "s", display: "Sonne", position: "anfang" },
  { letter: "t", display: "Tasse", position: "anfang" },
  { letter: "v", display: "Vogel", position: "anfang" },

  // —— Mitte (33): letter only in indices 1..n-2 ——
  { letter: "p", display: "Apfel", position: "mitte" },
  { letter: "a", display: "Ball", position: "mitte" },
  { letter: "a", display: "Baum", position: "mitte" },
  { letter: "i", display: "Biene", position: "mitte" },
  { letter: "l", display: "Blume", position: "mitte" },
  { letter: "r", display: "Brot", position: "mitte" },
  { letter: "u", display: "Buch", position: "mitte" },
  { letter: "c", display: "Decke", position: "mitte" },
  { letter: "d", display: "Feder", position: "mitte" },
  { letter: "i", display: "Fisch", position: "mitte" },
  { letter: "o", display: "Frosch", position: "mitte" },
  { letter: "b", display: "Gabel", position: "mitte" },
  { letter: "a", display: "Hase", position: "mitte" },
  { letter: "n", display: "Honig", position: "mitte" },
  { letter: "s", display: "Hose", position: "mitte" },
  { letter: "u", display: "Hund", position: "mitte" },
  { letter: "c", display: "Jacke", position: "mitte" },
  { letter: "s", display: "Käse", position: "mitte" },
  { letter: "t", display: "Katze", position: "mitte" },
  { letter: "i", display: "Kind", position: "mitte" },
  { letter: "s", display: "Kiste", position: "mitte" },
  { letter: "r", display: "Korb", position: "mitte" },
  { letter: "m", display: "Lampe", position: "mitte" },
  { letter: "u", display: "Maus", position: "mitte" },
  { letter: "l", display: "Milch", position: "mitte" },
  { letter: "o", display: "Mond", position: "mitte" },
  { letter: "a", display: "Nase", position: "mitte" },
  { letter: "f", display: "Ofen", position: "mitte" },
  { letter: "i", display: "Pilz", position: "mitte" },
  { letter: "g", display: "Regen", position: "mitte" },
  { letter: "l", display: "Salat", position: "mitte" },
  { letter: "o", display: "Sonne", position: "mitte" },
  { letter: "g", display: "Vogel", position: "mitte" },

  // —— Ende (33): letter only as last character ——
  { letter: "l", display: "Apfel", position: "ende" },
  { letter: "m", display: "Baum", position: "ende" },
  { letter: "t", display: "Brot", position: "ende" },
  { letter: "h", display: "Buch", position: "ende" },
  { letter: "s", display: "Bus", position: "ende" },
  { letter: "h", display: "Dach", position: "ende" },
  { letter: "e", display: "Dose", position: "ende" },
  { letter: "r", display: "Feder", position: "ende" },
  { letter: "h", display: "Fisch", position: "ende" },
  { letter: "s", display: "Fuchs", position: "ende" },
  { letter: "s", display: "Gans", position: "ende" },
  { letter: "s", display: "Gras", position: "ende" },
  { letter: "n", display: "Hahn", position: "ende" },
  { letter: "s", display: "Hals", position: "ende" },
  { letter: "d", display: "Hand", position: "ende" },
  { letter: "s", display: "Haus", position: "ende" },
  { letter: "d", display: "Hund", position: "ende" },
  { letter: "e", display: "Käse", position: "ende" },
  { letter: "d", display: "Kind", position: "ende" },
  { letter: "b", display: "Korb", position: "ende" },
  { letter: "h", display: "Kuh", position: "ende" },
  { letter: "d", display: "Lied", position: "ende" },
  { letter: "d", display: "Mond", position: "ende" },
  { letter: "d", display: "Mund", position: "ende" },
  { letter: "r", display: "Ohr", position: "ende" },
  { letter: "a", display: "Oma", position: "ende" },
  { letter: "a", display: "Opa", position: "ende" },
  { letter: "d", display: "Rad", position: "ende" },
  { letter: "k", display: "Rock", position: "ende" },
  { letter: "d", display: "Sand", position: "ende" },
  { letter: "l", display: "Seil", position: "ende" },
  { letter: "n", display: "Stern", position: "ende" },
  { letter: "f", display: "Topf", position: "ende" },
];

export const LETTER_POS_ITEMS: readonly LetterPosItem[] = RAW.map((row) => ({
  letter: row.letter.normalize("NFC"),
  display: row.display,
  word: row.display.toLocaleLowerCase("de-DE").normalize("NFC"),
  position: row.position,
}));

/** Zone of every occurrence of `letter` in `word` (exclusive categories). */
export function letterPositionZones(
  letter: string,
  word: string,
): Set<LetterPosition> {
  const L = letter.toLocaleLowerCase("de-DE").normalize("NFC");
  const chars = [...word.toLocaleLowerCase("de-DE").normalize("NFC")];
  const zones = new Set<LetterPosition>();
  const last = chars.length - 1;
  for (let i = 0; i < chars.length; i++) {
    if (chars[i] !== L) continue;
    if (i === 0) zones.add("anfang");
    else if (i === last) zones.add("ende");
    else zones.add("mitte");
  }
  return zones;
}

/** Exclusive zone, or null if missing/ambiguous. */
export function exclusiveLetterPosition(
  letter: string,
  word: string,
): LetterPosition | null {
  const zones = letterPositionZones(letter, word);
  if (zones.size !== 1) return null;
  return [...zones][0]!;
}

export function isLetterPosPuzzle(puzzle: Puzzle): boolean {
  return puzzle.type === "letterPos";
}

export function letterPosHearLabel(_puzzle?: Puzzle): string {
  return "Wort hören";
}

function indexFromRng(rng: () => number, length: number): number {
  if (length <= 0) return 0;
  const r = rng();
  const n = Number.isFinite(r) ? r : 0;
  const u = Math.min(1, Math.max(0, n));
  return Math.min(length - 1, Math.floor(u * length));
}

let lastPickedKey = "";

export function resetLetterPosPick(): void {
  lastPickedKey = "";
}

export function itemKey(item: LetterPosItem): string {
  return `${item.letter}|${item.word}|${item.position}`;
}

export function pickLetterPosItem(
  rng: () => number = Math.random,
  avoidKey: string = lastPickedKey,
): LetterPosItem {
  const pool = avoidKey
    ? LETTER_POS_ITEMS.filter((it) => itemKey(it) !== avoidKey)
    : LETTER_POS_ITEMS;
  const list = pool.length > 0 ? pool : LETTER_POS_ITEMS;
  const picked = list[indexFromRng(rng, list.length)]!;
  lastPickedKey = itemKey(picked);
  return picked;
}

/** Deterministic pick by absolute index into LETTER_POS_ITEMS. */
export function rngForLetterPosIndex(index: number): () => number {
  const len = LETTER_POS_ITEMS.length;
  const i = ((index % len) + len) % len;
  return () => (i + 0.5) / len;
}

/** Fill solution, prompt, voice and show-letter from a random pool item. */
export function realizeLetterPosPuzzle(
  puzzle: Puzzle,
  rng: () => number = Math.random,
): Puzzle {
  if (!isLetterPosPuzzle(puzzle)) return puzzle;
  const item = pickLetterPosItem(rng);
  const upper = item.letter.toLocaleUpperCase("de-DE");
  return {
    ...puzzle,
    solution: item.position,
    voiceText: item.display,
    prompt: `Wo steckt der Buchstabe ${upper}?`,
    letterPosLetter: item.letter,
    letterPosWord: item.word,
  };
}
