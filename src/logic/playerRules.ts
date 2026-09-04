export function canJump(grounded: boolean, worldPaused: boolean): boolean {
  return grounded && !worldPaused;
}

export type CharacterId = "bolt" | "marina" | "rush";
/** Robot vs vehicle silhouette — physics and squash/stretch. */
export type ShapeId = "mech" | "auto";
/** @deprecated alias — prefer ShapeId */
export type FormId = ShapeId;

export function moveSpeed(shape: ShapeId): number {
  return shape === "auto" ? 630 : 420;
}

export function jumpVelocity(shape: ShapeId): number {
  return shape === "auto" ? -420 : -780;
}

/** Feet on the walk collider in the 1920×1080 world (slightly below drawn grass). */
export const RESPAWN = { x: 300, y: 948 };

export type MoveInput = { left: boolean; right: boolean; jump: boolean };

export function combineMove(pad: MoveInput, keys: MoveInput): MoveInput {
  return {
    left: pad.left || keys.left,
    right: pad.right || keys.right,
    jump: pad.jump || keys.jump,
  };
}
