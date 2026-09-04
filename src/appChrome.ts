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
import { isOverlayOpen, refreshWritingModeUi } from "./puzzleUi";

/** Wire Settings dialog + F1 debug once after DOM is ready. */
export function installAppChrome(): void {
  ensureSettingsDom();
  bindSettings();
  bindDebugHotkey();
  syncDebugBadge();
}

function ensureSettingsDom(): void {
  if (document.getElementById("settings-overlay")) return;

  const nav = document.getElementById("top-nav");
  if (nav && !document.getElementById("btn-settings")) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.id = "btn-settings";
    btn.textContent = "Einstellungen";
    nav.appendChild(btn);
  }

  if (!document.getElementById("debug-badge")) {
    const badge = document.createElement("div");
    badge.id = "debug-badge";
    badge.className = "hidden";
    badge.textContent = "DEBUG (F1)";
    document.body.appendChild(badge);
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
}

function syncDebugBadge(): void {
  const badge = document.getElementById("debug-badge");
  if (!badge) return;
  badge.classList.toggle("hidden", !isDebugMode());
  if (isDebugMode()) {
    badge.textContent = `DEBUG (F1) · ${WRITING_MODE_LABELS[getEffectiveWritingMode()]}`;
  }
}

export function syncDebugBadgeLabel(): void {
  syncDebugBadge();
}
