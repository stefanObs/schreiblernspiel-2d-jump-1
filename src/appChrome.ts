import {
  DEFAULT_WRITING_MODE,
  WRITING_MODES,
  WRITING_MODE_LABELS,
  getEffectiveWritingMode,
  isDebugMode,
  loadWritingMode,
  saveWritingMode,
  setSessionWritingModeOverride,
  toggleDebugMode,
  type WritingMode,
} from "./logic/writingMode";
import { debugPuzzleOptions, dispatchDebugOpenPuzzle } from "./logic/debugPuzzles";
import { mergedPuzzles } from "./logic/puzzleStore";
import { isOverlayOpen, refreshWritingModeUi } from "./puzzleUi";

/** Wire Settings dialog + F1 debug once after DOM is ready. */
export function installAppChrome(): void {
  ensureSettingsDom();
  bindSettings();
  bindDebugHotkey();
  syncDebugBadge();
}

function ensureSettingsDom(): void {
  if (!document.getElementById("debug-badge")) {
    const badge = document.createElement("div");
    badge.id = "debug-badge";
    badge.className = "hidden";
    badge.textContent = "DEBUG (F1)";
    document.body.appendChild(badge);
  }

  if (!document.getElementById("debug-puzzle-bar")) {
    const bar = document.createElement("div");
    bar.id = "debug-puzzle-bar";
    bar.className = "hidden";
    bar.innerHTML = `
      <label for="debug-puzzle-select">Rätsel testen</label>
      <select id="debug-puzzle-select" aria-label="Rätsel zum Testen"></select>
      <button type="button" id="btn-debug-open-puzzle" title="Gewähltes Rätsel öffnen">Öffnen</button>
    `;
    document.body.appendChild(bar);
  }

  // Remove legacy single-puzzle debug buttons if present from older sessions.
  document.getElementById("btn-debug-ballkanone")?.remove();
  document.getElementById("btn-debug-repeat")?.remove();

  if (document.getElementById("settings-overlay")) return;

  const nav = document.getElementById("top-nav");
  if (nav && !document.getElementById("btn-settings")) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.id = "btn-settings";
    btn.textContent = "Einstellungen";
    nav.appendChild(btn);
  }

  const overlay = document.createElement("div");
  overlay.id = "settings-overlay";
  overlay.className = "hidden";
  overlay.innerHTML = `
    <div id="settings-panel" role="dialog" aria-labelledby="settings-title">
      <h2 id="settings-title">Einstellungen</h2>
      <label for="settings-writing-mode">Schreib-Modus</label>
      <select id="settings-writing-mode" aria-describedby="settings-mode-help"></select>
      <p id="settings-mode-help" class="settings-help">
        Der letzte Stand wird in diesem Browser gespeichert. Standard: Buchstaben lernen.
      </p>
      <button type="button" id="settings-close">Schließen</button>
    </div>
  `;
  document.body.appendChild(overlay);

  const select = overlay.querySelector("#settings-writing-mode") as HTMLSelectElement;
  for (const mode of WRITING_MODES) {
    const opt = document.createElement("option");
    opt.value = mode;
    opt.textContent = WRITING_MODE_LABELS[mode];
    select.appendChild(opt);
  }
}

function bindSettings(): void {
  const openBtn = document.getElementById("btn-settings");
  const overlay = document.getElementById("settings-overlay");
  const closeBtn = document.getElementById("settings-close");
  const select = document.getElementById("settings-writing-mode") as HTMLSelectElement | null;
  if (!openBtn || !overlay || !closeBtn || !select) return;

  const open = () => {
    select.value = loadWritingMode();
    overlay.classList.remove("hidden");
  };
  const close = () => overlay.classList.add("hidden");

  openBtn.addEventListener("click", open);
  closeBtn.addEventListener("click", close);
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) close();
  });
  select.addEventListener("change", () => {
    const mode = (select.value || DEFAULT_WRITING_MODE) as WritingMode;
    saveWritingMode(mode);
    if (!isDebugMode()) setSessionWritingModeOverride(null);
    if (isOverlayOpen()) refreshWritingModeUi();
  });
}

function bindDebugHotkey(): void {
  window.addEventListener("keydown", (e) => {
    if (e.key !== "F1") return;
    e.preventDefault();
    const on = toggleDebugMode();
    if (!on) setSessionWritingModeOverride(null);
    syncDebugBadge();
    if (isOverlayOpen()) refreshWritingModeUi();
  });

  const openBtn = document.getElementById("btn-debug-open-puzzle");
  openBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    if (!isDebugMode() || isOverlayOpen()) return;
    const select = document.getElementById("debug-puzzle-select") as HTMLSelectElement | null;
    const id = select?.value?.trim();
    if (id) dispatchDebugOpenPuzzle(id);
  });
}

function fillDebugPuzzleSelect(): void {
  const select = document.getElementById("debug-puzzle-select") as HTMLSelectElement | null;
  if (!select) return;
  const prev = select.value;
  const options = debugPuzzleOptions(mergedPuzzles());
  select.innerHTML = "";
  for (const opt of options) {
    const el = document.createElement("option");
    el.value = opt.id;
    el.textContent = opt.label;
    select.appendChild(el);
  }
  if (prev && options.some((o) => o.id === prev)) select.value = prev;
}

function syncDebugBadge(): void {
  const badge = document.getElementById("debug-badge");
  if (badge) {
    badge.classList.toggle("hidden", !isDebugMode());
    if (isDebugMode()) {
      badge.textContent = `DEBUG (F1) · ${WRITING_MODE_LABELS[getEffectiveWritingMode()]}`;
    }
  }
  const bar = document.getElementById("debug-puzzle-bar");
  bar?.classList.toggle("hidden", !isDebugMode());
  if (isDebugMode()) fillDebugPuzzleSelect();
}

export function syncDebugBadgeLabel(): void {
  syncDebugBadge();
}
