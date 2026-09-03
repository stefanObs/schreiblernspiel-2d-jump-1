import type { Puzzle } from "./puzzleTypes";

const KEY = "schreiblern-puzzles-v1";

export function builtinPuzzles(): Puzzle[] {
  return [
    {
      id: "bach-bruecke-hear",
      type: "word",
      hintMode: "hear",
      solution: "brücke",
      voiceText: "Brücke",
      motifId: "bridge",
      effect: "spawn_bridge",
      prompt: "Schreib das Wort.",
      anlautVisible: true,
      levelId: "bachbruecke",
    },
    {
      id: "bach-seil-motif",
      type: "word",
      hintMode: "motif",
      solution: "seil",
      voiceText: "Seil",
      motifId: "rope",
      effect: "spawn_rope",
      prompt: "Was siehst du?",
      anlautVisible: true,
      levelId: "bachbruecke",
    },
    {
      id: "bach-auto",
      type: "transform",
      hintMode: "hear",
      solution: "auto",
      voiceText: "Auto",
      effect: "transform_auto",
      prompt: "Werde zum Fahrzeug.",
      anlautVisible: true,
      levelId: "bachbruecke",
    },
    {
      id: "bach-mech",
      type: "transform",
      hintMode: "motif",
      solution: "mech",
      voiceText: "Mech",
      motifId: "mech",
      effect: "transform_mech",
      prompt: "Werde wieder zum Mech.",
      anlautVisible: true,
      levelId: "bachbruecke",
    },
    {
      id: "bach-plus",
      type: "math",
      hintMode: "motif",
      solution: "3",
      voiceText: "",
      effect: "spawn_platform",
      prompt: "2 + 1 = ?",
      mathSubtype: "plus",
      plusA: 2,
      plusB: 1,
      anlautVisible: false,
      levelId: "bachbruecke",
    },
    {
      id: "bach-compare",
      type: "math",
      hintMode: "motif",
      solution: ">",
      voiceText: "",
      effect: "spawn_ladder",
      prompt: "4 □ 7  (schreib > oder die größere Zahl)",
      mathSubtype: "compare",
      compareLeft: 4,
      compareRight: 7,
      anlautVisible: false,
      levelId: "bachbruecke",
    },
    {
      id: "bach-trace-bridge",
      type: "trace",
      hintMode: "motif",
      solution: "",
      voiceText: "",
      effect: "spawn_bridge",
      prompt: "Zeichne die Brücke nach.",
      traceTemplate: "bridge",
      anlautVisible: false,
      levelId: "bachbruecke",
    },
  ];
}

export function loadOverrides(): Puzzle[] {
  if (typeof localStorage === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Puzzle[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveOverrides(puzzles: Puzzle[]): void {
  localStorage.setItem(KEY, JSON.stringify(puzzles));
}

export function mergedPuzzles(): Puzzle[] {
  const over = loadOverrides();
  const byId = new Map(builtinPuzzles().map((p) => [p.id, p]));
  for (const p of over) byId.set(p.id, p);
  return [...byId.values()].filter((p) => p.levelId === "bachbruecke");
}

export function exportPuzzlesJson(puzzles: Puzzle[]): string {
  return JSON.stringify(puzzles, null, 2);
}

export function parsePuzzlesJson(raw: string): Puzzle[] {
  const parsed = JSON.parse(raw) as Puzzle[];
  if (!Array.isArray(parsed)) throw new Error("Kein Array");
  return parsed;
}
