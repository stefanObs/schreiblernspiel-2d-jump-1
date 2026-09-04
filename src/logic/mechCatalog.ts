import type { CharacterId, ShapeId } from "./playerRules";

export type MechArt = {
  mechKey: string;
  autoKey: string;
  walkAnim: string;
  walkFrames: string[];
  mechFile: string;
  autoFile: string;
  walkFiles: string[];
};

export const MECH_CHARS: CharacterId[] = ["bolt", "marina", "rush"];

export const MECH_ART: Record<CharacterId, MechArt> = {
  bolt: {
    mechKey: "bolt-mech",
    autoKey: "bolt-auto",
    walkAnim: "bolt-walk",
    walkFrames: ["bolt-walk-1", "bolt-walk-2", "bolt-walk-3", "bolt-walk-4"],
    mechFile: "art/bolt_mech_side.png",
    autoFile: "art/bolt_vehicle_side.png",
    walkFiles: [
      "art/bolt_mech_walk_01.png",
      "art/bolt_mech_walk_02.png",
      "art/bolt_mech_walk_03.png",
      "art/bolt_mech_walk_04.png",
    ],
  },
  marina: {
    mechKey: "marina-mech",
    autoKey: "marina-auto",
    walkAnim: "marina-walk",
    walkFrames: ["marina-walk-1", "marina-walk-2", "marina-walk-3", "marina-walk-4"],
    mechFile: "art/marina_mech_side.png",
    autoFile: "art/marina_vehicle_side.png",
    walkFiles: [
      "art/marina_mech_walk_01.png",
      "art/marina_mech_walk_02.png",
      "art/marina_mech_walk_03.png",
      "art/marina_mech_walk_04.png",
    ],
  },
  rush: {
    mechKey: "rush-mech",
    autoKey: "rush-auto",
    walkAnim: "rush-walk",
    walkFrames: ["rush-walk-1", "rush-walk-2", "rush-walk-3", "rush-walk-4"],
    mechFile: "art/rush_mech_side.png",
    autoFile: "art/rush_vehicle_side.png",
    walkFiles: [
      "art/rush_mech_walk_01.png",
      "art/rush_mech_walk_02.png",
      "art/rush_mech_walk_03.png",
      "art/rush_mech_walk_04.png",
    ],
  },
};

export function textureFor(character: CharacterId, shape: ShapeId): string {
  const art = MECH_ART[character];
  return shape === "auto" ? art.autoKey : art.mechKey;
}

export function characterDisplayName(character: CharacterId): string {
  if (character === "marina") return "Marina";
  if (character === "rush") return "Rush";
  return "Bolt";
}
