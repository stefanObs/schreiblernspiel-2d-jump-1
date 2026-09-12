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

/** 100 grade-1 examples with word art: 34 Anfang, 33 Mitte, 33 Ende. Letter occurs in exactly one zone. */
const RAW: readonly { letter: string; display: string; position: LetterPosition }[] = [
  // —— Anfang (34) ——
  { letter: "i", display: "Insel", position: "anfang" },
  { letter: "a", display: "Affe", position: "anfang" },
  { letter: "o", display: "Ofen", position: "anfang" },
  { letter: "u", display: "Unfall", position: "anfang" },
  { letter: "b", display: "Biene", position: "anfang" },
  { letter: "ä", display: "Äpfel", position: "anfang" },
  { letter: "ö", display: "Öl", position: "anfang" },
  { letter: "r", display: "Rose", position: "anfang" },
  { letter: "l", display: "Lampe", position: "anfang" },
  { letter: "n", display: "Nase", position: "anfang" },
  { letter: "m", display: "Mantel", position: "anfang" },
  { letter: "h", display: "Hose", position: "anfang" },
  { letter: "j", display: "Jacke", position: "anfang" },
  { letter: "s", display: "Sonne", position: "anfang" },
  { letter: "s", display: "Schuhe", position: "anfang" },
  { letter: "f", display: "Feder", position: "anfang" },
  { letter: "w", display: "Wolke", position: "anfang" },
  { letter: "z", display: "Ziege", position: "anfang" },
  { letter: "d", display: "Dose", position: "anfang" },
  { letter: "t", display: "Tasse", position: "anfang" },
  { letter: "b", display: "Besen", position: "anfang" },
  { letter: "p", display: "Pinsel", position: "anfang" },
  { letter: "g", display: "Gabel", position: "anfang" },
  { letter: "k", display: "Kerze", position: "anfang" },
  { letter: "z", display: "Zange", position: "anfang" },
  { letter: "d", display: "Dach", position: "anfang" },
  { letter: "e", display: "Ei", position: "anfang" },
  { letter: "a", display: "Auge", position: "anfang" },
  { letter: "h", display: "Haus", position: "anfang" },
  { letter: "s", display: "Seil", position: "anfang" },
  { letter: "b", display: "Baum", position: "anfang" },
  { letter: "b", display: "Brücke", position: "anfang" },
  { letter: "h", display: "Hund", position: "anfang" },
  { letter: "f", display: "Fisch", position: "anfang" },
  // —— Mitte (33) ——
  { letter: "n", display: "Insel", position: "mitte" },
  { letter: "s", display: "Esel", position: "mitte" },
  { letter: "f", display: "Affe", position: "mitte" },
  { letter: "f", display: "Ofen", position: "mitte" },
  { letter: "n", display: "Unfall", position: "mitte" },
  { letter: "i", display: "Biene", position: "mitte" },
  { letter: "p", display: "Äpfel", position: "mitte" },
  { letter: "o", display: "Rose", position: "mitte" },
  { letter: "a", display: "Lampe", position: "mitte" },
  { letter: "a", display: "Nase", position: "mitte" },
  { letter: "a", display: "Mantel", position: "mitte" },
  { letter: "o", display: "Hose", position: "mitte" },
  { letter: "a", display: "Jacke", position: "mitte" },
  { letter: "o", display: "Sonne", position: "mitte" },
  { letter: "c", display: "Schuhe", position: "mitte" },
  { letter: "e", display: "Feder", position: "mitte" },
  { letter: "o", display: "Wolke", position: "mitte" },
  { letter: "i", display: "Ziege", position: "mitte" },
  { letter: "o", display: "Dose", position: "mitte" },
  { letter: "a", display: "Tasse", position: "mitte" },
  { letter: "e", display: "Besen", position: "mitte" },
  { letter: "i", display: "Pinsel", position: "mitte" },
  { letter: "a", display: "Gabel", position: "mitte" },
  { letter: "r", display: "Kerze", position: "mitte" },
  { letter: "a", display: "Zange", position: "mitte" },
  { letter: "a", display: "Dach", position: "mitte" },
  { letter: "u", display: "Eule", position: "mitte" },
  { letter: "u", display: "Auge", position: "mitte" },
  { letter: "a", display: "Haus", position: "mitte" },
  { letter: "e", display: "Seil", position: "mitte" },
  { letter: "a", display: "Baum", position: "mitte" },
  { letter: "r", display: "Brücke", position: "mitte" },
  { letter: "u", display: "Hund", position: "mitte" },
  // —— Ende (33) ——
  { letter: "l", display: "Insel", position: "ende" },
  { letter: "l", display: "Esel", position: "ende" },
  { letter: "e", display: "Affe", position: "ende" },
  { letter: "n", display: "Ofen", position: "ende" },
  { letter: "l", display: "Äpfel", position: "ende" },
  { letter: "l", display: "Öl", position: "ende" },
  { letter: "e", display: "Rose", position: "ende" },
  { letter: "e", display: "Lampe", position: "ende" },
  { letter: "e", display: "Nase", position: "ende" },
  { letter: "l", display: "Mantel", position: "ende" },
  { letter: "e", display: "Hose", position: "ende" },
  { letter: "e", display: "Jacke", position: "ende" },
  { letter: "e", display: "Sonne", position: "ende" },
  { letter: "e", display: "Schuhe", position: "ende" },
  { letter: "r", display: "Feder", position: "ende" },
  { letter: "e", display: "Wolke", position: "ende" },
  { letter: "e", display: "Dose", position: "ende" },
  { letter: "e", display: "Tasse", position: "ende" },
  { letter: "n", display: "Besen", position: "ende" },
  { letter: "l", display: "Pinsel", position: "ende" },
  { letter: "l", display: "Gabel", position: "ende" },
  { letter: "e", display: "Zange", position: "ende" },
  { letter: "h", display: "Dach", position: "ende" },
  { letter: "i", display: "Ei", position: "ende" },
  { letter: "e", display: "Auge", position: "ende" },
  { letter: "s", display: "Haus", position: "ende" },
  { letter: "l", display: "Seil", position: "ende" },
  { letter: "m", display: "Baum", position: "ende" },
  { letter: "e", display: "Brücke", position: "ende" },
  { letter: "d", display: "Hund", position: "ende" },
  { letter: "h", display: "Fisch", position: "ende" },
  { letter: "f", display: "Topf", position: "ende" },
  { letter: "d", display: "Rad", position: "ende" },
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

/** How many words must be solved per letterPos station open. */
export const LETTER_POS_ROUNDS = 3;

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
  const avoid = new Set(avoidKey ? [avoidKey] : []);
  return pickLetterPosItems(1, rng, avoid)[0]!;
}

