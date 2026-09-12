import { describe, expect, it } from "vitest";
import {
  GOAL_X,
  SOLID_FLOORS,
  SPAWN_PARTS,
  STREET_CROSSING,
  TREEHOUSE,
  WATER_GAPS,
  WORLD,
  isStreetTrigger,
  spawnPartsForEffect,
  waterGapAt,
} from "../src/logic/bachbrueckeLayout";
import { canClimb, climbVelocityY, combineMove } from "../src/logic/playerRules";
import { playerPose } from "../src/logic/animState";
import { BOARD_CATEGORIES, STATION_SLOTS } from "../src/logic/puzzleCategories";

describe("bachbrueckeLayout", () => {
  it("extends the world past the old 3600 design width", () => {
    expect(WORLD.width).toBeGreaterThan(3600);
    expect(GOAL_X).toBeGreaterThan(3400);
  });

  it("has stream, lake, and street gaps", () => {
    const kinds = WATER_GAPS.map((g) => g.kind);
    expect(kinds).toContain("stream");
    expect(kinds).toContain("lake");
    expect(kinds).toContain("street");
    expect(waterGapAt(900)?.kind).toBe("stream");
    expect(waterGapAt(2650)?.kind).toBe("lake");
    expect(waterGapAt(3250)?.kind).toBe("street");
  });

  it("has stepped solid floors including treehouse floor", () => {
    expect(SOLID_FLOORS.some((f) => f.id === "ledge-mid")).toBe(true);
    expect(SOLID_FLOORS.some((f) => f.id === "ledge-high")).toBe(true);
    expect(SOLID_FLOORS.some((f) => f.id === "bank-far")).toBe(true);
    expect(TREEHOUSE.floor.y).toBeLessThan(WORLD.groundY);
  });

  it("maps spawn effects including lake bridge and climb parts", () => {
    expect(spawnPartsForEffect("spawn_bridge").some((p) => p.id === "stream_bridge")).toBe(true);
    expect(spawnPartsForEffect("spawn_lake_bridge").some((p) => p.id === "lake_bridge")).toBe(true);
    expect(SPAWN_PARTS.filter((p) => "climb" in p && p.climb).map((p) => p.id)).toEqual(
      expect.arrayContaining(["climb_rope", "ladder"]),
    );
  });

  it("defines street crossing trigger and far-side exit", () => {
    expect(isStreetTrigger(STREET_CROSSING.triggerX)).toBe(true);
    expect(isStreetTrigger(STREET_CROSSING.triggerX + STREET_CROSSING.triggerW)).toBe(false);
    expect(STREET_CROSSING.exitX).toBeGreaterThan(STREET_CROSSING.triggerX);
    expect(STREET_CROSSING.puzzleId).toContain("buchstabenstrasse");
  });
});

describe("climb helpers", () => {
  it("allows climb only for mech when world is not paused", () => {
    expect(canClimb("mech", false)).toBe(true);
    expect(canClimb("auto", false)).toBe(false);
    expect(canClimb("mech", true)).toBe(false);
  });

  it("maps up/down climb velocity without swing", () => {
    expect(climbVelocityY({ up: true, down: false, jump: false })).toBeLessThan(0);
    expect(climbVelocityY({ up: false, down: true, jump: false })).toBeGreaterThan(0);
    expect(climbVelocityY({ up: false, down: false, jump: false })).toBe(0);
  });

  it("combineMove merges up/down and pose reports climb", () => {
    const move = combineMove(
      { left: false, right: false, jump: false, up: true },
      { left: false, right: false, jump: false, down: true },
    );
    expect(move.up).toBe(true);
    expect(move.down).toBe(true);
    expect(playerPose(false, 0, false, true)).toBe("climb");
  });
});

describe("level station layout", () => {
  it("puts ballkanone in the elevated treehouse and rope unlock on the ground", () => {
    const rope = STATION_SLOTS.find((s) => s.effect === "spawn_rope");
    const ball = STATION_SLOTS.find((s) => s.category === "ballkanone");
    expect(rope?.elevated).toBeFalsy();
    expect(ball?.elevated).toBe(true);
    expect(ball?.x).toBe(TREEHOUSE.propX);
  });

  it("has no buchstabenstrasse board; street is the auto gate", () => {
    expect(STATION_SLOTS.every((s) => s.category !== "buchstabenstrasse")).toBe(true);
    expect(BOARD_CATEGORIES.includes("buchstabenstrasse")).toBe(false);
  });

  it("has a lake bridge progression slot", () => {
    expect(STATION_SLOTS.some((s) => s.effect === "spawn_lake_bridge")).toBe(true);
  });
});
