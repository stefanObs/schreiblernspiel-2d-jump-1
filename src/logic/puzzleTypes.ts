export type HintMode = "hear" | "motif";
export type PuzzleType = "word" | "math" | "transform" | "trace";
export type MathSubtype = "plus" | "compare" | "countdown";
export type WorldEffect =
  | "spawn_bridge"
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
  traceTemplate?: "bridge" | "ladder";
  anlautVisible?: boolean;
  /** Display syllables for Silbenbogen hints (e.g. ["Brü","cke"]). */
  syllables?: string[];
  /** Free / multi-target transform: any listed answer is accepted. */
  transformOptions?: TransformOption[];
  levelId: string;
};

export type Point = { x: number; y: number };
