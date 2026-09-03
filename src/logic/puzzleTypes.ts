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
  | "none";

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
  levelId: string;
};

export type Point = { x: number; y: number };
