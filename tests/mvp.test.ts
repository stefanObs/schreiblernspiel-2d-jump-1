import { describe, expect, it } from "vitest";
import { pickGermanVoice, shouldSpeakSolution, voiceClipPath, learnerSpeakText, LEARNER_SPEAK_RATE } from "../src/logic/speech";
import { shouldKeepWorldPaused } from "../src/logic/pause";
import { answersMatch, normalizeAnswer } from "../src/logic/normalizeAnswer";
import { matchPuzzle } from "../src/logic/matchPuzzle";
import { canJump, combineMove, jumpVelocity, moveSpeed, RESPAWN } from "../src/logic/playerRules";
import { ANLAUT_REQUIRED_IDS, ANLAUT_TILES, phoneticLautOnly } from "../src/logic/anlaut";
import { TRACE_PASS, templatePath, traceScore } from "../src/logic/traceScore";
import { builtinPuzzles, exportPuzzlesJson, freeTransformPuzzle, parsePuzzlesJson } from "../src/logic/puzzleStore";
import { motifArtPath, motifArtPaths } from "../src/logic/motifArt";
import { MECH_ART, MECH_CHARS, alternateShape, artPublicPath, shapeDisplayName, textureFor } from "../src/logic/mechCatalog";
import type { Puzzle } from "../src/logic/puzzleTypes";
import { starFillLevels, starsFromWrongAttempts } from "../src/logic/starRating";
import {
  airAngle,
  airScale,
  landOverlay,
  playerPose,
  poseAngle,
  poseScale,
  spawnMotion,
  takeoffOverlay,
} from "../src/logic/animState";
import {
  hintStageFromAttempts,
  scrambleLetters,
  syllableChars,
  syllableInitials,
} from "../src/logic/writingHints";
import {
  DEFAULT_WRITING_MODE,
  PRACTICE_REVEAL_AFTER,
  effectiveWritingUi,
  getEffectiveWritingMode,
  getSessionWritingModeOverride,
  isDebugMode,
  loadDebugMode,
  loadWritingMode,
  modeAppliesToPuzzleType,
  parseWritingMode,
  resetDebugModeCacheForTests,
  saveWritingMode,
  setDebugMode,
  setSessionWritingModeOverride,
  shouldRevealSolution,
  toggleDebugMode,
  writingModeUi,
} from "../src/logic/writingMode";

const word: Puzzle = builtinPuzzles()[0];

describe("normalizeAnswer", () => {
  it("trims, lowercases, maps ue to ü", () => {
    expect(normalizeAnswer("  Bruecke ")).toBe("brücke");
    expect(answersMatch("SEIL", "seil")).toBe(true);
  });
});

describe("playerRules", () => {
  it("allows jump only when grounded and not paused", () => {
    expect(canJump(true, false)).toBe(true);
    expect(canJump(false, false)).toBe(false);
    expect(canJump(true, true)).toBe(false);
  });
  it("keeps respawn and auto vs mech speeds", () => {
    expect(RESPAWN.x).toBe(300);
    expect(RESPAWN.y).toBe(948);
    expect(moveSpeed("auto")).toBeGreaterThan(moveSpeed("mech"));
    expect(Math.abs(jumpVelocity("auto"))).toBeLessThan(Math.abs(jumpVelocity("mech")));
  });
  it("merges pad and keyboard", () => {
    expect(combineMove({ left: false, right: true, jump: false }, { left: true, right: false, jump: true })).toEqual({
      left: true,
      right: true,
      jump: true,
    });
  });
});

