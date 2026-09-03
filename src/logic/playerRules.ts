export function canJump(grounded: boolean, worldPaused: boolean): boolean {
  return grounded && !worldPaused;
}

export type FormId = "mech" | "auto";

export function moveSpeed(form: FormId): number {
  return form === "auto" ? 420 : 280;
}

export function jumpVelocity(form: FormId): number {
  return form === "auto" ? -280 : -520;
}

export const RESPAWN = { x: 200, y: 620 };

export type MoveInput = { left: boolean; right: boolean; jump: boolean };

export function combineMove(pad: MoveInput, keys: MoveInput): MoveInput {
  return {
    left: pad.left || keys.left,
    right: pad.right || keys.right,
    jump: pad.jump || keys.jump,
  };
}
