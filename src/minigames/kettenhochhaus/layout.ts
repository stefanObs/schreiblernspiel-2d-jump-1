import { CHAIN_COUNT } from "./types";

/**
 * Street runs **forward +Z** toward the burning high-rise.
 * Each chain spans **left→right (+X)** across the screen as a barrier.
 */
export const STREET = {
  /** Mech / road center X */
  roadX: 0,
  /** Chain hangs at this height */
  chainY: 1.15,
  /** Pads in front of the active chain (toward camera / −Z from chain) */
  padOffsetZ: 1.35,
  /** World Z of each of the 4 chains (increasing = further forward). */
  chainZs: [-0.2, 1.6, 3.4, 5.2] as const,
  buildingZ: 7.4,
  buildingX: 0.35,
  hoseX: -1.1,
  hoseZ: 6.6,
  /** Mech stands this far before the active chain (toward −Z). */
  approachBeforeChain: 1.15,
  /** Mech Z when extinguishing at the building. */
  extinguishMechZ: 6.5,
  /** Half-span of the chain barrier along X (left / right ends). */
  chainHalfSpan: 2.35,
} as const;

export function chainWorldZ(index: number): number {
  const zs = STREET.chainZs;
  const i = Math.max(0, Math.min(zs.length - 1, index));
  return zs[i]!;
}

/** Idle stand position before the chain the player must solve next. */
export function mechIdleZ(chainIndex: number): number {
  if (chainIndex >= CHAIN_COUNT) return STREET.extinguishMechZ;
  return chainWorldZ(chainIndex) - STREET.approachBeforeChain;
}

/**
 * Where the mech runs after breaking chain `brokenIndex` (0-based).
 * After the last chain → building extinguish spot.
 */
export function mechRunTargetAfterHit(brokenIndex: number): number {
  if (brokenIndex >= CHAIN_COUNT - 1) return STREET.extinguishMechZ;
  return mechIdleZ(brokenIndex + 1);
}

/** Zone pads: Anfang left, Mitte center, Ende right — at the active chain. */
export function zonePadX(zone: "anfang" | "mitte" | "ende"): number {
  if (zone === "anfang") return -1.15;
  if (zone === "ende") return 1.15;
  return 0;
}

export function zonePadZ(chainIndex: number): number {
  // Pads sit slightly toward the camera (−Z) from the active chain.
  return chainWorldZ(Math.min(chainIndex, CHAIN_COUNT - 1)) - 0.85;
}
