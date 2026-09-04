import { ANLAUT_TILES } from "./logic/anlaut";
import { matchPuzzle } from "./logic/matchPuzzle";
import { motifArtPaths } from "./logic/motifArt";
import { starFillLevels, starsFromWrongAttempts } from "./logic/starRating";
import { TRACE_PASS, templatePath, traceScore } from "./logic/traceScore";
import type { Point, Puzzle } from "./logic/puzzleTypes";
import { speakAnlaut, speakGerman, type SpeakFn } from "./logic/speech";
import {
  hintStageFromAttempts,
  scrambleLetters,
  syllableChars,
  syllableInitials,
  type HintStage,
} from "./logic/writingHints";
import {
  WRITING_MODES,
  WRITING_MODE_LABELS,
  effectiveWritingUi,
  getEffectiveWritingMode,
  isDebugMode,
  modeAppliesToPuzzleType,
  setSessionWritingModeOverride,
  type WritingMode,
} from "./logic/writingMode";

export type OverlayHandlers = {
  onSolved: (puzzle: Puzzle, stars: number) => void;
  speak?: SpeakFn;
};

let current: Puzzle | null = null;
let stroke: Point[] = [];
let drawing = false;
let wrongAttempts = 0;
let scrambledCache: string[] | null = null;
let speakFn: SpeakFn = speakGerman;
let autoSpokeThisOpen = false;

export function isOverlayOpen(): boolean {
  return !document.getElementById("puzzle-overlay")?.classList.contains("hidden");
}

export function openPuzzle(puzzle: Puzzle, handlers: OverlayHandlers): void {
  current = puzzle;
  wrongAttempts = 0;
  scrambledCache = null;
  autoSpokeThisOpen = false;
  speakFn = handlers.speak ?? speakGerman;

  const root = document.getElementById("puzzle-overlay");
  const panel = document.getElementById("puzzle-panel");
  const success = document.getElementById("puzzle-success");
  const input = document.getElementById("puzzle-input") as HTMLInputElement | null;
  const prompt = document.getElementById("puzzle-prompt");
  const motif = document.getElementById("puzzle-motif");
  const hear = document.getElementById("puzzle-hear");
  const textRow = document.getElementById("puzzle-text-row");
  const trace = document.getElementById("puzzle-trace") as HTMLCanvasElement | null;
  const anlaut = document.getElementById("puzzle-anlaut");
  const hints = document.getElementById("puzzle-hints");
  const err = document.getElementById("puzzle-error");
  if (
    !root ||
    !panel ||
    !success ||
    !input ||
    !prompt ||
    !motif ||
    !hear ||
    !textRow ||
    !trace ||
    !anlaut ||
    !hints ||
    !err
  ) {
    return;
  }

  ensureDebugControls(root);
  err.textContent = "";
  input.value = "";
  input.classList.remove("wrong");
  success.classList.add("hidden");
  panel.classList.remove("hidden");
  anlaut.classList.remove("success-dim");
  root.classList.remove("hidden");

  const isTrace = puzzle.type === "trace";
  textRow.classList.toggle("hidden", isTrace);
  trace.classList.toggle("hidden", !isTrace);

  const arts = motifArtPaths(puzzle);
  motif.classList.toggle("hidden", arts.length === 0);
  motif.innerHTML = arts
    .map((src) => `<img src="${src}" alt="" decoding="async" class="puzzle-motif-img" />`)
    .join("");
  motif.classList.toggle("motif-strip", arts.length > 1);

  hear.textContent = "Wort hören";
  hear.onclick = () => speakFn(puzzle.voiceText);

  let solvedEffect = puzzle.effect;

  const finishOk = () => {
    const stars = starsFromWrongAttempts(wrongAttempts);
    const solvedPuzzle = { ...puzzle, effect: solvedEffect };
    showSuccess(solvedPuzzle, stars, () => {
      closePuzzle();
      handlers.onSolved(solvedPuzzle, stars);
    });
  };

  if (isTrace) {
    setupTrace(trace, puzzle, finishOk);
  } else {
    input.focus();
    const submit = () => {
      const result = matchPuzzle(puzzle, input.value);
      if (result.ok) {
        solvedEffect = result.effect === "none" ? puzzle.effect : result.effect;
        finishOk();
      } else {
        wrongAttempts += 1;
        input.classList.add("wrong");
        err.textContent = "Noch einmal versuchen.";
        applyWritingModeUi();
      }
    };
    document.getElementById("puzzle-ok")!.onclick = submit;
    input.onkeydown = (e) => {
      if (e.key === "Enter") submit();
    };
  }

  applyWritingModeUi();
}

