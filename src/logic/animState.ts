import type { FormId } from "./playerRules";

export type PlayerPose = "idle" | "walk" | "air";
export type SpawnKind = "bridge" | "rope" | "ladder" | "platform";

export const LAND_MS = 260;
export const TAKEOFF_MS = 100;

export function playerPose(grounded: boolean, speedX: number, paused: boolean): PlayerPose {
  if (paused) return "idle";
  if (!grounded) return "air";
  return Math.abs(speedX) > 40 ? "walk" : "idle";
}

/** Comic air silhouette from vertical velocity (neg = up). */
export function airScale(velocityY: number, form: FormId): { x: number; y: number } {
  const rise = form === "mech" ? 780 : 420;
  if (velocityY < -100) {
    const p = Math.min(1, -velocityY / rise);
    return { x: 0.9 - p * 0.05, y: 1.08 + p * 0.14 };
  }
  if (velocityY > 100) {
    const p = Math.min(1, velocityY / 920);
    return { x: 1.02 + p * 0.1, y: 0.98 - p * 0.1 };
  }
  // Soft float at apex
  return { x: 1.04, y: 0.96 };
}

export function airAngle(velocityY: number, facingLeft: boolean, form: FormId): number {
  const rise = form === "mech" ? 780 : 420;
  let bias = 0;
  if (velocityY < -100) {
    const p = Math.min(1, -velocityY / rise);
    bias = -5 - p * 8; // lean back on launch
  } else if (velocityY > 100) {
    const p = Math.min(1, velocityY / 920);
    bias = 6 + p * 10; // lean into fall
  } else {
    bias = 2;
  }
  return facingLeft ? -bias : bias;
}

export function poseScale(
  pose: PlayerPose,
  timeMs: number,
  form: FormId,
  velocityY = 0,
): { x: number; y: number } {
  if (pose === "air") return airScale(velocityY, form);
  if (pose === "walk") {
    // Mech has real leg frames — no extra squash (it reads as jitter).
    if (form === "mech") return { x: 1, y: 1 };
    // Auto: bouncy drive hop (wheels / chassis)
    const period = 130;
    const wave = Math.abs(Math.sin((timeMs / period) * Math.PI));
    return { x: 1 + wave * 0.06, y: 1 - wave * 0.11 };
  }
  if (form === "auto") {
    const idle = Math.sin(timeMs / 280) * 0.025;
    return { x: 1 + idle * 0.3, y: 1 - idle };
  }
  const bob = Math.sin(timeMs / 400) * 0.03;
  return { x: 1 - bob * 0.4, y: 1 + bob };
}

export function poseAngle(
  pose: PlayerPose,
  facingLeft: boolean,
  timeMs: number,
  form: FormId,
  velocityY = 0,
): number {
  if (pose === "air") return airAngle(velocityY, facingLeft, form);
  if (pose === "walk" && form === "auto") {
    const rock = Math.sin(timeMs / 65) * 5;
    const lean = facingLeft ? 4 : -4;
    return rock + lean;
  }
  if (pose === "idle" && form === "auto") {
    return Math.sin(timeMs / 320) * 1.5;
  }
  return 0;
}

/** Launch kick stretch for the first moments after jump. */
export function takeoffOverlay(sinceJumpMs: number): { x: number; y: number } | null {
  if (sinceJumpMs < 0 || sinceJumpMs >= TAKEOFF_MS) return null;
  const t = sinceJumpMs / TAKEOFF_MS;
  const kick = Math.cos((t * Math.PI) / 2); // 1 → 0
  return { x: 1 - 0.12 * kick, y: 1 + 0.18 * kick };
}

/** Land impact squash, then a short rebound stretch. */
export function landOverlay(sinceLandMs: number): { x: number; y: number } | null {
  if (sinceLandMs < 0 || sinceLandMs >= LAND_MS) return null;
  const t = sinceLandMs / LAND_MS;
  if (t < 0.42) {
    const squash = Math.sin((t / 0.42) * Math.PI);
    return { x: 1 + 0.24 * squash, y: 1 - 0.28 * squash };
  }
  const bounce = Math.sin(((t - 0.42) / 0.58) * Math.PI);
  return { x: 1 - 0.07 * bounce, y: 1 + 0.1 * bounce };
}

export function spawnMotion(kind: SpawnKind): { fromY: number; duration: number } {
  if (kind === "rope") return { fromY: -220, duration: 520 };
  if (kind === "ladder") return { fromY: -130, duration: 420 };
  return { fromY: -72, duration: 500 };
}