describe("matchPuzzle", () => {
  it("spawns bridge only on match", () => {
    expect(matchPuzzle(word, "brücke").ok).toBe(true);
    expect(matchPuzzle(word, "brücke").effect).toBe("spawn_bridge");
    expect(matchPuzzle(word, "seil").ok).toBe(false);
  });
  it("plus and compare", () => {
    const plus = builtinPuzzles().find((p) => p.id === "bach-plus")!;
    const cmp = builtinPuzzles().find((p) => p.id === "bach-compare")!;
    expect(matchPuzzle(plus, "3").ok).toBe(true);
    expect(matchPuzzle(plus, "4").ok).toBe(false);
    expect(matchPuzzle(cmp, ">").ok).toBe(true);
    expect(matchPuzzle(cmp, "7").ok).toBe(true);
    expect(matchPuzzle(cmp, "<").ok).toBe(false);
  });
  it("transform auto uses motif only", () => {
    const auto = builtinPuzzles().find((p) => p.id === "bach-auto")!;
    expect(auto.hintMode).toBe("motif");
    expect(matchPuzzle(auto, "Auto").effect).toBe("transform_auto");
  });
  it("free Transformieren accepts mech names and auto/mech via images", () => {
    const free = freeTransformPuzzle();
    expect(free.hintMode).toBe("motif");
    expect(matchPuzzle(free, "Marina").effect).toBe("transform_marina");
    expect(matchPuzzle(free, "Rush").effect).toBe("transform_rush");
    expect(matchPuzzle(free, "Bolt").effect).toBe("transform_bolt");
    expect(matchPuzzle(free, "Auto").effect).toBe("transform_auto");
    expect(matchPuzzle(free, "Mech").effect).toBe("transform_mech");
    expect(matchPuzzle(free, "Schiff").ok).toBe(false);
  });
  it("name-word examples teach mech names with hear text", () => {
    const marina = builtinPuzzles().find((p) => p.id === "bach-marina-name")!;
    expect(marina.type).toBe("word");
    expect(marina.hintMode).toBe("hear");
    expect(matchPuzzle(marina, "Marina").effect).toBe("transform_marina");
  });
});

describe("speech policy", () => {
  it("speaks in hear mode and not for motif solution", () => {
    expect(shouldSpeakSolution("hear", false)).toBe(true);
    expect(shouldSpeakSolution("motif", false)).toBe(false);
  });
  it("prefers a de-DE voice", () => {
    const v = pickGermanVoice([
      { lang: "en-US" },
      { lang: "de-CH" },
      { lang: "de-DE" },
    ]);
    expect(v?.lang).toBe("de-DE");
  });
  it("maps hear words to bundled clips", () => {
    expect(voiceClipPath("Brücke")).toBe("/voice/bruecke.wav");
    expect(voiceClipPath("A wie Affe")).toBe("/voice/a-wie-affe.wav");
  });
  it("speaks the plain word at medium pace without syllable stress", () => {
    expect(LEARNER_SPEAK_RATE).toBeGreaterThanOrEqual(0.65);
    expect(LEARNER_SPEAK_RATE).toBeLessThanOrEqual(0.72);
    expect(learnerSpeakText("Brücke")).toBe("Brücke");
    expect(learnerSpeakText("Auto")).toBe("Auto");
  });
});

describe("anlaut", () => {
  it("has full catalog with one phonetic laut per tile (no wie / letter names)", () => {
    expect(ANLAUT_TILES.length).toBeGreaterThanOrEqual(ANLAUT_REQUIRED_IDS.length);
    for (const id of ANLAUT_REQUIRED_IDS) {
      expect(ANLAUT_TILES.some((t) => t.id === id)).toBe(true);
    }
    expect(
      ANLAUT_TILES.every(
        (t) => t.upper && t.lower && t.speak && t.word && t.region && !/\bwie\b/i.test(t.speak),
      ),
    ).toBe(true);
    expect(ANLAUT_TILES.every((t) => phoneticLautOnly(t.speak) === t.speak.trim())).toBe(true);
    const a = ANLAUT_TILES.find((t) => t.id === "a")!;
    expect(a.speak).toBe("aaa");
    expect(a.upper).toBe("A");
    expect(a.lower).toBe("a");
    const b = ANLAUT_TILES.find((t) => t.id === "b")!;
    expect(b.speak).toBe("buh");
    const green = ANLAUT_TILES.find((t) => t.id === "e-silent")!;
    expect(green.accent).toBe("green");
  });
  it("strips legacy wie-phrases to a single laut", () => {
    expect(phoneticLautOnly("aaa wie Affe")).toBe("aaa");
    expect(phoneticLautOnly("buh")).toBe("buh");
  });
});

