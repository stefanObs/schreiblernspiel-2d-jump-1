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

export const RESPAWN = { x: 120, y: 520 };
