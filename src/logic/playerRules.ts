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

export type MoveInput = { left: boolean; right: boolean; jump: boolean; up?: boolean; down?: boolean };

export function combineMove(pad: MoveInput, keys: MoveInput): MoveInput {
  return {
    left: pad.left || keys.left,
    right: pad.right || keys.right,
    jump: pad.jump || keys.jump,
    up: Boolean(pad.up || keys.up),
    down: Boolean(pad.down || keys.down),
  };
}

/** Vertical climb speed (mech only). */
export const CLIMB_SPEED = 280;

/** Horizontal snap tolerance to grab a climb sensor (world px after scale). */
export const CLIMB_GRAB_DX = 36;

export function canClimb(shape: ShapeId, worldPaused: boolean): boolean {
  return shape === "mech" && !worldPaused;
}

export type ClimbInput = { up: boolean; down: boolean; jump: boolean };

/** Velocity while climbing; jump detaches (caller clears climb state). */
export function climbVelocityY(input: ClimbInput, climbSpeed = CLIMB_SPEED): number {
  if (input.up && !input.down) return -climbSpeed;
  if (input.down && !input.up) return climbSpeed;
  return 0;
}
