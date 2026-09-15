import type { CharacterId } from "../../logic/playerRules";
import type { Puzzle } from "../../logic/puzzleTypes";
import { speakGerman, type SpeakFn } from "../../logic/speech";
import { starFillLevels, starsFromWrongAttempts } from "../../logic/starRating";
import { applyFliegerMission, configFromPuzzle } from "./mission";
import { BuchstabenfliegerApp } from "./render";
import type { ArrivalResult, PromptResult, ShotResult } from "./sim";
import type { BuchstabenfliegerHandlers } from "./types";

let app: BuchstabenfliegerApp | null = null;
let resizeObs: ResizeObserver | null = null;
let feedbackClearTimer = 0;
let winPanelTimer = 0;

export function isBuchstabenfliegerOpen(): boolean {
  return !document.getElementById("buchstabenflieger-overlay")?.classList.contains("hidden");
}

function showStars(wrong: number, displayWord: string): number {
  const stars = starsFromWrongAttempts(wrong);
  const panel = document.getElementById("buchstabenflieger-success");
  const row = document.getElementById("buchstabenflieger-stars");
  const wordEl = document.getElementById("buchstabenflieger-success-word");
  if (wordEl) wordEl.textContent = displayWord;
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
    panel.classList.remove("celebrate-in");
    void panel.offsetWidth;
    panel.classList.add("celebrate-in");
  }
  return stars;
}

function updateMisses(wrong: number): void {
  const el = document.getElementById("buchstabenflieger-misses");
  if (!el) return;
  el.textContent = `Fehlversuche: ${wrong}`;
  el.classList.toggle("has-misses", wrong > 0);
}

function setFeedback(text: string, kind: "hit" | "miss" | ""): void {
  const feedbackEl = document.getElementById("buchstabenflieger-feedback");
  const root = document.getElementById("buchstabenflieger-overlay");
  if (!feedbackEl) return;
  window.clearTimeout(feedbackClearTimer);
  feedbackEl.classList.remove("feedback-hit", "feedback-miss");
  root?.classList.remove("miss-flash");
  feedbackEl.textContent = text;
  if (kind === "hit") feedbackEl.classList.add("feedback-hit");
  if (kind === "miss") {
    feedbackEl.classList.add("feedback-miss");
    root?.classList.add("miss-flash");
  }
  if (!text) return;
  feedbackClearTimer = window.setTimeout(() => {
    feedbackEl.classList.remove("feedback-hit", "feedback-miss");
    root?.classList.remove("miss-flash");
    feedbackEl.textContent = "";
  }, 1100);
}

function syncPromptUi(phase: string): void {
  const radar = document.getElementById("buchstabenflieger-radar-actions");
  const lane = document.getElementById("buchstabenflieger-lane-actions");
  const flight = document.getElementById("buchstabenflieger-flight-actions");
  radar?.classList.toggle("hidden", phase !== "radar_prompt");
  lane?.classList.toggle("hidden", phase !== "lane_prompt");
  flight?.classList.toggle("hidden", phase !== "radar_wave" && phase !== "armor_wave");
}

