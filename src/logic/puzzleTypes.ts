import type { TraceTemplate } from "./traceTemplates";

export type HintMode = "hear" | "motif";
export type PuzzleType =
  | "word"
  | "math"
  | "transform"
  | "trace"
  | "ballkanone"
  | "buchstabenstrasse"
  | "kettenhochhaus"
  | "letterPos"
  | "letterPick";
export type LetterPickOption = {
  id: string;
  display: string;
  artPath: string;
  voiceText: string;
};
export type MathSubtype = "plus" | "minus" | "compare" | "countdown";
/** Repeat the same character 3× large + 3× small (letter and/or digit). */
export type RepeatKind = "digit" | "letter-or-digit";
export type BallkanoneVariant = "static" | "track" | "peek";
export type WorldEffect =
  | "spawn_bridge"
  | "spawn_lake_bridge"
  | "spawn_rope"
  | "spawn_ladder"
  | "spawn_platform"
  | "transform_mech"
  | "transform_auto"
  | "transform_bolt"
  | "transform_marina"
  | "transform_rush"
  | "none";

export type TransformOption = {
  answer: string;
  effect: WorldEffect;
  motifId: string;
};

export type Puzzle = {
  id: string;
  type: PuzzleType;
  hintMode: HintMode;
  solution: string;
  voiceText: string;
  motifId?: string;
  effect: WorldEffect;
  prompt: string;
  mathSubtype?: MathSubtype;
  compareLeft?: number;
  compareRight?: number;
  countdownFrom?: number;
  plusA?: number;
  plusB?: number;
  /** Silhouette for Nachzeichnen (see TRACE_TEMPLATES). */
  traceTemplate?: TraceTemplate;
  anlautVisible?: boolean;
  /** Display syllables for Silbenbogen hints (e.g. ["Brü","cke"]). */
  syllables?: string[];
  /** Free / multi-target transform: any listed answer is accepted. */
  transformOptions?: TransformOption[];
  /** Ballkanone minigame variant (default static). */
  ballkanoneVariant?: BallkanoneVariant;
  /** Extra wrong letters for ballkanone targets. */
  ballkanoneDistractors?: string[];
  /** Extra wrong letters for buchstabenstrasse spawn pool. */
  buchstabenstrasseDistractors?: string[];
  /** Random 3× large + 3× small of one letter or digit. */
  repeatKind?: RepeatKind;
  /** Shown letter for letterPos puzzles (lowercase). */
  letterPosLetter?: string;
  /** Spoken word (lowercase) for letterPos puzzles. */
  letterPosWord?: string;
  /** Shown letter for letterPick puzzles (lowercase a–z). */
  letterPickLetter?: string;
  /** Five image options for letterPick (after realize). */
  letterPickOptions?: LetterPickOption[];
  levelId: string;
};

export type Point = { x: number; y: number };
