import type { Point } from "./puzzleTypes";

export function templatePath(kind: "bridge" | "ladder"): Point[] {
  if (kind === "bridge") {
    const pts: Point[] = [];
    for (let i = 0; i <= 20; i++) pts.push({ x: 40 + i * 16, y: 140 });
    return pts;
  }
  const pts: Point[] = [];
  for (let i = 0; i <= 16; i++) pts.push({ x: 200, y: 40 + i * 12 });
  for (let r = 0; r < 5; r++) {
    pts.push({ x: 170, y: 60 + r * 36 }, { x: 230, y: 60 + r * 36 });
  }
  return pts;
}

export function traceScore(stroke: Point[], template: Point[]): number {
  if (stroke.length < 4 || template.length === 0) return 0;
  const hits = template.filter((t) =>
    stroke.some((s) => Math.hypot(s.x - t.x, s.y - t.y) < 28),
  ).length;
  return hits / template.length;
}

export const TRACE_PASS = 0.55;