/** Re-apply mode UI after Settings / Debug / F1 changes while overlay is open. */
export function refreshWritingModeUi(): void {
  if (!current || !isOverlayOpen()) return;
  applyWritingModeUi();
}

export function closePuzzle(): void {
  current = null;
  wrongAttempts = 0;
  scrambledCache = null;
  autoSpokeThisOpen = false;
  document.getElementById("puzzle-success")?.classList.add("hidden");
  document.getElementById("puzzle-panel")?.classList.remove("hidden");
  document.getElementById("puzzle-anlaut")?.classList.remove("success-dim");
  document.getElementById("puzzle-overlay")?.classList.add("hidden");
  document.getElementById("puzzle-debug")?.classList.add("hidden");
}

function applyWritingModeUi(): void {
  const puzzle = current;
  if (!puzzle) return;

  const mode = getEffectiveWritingMode();
  const modeOn = modeAppliesToPuzzleType(puzzle.type);
  const ui = modeOn
    ? effectiveWritingUi(mode, wrongAttempts)
    : {
        showAnlaut: puzzle.anlautVisible !== false,
        showCopyBoxes: false,
        showProgressiveHints: false,
        revealSolutionAfterAttempts: null,
      };

  const prompt = document.getElementById("puzzle-prompt");
  const hear = document.getElementById("puzzle-hear");
  const anlaut = document.getElementById("puzzle-anlaut");
  const hints = document.getElementById("puzzle-hints");
  const err = document.getElementById("puzzle-error");
  if (!prompt || !hear || !anlaut || !hints) return;

  const isTrace = puzzle.type === "trace";
  const learnSpeak = modeOn && mode === "learn" && !isTrace;

  if (learnSpeak) {
    prompt.textContent = `${puzzle.prompt} Schreib die Buchstaben ab.`;
  } else if (puzzle.hintMode === "hear" && !isTrace) {
    prompt.textContent = `${puzzle.prompt} Tippe auf „Wort hören“.`;
  } else {
    prompt.textContent = puzzle.prompt;
  }

  // Learn mode always offers hearing; otherwise follow station hintMode.
  const showHear = !isTrace && (learnSpeak || puzzle.hintMode === "hear");
  hear.classList.toggle("hidden", !showHear);
  if (learnSpeak && !autoSpokeThisOpen) {
    autoSpokeThisOpen = true;
    speakFn(puzzle.voiceText);
  }

  const showAnlaut = modeOn ? ui.showAnlaut : puzzle.anlautVisible !== false;
  anlaut.classList.toggle("hidden", !showAnlaut);
  if (showAnlaut) renderAnlaut(anlaut, speakFn);
  else anlaut.innerHTML = "";

  if (ui.showCopyBoxes && modeOn && !isTrace) {
    renderCopyBoxes(hints, puzzle, mode === "practice");
  } else if (ui.showProgressiveHints && modeOn && !isTrace) {
    const stage = hintStageFromAttempts(wrongAttempts);
    if (stage === "letters" || stage === "initials") ensureScrambled(puzzle);
    renderWritingHints(hints, puzzle, stage);
  } else {
    hints.innerHTML = "";
    hints.classList.add("hidden");
  }

  if (
    err &&
    modeOn &&
    mode === "practice" &&
    ui.showCopyBoxes &&
    wrongAttempts > 0
  ) {
    err.textContent = "Tipp: So schreibt man das Wort — du kannst es abschreiben.";
  }

  syncDebugControls(mode);
  const badge = document.getElementById("debug-badge");
  if (badge && isDebugMode()) {
    badge.textContent = `DEBUG (F1) · ${WRITING_MODE_LABELS[mode]}`;
  }
}

function ensureDebugControls(root: HTMLElement): void {
  if (document.getElementById("puzzle-debug")) return;
  const bar = document.createElement("div");
  bar.id = "puzzle-debug";
  bar.className = "hidden";
  bar.innerHTML = `
    <label for="puzzle-debug-mode">Debug-Modus</label>
    <select id="puzzle-debug-mode"></select>
  `;
  const select = bar.querySelector("#puzzle-debug-mode") as HTMLSelectElement;
  for (const m of WRITING_MODES) {
    const opt = document.createElement("option");
    opt.value = m;
    opt.textContent = WRITING_MODE_LABELS[m];
    select.appendChild(opt);
  }
  select.addEventListener("change", () => {
    setSessionWritingModeOverride(select.value as WritingMode);
    applyWritingModeUi();
  });
  root.insertBefore(bar, root.firstChild);
}

