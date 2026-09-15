import { normalizeAnswer } from "../../logic/normalizeAnswer";
import type { LetterPosition } from "../../logic/letterPositionPuzzle";
import {
  LANE_TO_ZONE,
  ZONE_TO_LANE,
  type ActiveEnemy,
  type BuchstabenfliegerConfig,
  type BuchstabenfliegerSimState,
  type Lane,
} from "./types";

export const DEFAULT_APPROACH_SECONDS = 5;
export const DEFAULT_HITS_NEEDED = 3;
export const LANES: Lane[] = [0, 1, 2];

export type Rng = () => number;

function splitWord(word: string): string[] {
  return [...word.trim().toLowerCase().normalize("NFC")];
}

function displayChars(word: string): string[] {
  return [...word.normalize("NFC")];
}

function alignDisplayChars(wordChars: string[], displayWord: string): string[] {
  const display = displayChars(displayWord);
  const wordJoined = wordChars.join("");
  if (display.length === wordChars.length) {
    const displayLower = display.map((c) => c.toLocaleLowerCase("de-DE")).join("");
    if (displayLower === wordJoined && display.join("") === wordJoined) {
      return wordChars.map((c, i) => (i === 0 ? c.toLocaleUpperCase("de-DE") : c));
    }
    return display;
  }
  return wordChars.map((c, i) => (i === 0 ? c.toLocaleUpperCase("de-DE") : c));
}

function uniqueDistractors(wordChars: string[], distractors: string[]): string[] {
  const need = new Set(wordChars);
  const out: string[] = [];
  for (const raw of distractors) {
    const n = normalizeAnswer(raw).normalize("NFC");
    if (!n || need.has(n) || out.includes(n)) continue;
    out.push(n);
  }
  return out;
}

function defaultDistractors(wordChars: string[]): string[] {
  const pool = [..."abcdefghijklmnopqrstuvwxyzäöüß"];
  const have = new Set(wordChars);
  const picks: string[] = [];
  for (const c of pool) {
    if (have.has(c)) continue;
    picks.push(c);
    if (picks.length >= Math.min(6, Math.max(3, wordChars.length))) break;
  }
  return picks;
}

function pickLane(rng: Rng): Lane {
  const i = Math.floor(rng() * 3);
  return LANES[Math.min(2, Math.max(0, i))]!;
}

function letterDisplay(wordChars: string[], displayCharsList: string[], normalized: string): string {
  const idx = wordChars.indexOf(normalized);
  if (idx >= 0) return displayCharsList[idx] ?? normalized;
  return normalized.toLocaleUpperCase("de-DE");
}

function singleLetterDisplay(normalized: string): string {
  return normalized.toLocaleUpperCase("de-DE");
}

export function createSim(
  config: BuchstabenfliegerConfig,
  _rng: Rng = Math.random,
): BuchstabenfliegerSimState {
  const wordChars = splitWord(config.word);
  if (wordChars.length === 0) {
    throw new Error("Buchstabenflieger: empty word");
  }
  const displayWord = (config.displayWord ?? config.word).trim() || config.word;
  const display = alignDisplayChars(wordChars, displayWord);
  const distractors = uniqueDistractors(
    wordChars,
    config.distractors?.length ? config.distractors : defaultDistractors(wordChars),
  );
  const radarNorm = normalizeAnswer(config.radarLetter).normalize("NFC");
  const posNorm = normalizeAnswer(config.positionLetter).normalize("NFC");

  return {
    wordChars,
    displayChars: display,
    displayWord,
    radarLetter: radarNorm,
    radarLetterDisplay: singleLetterDisplay(radarNorm),
    radarInWord: config.radarInWord,
    positionLetter: posNorm,
    positionLetterDisplay: singleLetterDisplay(posNorm),
    positionZone: config.positionZone,
    distractors,
    hitsNeeded: config.hitsNeeded ?? DEFAULT_HITS_NEEDED,
    hitsDone: 0,
    planeLane: 1,
    active: null,
    phase: "radar_prompt",
    wrongAttempts: 0,
    won: false,
    approachSeconds: config.approachSeconds ?? DEFAULT_APPROACH_SECONDS,
    enemySeq: 0,
  };
}