describe("writingMode", () => {
  it("defaults to Buchstaben lernen and parses known ids", () => {
    expect(DEFAULT_WRITING_MODE).toBe("learn");
    expect(parseWritingMode(null)).toBe("learn");
    expect(parseWritingMode("free")).toBe("free");
    expect(parseWritingMode("nope")).toBe("learn");
  });
  it("persists via storage and restores", () => {
    const mem = new Map<string, string>();
    const storage = {
      getItem: (k: string) => mem.get(k) ?? null,
      setItem: (k: string, v: string) => {
        mem.set(k, v);
      },
      removeItem: (k: string) => {
        mem.delete(k);
      },
      clear: () => mem.clear(),
      key: () => null,
      length: 0,
    } as Storage;
    expect(loadWritingMode(storage)).toBe("learn");
    saveWritingMode("practice", storage);
    expect(loadWritingMode(storage)).toBe("practice");
  });
  it("exposes anlaut/copy/hint flags per mode", () => {
    expect(writingModeUi("learn")).toMatchObject({
      showAnlaut: true,
      showCopyBoxes: true,
      showProgressiveHints: false,
    });
    expect(writingModeUi("practice")).toMatchObject({
      showAnlaut: true,
      showCopyBoxes: false,
      showProgressiveHints: true,
      revealSolutionAfterAttempts: PRACTICE_REVEAL_AFTER,
    });
    expect(writingModeUi("free")).toMatchObject({
      showAnlaut: false,
      showCopyBoxes: false,
      showProgressiveHints: false,
    });
  });
  it("reveals practice solution after several wrongs", () => {
    expect(shouldRevealSolution("practice", PRACTICE_REVEAL_AFTER - 1)).toBe(false);
    expect(shouldRevealSolution("practice", PRACTICE_REVEAL_AFTER)).toBe(true);
    expect(shouldRevealSolution("learn", 10)).toBe(false);
    expect(effectiveWritingUi("practice", PRACTICE_REVEAL_AFTER).showCopyBoxes).toBe(true);
  });
  it("applies only to word and transform puzzles", () => {
    expect(modeAppliesToPuzzleType("word")).toBe(true);
    expect(modeAppliesToPuzzleType("transform")).toBe(true);
    expect(modeAppliesToPuzzleType("math")).toBe(false);
    expect(modeAppliesToPuzzleType("trace")).toBe(false);
  });
  it("toggles debug, persists in storage, and uses session override without saving writing mode", () => {
    resetDebugModeCacheForTests();
    const mem = new Map<string, string>();
    const storage = {
      getItem: (k: string) => mem.get(k) ?? null,
      setItem: (k: string, v: string) => {
        mem.set(k, v);
      },
      removeItem: (k: string) => {
        mem.delete(k);
      },
      clear: () => mem.clear(),
      key: () => null,
      length: 0,
    } as Storage;
    saveWritingMode("learn", storage);
    expect(toggleDebugMode(storage)).toBe(true);
    expect(loadDebugMode(storage)).toBe(true);
    setSessionWritingModeOverride("free");
    expect(getEffectiveWritingMode(storage)).toBe("free");
    expect(loadWritingMode(storage)).toBe("learn");

    resetDebugModeCacheForTests();
    expect(isDebugMode(storage)).toBe(true);

    setDebugMode(false, storage);
    expect(loadDebugMode(storage)).toBe(false);
    expect(getSessionWritingModeOverride()).toBeNull();
    expect(getEffectiveWritingMode(storage)).toBe("learn");
  });
});