function syncDebugControls(mode: WritingMode): void {
  const bar = document.getElementById("puzzle-debug");
  const select = document.getElementById("puzzle-debug-mode") as HTMLSelectElement | null;
  if (!bar || !select) return;
  const show = isDebugMode() && !!current;
  bar.classList.toggle("hidden", !show);
  if (show) select.value = mode;
}

function showSuccess(_puzzle: Puzzle, stars: number, onContinue: () => void): void {
  const panel = document.getElementById("puzzle-panel");
  const success = document.getElementById("puzzle-success");
  const starsHost = document.getElementById("success-stars");
  const title = document.getElementById("success-title");
  const sub = document.getElementById("success-sub");
  const cont = document.getElementById("success-continue") as HTMLButtonElement | null;
  const anlaut = document.getElementById("puzzle-anlaut");
  if (!panel || !success || !starsHost || !title || !sub || !cont) {
    onContinue();
    return;
  }
  panel.classList.add("hidden");
  document.getElementById("puzzle-debug")?.classList.add("hidden");
  anlaut?.classList.add("success-dim");
  success.classList.remove("hidden");
  success.classList.remove("success-play");
  void success.offsetWidth;
  success.classList.add("success-play");

  title.textContent = stars >= 3 ? "Perfekt!" : stars >= 2 ? "Super!" : "Geschafft!";
  sub.textContent =
    stars >= 3
      ? "3 Sterne — stark!"
      : stars % 1 === 0
        ? `${stars} Sterne`
        : `${stars.toLocaleString("de-DE")} Sterne`;

  starsHost.innerHTML = "";
  starFillLevels(stars).forEach((level, i) => {
    const star = document.createElement("span");
    star.className = `success-star success-star-${level}`;
    star.style.setProperty("--star-i", String(i));
    star.setAttribute("aria-hidden", "true");
    star.innerHTML =
      level === "half"
        ? `<span class="star-base">☆</span><span class="star-half">★</span>`
        : level === "full"
          ? "★"
          : "☆";
    starsHost.appendChild(star);
  });
  starsHost.setAttribute("aria-label", `${stars} von 3 Sternen`);

  const burst = success.querySelector(".success-burst");
  if (burst) {
    burst.innerHTML = "";
    for (let i = 0; i < 12; i++) {
      const p = document.createElement("span");
      p.className = "success-particle";
      const ang = (i / 12) * Math.PI * 2;
      p.style.setProperty("--dx", `${Math.round(Math.cos(ang) * 110)}px`);
      p.style.setProperty("--dy", `${Math.round(Math.sin(ang) * 80)}px`);
      p.style.setProperty("--i", String(i));
      burst.appendChild(p);
    }
  }

  cont.onclick = () => onContinue();
  cont.focus();
}

function copySyllables(puzzle: Puzzle): string[] {
  if (puzzle.syllables?.length) return puzzle.syllables;
  const sol = puzzle.solution?.trim();
  if (!sol) return [];
  return [sol];
}

function renderCopyBoxes(host: HTMLElement, puzzle: Puzzle, asTip: boolean): void {
  const syllables = copySyllables(puzzle);
  if (!syllables.length) {
    host.innerHTML = "";
    host.classList.add("hidden");
    return;
  }
  host.classList.remove("hidden");
  host.innerHTML = "";

  const block = document.createElement("div");
  block.className = "hint-block copy-boxes";
  const label = document.createElement("p");
  label.className = "hint-label";
  label.textContent = asTip ? "Lösung zum Abschreiben" : "Abschreiben";
  block.appendChild(label);

  const arcRow = document.createElement("div");
  arcRow.className = "syllable-arcs";
  syllables.forEach((syl) => {
    const group = document.createElement("div");
    group.className = "syllable-group";
    const slots = document.createElement("div");
    slots.className = "letter-slots";
    for (const ch of syl) {
      const slot = document.createElement("span");
      slot.className = "letter-slot letter-slot-filled";
      slot.textContent = ch;
      slots.appendChild(slot);
    }
    const bogen = document.createElement("div");
    bogen.className = "silbenbogen";
    bogen.setAttribute("aria-hidden", "true");
    group.appendChild(slots);
    group.appendChild(bogen);
    arcRow.appendChild(group);
  });
  block.appendChild(arcRow);
  host.appendChild(block);
}