export type MoveResult = { kind: "moved"; lane: Lane } | { kind: "blocked"; lane: Lane };

export function tryMovePlane(state: BuchstabenfliegerSimState, dir: -1 | 1): MoveResult {
  if (state.won || state.phase === "radar_prompt" || state.phase === "lane_prompt") {
    return { kind: "blocked", lane: state.planeLane };
  }
  const next = state.planeLane + dir;
  if (next < 0 || next > 2) {
    return { kind: "blocked", lane: state.planeLane };
  }
  state.planeLane = next as Lane;
  return { kind: "moved", lane: state.planeLane };
}

export type PromptResult =
  | { kind: "correct"; phase: BuchstabenfliegerSimState["phase"] }
  | { kind: "wrong"; wrongAttempts: number }
  | { kind: "ignored" };

/** Answer radar Ja/Nein. `yes` means "letter is in the word". */
export function answerRadar(state: BuchstabenfliegerSimState, yes: boolean): PromptResult {
  if (state.phase !== "radar_prompt" || state.won) return { kind: "ignored" };
  if (yes === state.radarInWord) {
    state.phase = "radar_wave";
    state.active = null;
    return { kind: "correct", phase: state.phase };
  }
  state.wrongAttempts += 1;
  return { kind: "wrong", wrongAttempts: state.wrongAttempts };
}

/** Answer Anfang/Mitte/Ende for the position booster. */
export function answerLane(
  state: BuchstabenfliegerSimState,
  zone: LetterPosition,
): PromptResult {
  if (state.phase !== "lane_prompt" || state.won) return { kind: "ignored" };
  if (zone === state.positionZone) {
    state.phase = "armor_wave";
    state.active = null;
    return { kind: "correct", phase: state.phase };
  }
  state.wrongAttempts += 1;
  return { kind: "wrong", wrongAttempts: state.wrongAttempts };
}

function radarSpawnPool(state: BuchstabenfliegerSimState): string[] {
  const members = [...new Set(state.wordChars)];
  return [...members, ...state.distractors];
}

export function spawnNext(
  state: BuchstabenfliegerSimState,
  rng: Rng = Math.random,
): ActiveEnemy | null {
  if (state.won) {
    state.active = null;
    return null;
  }

  if (state.phase === "radar_wave") {
    const pool = radarSpawnPool(state);
    if (pool.length === 0) return null;
    const pick = pool[Math.floor(rng() * pool.length)]!;
    const membership = state.wordChars.includes(pick);
    const enemy: ActiveEnemy = {
      id: `enemy-${state.enemySeq++}`,
      letter: letterDisplay(state.wordChars, state.displayChars, pick),
      normalized: pick,
      lane: pickLane(rng),
      membership,
      kind: "bird",
      progress: 0,
    };
    state.active = enemy;
    return enemy;
  }

  if (state.phase === "armor_wave") {
    const lane = ZONE_TO_LANE[state.positionZone];
    const enemy: ActiveEnemy = {
      id: `enemy-${state.enemySeq++}`,
      letter: state.positionLetterDisplay,
      normalized: state.positionLetter,
      lane,
      membership: true,
      kind: "armor",
      progress: 0,
    };
    state.active = enemy;
    return enemy;
  }

  state.active = null;
  return null;
}

export type ShotResult =
  | { kind: "hit"; won: boolean; letter: string; hitsDone: number }
  | { kind: "miss"; reason: "distractor" | "wrong_lane"; wrongAttempts: number }
  | { kind: "ignored" };