describe("writingHints", () => {
  it("unlocks arcs, letters, then syllable initials every 2 wrongs", () => {
    expect(hintStageFromAttempts(0)).toBe("none");
    expect(hintStageFromAttempts(1)).toBe("none");
    expect(hintStageFromAttempts(2)).toBe("arcs");
    expect(hintStageFromAttempts(3)).toBe("arcs");
    expect(hintStageFromAttempts(4)).toBe("letters");
    expect(hintStageFromAttempts(5)).toBe("letters");
    expect(hintStageFromAttempts(6)).toBe("initials");
  });
  it("derives chars and initials from syllables", () => {
    expect(syllableChars(["Brü", "cke"])).toEqual(["B", "r", "ü", "c", "k", "e"]);
    expect(syllableInitials(["Brü", "cke"])).toEqual(["B", "c"]);
  });
  it("scrambles deterministically without dropping letters", () => {
    const chars = ["B", "r", "ü", "c", "k", "e"];
    const a = scrambleLetters(chars, 42);
    const b = scrambleLetters(chars, 42);
    expect(a).toEqual(b);
    expect([...a].sort()).toEqual([...chars].sort());
    expect(a.join("")).not.toBe(chars.join(""));
  });
  it("stores syllables on hear/motif word puzzles", () => {
    expect(builtinPuzzles().find((p) => p.id === "bach-bruecke-hear")?.syllables).toEqual(["Brü", "cke"]);
    expect(builtinPuzzles().find((p) => p.id === "bach-auto")?.syllables).toEqual(["Au", "to"]);
  });
});

describe("trace", () => {
  it("passes near template and fails empty stroke", () => {
    const tmpl = templatePath("bridge");
    expect(traceScore([], tmpl)).toBe(0);
    expect(traceScore(tmpl, tmpl)).toBeGreaterThanOrEqual(TRACE_PASS);
  });
});

describe("pause", () => {
  it("keeps the world paused on a wrong answer", () => {
    expect(shouldKeepWorldPaused(false)).toBe(true);
    expect(shouldKeepWorldPaused(true)).toBe(false);
  });
});

describe("animState", () => {
  it("uses idle when paused or standing, walk when moving, air when off ground", () => {
    expect(playerPose(true, 0, true)).toBe("idle");
    expect(playerPose(true, 0, false)).toBe("idle");
    expect(playerPose(true, 80, false)).toBe("walk");
    expect(playerPose(false, 80, false)).toBe("air");
  });
  it("squishes walk more than idle and stretches in air", () => {
    const idle = poseScale("idle", 0, "mech");
    const walkAuto = poseScale("walk", 75, "auto");
    const walkMech = poseScale("walk", 75, "mech");
    const airUp = poseScale("air", 0, "mech", -780);
    expect(walkAuto.y).toBeLessThan(idle.y);
    expect(walkMech).toEqual({ x: 1, y: 1 });
    expect(airUp.y).toBeGreaterThan(1);
  });
  it("gives the auto a bouncy drive lean while rolling", () => {
    const drive = poseScale("walk", 65, "auto");
    const right = poseAngle("walk", false, 0, "auto");
    const left = poseAngle("walk", true, 0, "auto");
    expect(drive.y).toBeLessThan(1);
    expect(right).toBeLessThan(0);
    expect(left).toBeGreaterThan(0);
  });
  it("stretches on rise, floats at apex, and foreshortens on fall", () => {
    const up = airScale(-780, "mech");
    const apex = airScale(0, "mech");
    const down = airScale(700, "mech");
    expect(up.y).toBeGreaterThan(apex.y);
    expect(up.x).toBeLessThan(apex.x);
    expect(down.x).toBeGreaterThan(apex.x);
    expect(down.y).toBeLessThan(apex.y);
  });
  it("leans back ascending and forward falling", () => {
    expect(airAngle(-780, false, "mech")).toBeLessThan(0);
    expect(airAngle(700, false, "mech")).toBeGreaterThan(0);
    expect(airAngle(-780, true, "mech")).toBeGreaterThan(0);
  });
  it("kicks stretch on takeoff and squashes then rebounds on land", () => {
    const kick = takeoffOverlay(0)!;
    expect(kick.y).toBeGreaterThan(1);
    expect(kick.x).toBeLessThan(1);
    expect(takeoffOverlay(200)).toBeNull();
    const impact = landOverlay(40)!;
    const rebound = landOverlay(180)!;
    expect(impact.y).toBeLessThan(1);
    expect(impact.x).toBeGreaterThan(1);
    expect(rebound.y).toBeGreaterThan(1);
    expect(landOverlay(400)).toBeNull();
  });
  it("drops ropes from higher than bridges", () => {
    expect(spawnMotion("rope").fromY).toBeLessThan(spawnMotion("bridge").fromY);
  });
});

