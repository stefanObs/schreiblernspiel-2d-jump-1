export type {
  ChainRound,
  ChainZone,
  KettenhochhausConfig,
  KettenhochhausSimState,
} from "./types";
export { CHAIN_COUNT, MAX_LIVES, ZONE_LABELS } from "./types";
export {
  acceptedZonesFor,
  brokenMask,
  chainProgress,
  clickZone,
  createSim,
  currentChain,
  intendedZone,
  zoneOfIndex,
  type ClickResult,
} from "./sim";
export {
  applyKettenhochhausRound,
  chainFromLetterPosItem,
  pickChainRounds,
  realizeKettenhochhausPuzzle,
} from "./chainList";
export { openKettenhochhaus, isKettenhochhausOpen } from "./openKettenhochhaus";
export { KettenhochhausApp } from "./render/KettenhochhausScene";