/** Fire at the active enemy when it is in range (progress ≥ 0.35) and same lane. */
export function shoot(
  state: BuchstabenfliegerSimState,
  rng: Rng = Math.random,
): ShotResult {
  if (state.won) return { kind: "ignored" };
  if (state.phase !== "radar_wave" && state.phase !== "armor_wave") {
    return { kind: "ignored" };
  }
  if (!state.active || state.active.progress < 0.35) {
    return { kind: "ignored" };
  }
  if (state.active.lane !== state.planeLane) {
    state.wrongAttempts += 1;
    return { kind: "miss", reason: "wrong_lane", wrongAttempts: state.wrongAttempts };
  }

  if (state.phase === "radar_wave") {
    if (!state.active.membership) {
      state.wrongAttempts += 1;
      state.active = null;
      spawnNext(state, rng);
      return { kind: "miss", reason: "distractor", wrongAttempts: state.wrongAttempts };
    }
    state.hitsDone += 1;
    const letter = state.active.letter;
    state.active = null;
    if (state.hitsDone >= state.hitsNeeded) {
      state.phase = "lane_prompt";
      return { kind: "hit", won: false, letter, hitsDone: state.hitsDone };
    }
    spawnNext(state, rng);
    return { kind: "hit", won: false, letter, hitsDone: state.hitsDone };
  }

  // armor_wave — same lane already checked; armor lane is the correct zone
  const letter = state.active.letter;
  state.active = null;
  state.won = true;
  state.phase = "won";
  return { kind: "hit", won: true, letter, hitsDone: state.hitsDone };
}

export type ArrivalResult =
  | { kind: "crash"; wrongAttempts: number; letter: string }
  | { kind: "dodge"; letter: string }
  | { kind: "ignored" };

function resolveArrival(
  state: BuchstabenfliegerSimState,
  rng: Rng = Math.random,
): ArrivalResult {
  if (!state.active || state.won) return { kind: "ignored" };
  const enemy = state.active;
  const sameLane = enemy.lane === state.planeLane;

  if (sameLane) {
    state.wrongAttempts += 1;
    state.active = null;
    if (state.phase === "radar_wave" || state.phase === "armor_wave") {
      spawnNext(state, rng);
    }
    return { kind: "crash", wrongAttempts: state.wrongAttempts, letter: enemy.letter };
  }

  state.active = null;
  if (state.phase === "radar_wave" || state.phase === "armor_wave") {
    spawnNext(state, rng);
  }
  return { kind: "dodge", letter: enemy.letter };
}

export type TickResult =
  | { kind: "approaching"; progress: number }
  | ArrivalResult
  | { kind: "idle" }
  | { kind: "spawned" };

export function tick(
  state: BuchstabenfliegerSimState,
  dtSeconds: number,
  rng: Rng = Math.random,
): TickResult {
  if (state.won) return { kind: "idle" };
  if (state.phase !== "radar_wave" && state.phase !== "armor_wave") {
    return { kind: "idle" };
  }
  if (!state.active) {
    spawnNext(state, rng);
    if (!state.active) return { kind: "idle" };
    return { kind: "spawned" };
  }
  const duration = Math.max(0.001, state.approachSeconds);
  state.active.progress = Math.min(1, state.active.progress + dtSeconds / duration);
  if (state.active.progress < 1) {
    return { kind: "approaching", progress: state.active.progress };
  }
  return resolveArrival(state, rng);
}

export function forceActive(
  state: BuchstabenfliegerSimState,
  normalized: string,
  lane: Lane,
  opts?: { membership?: boolean; kind?: ActiveEnemy["kind"]; progress?: number },
): ActiveEnemy {
  const membership = opts?.membership ?? state.wordChars.includes(normalized);
  const enemy: ActiveEnemy = {
    id: `enemy-${state.enemySeq++}`,
    letter: letterDisplay(state.wordChars, state.displayChars, normalized),
    normalized,
    lane,
    membership,
    kind: opts?.kind ?? "bird",
    progress: opts?.progress ?? 0,
  };
  state.active = enemy;
  return enemy;
}

export function zoneForLane(lane: Lane): LetterPosition {
  return LANE_TO_ZONE[lane];
}

export function progressLabel(state: BuchstabenfliegerSimState): string {
  if (state.phase === "radar_prompt") return "Radar-Booster";
  if (state.phase === "radar_wave") {
    return `Treffer ${state.hitsDone} von ${state.hitsNeeded}`;
  }
  if (state.phase === "lane_prompt") return "Spur-Booster";
  if (state.phase === "armor_wave") return "Panzer!";
  return "Geschafft!";
}
