import type { Puzzle, WorldEffect } from "./puzzleTypes";

/** In-game sprites used as large word / object illustrations in the puzzle overlay. */
const MOTIF_ART: Record<string, string> = {
  bridge: "/art/prop_bridge.png",
  rope: "/art/prop_rope.png",
  ladder: "/art/prop_ladder.png",
  mech: "/art/bolt_mech_side.png",
  auto: "/art/bolt_vehicle_side.png",
  bolt: "/art/bolt_mech_side.png",
  marina: "/art/marina_mech_side.png",
  rush: "/art/rush_mech_side.png",
  "marina-auto": "/art/marina_vehicle_side.png",
  "rush-auto": "/art/rush_vehicle_side.png",
};

function motifFromEffect(effect: WorldEffect): string | undefined {
  switch (effect) {
    case "spawn_bridge":
      return "bridge";
    case "spawn_rope":
      return "rope";
    case "spawn_ladder":
      return "ladder";
    case "transform_mech":
      return "mech";
    case "transform_auto":
      return "auto";
    case "transform_bolt":
      return "bolt";
    case "transform_marina":
      return "marina";
    case "transform_rush":
      return "rush";
    default:
      return undefined;
  }
}

/** Path to the Style C sprite that illustrates this puzzle, or null if none. */
export function motifArtPath(puzzle: Puzzle): string | null {
  if (puzzle.type === "math") return null;
  const id = puzzle.motifId ?? motifFromEffect(puzzle.effect);
  if (!id) return null;
  return MOTIF_ART[id] ?? null;
}

/** One or more motif images (free transform shows several mechs). */
export function motifArtPaths(puzzle: Puzzle): string[] {
  if (puzzle.transformOptions?.length) {
    const paths: string[] = [];
    const seen = new Set<string>();
    for (const opt of puzzle.transformOptions) {
      const path = MOTIF_ART[opt.motifId];
      if (path && !seen.has(path)) {
        seen.add(path);
        paths.push(path);
      }
    }
    return paths;
  }
  const one = motifArtPath(puzzle);
  return one ? [one] : [];
}
