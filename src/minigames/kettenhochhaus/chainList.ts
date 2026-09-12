import {
  applyLetterPosItem,
  itemKey,
  pickLetterPosItems,
  type LetterPosItem,
} from "../../logic/letterPositionPuzzle";
import type { Puzzle } from "../../logic/puzzleTypes";
import { CHAIN_COUNT, type ChainRound } from "./types";

export function chainFromLetterPosItem(item: LetterPosItem): ChainRound {
  const upper = item.letter.toLocaleUpperCase("de-DE");
  return {
    letter: item.letter,
    displayLetter: upper,
    word: item.word,
    displayWord: item.display,
  };
}

export function pickChainRounds(
  count: number = CHAIN_COUNT,
  rng: () => number = Math.random,
): ChainRound[] {
  return pickLetterPosItems(count, rng).map(chainFromLetterPosItem);
}

/** Apply first chain onto puzzle fields used by HUD / speech. */
export function applyKettenhochhausRound(puzzle: Puzzle, chain: ChainRound): Puzzle {
  return applyLetterPosItem(puzzle, {
    letter: chain.letter,
    word: chain.word,
    display: chain.displayWord,
    position: "mitte", // placeholder; matching uses acceptedZonesFor
  });
}

export function realizeKettenhochhausPuzzle(
  puzzle: Puzzle,
  rng: () => number = Math.random,
): { puzzle: Puzzle; chains: ChainRound[] } {
  const chains = pickChainRounds(CHAIN_COUNT, rng);
  const first = chains[0]!;
  return {
    puzzle: {
      ...puzzle,
      solution: first.word,
      voiceText: first.displayWord,
      prompt:
        puzzle.prompt ||
        `Wo steckt der Buchstabe ${first.displayLetter}? Schlage die Ketten durch.`,
      letterPosLetter: first.letter,
      letterPosWord: first.word,
    },
    chains,
  };
}

export function chainRoundKey(chain: ChainRound): string {
  return itemKey({
    letter: chain.letter,
    word: chain.word,
    display: chain.displayWord,
    position: "mitte",
  });
}
