import type { WorldEffect, Puzzle } from "../../logic/puzzleTypes";
import type { CharacterId } from "../../logic/playerRules";
import type { SpeakFn } from "../../logic/speech";
import type { LetterPosition } from "../../logic/letterPositionPuzzle";

export type Lane = 0 | 1 | 2;

export type FliegerPhase =
  | "radar_prompt"
  | "radar_wave"
  | "lane_prompt"
  | "armor_wave"
  | "won";

export type EnemyKind = "bird" | "armor";

export type ActiveEnemy = {
  id: string;
  letter: string;
  normalized: string;
  lane: Lane;
  /** True if letter appears in the target word. */
  membership: boolean;
  kind: EnemyKind;
  /** 0 = far (right), 1 = at plane. */
  progress: number;
};

export type BuchstabenfliegerConfig = {
  word: string;
  displayWord?: string;
  /** Letter asked in the radar (Ja/Nein membership) prompt. */
  radarLetter: string;
  /** Correct answer for radar: letter is in the word. */
  radarInWord: boolean;
  /** Letter for lane/position booster (exclusive zone). */
  positionLetter: string;
  positionZone: LetterPosition;
  distractors?: string[];
  /** Membership hits needed to clear radar wave. */
  hitsNeeded?: number;
  approachSeconds?: number;
  prompt?: string;
  voiceText?: string;
  effect?: WorldEffect;
};

export type BuchstabenfliegerSimState = {
  wordChars: string[];
  displayChars: string[];
  displayWord: string;
  radarLetter: string;
  radarLetterDisplay: string;
  radarInWord: boolean;
  positionLetter: string;
  positionLetterDisplay: string;
  positionZone: LetterPosition;
  distractors: string[];
  hitsNeeded: number;
  hitsDone: number;
  planeLane: Lane;
  active: ActiveEnemy | null;
  phase: FliegerPhase;
  wrongAttempts: number;
  won: boolean;
  approachSeconds: number;
  enemySeq: number;
};

export type BuchstabenfliegerHandlers = {
  onSolved: (puzzle: Puzzle, stars: number) => void;
  speak?: SpeakFn;
  character: CharacterId;
};

export const LANE_TO_ZONE: Record<Lane, LetterPosition> = {
  0: "anfang",
  1: "mitte",
  2: "ende",
};

export const ZONE_TO_LANE: Record<LetterPosition, Lane> = {
  anfang: 0,
  mitte: 1,
  ende: 2,
};
