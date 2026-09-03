import { ANLAUT_TILES } from "./logic/anlaut";
import { matchPuzzle } from "./logic/matchPuzzle";
import { TRACE_PASS, templatePath, traceScore } from "./logic/traceScore";
import type { Point, Puzzle } from "./logic/puzzleTypes";
import { shouldSpeakSolution, speakGerman, unlockSpeech, type SpeakFn } from "./logic/speech";

export type OverlayHandlers = {
  onSolved: (puzzle: Puzzle) => void;
  speak?: SpeakFn;
};

let current: Puzzle | null = null;
let stroke: Point[] = [];
let drawing = false;

export function isOverlayOpen(): boolean {
  return !document.getElementById("puzzle-overlay")?.classList.contains("hidden");
}

export function openPuzzle(puzzle: Puzzle, handlers: OverlayHandlers): void {
  current = puzzle;
  const root = document.getElementById("puzzle-overlay");
  const input = document.getElementById("puzzle-input") as HTMLInputElement | null;
  const prompt = document.getElementById("puzzle-prompt");
  const motif = document.getElementById("puzzle-motif");
  const hear = document.getElementById("puzzle-hear");
  const textRow = document.getElementById("puzzle-text-row");
  const trace = document.getElementById("puzzle-trace") as HTMLCanvasElement | null;
  const anlaut = document.getElementById("puzzle-anlaut");
  const err = document.getElementById("puzzle-error");
  if (!root || !input || !prompt || !motif || !hear || !textRow || !trace || !anlaut || !err) {
    return;
  }
  if (typeof speechSynthesis === "undefined" && puzzle.hintMode === "hear") {
    err.textContent = "Keine Vorlese-Stimme. Unter Windows eine deutsche Stimme aktivieren.";
  }
  input.value = "";
  input.classList.remove("wrong");
  prompt.textContent = puzzle.prompt;
  if (puzzle.hintMode === "hear" && puzzle.type !== "trace") {
    prompt.textContent = `${puzzle.prompt} Tippe auf „Wort hören“.`;
  }
  root.classList.remove("hidden");

  const speak = handlers.speak ?? speakGerman;
  const isTrace = puzzle.type === "trace";
  textRow.classList.toggle("hidden", isTrace);
  trace.classList.toggle("hidden", !isTrace);
  hear.textContent = "Wort hören";
  hear.classList.toggle("hidden", puzzle.hintMode !== "hear" || isTrace);
  motif.classList.toggle("hidden", puzzle.hintMode !== "motif");
  motif.innerHTML = puzzle.hintMode === "motif" ? motifSvg(puzzle.motifId) : "";
  anlaut.classList.toggle("hidden", puzzle.anlautVisible === false);
  renderAnlaut(anlaut, speak);

  const playWord = () => {
    unlockSpeech();
    if (shouldSpeakSolution(puzzle.hintMode, isTrace) || puzzle.hintMode === "hear") {
      speak(puzzle.voiceText);
    }
  };
  hear.onclick = (e) => {
    e.preventDefault();
    playWord();
  };

  if (shouldSpeakSolution(puzzle.hintMode, isTrace)) {
    window.setTimeout(playWord, 200);
  }

  if (isTrace) {
    setupTrace(trace, puzzle, handlers);
  } else {
    input.focus();
    const submit = () => {
      const result = matchPuzzle(puzzle, input.value);
      if (result.ok) {
        closePuzzle();
        handlers.onSolved(puzzle);
      } else {
        input.classList.add("wrong");
        err.textContent = "Noch einmal versuchen.";
      }
    };
    document.getElementById("puzzle-ok")!.onclick = submit;
    input.onkeydown = (e) => {
      if (e.key === "Enter") submit();
    };
  }
}

export function closePuzzle(): void {
  current = null;
  document.getElementById("puzzle-overlay")?.classList.add("hidden");
}

function renderAnlaut(host: HTMLElement, speak: SpeakFn): void {
  host.innerHTML = "";
  for (const tile of ANLAUT_TILES) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "anlaut-tile";
    b.textContent = `${tile.letters}\n${tile.word}`;
    b.addEventListener("click", () => speak(tile.speak));
    host.appendChild(b);
  }
}

function motifSvg(id?: string): string {
  if (id === "rope") {
    return `<svg viewBox="0 0 80 80" aria-hidden="true"><path d="M40 8c-8 16-8 24 0 40s8 24 0 32" fill="none" stroke="#6D4C41" stroke-width="6"/></svg>`;
  }
  if (id === "mech") {
    return `<svg viewBox="0 0 80 80"><rect x="22" y="18" width="36" height="48" rx="6" fill="#FFD600" stroke="#1A1A1A" stroke-width="3"/></svg>`;
  }
  return `<svg viewBox="0 0 120 60"><rect x="8" y="28" width="104" height="12" fill="#8D6E63" stroke="#1A1A1A" stroke-width="3"/></svg>`;
}

function setupTrace(canvas: HTMLCanvasElement, puzzle: Puzzle, handlers: OverlayHandlers): void {
  const kind = puzzle.traceTemplate ?? "bridge";
  const tmpl = templatePath(kind);
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  stroke = [];
  const redraw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.setLineDash([8, 8]);
    ctx.strokeStyle = "#90CAF9";
    ctx.lineWidth = 6;
    ctx.beginPath();
    tmpl.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.strokeStyle = "#1565C0";
    ctx.beginPath();
    stroke.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
    ctx.stroke();
  };
  redraw();
  const pt = (e: PointerEvent): Point => {
    const r = canvas.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };
  canvas.onpointerdown = (e) => {
    drawing = true;
    canvas.setPointerCapture(e.pointerId);
    stroke = [pt(e)];
    redraw();
  };
  canvas.onpointermove = (e) => {
    if (!drawing) return;
    stroke.push(pt(e));
    redraw();
  };
  canvas.onpointerup = () => {
    drawing = false;
    if (traceScore(stroke, tmpl) >= TRACE_PASS) {
      closePuzzle();
      handlers.onSolved(puzzle);
    } else {
      const err = document.getElementById("puzzle-error");
      if (err) err.textContent = "Etwas genauer nachzeichnen.";
    }
  };
  document.getElementById("puzzle-ok")!.onclick = () => {
    if (traceScore(stroke, tmpl) >= TRACE_PASS) {
      closePuzzle();
      handlers.onSolved(puzzle);
    }
  };
}
