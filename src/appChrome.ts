import {
  DEFAULT_WRITING_MODE,
  WRITING_MODES,
  WRITING_MODE_LABELS,
  getEffectiveWritingMode,
  isAutoSolvePuzzles,
  isDebugMode,
  loadWritingMode,
  saveWritingMode,
  setAutoSolvePuzzles,
  setSessionWritingModeOverride,
  toggleDebugMode,
  type WritingMode,
} from "./logic/writingMode";
import {
  PUZZLE_CATEGORIES,
  PUZZLE_CATEGORY_LABELS,
  dispatchCategoriesChanged,
  loadEnabledCategories,
  saveEnabledCategories,
  type EnabledCategories,
} from "./logic/puzzleCategories";
import { debugPuzzleGroups, dispatchDebugOpenPuzzle } from "./logic/debugPuzzles";
import { mergedPuzzles } from "./logic/puzzleStore";
import { isOverlayOpen, refreshWritingModeUi } from "./puzzleUi";

const DEBUG_PICKERS = [
  { selectId: "debug-puzzle-select", btnId: "btn-debug-open-puzzle", group: "puzzles" as const },
  { selectId: "debug-zeichnen-select", btnId: "btn-debug-open-zeichnen", group: "zeichnen" as const },
  { selectId: "debug-transform-select", btnId: "btn-debug-open-transform", group: "transforms" as const },
  { selectId: "debug-minigame-select", btnId: "btn-debug-open-minigame", group: "minigames" as const },
];

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
      <label class="debug-auto-solve" for="debug-auto-solve">
        <input type="checkbox" id="debug-auto-solve" />
        Auto-Lösen (Karte)
      </label>
      <div class="debug-picker-group">
        <label for="debug-puzzle-select">Rätsel testen</label>
        <select id="debug-puzzle-select" aria-label="Rätsel zum Testen"></select>
        <button type="button" id="btn-debug-open-puzzle" title="Gewähltes Rätsel öffnen">Öffnen</button>
      </div>
      <div class="debug-picker-group">
        <label for="debug-zeichnen-select">Zeichnen</label>
        <select id="debug-zeichnen-select" aria-label="Zeichnen-Rätsel zum Testen"></select>
        <button type="button" id="btn-debug-open-zeichnen" title="Gewähltes Zeichnen-Rätsel öffnen">Öffnen</button>
      </div>
      <div class="debug-picker-group">
        <label for="debug-transform-select">Transformieren</label>
        <select id="debug-transform-select" aria-label="Transformierung zum Testen"></select>
        <button type="button" id="btn-debug-open-transform" title="Gewählte Transformierung öffnen">Öffnen</button>
      </div>
      <div class="debug-picker-group">
        <label for="debug-minigame-select">Minispiele</label>
        <select id="debug-minigame-select" aria-label="Minispiel zum Testen"></select>
        <button type="button" id="btn-debug-open-minigame" title="Gewähltes Minispiel öffnen">Öffnen</button>
      </div>
    `;
    document.body.appendChild(bar);
  } else if (!document.getElementById("debug-auto-solve")) {
    const bar = document.getElementById("debug-puzzle-bar");
    const label = document.createElement("label");
    label.className = "debug-auto-solve";
    label.htmlFor = "debug-auto-solve";
    label.innerHTML = `
      <input type="checkbox" id="debug-auto-solve" />
      Auto-Lösen (Karte)
    `;
    bar?.prepend(label);
  }

  // Older sessions may still have a debug bar without the Zeichnen picker.
  if (document.getElementById("debug-puzzle-bar") && !document.getElementById("debug-zeichnen-select")) {
    const bar = document.getElementById("debug-puzzle-bar");
    const puzzleGroup = bar?.querySelector("#debug-puzzle-select")?.closest(".debug-picker-group");
    const group = document.createElement("div");
    group.className = "debug-picker-group";
    group.innerHTML = `
      <label for="debug-zeichnen-select">Zeichnen</label>
      <select id="debug-zeichnen-select" aria-label="Zeichnen-Rätsel zum Testen"></select>
      <button type="button" id="btn-debug-open-zeichnen" title="Gewähltes Zeichnen-Rätsel öffnen">Öffnen</button>
    `;
    puzzleGroup?.after(group);
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
      <fieldset id="settings-puzzle-categories">
        <legend>Rätsel auf der Bachbrücke</legend>
        <p class="settings-help">
          Holztafeln bleiben an ihrem Platz; abgewählte Tafel-Typen werden durch andere Tafel-Rätsel ersetzt. Minispiele (Ballkanone, Buchstabenstraße) nur an Sonderorten — ausgeschaltet verschwinden sie dort.
        </p>
        <div id="settings-category-list" class="settings-category-list"></div>
        <p id="settings-category-hint" class="settings-help settings-category-hint hidden" role="status">
          Mindestens eine Kategorie muss aktiv bleiben.
        </p>
      </fieldset>
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

  const list = overlay.querySelector("#settings-category-list") as HTMLDivElement;
  for (const category of PUZZLE_CATEGORIES) {
    const row = document.createElement("label");
    row.className = "settings-category-row";
    const input = document.createElement("input");
    input.type = "checkbox";
    input.name = "puzzle-category";
    input.value = category;
    input.dataset.category = category;
    const span = document.createElement("span");
    span.textContent = PUZZLE_CATEGORY_LABELS[category];
    row.append(input, span);
    list.appendChild(row);
  }
}

function readCategoryChecks(overlay: HTMLElement): EnabledCategories {
  const enabled = loadEnabledCategories();
  for (const category of PUZZLE_CATEGORIES) {
    const input = overlay.querySelector(
      `input[data-category="${category}"]`,
    ) as HTMLInputElement | null;
    if (input) enabled[category] = input.checked;
  }
  return enabled;
}

function syncCategoryChecks(overlay: HTMLElement, enabled: EnabledCategories): void {
  for (const category of PUZZLE_CATEGORIES) {
    const input = overlay.querySelector(
      `input[data-category="${category}"]`,
    ) as HTMLInputElement | null;
    if (input) input.checked = enabled[category];
  }
}

function bindSettings(): void {
  const openBtn = document.getElementById("btn-settings");
  const overlay = document.getElementById("settings-overlay");
  const closeBtn = document.getElementById("settings-close");
  const select = document.getElementById("settings-writing-mode") as HTMLSelectElement | null;
  const hint = document.getElementById("settings-category-hint");
  if (!openBtn || !overlay || !closeBtn || !select) return;

  const open = () => {
    select.value = loadWritingMode();
    syncCategoryChecks(overlay, loadEnabledCategories());
    hint?.classList.add("hidden");
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

  overlay.querySelector("#settings-category-list")?.addEventListener("change", (e) => {
    const target = e.target as HTMLInputElement | null;
    if (!target || target.name !== "puzzle-category") return;
    const next = readCategoryChecks(overlay);
    const anyOn = PUZZLE_CATEGORIES.some((c) => next[c]);
    if (!anyOn) {
      target.checked = true;
      next[target.value as keyof EnabledCategories] = true;
      hint?.classList.remove("hidden");
    } else {
      hint?.classList.add("hidden");
    }
    saveEnabledCategories(next);
    dispatchCategoriesChanged();
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

  document.getElementById("debug-auto-solve")?.addEventListener("change", (e) => {
    const input = e.target as HTMLInputElement;
    setAutoSolvePuzzles(input.checked);
    syncDebugBadge();
  });

  for (const picker of DEBUG_PICKERS) {
    document.getElementById(picker.btnId)?.addEventListener("click", (e) => {
      e.preventDefault();
      if (!isDebugMode() || isOverlayOpen()) return;
      const select = document.getElementById(picker.selectId) as HTMLSelectElement | null;
      const id = select?.value?.trim();
      if (id) dispatchDebugOpenPuzzle(id);
    });
  }
}

function fillDebugPuzzleSelect(): void {
  const groups = debugPuzzleGroups(mergedPuzzles());
  for (const picker of DEBUG_PICKERS) {
    const select = document.getElementById(picker.selectId) as HTMLSelectElement | null;
    if (!select) continue;
    const prev = select.value;
    const options = groups[picker.group];
    select.innerHTML = "";
    for (const opt of options) {
      const el = document.createElement("option");
      el.value = opt.id;
      el.textContent = opt.label;
      select.appendChild(el);
    }
    if (prev && options.some((o) => o.id === prev)) select.value = prev;
  }
}

function syncDebugBadge(): void {
  const badge = document.getElementById("debug-badge");
  if (badge) {
    badge.classList.toggle("hidden", !isDebugMode());
    if (isDebugMode()) {
      const auto = isAutoSolvePuzzles() ? " · Auto-Lösen" : "";
      badge.textContent = `DEBUG (F1)${auto} · ${WRITING_MODE_LABELS[getEffectiveWritingMode()]}`;
    }
  }
  const bar = document.getElementById("debug-puzzle-bar");
  bar?.classList.toggle("hidden", !isDebugMode());
  const check = document.getElementById("debug-auto-solve") as HTMLInputElement | null;
  if (check) check.checked = isAutoSolvePuzzles();
  if (isDebugMode()) fillDebugPuzzleSelect();
}

export function syncDebugBadgeLabel(): void {
  syncDebugBadge();
}
