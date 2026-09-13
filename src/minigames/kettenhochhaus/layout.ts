import { CHAIN_COUNT } from "./types";

/** Street runs +X toward the burning high-rise. Chains block the road in sequence. */
export const STREET = {
  mechZ: 1.15,
  chainZ: 0.35,
  padZ: 2.2,
  /** World X of each of the 4 chains across the street. */
  chainXs: [-1.6, -0.05, 1.5, 3.05] as const,
  buildingX: 5.1,
  buildingZ: -1.0,
  hoseX: 4.35,
  hoseZ: 0.35,
  /** Offset: mech stands this far before the active chain (toward −X). */
  approachBeforeChain: 0.95,
  /** Mech X when running to the building after the last chain. */
  extinguishMechX: 4.2,
} as const;

export function chainWorldX(index: number): number {
  const xs = STREET.chainXs;
  const i = Math.max(0, Math.min(xs.length - 1, index));
  return xs[i]!;
}

/** Idle stand position before the chain the player must solve next. */
export function mechIdleX(chainIndex: number): number {
  if (chainIndex >= CHAIN_COUNT) return STREET.extinguishMechX;
  return chainWorldX(chainIndex) - STREET.approachBeforeChain;
}

/**
 * Where the mech runs after breaking chain `brokenIndex` (0-based).
 * After the last chain → building extinguish spot.
 */
export function mechRunTargetAfterHit(brokenIndex: number): number {
  if (brokenIndex >= CHAIN_COUNT - 1) return STREET.extinguishMechX;
  return mechIdleX(brokenIndex + 1);
}

/** Zone pads sit near the active chain: Anfang left, Mitte center, Ende right. */
export function zonePadX(zone: "anfang" | "mitte" | "ende", chainIndex: number): number {
  const base = chainWorldX(Math.min(chainIndex, CHAIN_COUNT - 1));
  if (zone === "anfang") return base - 1.0;
  if (zone === "ende") return base + 1.0;
  return base;
}