/** Pick `count` distinct pool items (by itemKey). Updates last-picked to the final item. */
export function pickLetterPosItems(
  count: number = LETTER_POS_ROUNDS,
  rng: () => number = Math.random,
  avoidKeys: ReadonlySet<string> = lastPickedKey ? new Set([lastPickedKey]) : new Set(),
): LetterPosItem[] {
  const n = Math.max(1, Math.min(count, LETTER_POS_ITEMS.length));
  const picked: LetterPosItem[] = [];
  const used = new Set(avoidKeys);
  for (let i = 0; i < n; i++) {
    const pool = LETTER_POS_ITEMS.filter((it) => !used.has(itemKey(it)));
    const list = pool.length > 0 ? pool : LETTER_POS_ITEMS;
    const item = list[indexFromRng(rng, list.length)]!;
    picked.push(item);
    used.add(itemKey(item));
  }
  lastPickedKey = itemKey(picked[picked.length - 1]!);
  return picked;
}

/** Deterministic pick by absolute index into LETTER_POS_ITEMS. */
export function rngForLetterPosIndex(index: number): () => number {
  const len = LETTER_POS_ITEMS.length;
  const i = ((index % len) + len) % len;
  return () => (i + 0.5) / len;
}

/** Apply one pool item onto puzzle fields used by UI/match. */
export function applyLetterPosItem(puzzle: Puzzle, item: LetterPosItem): Puzzle {
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

export function letterPosProgressLabel(roundIndex: number, total: number = LETTER_POS_ROUNDS): string {
  const n = Math.min(total, Math.max(1, roundIndex + 1));
  return `Wort ${n} von ${total}`;
}

/** Fill first of three round items; UI advances through the rest. */
export function realizeLetterPosPuzzle(
  puzzle: Puzzle,
  rng: () => number = Math.random,
): Puzzle {
  if (!isLetterPosPuzzle(puzzle)) return puzzle;
  return startLetterPosSession(puzzle, rng).puzzle;
}

/** Start a multi-word letterPos session (rounds for the UI). */
export function startLetterPosSession(
  puzzle: Puzzle,
  rng: () => number = Math.random,
): { puzzle: Puzzle; rounds: LetterPosItem[] } {
  if (!isLetterPosPuzzle(puzzle)) return { puzzle, rounds: [] };
  const rounds = pickLetterPosItems(LETTER_POS_ROUNDS, rng);
  return { puzzle: applyLetterPosItem(puzzle, rounds[0]!), rounds };
}
