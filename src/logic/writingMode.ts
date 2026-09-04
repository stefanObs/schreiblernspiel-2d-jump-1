/** Global writing support modes (Konzept 3.4 / 3.5). */

export type WritingMode = "learn" | "practice" | "free";

export const WRITING_MODES: WritingMode[] = ["learn", "practice", "free"];

export const WRITING_MODE_LABELS: Record<WritingMode, string> = {
  learn: "Buchstaben lernen",
  practice: "Schreibtabelle üben",
  free: "Freies Schreiben",
};

export const DEFAULT_WRITING_MODE: WritingMode = "learn";

/** After this many wrong attempts in practice mode, show the solution. */
export const PRACTICE_REVEAL_AFTER = 4;

export const WRITING_MODE_STORAGE_KEY = "schreiblernspiel.writingMode";

export type WritingModeUi = {
  showAnlaut: boolean;
  /** Filled letter boxes to copy from (learn, or practice after reveal). */
  showCopyBoxes: boolean;
  /** Progressive Silbenbogen / scrambled letters after wrongs. */
  showProgressiveHints: boolean;
  /** Wrong-attempt count at which practice reveals the full solution. */
  revealSolutionAfterAttempts: number | null;
};

export function isWritingMode(value: unknown): value is WritingMode {
  return value === "learn" || value === "practice" || value === "free";
}

export function parseWritingMode(raw: string | null | undefined): WritingMode {
  if (isWritingMode(raw)) return raw;
  return DEFAULT_WRITING_MODE;
}

export function loadWritingMode(storage: Storage | null = defaultStorage()): WritingMode {
  if (!storage) return DEFAULT_WRITING_MODE;
  try {
    return parseWritingMode(storage.getItem(WRITING_MODE_STORAGE_KEY));
  } catch {
    return DEFAULT_WRITING_MODE;
  }
}

export function saveWritingMode(
  mode: WritingMode,
  storage: Storage | null = defaultStorage(),
): void {
  if (!storage) return;
  try {
    storage.setItem(WRITING_MODE_STORAGE_KEY, mode);
  } catch {
    /* private mode / quota */
  }
}

export function writingModeUi(mode: WritingMode): WritingModeUi {
  switch (mode) {
    case "learn":
      return {
        showAnlaut: true,
        showCopyBoxes: true,
        showProgressiveHints: false,
        revealSolutionAfterAttempts: null,
      };
    case "practice":
      return {
        showAnlaut: true,
        showCopyBoxes: false,
        showProgressiveHints: true,
        revealSolutionAfterAttempts: PRACTICE_REVEAL_AFTER,
      };
    case "free":
      return {
        showAnlaut: false,
        showCopyBoxes: false,
        showProgressiveHints: false,
        revealSolutionAfterAttempts: null,
      };
  }
}

/** Whether practice should reveal the solution after `wrongAttempts`. */
export function shouldRevealSolution(
  mode: WritingMode,
  wrongAttempts: number,
): boolean {
  const after = writingModeUi(mode).revealSolutionAfterAttempts;
  return after != null && wrongAttempts >= after;
}

/** Effective UI flags for the current attempt count. */
export function effectiveWritingUi(
  mode: WritingMode,
  wrongAttempts: number,
): WritingModeUi {
  const base = writingModeUi(mode);
  if (mode === "practice" && shouldRevealSolution(mode, wrongAttempts)) {
    return { ...base, showCopyBoxes: true, showProgressiveHints: false };
  }
  return base;
}

/** Modes affect word/transform text puzzles; math/trace keep prior anlaut rules. */
export function modeAppliesToPuzzleType(type: string): boolean {
  return type === "word" || type === "transform";
}

function defaultStorage(): Storage | null {
  try {
    return typeof localStorage !== "undefined" ? localStorage : null;
  } catch {
    return null;
  }
}

/** Session debug state (F1). Not persisted. */
let debugEnabled = false;
/** Session override while debugging; does not write Settings. */
let sessionOverride: WritingMode | null = null;

export function isDebugMode(): boolean {
  return debugEnabled;
}

export function setDebugMode(on: boolean): void {
  debugEnabled = on;
  if (!on) sessionOverride = null;
}

export function toggleDebugMode(): boolean {
  setDebugMode(!debugEnabled);
  return debugEnabled;
}

export function getSessionWritingModeOverride(): WritingMode | null {
  return sessionOverride;
}

export function setSessionWritingModeOverride(mode: WritingMode | null): void {
  sessionOverride = mode;
}

/** Saved settings mode, or debug session override when debug is on. */
export function getEffectiveWritingMode(
  storage: Storage | null = defaultStorage(),
): WritingMode {
  if (debugEnabled && sessionOverride) return sessionOverride;
  return loadWritingMode(storage);
}
