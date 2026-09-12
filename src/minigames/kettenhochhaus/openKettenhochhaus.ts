import type { Puzzle } from "../../logic/puzzleTypes";
import { speakGerman, type SpeakFn } from "../../logic/speech";
import { starFillLevels, starsFromWrongAttempts } from "../../logic/starRating";
import { realizeKettenhochhausPuzzle } from "./chainList";
import { KettenhochhausApp } from "./render/KettenhochhausScene";
import type { ClickResult } from "./sim";
import type { ChainRound, ChainZone, KettenhochhausConfig } from "./types";
import { ZONE_LABELS } from "./types";

export type KettenhochhausHandlers = {
  onSolved: (puzzle: Puzzle, stars: number) => void;
  speak?: SpeakFn;
};

let app: KettenhochhausApp | null = null;
let resizeObs: ResizeObserver | null = null;
let feedbackClearTimer = 0;
let activeChains: ChainRound[] = [];
let activePuzzle: Puzzle | null = null;
/** Tear down prior open so reopen does not stack DOM listeners. */
let previousCleanup: (() => void) | null = null;

export function isKettenhochhausOpen(): boolean {
  return !document.getElementById("kettenhochhaus-overlay")?.classList.contains("hidden");
}

function configFromChains(chains: ChainRound[], puzzle: Puzzle): KettenhochhausConfig {
  return {
    chains,
    prompt: puzzle.prompt,
    voiceText: puzzle.voiceText,
    effect: puzzle.effect,
  };
}

function showStars(wrong: number): number {
  const stars = starsFromWrongAttempts(wrong);
  const panel = document.getElementById("kettenhochhaus-success");
  const row = document.getElementById("kettenhochhaus-stars");
  if (panel && row) {
    row.replaceChildren();
    for (const level of starFillLevels(stars)) {
      const s = document.createElement("span");
      s.className =
        level === "full"
          ? "success-star"
          : level === "half"
            ? "success-star success-star-half"
            : "success-star success-star-empty";
      s.textContent = "★";
      row.append(s);
    }
    panel.classList.remove("hidden");
  }
  return stars;
}

function updateLives(lives: number): void {
  const el = document.getElementById("kettenhochhaus-lives");
  if (!el) return;
  el.textContent = `Leben: ${lives}`;
  el.classList.toggle("has-misses", lives < 3);
  if (lives < 3) {
    el.classList.remove("has-misses");
    void el.offsetWidth;
    el.classList.add("has-misses");
  }
}

function showFeedback(result: ClickResult): void {
  const feedbackEl = document.getElementById("kettenhochhaus-feedback");
  if (!feedbackEl) return;
  window.clearTimeout(feedbackClearTimer);
  feedbackEl.classList.remove("feedback-hit", "feedback-miss");
  if (result.kind === "miss") {
    feedbackEl.textContent = "Daneben — ein Leben weniger!";
    void feedbackEl.offsetWidth;
    feedbackEl.classList.add("feedback-miss");
  } else if (result.kind === "restart") {
    feedbackEl.textContent = "Keine Leben mehr — von vorn!";
    void feedbackEl.offsetWidth;
    feedbackEl.classList.add("feedback-miss");
  } else if (result.kind === "hit") {
    feedbackEl.textContent = result.won ? "Hochhaus gelöscht!" : "Kette durchschlagen!";
    void feedbackEl.offsetWidth;
    feedbackEl.classList.add("feedback-hit");
  } else {
    feedbackEl.textContent = "";
    return;
  }
  feedbackClearTimer = window.setTimeout(() => {
    feedbackEl.classList.remove("feedback-hit", "feedback-miss");
    const keep = result.kind === "hit" && result.won;
    if (!keep) feedbackEl.textContent = "";
  }, 900);
}

function speakCurrent(speak: SpeakFn): void {
  const word = document.getElementById("kettenhochhaus-word")?.textContent?.trim();
  if (word) void speak(word);
}