describe("motif art", () => {
  it("maps word and transform puzzles to in-game sprites", () => {
    const bridge = builtinPuzzles().find((p) => p.id === "bach-bruecke-hear")!;
    const seil = builtinPuzzles().find((p) => p.id === "bach-seil-motif")!;
    const auto = builtinPuzzles().find((p) => p.id === "bach-auto")!;
    const mech = builtinPuzzles().find((p) => p.id === "bach-mech")!;
    const marina = builtinPuzzles().find((p) => p.id === "bach-transform-marina")!;
    const math = builtinPuzzles().find((p) => p.id === "bach-plus")!;
    expect(motifArtPath(bridge)).toBe("/art/prop_bridge.png");
    expect(motifArtPath(seil)).toBe("/art/prop_rope.png");
    expect(motifArtPath(auto)).toBe("/art/bolt_vehicle_side.png");
    expect(motifArtPath(mech)).toBe("/art/bolt_mech_side.png");
    expect(motifArtPath(marina)).toBe("/art/marina_mech_side.png");
    expect(motifArtPath(math)).toBeNull();
  });
  it("shows several mech images for free transform", () => {
    const paths = motifArtPaths(freeTransformPuzzle());
    expect(paths.length).toBeGreaterThanOrEqual(4);
    expect(paths).toContain("/art/marina_mech_side.png");
    expect(paths).toContain("/art/rush_mech_side.png");
  });
});

describe("mech catalog", () => {
  it("has bolt marina rush with mech and auto textures", () => {
    expect(MECH_CHARS).toEqual(["bolt", "marina", "rush"]);
    expect(textureFor("marina", "mech")).toBe(MECH_ART.marina.mechKey);
    expect(textureFor("rush", "auto")).toBe(MECH_ART.rush.autoKey);
  });
  it("maps the transform button to the other form of the current mech", () => {
    expect(alternateShape("mech")).toBe("auto");
    expect(alternateShape("auto")).toBe("mech");
    expect(shapeDisplayName("auto")).toBe("Auto");
    expect(artPublicPath("bolt", "auto")).toBe("/art/bolt_vehicle_side.png");
    expect(artPublicPath("marina", "mech")).toBe("/art/marina_mech_side.png");
  });
});

describe("starRating", () => {
  it("starts at 3 and loses half a star per 2 wrong tries", () => {
    expect(starsFromWrongAttempts(0)).toBe(3);
    expect(starsFromWrongAttempts(1)).toBe(3);
    expect(starsFromWrongAttempts(2)).toBe(2.5);
    expect(starsFromWrongAttempts(3)).toBe(2.5);
    expect(starsFromWrongAttempts(4)).toBe(2);
    expect(starsFromWrongAttempts(8)).toBe(1);
    expect(starsFromWrongAttempts(20)).toBe(1);
  });
  it("maps to full half and empty star slots", () => {
    expect(starFillLevels(3)).toEqual(["full", "full", "full"]);
    expect(starFillLevels(2.5)).toEqual(["full", "full", "half"]);
    expect(starFillLevels(1)).toEqual(["full", "empty", "empty"]);
  });
});

describe("puzzle json", () => {
  it("roundtrips export/parse", () => {
    const json = exportPuzzlesJson(builtinPuzzles());
    expect(parsePuzzlesJson(json).length).toBe(builtinPuzzles().length);
  });
});
