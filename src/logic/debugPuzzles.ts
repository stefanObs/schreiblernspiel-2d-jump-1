import { freeTransformPuzzle } from "./puzzleStore";
import type { Puzzle } from "./puzzleTypes";
import { TRACE_LABELS, isTraceTemplate } from "./traceTemplates";

export const DEBUG_OPEN_PUZZLE_EVENT = "schreiblern:debug-open-puzzle";

export type DebugOpenPuzzleDetail = { puzzleId: string };

export type DebugPuzzleOption = {
  id: string;
  label: string;
};

export type DebugPuzzleGroups = {
  puzzles: DebugPuzzleOption[];
  zeichnen: DebugPuzzleOption[];
  transforms: DebugPuzzleOption[];
  minigames: DebugPuzzleOption[];
};

const TYPE_LABEL: Record<string, string> = {
  word: "Wort",
  math: "Mathe",
  transform: "Transform",
  trace: "Zeichnen",
  ballkanone: "Ballkanone",
  buchstabenstrasse: "Buchstabenstraße",
  kettenhochhaus: "Kettenhochhaus",
  letterPos: "Position",
  letterPick: "Bildwahl",
};

const MINIGAME_TYPES = new Set<Puzzle["type"]>([
  "ballkanone",
  "buchstabenstrasse",
  "kettenhochhaus",
]);

export function isTransformDebugPuzzle(p: Puzzle): boolean {
  return p.type === "transform" || p.effect.startsWith("transform_");
}

export function isMinigameDebugPuzzle(p: Puzzle): boolean {
  return MINIGAME_TYPES.has(p.type);
}

export function isZeichnenDebugPuzzle(p: Puzzle): boolean {
  return p.type === "trace";
}

function optionLabel(p: Puzzle): string {
  const kind = TYPE_LABEL[p.type] ?? p.type;
  if (p.type === "trace" && p.traceTemplate && isTraceTemplate(p.traceTemplate)) {
    return `${kind} · ${TRACE_LABELS[p.traceTemplate]}`;
  }
  const prompt = p.prompt.trim() || p.id;
  const short = prompt.length > 42 ? `${prompt.slice(0, 40)}…` : prompt;
  return `${kind} · ${short}`;
}

function toOption(p: Puzzle): DebugPuzzleOption {
  return { id: p.id, label: optionLabel(p) };
}

/** Stable options for the F1 debug puzzle picker (flat list, all puzzles). */
export function debugPuzzleOptions(puzzles: readonly Puzzle[]): DebugPuzzleOption[] {
  return puzzles.map(toOption);
}

/** Split level puzzles into Rätsel / Zeichnen / Transformieren / Minispiele for the F1 bar. */
export function debugPuzzleGroups(puzzles: readonly Puzzle[]): DebugPuzzleGroups {
  const puzzlesOut: DebugPuzzleOption[] = [];
  const zeichnen: DebugPuzzleOption[] = [];
  const transforms: DebugPuzzleOption[] = [];
  const minigames: DebugPuzzleOption[] = [];

  for (const p of puzzles) {
    if (isMinigameDebugPuzzle(p)) minigames.push(toOption(p));
    else if (isTransformDebugPuzzle(p)) transforms.push(toOption(p));
    else if (isZeichnenDebugPuzzle(p)) zeichnen.push(toOption(p));
    else puzzlesOut.push(toOption(p));
  }

  const free = freeTransformPuzzle();
  if (!transforms.some((o) => o.id === free.id)) {
    transforms.unshift({ id: free.id, label: `Frei · ${free.prompt.trim() || free.id}` });
  }

  return { puzzles: puzzlesOut, zeichnen, transforms, minigames };
}

export function dispatchDebugOpenPuzzle(puzzleId: string): void {
  window.dispatchEvent(
    new CustomEvent<DebugOpenPuzzleDetail>(DEBUG_OPEN_PUZZLE_EVENT, {
      detail: { puzzleId },
    }),
  );
}