export function openKettenhochhaus(puzzle: Puzzle, handlers: KettenhochhausHandlers): void {
  previousCleanup?.();
  previousCleanup = null;

  const realized = realizeKettenhochhausPuzzle(puzzle);
  puzzle = realized.puzzle;
  activeChains = realized.chains;
  activePuzzle = puzzle;

  const root = document.getElementById("kettenhochhaus-overlay");
  const canvas = document.getElementById("kettenhochhaus-canvas") as HTMLCanvasElement | null;
  const progressEl = document.getElementById("kettenhochhaus-progress");
  const letterEl = document.getElementById("kettenhochhaus-letter");
  const promptEl = document.getElementById("kettenhochhaus-prompt");
  const feedbackEl = document.getElementById("kettenhochhaus-feedback");
  const success = document.getElementById("kettenhochhaus-success");
  if (!root || !canvas || !promptEl) return;

  success?.classList.add("hidden");
  if (feedbackEl) {
    feedbackEl.textContent = "";
    feedbackEl.classList.remove("feedback-hit", "feedback-miss");
  }
  updateLives(3);
  promptEl.textContent =
    puzzle.prompt || "Klicke Anfang, Mitte oder Ende — wo steckt der Buchstabe?";
  root.classList.remove("hidden");

  const speak: SpeakFn = handlers.speak ?? speakGerman;
  if (puzzle.voiceText) void speak(puzzle.voiceText);

  let stars = 3;
  app?.dispose();
  app = new KettenhochhausApp(canvas, configFromChains(activeChains, puzzle), {
    onProgress: ({ progressLabel, letter, displayWord, lives }) => {
      if (progressEl) progressEl.textContent = progressLabel;
      if (letterEl) letterEl.textContent = letter;
      const wordEl = document.getElementById("kettenhochhaus-word");
      if (wordEl) wordEl.textContent = displayWord;
      updateLives(lives);
    },
    onClick: (result) => {
      showFeedback(result);
      if (result.kind === "miss") updateLives(result.lives);
      if (result.kind === "restart") updateLives(3);
      if (result.kind === "hit" && !result.won) {
        const next = activeChains[result.chainIndex];
        if (next?.displayWord) void speak(next.displayWord);
      }
    },
    onWon: (wrong) => {
      stars = showStars(wrong);
    },
  });
  void app.start();

  const onResize = () => app?.resize();
  window.addEventListener("resize", onResize);
  resizeObs?.disconnect();
  resizeObs = new ResizeObserver(onResize);
  resizeObs.observe(root);

  const continueBtn = document.getElementById("kettenhochhaus-continue");
  const hearBtn = document.getElementById("kettenhochhaus-hear");
  const zoneButtons = Array.from(
    document.querySelectorAll<HTMLButtonElement>("#kettenhochhaus-zones [data-zone]"),
  );

  const onZoneClick = (e: Event) => {
    const btn = e.currentTarget as HTMLButtonElement;
    const zone = btn.dataset.zone as ChainZone | undefined;
    if (!zone || !(zone in ZONE_LABELS)) return;
    app?.chooseZone(zone);
  };

  const closeCleanup = () => {
    window.clearTimeout(feedbackClearTimer);
    window.removeEventListener("resize", onResize);
    resizeObs?.disconnect();
    resizeObs = null;
    app?.dispose();
    app = null;
    activeChains = [];
    activePuzzle = null;
    root.classList.add("hidden");
    continueBtn?.removeEventListener("click", onContinue);
    hearBtn?.removeEventListener("click", onHear);
    for (const btn of zoneButtons) btn.removeEventListener("click", onZoneClick);
    if (previousCleanup === closeCleanup) previousCleanup = null;
  };
  previousCleanup = closeCleanup;

  const onContinue = () => {
    const p = activePuzzle ?? puzzle;
    closeCleanup();
    handlers.onSolved(p, stars);
  };
  const onHear = () => speakCurrent(speak);

  continueBtn?.addEventListener("click", onContinue);
  hearBtn?.addEventListener("click", onHear);
  for (const btn of zoneButtons) btn.addEventListener("click", onZoneClick);
}
