import { describe, expect, it } from "vitest";
import { exclusiveLetterPosition } from "../src/logic/letterPositionPuzzle";
import { builtinPuzzles } from "../src/logic/puzzleStore";
import {
  MINIGAME_CATEGORIES,
  PUZZLE_CATEGORIES,
  STATION_SLOTS,
  defaultEnabledCategories,
  isMinigameCategory,
} from "../src/logic/puzzleCategories";
import {
  answerLane,
  answerRadar,
  createSim,
  forceActive,
  shoot,
  tick,
  tryMovePlane,
  DEFAULT_HITS_NEEDED,
} from "../src/minigames/buchstabenflieger/sim";
import { configFromLetterPosItem } from "../src/minigames/buchstabenflieger/mission";
import { ZONE_TO_LANE } from "../src/minigames/buchstabenflieger/types";

function seqRng(values: number[]): () => number {
  let i = 0;
  return () => {
    const v = values[Math.min(i, values.length - 1)]!;
    i += 1;
    return v;
  };
}

const baseConfig = {
  word: "haus",
  displayWord: "Haus",
  radarLetter: "s",
  radarInWord: true,
  positionLetter: "a",
  positionZone: "mitte" as const,
  distractors: ["k", "n"],
  hitsNeeded: 2,
  approachSeconds: 1,
};

describe("buchstabenflieger sim", () => {
  it("rejects wrong radar answer and advances on correct", () => {
    const state = createSim(baseConfig);
    expect(state.phase).toBe("radar_prompt");
    expect(answerRadar(state, false)).toMatchObject({ kind: "wrong", wrongAttempts: 1 });
    expect(state.phase).toBe("radar_prompt");
    expect(answerRadar(state, true)).toMatchObject({ kind: "correct", phase: "radar_wave" });
    expect(state.phase).toBe("radar_wave");
  });

  it("hits membership birds and rejects distractors", () => {
    const state = createSim(baseConfig);
    answerRadar(state, true);
    forceActive(state, "k", 1, { membership: false, progress: 0.5 });
    expect(shoot(state)).toMatchObject({ kind: "miss", reason: "distractor" });
    expect(state.wrongAttempts).toBe(1);

    forceActive(state, "h", 1, { membership: true, progress: 0.5 });
    expect(shoot(state)).toMatchObject({ kind: "hit", won: false, hitsDone: 1 });
    forceActive(state, "a", 1, { membership: true, progress: 0.5 });
    expect(shoot(state)).toMatchObject({ kind: "hit", won: false });
    expect(state.phase).toBe("lane_prompt");
  });

  it("dodges other-lane arrival and crashes same-lane", () => {
    const state = createSim(baseConfig);
    answerRadar(state, true);
    state.planeLane = 1;
    forceActive(state, "k", 0, { membership: false, progress: 0.99 });
    expect(tick(state, 1)).toMatchObject({ kind: "dodge" });

    forceActive(state, "k", 1, { membership: false, progress: 0.99 });
    expect(tick(state, 1)).toMatchObject({ kind: "crash" });
    expect(state.wrongAttempts).toBe(1);
  });

  it("requires correct lane zone then destroys armor from matching spur", () => {
    const state = createSim({ ...baseConfig, hitsNeeded: 1 });
    answerRadar(state, true);
    forceActive(state, "h", 1, { membership: true, progress: 0.5 });
    shoot(state);
    expect(state.phase).toBe("lane_prompt");

    expect(answerLane(state, "anfang")).toMatchObject({ kind: "wrong" });
    expect(answerLane(state, "mitte")).toMatchObject({ kind: "correct", phase: "armor_wave" });

    const armorLane = ZONE_TO_LANE.mitte;
    state.planeLane = armorLane;
    forceActive(state, "a", armorLane, { kind: "armor", membership: true, progress: 0.5 });
    expect(shoot(state)).toMatchObject({ kind: "hit", won: true });
    expect(state.won).toBe(true);
    expect(state.phase).toBe("won");
  });

  it("armor shot from wrong lane is a miss", () => {
    const state = createSim({ ...baseConfig, hitsNeeded: 1 });
    answerRadar(state, true);
    forceActive(state, "h", 1, { membership: true, progress: 0.5 });
    shoot(state);
    answerLane(state, "mitte");
    state.planeLane = 0;
    forceActive(state, "a", ZONE_TO_LANE.mitte, { kind: "armor", progress: 0.5 });
    expect(shoot(state)).toMatchObject({ kind: "miss", reason: "wrong_lane" });
  });

  it("blocks plane moves during prompts", () => {
    const state = createSim(baseConfig);
    expect(tryMovePlane(state, -1)).toMatchObject({ kind: "blocked" });
    answerRadar(state, true);
    expect(tryMovePlane(state, -1)).toMatchObject({ kind: "moved", lane: 0 });
  });

  it("defaults hitsNeeded", () => {
    const state = createSim({
      word: "haus",
      radarLetter: "x",
      radarInWord: false,
      positionLetter: "h",
      positionZone: "anfang",
    });
    expect(state.hitsNeeded).toBe(DEFAULT_HITS_NEEDED);
  });
});

describe("buchstabenflieger mission", () => {
  it("builds config from letterPos item with exclusive zone", () => {
    const item = {
      letter: "a",
      word: "haus",
      display: "Haus",
      position: "mitte" as const,
    };
    expect(exclusiveLetterPosition(item.letter, item.word)).toBe("mitte");
    const cfg = configFromLetterPosItem(item, seqRng([0.1, 0.2]));
    expect(cfg.word).toBe("haus");
    expect(cfg.positionZone).toBe("mitte");
    expect(cfg.positionLetter).toBe("a");
    expect(typeof cfg.radarInWord).toBe("boolean");
  });
});

describe("buchstabenflieger station wiring", () => {
  it("registers type and builtin as minigame without a ground board slot", () => {
    expect(PUZZLE_CATEGORIES).toContain("buchstabenflieger");
    expect(MINIGAME_CATEGORIES).toContain("buchstabenflieger");
    expect(isMinigameCategory("buchstabenflieger")).toBe(true);
    // Hangar-Sonderort not shipped yet — off by default, no world Holztafel.
    expect(defaultEnabledCategories().buchstabenflieger).toBe(false);
    expect(builtinPuzzles().some((p) => p.type === "buchstabenflieger")).toBe(true);
    expect(STATION_SLOTS.every((s) => s.category !== "buchstabenflieger")).toBe(true);
  });
});
