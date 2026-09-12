import {
  letterPositionZones,
  type LetterPosition,
} from "../../logic/letterPositionPuzzle";
import {
  CHAIN_COUNT,
  MAX_LIVES,
  type ChainRound,
  type ChainZone,
  type KettenhochhausConfig,
  type KettenhochhausSimState,
} from "./types";

export type ClickResult =
  | { kind: "hit"; chainIndex: number; won: boolean; zone: ChainZone }
  | { kind: "miss"; lives: number; wrongAttempts: number; zone: ChainZone }
  | { kind: "restart"; wrongAttempts: number; zone: ChainZone }
  | { kind: "ignored" };

/**
 * Zones where `letter` occurs in `word`.
 * Choice when a letter appears in multiple places: **any matching zone is accepted**
 * (Anfang if index 0, Ende if last, Mitte otherwise). Teaching rounds still pick
 * exclusive letterPos items so the intended answer is usually unique.
 */
export function acceptedZonesFor(letter: string, word: string): Set<ChainZone> {
  return letterPositionZones(letter, word) as Set<ChainZone>;
}

export function zoneOfIndex(index: number, length: number): ChainZone {
  if (length <= 0) return "mitte";
  if (index === 0) return "anfang";
  if (index === length - 1) return "ende";
  return "mitte";
}

export function createSim(config: KettenhochhausConfig): KettenhochhausSimState {
  const chains = config.chains.slice(0, CHAIN_COUNT);
  if (chains.length === 0) {
    throw new Error("Kettenhochhaus: empty chains");
  }
  return {
    chains,
    chainIndex: 0,
    lives: MAX_LIVES,
    maxLives: MAX_LIVES,
    wrongAttempts: 0,
    won: false,
    restartCount: 0,
  };
}

export function currentChain(state: KettenhochhausSimState): ChainRound | null {
  if (state.won) return null;
  return state.chains[state.chainIndex] ?? null;
}

export function chainProgress(state: KettenhochhausSimState): string {
  const done = Math.min(state.chainIndex, state.chains.length);
  return `Kette ${Math.min(done + 1, state.chains.length)} von ${state.chains.length}`;
}

export function brokenMask(state: KettenhochhausSimState): boolean[] {
  return state.chains.map((_, i) => i < state.chainIndex);
}

/** Click Anfang / Mitte / Ende for the current chain letter. */
export function clickZone(state: KettenhochhausSimState, zone: ChainZone): ClickResult {
  if (state.won) return { kind: "ignored" };
  const chain = state.chains[state.chainIndex];
  if (!chain) return { kind: "ignored" };

  const accepted = acceptedZonesFor(chain.letter, chain.word);
  if (accepted.size === 0) return { kind: "ignored" };

  if (accepted.has(zone)) {
    state.chainIndex += 1;
    if (state.chainIndex >= state.chains.length) {
      state.won = true;
    }
    return {
      kind: "hit",
      chainIndex: state.chainIndex,
      won: state.won,
      zone,
    };
  }

  state.lives -= 1;
  state.wrongAttempts += 1;
  if (state.lives <= 0) {
    state.lives = state.maxLives;
    state.chainIndex = 0;
    state.restartCount += 1;
    return { kind: "restart", wrongAttempts: state.wrongAttempts, zone };
  }
  return {
    kind: "miss",
    lives: state.lives,
    wrongAttempts: state.wrongAttempts,
    zone,
  };
}

export function intendedZone(chain: ChainRound): LetterPosition | null {
  const zones = acceptedZonesFor(chain.letter, chain.word);
  if (zones.size !== 1) return null;
  return [...zones][0]!;
}
