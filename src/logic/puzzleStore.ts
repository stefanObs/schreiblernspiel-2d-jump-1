import type { Puzzle, TransformOption } from "./puzzleTypes";

const KEY = "schreiblern-puzzles-v1";

const FREE_TRANSFORM_OPTIONS: TransformOption[] = [
  { answer: "bolt", effect: "transform_bolt", motifId: "bolt" },
  { answer: "marina", effect: "transform_marina", motifId: "marina" },
  { answer: "rush", effect: "transform_rush", motifId: "rush" },
  { answer: "auto", effect: "transform_auto", motifId: "auto" },
  { answer: "mech", effect: "transform_mech", motifId: "mech" },
];

/** HUD „Transformieren“ — Namen der Mechs oder Auto/Mech, nur Bilder. */
export function freeTransformPuzzle(): Puzzle {
  return {
    id: "free-transform",
    type: "transform",
    hintMode: "motif",
    solution: "",
    voiceText: "",
    transformOptions: FREE_TRANSFORM_OPTIONS,
    effect: "none",
    prompt: "Schreib Bolt, Marina, Rush, Auto oder Mech.",
    anlautVisible: true,
    levelId: "bachbruecke",
  };
}

export function builtinPuzzles(): Puzzle[] {
  return [
    {
      id: "bach-bruecke-hear",
      type: "word",
      hintMode: "hear",
      solution: "brücke",
      voiceText: "Brücke",
      syllables: ["Brü", "cke"],
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
      syllables: ["Seil"],
      motifId: "rope",
      effect: "spawn_rope",
      prompt: "Was siehst du?",
      anlautVisible: true,
      levelId: "bachbruecke",
    },
    {
      id: "bach-bolt-name",
      type: "word",
      hintMode: "hear",
      solution: "bolt",
      voiceText: "Bolt",
      syllables: ["Bolt"],
      motifId: "bolt",
      effect: "transform_bolt",
      prompt: "Schreib den Namen des gelben Mechs.",
      anlautVisible: true,
      levelId: "bachbruecke",
    },
    {
      id: "bach-marina-name",
      type: "word",
      hintMode: "hear",
      solution: "marina",
      voiceText: "Marina",
      syllables: ["Ma", "ri", "na"],
      motifId: "marina",
      effect: "transform_marina",
      prompt: "Schreib den Namen des türkisen Mechs.",
      anlautVisible: true,
      levelId: "bachbruecke",
    },
    {
      id: "bach-rush-name",
      type: "word",
      hintMode: "hear",
      solution: "rush",
      voiceText: "Rush",
      syllables: ["Rush"],
      motifId: "rush",
      effect: "transform_rush",
      prompt: "Schreib den Namen des roten Mechs.",
      anlautVisible: true,
      levelId: "bachbruecke",
    },
    {
      id: "bach-transform-marina",
      type: "transform",
      hintMode: "motif",
      solution: "marina",
      voiceText: "Marina",
      syllables: ["Ma", "ri", "na"],
      motifId: "marina",
      effect: "transform_marina",
      prompt: "Verwandle dich in diesen Mech.",
      anlautVisible: true,
      levelId: "bachbruecke",
    },
    {
      id: "bach-transform-rush",
      type: "transform",
      hintMode: "motif",
      solution: "rush",
      voiceText: "Rush",
      syllables: ["Rush"],
      motifId: "rush",
      effect: "transform_rush",
      prompt: "Verwandle dich in diesen Mech.",
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
      prompt: "Addieren",
      mathSubtype: "plus",
      plusA: 2,
      plusB: 1,
      anlautVisible: false,
      levelId: "bachbruecke",
    },
    {
      id: "bach-minus",
      type: "math",
      hintMode: "motif",
      solution: "1",
      voiceText: "",
      effect: "spawn_platform",
      prompt: "Minus",
      mathSubtype: "minus",
      plusA: 3,
      plusB: 2,
      anlautVisible: false,
      levelId: "bachbruecke",
    },
    {
      id: "bach-repeat-digit",
      type: "word",
      hintMode: "hear",
      solution: "",
      voiceText: "",
      effect: "none",
      prompt: "Schreib den Buchstaben oder die Zahl dreimal groß und dreimal klein.",
      repeatKind: "letter-or-digit",
      anlautVisible: true,
      levelId: "bachbruecke",
    },
    {
      id: "bach-letter-pos",
      type: "letterPos",
      hintMode: "hear",
      solution: "",
      voiceText: "",
      effect: "spawn_platform",
      prompt: "Wo steckt der Buchstabe?",
      anlautVisible: false,
      levelId: "bachbruecke",
    },
    {
      id: "bach-letter-pick",
      type: "letterPick",
      hintMode: "hear",
      solution: "",
      voiceText: "",
      effect: "spawn_platform",
      prompt: "Welches Wort hat den Buchstaben?",
      anlautVisible: false,
      levelId: "bachbruecke",
    },
    {
      id: "bach-compare",
      type: "math",
      hintMode: "motif",
      solution: "<",
      voiceText: "",
      effect: "spawn_ladder",
      prompt: "Zahlen in Relation zueinander",
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
    {
      id: "bach-ballkanone-ball",
      type: "ballkanone",
      hintMode: "hear",
      solution: "ball",
      voiceText: "Ball",
      syllables: ["Ball"],
      effect: "spawn_platform",
      prompt: "Schieße die Buchstaben für BALL ab.",
      ballkanoneVariant: "static",
      ballkanoneDistractors: ["k", "n", "m", "t"],
      anlautVisible: false,
      levelId: "bachbruecke",
    },
    {
      id: "bach-ballkanone-kanone",
      type: "ballkanone",
      hintMode: "hear",
      solution: "kanone",
      voiceText: "Kanone",
      syllables: ["Ka", "no", "ne"],
      effect: "spawn_ladder",
      prompt: "Schieße die Buchstaben für KANONE ab.",
      ballkanoneVariant: "static",
      ballkanoneDistractors: ["b", "r", "m", "s", "t"],
      anlautVisible: false,
      levelId: "bachbruecke",
    },
    {
      id: "bach-buchstabenstrasse-ball",
      type: "buchstabenstrasse",
      hintMode: "hear",
      solution: "ball",
      voiceText: "Ball",
      syllables: ["Ball"],
      effect: "spawn_platform",
      prompt: "Sammle die Buchstaben für Ball.",
      buchstabenstrasseDistractors: ["k", "n", "m", "t"],
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
