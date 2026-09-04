/** Progressive writing hints after wrong attempts (Erstklässler scaffolding). */

export type HintStage = "none" | "arcs" | "letters" | "initials";

/** After 2 / 4 / 6 wrong answers. */
export function hintStageFromAttempts(wrongAttempts: number): HintStage {
  if (wrongAttempts >= 6) return "initials";
  if (wrongAttempts >= 4) return "letters";
  if (wrongAttempts >= 2) return "arcs";
  return "none";
}

export function syllableChars(syllables: string[]): string[] {
  return syllables.join("").split("").filter(Boolean);
}

export function syllableInitials(syllables: string[]): string[] {
  return syllables.map((s) => s.charAt(0)).filter(Boolean);
}

/** Deterministic shuffle so the letter order stays stable for a session. */
export function scrambleLetters(chars: string[], seed: number): string[] {
  const out = [...chars];
  let s = seed >>> 0 || 1;
  for (let i = out.length - 1; i > 0; i--) {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    const j = s % (i + 1);
    const tmp = out[i]!;
    out[i] = out[j]!;
    out[j] = tmp;
  }
  return out;
}