export function openBuchstabenflieger(puzzle: Puzzle, handlers: BuchstabenfliegerHandlers): void {
  puzzle = applyFliegerMission(puzzle);
  const root = document.getElementById("buchstabenflieger-overlay");
  const canvas = document.getElementById("buchstabenflieger-canvas") as HTMLCanvasElement | null;
  const promptEl = document.getElementById("buchstabenflieger-prompt");
  const progressEl = document.getElementById("buchstabenflieger-progress");
  const success = document.getElementById("buchstabenflieger-success");
  if (!root || !canvas || !promptEl || !progressEl) return;

  success?.classList.add("hidden");
  setFeedback("", "");
  updateMisses(0);
  const wordEl = document.getElementById("buchstabenflieger-word");
  if (wordEl) wordEl.textContent = (puzzle.voiceText || puzzle.solution || "").trim();
  promptEl.textContent = puzzle.prompt || "Fliege und nutze die Buchstaben-Booster.";
  root.classList.remove("hidden");

  const speak: SpeakFn = handlers.speak ?? speakGerman;
  if (puzzle.voiceText) void speak(puzzle.voiceText);

  const character: CharacterId = handlers.character ?? "bolt";
  const config = configFromPuzzle(puzzle);
  let stars = 3;
  const displayWord = (puzzle.voiceText || puzzle.solution || "").trim();

  app?.dispose();
  window.clearTimeout(winPanelTimer);
  app = new BuchstabenfliegerApp(canvas, config, character, {
    onHud: (info) => {
      progressEl.textContent = info.progress;
      updateMisses(info.wrongAttempts);
      syncPromptUi(info.phase);
      if (info.phase === "radar_prompt") {
        promptEl.textContent = `Steckt ${info.radarLetter} in ${info.word}?`;
      } else if (info.phase === "lane_prompt") {
        promptEl.textContent = `Wo steckt ${info.positionLetter} in ${info.word}?`;
      } else if (info.phase === "radar_wave") {
        promptEl.textContent = "Schieße nur Buchstaben, die im Wort stecken!";
      } else if (info.phase === "armor_wave") {
        promptEl.textContent = "Schieße den Panzer aus der richtigen Spur!";
      }
      if (wordEl) wordEl.textContent = info.word;
    },
    onPrompt: (result: PromptResult) => {
      if (result.kind === "correct") setFeedback("Booster bereit!", "hit");
      else if (result.kind === "wrong") {
        setFeedback("Noch einmal!", "miss");
        updateMisses(result.wrongAttempts);
      }
    },
    onShot: (result: ShotResult) => {
      if (result.kind === "hit") {
        setFeedback(result.won ? "Geschafft!" : "Treffer!", "hit");
      } else if (result.kind === "miss") {
        setFeedback(
          result.reason === "distractor"
            ? "Falscher Buchstabe!"
            : "Falsche Spur!",
          "miss",
        );
        updateMisses(result.wrongAttempts);
      }
    },
    onArrival: (result: ArrivalResult) => {
      if (result.kind === "crash") {
        setFeedback("Autsch — Kollision!", "miss");
        updateMisses(result.wrongAttempts);
      } else if (result.kind === "dodge") {
        setFeedback("Gut ausgewichen!", "hit");
      }
    },
    onWon: (wrong) => {
      if (puzzle.voiceText) void speak(puzzle.voiceText);
      winPanelTimer = window.setTimeout(() => {
        stars = showStars(wrong, displayWord);
      }, 900);
    },
  });
  app.start();
  syncPromptUi("radar_prompt");

  const onResize = () => app?.resize();
  window.addEventListener("resize", onResize);
  resizeObs?.disconnect();
  resizeObs = new ResizeObserver(onResize);
  resizeObs.observe(root);

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") {
      e.preventDefault();
      app?.moveUp();
    } else if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") {
      e.preventDefault();
      app?.moveDown();
    } else if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      app?.fire();
    }
  };
  window.addEventListener("keydown", onKeyDown);

  const upBtn = document.getElementById("buchstabenflieger-up");
  const downBtn = document.getElementById("buchstabenflieger-down");
  const fireBtn = document.getElementById("buchstabenflieger-fire");
  const yesBtn = document.getElementById("buchstabenflieger-yes");
  const noBtn = document.getElementById("buchstabenflieger-no");
  const zoneBtns = [
    ...document.querySelectorAll<HTMLButtonElement>("#buchstabenflieger-lane-actions [data-zone]"),
  ];

  const onUp = (e: Event) => {
    e.preventDefault();
    app?.moveUp();
  };
  const onDown = (e: Event) => {
    e.preventDefault();
    app?.moveDown();
  };
  const onFire = (e: Event) => {
    e.preventDefault();
    app?.fire();
  };
  const onYes = (e: Event) => {
    e.preventDefault();
    app?.answerRadarYes();
  };
  const onNo = (e: Event) => {
    e.preventDefault();
    app?.answerRadarNo();
  };

  upBtn?.addEventListener("pointerdown", onUp);
  downBtn?.addEventListener("pointerdown", onDown);
  fireBtn?.addEventListener("pointerdown", onFire);
  yesBtn?.addEventListener("pointerdown", onYes);
  noBtn?.addEventListener("pointerdown", onNo);
  for (const btn of zoneBtns) {
    btn.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      const zone = btn.dataset.zone as "anfang" | "mitte" | "ende" | undefined;
      if (zone) app?.answerZone(zone);
    });
  }

  const continueBtn = document.getElementById("buchstabenflieger-continue");
  const hearBtn = document.getElementById("buchstabenflieger-hear");
  const closeCleanup = () => {
    window.clearTimeout(feedbackClearTimer);
    window.clearTimeout(winPanelTimer);
    window.removeEventListener("resize", onResize);
    window.removeEventListener("keydown", onKeyDown);
    upBtn?.removeEventListener("pointerdown", onUp);
    downBtn?.removeEventListener("pointerdown", onDown);
    fireBtn?.removeEventListener("pointerdown", onFire);
    yesBtn?.removeEventListener("pointerdown", onYes);
    noBtn?.removeEventListener("pointerdown", onNo);
    resizeObs?.disconnect();
    resizeObs = null;
    app?.dispose();
    app = null;
    root.classList.add("hidden");
    success?.classList.add("hidden");
    success?.classList.remove("celebrate-in");
    continueBtn?.removeEventListener("click", onContinue);
    hearBtn?.removeEventListener("click", onHear);
  };

  const onContinue = () => {
    closeCleanup();
    handlers.onSolved(puzzle, stars);
  };
  const onHear = () => {
    if (puzzle.voiceText) void speak(puzzle.voiceText);
  };
  continueBtn?.addEventListener("click", onContinue);
  hearBtn?.addEventListener("click", onHear);
}
