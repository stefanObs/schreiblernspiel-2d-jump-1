import type { Puzzle } from "./puzzleTypes";

export const DEBUG_OPEN_PUZZLE_EVENT = "schreiblern:debug-open-puzzle";

export type DebugOpenPuzzleDetail = { puzzleId: string };

export type DebugPuzzleOption = {
  id: string;
  label: string;
};

const TYPE_LABEL: Record<string, string> = {
  word: "Wort",
  math: "Mathe",
  transform: "Transform",
  trace: "Zeichnen",
  ballkanone: "Ballkanone",
  letterPos: "Position",
};

/** Stable options for the F1 debug puzzle picker. */
export function debugPuzzleOptions(puzzles: readonly Puzzle[]): DebugPuzzleOption[] {
  return puzzles.map((p) => {
    const kind = TYPE_LABEL[p.type] ?? p.type;
    const prompt = p.prompt.trim() || p.id;
    const short = prompt.length > 42 ? `${prompt.slice(0, 40)}…` : prompt;
    return { id: p.id, label: `${kind} · ${short}` };
  });
}

export function dispatchDebugOpenPuzzle(puzzleId: string): void {
  window.dispatchEvent(
    new CustomEvent<DebugOpenPuzzleDetail>(DEBUG_OPEN_PUZZLE_EVENT, {
      detail: { puzzleId },
    }),
  );
}
