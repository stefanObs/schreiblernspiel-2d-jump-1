import type { WorldEffect } from "../../logic/puzzleTypes";
import type { LetterPosition } from "../../logic/letterPositionPuzzle";

export type ChainZone = LetterPosition;

export type ChainRound = {
  /** Lowercase NFC letter. */
  letter: string;
  /** Display glyph (may be uppercase). */
  displayLetter: string;
  /** Lowercase NFC word. */
  word: string;
  /** Spoken / HUD word. */
  displayWord: string;
};

export type KettenhochhausConfig = {
  /** Up to 4 chain rounds (`createSim` trims extras; under-length stays as-is). */
  chains: ChainRound[];
  prompt?: string;
  voiceText?: string;
  effect?: WorldEffect;
};

export type KettenhochhausSimState = {
  chains: ChainRound[];
  /** Index of the active chain (0..length). */
  chainIndex: number;
  lives: number;
  maxLives: number;
  /** Cumulative misses (across restarts) for star rating. */
  wrongAttempts: number;
  won: boolean;
  restartCount: number;
};

export const CHAIN_COUNT = 4;
export const MAX_LIVES = 3;

export const ZONE_LABELS: Record<ChainZone, string> = {
  anfang: "Anfang",
  mitte: "Mitte",
  ende: "Ende",
};
