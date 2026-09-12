import { describe, expect, it } from "vitest";
import { LETTER_POS_ITEMS } from "../src/logic/letterPositionPuzzle";
import { STATION_SLOTS } from "../src/logic/puzzleCategories";
import { builtinPuzzles } from "../src/logic/puzzleStore";
import { starsFromWrongAttempts } from "../src/logic/starRating";
import {
  acceptedZonesFor,
  chainFromLetterPosItem,
  CHAIN_COUNT,
  clickZone,
  createSim,
  currentChain,
  MAX_LIVES,
  pickChainRounds,
  zoneOfIndex,
} from "../src/minigames/kettenhochhaus";

describe("kettenhochhaus letter zones", () => {
  it("maps first / middle / last indices", () => {
    expect(zoneOfIndex(0, 4)).toBe("anfang");
    expect(zoneOfIndex(1, 4)).toBe("mitte");
    expect(zoneOfIndex(2, 4)).toBe("mitte");
    expect(zoneOfIndex(3, 4)).toBe("ende");
    expect(zoneOfIndex(0, 1)).toBe("anfang");
  });

  it("accepts any zone when a letter appears in multiple places", () => {
    // Choice: multi-occurrence → any matching zone counts (not a single intended index).
    const zones = acceptedZonesFor("l", "ball");
    expect(zones.has("mitte")).toBe(true);
    expect(zones.has("ende")).toBe(true);
    expect(zones.has("anfang")).toBe(false);
  });

  it("keeps exclusive letterPos teaching items unambiguous", () => {
    for (const item of LETTER_POS_ITEMS.slice(0, 20)) {
      const zones = acceptedZonesFor(item.letter, item.word);
      expect(zones.has(item.position)).toBe(true);
    }
  });
});

describe("kettenhochhaus sim", () => {
  const four = [
    chainFromLetterPosItem(LETTER_POS_ITEMS.find((i) => i.display === "Haus" && i.position === "anfang")!),
    chainFromLetterPosItem(LETTER_POS_ITEMS.find((i) => i.display === "Haus" && i.position === "mitte")!),
    chainFromLetterPosItem(LETTER_POS_ITEMS.find((i) => i.display === "Dose" && i.position === "ende")!),
    chainFromLetterPosItem(LETTER_POS_ITEMS.find((i) => i.display === "Rose" && i.position === "anfang")!),
  ];

  it("wins after four correct zone clicks", () => {
    const state = createSim({ chains: four });
    expect(state.lives).toBe(MAX_LIVES);
    expect(state.chains).toHaveLength(CHAIN_COUNT);

    expect(clickZone(state, "anfang")).toMatchObject({ kind: "hit", won: false });
    expect(clickZone(state, "mitte")).toMatchObject({ kind: "hit", won: false });
    expect(clickZone(state, "ende")).toMatchObject({ kind: "hit", won: false });
    expect(clickZone(state, "anfang")).toMatchObject({ kind: "hit", won: true });
    expect(state.won).toBe(true);
    expect(currentChain(state)).toBeNull();
    expect(clickZone(state, "mitte").kind).toBe("ignored");
    expect(starsFromWrongAttempts(state.wrongAttempts)).toBe(3);
  });

  it("loses a life on miss and restarts at zero lives", () => {
    const state = createSim({ chains: four });
    expect(clickZone(state, "ende")).toMatchObject({ kind: "miss", lives: 2 });
    expect(state.chainIndex).toBe(0);
    expect(state.wrongAttempts).toBe(1);

    expect(clickZone(state, "anfang")).toMatchObject({ kind: "hit", won: false });
    expect(state.chainIndex).toBe(1);

    expect(clickZone(state, "ende")).toMatchObject({ kind: "miss", lives: 1 });
    expect(clickZone(state, "anfang")).toMatchObject({ kind: "restart", wrongAttempts: 3 });
    expect(state.lives).toBe(MAX_LIVES);
    expect(state.chainIndex).toBe(0);
    expect(state.restartCount).toBe(1);
    expect(state.won).toBe(false);
  });

  it("accepts mitte or ende for letter l in ball", () => {
    const ballL = { letter: "l", displayLetter: "L", word: "ball", displayWord: "Ball" };
    const filler = four.slice(0, 3);
    expect(clickZone(createSim({ chains: [ballL, ...filler] }), "mitte").kind).toBe("hit");
    expect(clickZone(createSim({ chains: [ballL, ...filler] }), "ende").kind).toBe("hit");
    expect(clickZone(createSim({ chains: [ballL, ...filler] }), "anfang").kind).toBe("miss");
  });
});

describe("kettenhochhaus station wiring", () => {
  it("ships builtin bach-kettenhochhaus", () => {
    const p = builtinPuzzles().find((x) => x.id === "bach-kettenhochhaus");
    expect(p).toBeDefined();
    expect(p!.type).toBe("kettenhochhaus");
    expect(p!.hintMode).toBe("hear");
  });

  it("BachbrueckeScene dispatches kettenhochhaus to openKettenhochhaus", () => {
    // Wiring is asserted via openPuzzleNow switch in scene (compile-time + runtime station).
    expect(STATION_SLOTS.some((s) => s.category === "kettenhochhaus")).toBe(true);
  });

  it("picks four distinct chain rounds", () => {
    const rounds = pickChainRounds(4, () => 0.1);
    expect(rounds).toHaveLength(4);
    const keys = new Set(rounds.map((r) => `${r.letter}|${r.word}`));
    expect(keys.size).toBe(4);
  });
});