function ensureScrambled(puzzle: Puzzle): void {
  if (scrambledCache || !puzzle.syllables?.length) return;
  const chars = syllableChars(puzzle.syllables);
  scrambledCache = scrambleLetters(chars, hashSeed(puzzle.id + chars.join("")));
}

function hashSeed(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function renderWritingHints(host: HTMLElement, puzzle: Puzzle, stage: HintStage): void {
  const syllables = puzzle.syllables;
  if (!syllables?.length || stage === "none") {
    host.innerHTML = "";
    host.classList.add("hidden");
    return;
  }
  host.classList.remove("hidden");
  host.innerHTML = "";

  const arcs = document.createElement("div");
  arcs.className = "hint-block";
  const arcsLabel = document.createElement("p");
  arcsLabel.className = "hint-label";
  arcsLabel.textContent = "Silbenbogen";
  arcs.appendChild(arcsLabel);
  const arcRow = document.createElement("div");
  arcRow.className = "syllable-arcs";
  const initials = stage === "initials" ? syllableInitials(syllables) : [];
  syllables.forEach((syl, si) => {
    const group = document.createElement("div");
    group.className = "syllable-group";
    const slots = document.createElement("div");
    slots.className = "letter-slots";
    for (let i = 0; i < syl.length; i++) {
      const slot = document.createElement("span");
      slot.className = "letter-slot";
      if (stage === "initials" && i === 0) {
        slot.textContent = initials[si] ?? "";
      }
      slots.appendChild(slot);
    }
    const bogen = document.createElement("div");
    bogen.className = "silbenbogen";
    bogen.setAttribute("aria-hidden", "true");
    group.appendChild(slots);
    group.appendChild(bogen);
    arcRow.appendChild(group);
  });
  arcs.appendChild(arcRow);
  host.appendChild(arcs);

  if (stage === "letters" || stage === "initials") {
    ensureScrambled(puzzle);
    const letters = document.createElement("div");
    letters.className = "hint-block";
    const label = document.createElement("p");
    label.className = "hint-label";
    label.textContent = "Buchstaben (ungeordnet)";
    letters.appendChild(label);
    const row = document.createElement("div");
    row.className = "hint-letters";
    for (const ch of scrambledCache ?? []) {
      const tile = document.createElement("span");
      tile.className = "hint-letter";
      tile.textContent = ch;
      row.appendChild(tile);
    }
    letters.appendChild(row);
    host.appendChild(letters);
  }

  if (stage === "initials") {
    const initBlock = document.createElement("div");
    initBlock.className = "hint-block";
    const label = document.createElement("p");
    label.className = "hint-label";
    label.textContent = "Erste Buchstaben der Silben";
    initBlock.appendChild(label);
    const row = document.createElement("div");
    row.className = "hint-initials";
    for (const ch of syllableInitials(syllables)) {
      const tile = document.createElement("span");
      tile.className = "hint-initial";
      tile.textContent = `${ch}…`;
      row.appendChild(tile);
    }
    initBlock.appendChild(row);
    host.appendChild(initBlock);
  }
}

function renderAnlaut(host: HTMLElement, _speak: SpeakFn): void {
  host.innerHTML = "";
  for (const tile of ANLAUT_TILES) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "anlaut-tile";
    b.setAttribute("aria-label", `${tile.upper} ${tile.lower}, ${tile.word}`);

    const letters = document.createElement("span");
    letters.className = "anlaut-letters";
    const upper = document.createElement("span");
    upper.className = "anlaut-upper";
    upper.textContent = tile.upper;
    const lower = document.createElement("span");
    lower.className = "anlaut-lower";
    lower.textContent = tile.lower;
    letters.append(upper, lower);

    const img = document.createElement("img");
    img.className = "anlaut-img";
    img.src = tile.image;
    img.alt = "";
    img.decoding = "async";
    img.loading = "lazy";

    const word = document.createElement("span");
    word.className = "anlaut-word";
    word.textContent = tile.word;

    b.append(letters, img, word);
    b.addEventListener("click", () => speakAnlaut(tile.clipKey, tile.speak));
    host.appendChild(b);
  }
}

function setupTrace(canvas: HTMLCanvasElement, puzzle: Puzzle, finishOk: () => void): void {
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
  const tryPass = () => {
    if (traceScore(stroke, tmpl) >= TRACE_PASS) {
      finishOk();
    } else {
      wrongAttempts += 1;
      const err = document.getElementById("puzzle-error");
      if (err) err.textContent = "Etwas genauer nachzeichnen.";
    }
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
    tryPass();
  };
  document.getElementById("puzzle-ok")!.onclick = () => tryPass();
}
