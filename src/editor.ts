import "./styles.css";
import {
  builtinPuzzles,
  exportPuzzlesJson,
  loadOverrides,
  parsePuzzlesJson,
  saveOverrides,
} from "./logic/puzzleStore";
import type { Puzzle } from "./logic/puzzleTypes";
import { openPuzzle } from "./puzzleUi";

function merged(): Puzzle[] {
  const map = new Map(builtinPuzzles().map((p) => [p.id, p]));
  for (const p of loadOverrides()) map.set(p.id, p);
  return [...map.values()];
}

function render(): void {
  const list = document.getElementById("editor-list");
  if (!list) return;
  list.innerHTML = "";
  for (const p of merged()) {
    const row = document.createElement("div");
    row.className = "editor-row";
    const label = document.createElement("span");
    label.textContent = `${p.id} · ${p.type} · ${p.solution || p.traceTemplate || ""} · ${p.effect}`;
    const edit = button("Bearbeiten", () => fillForm(p));
    const dup = button("Duplizieren", () => {
      const copy = { ...p, id: `${p.id}-copy` };
      upsert(copy);
    });
    const del = button("Löschen", () => {
      saveOverrides(loadOverrides().filter((x) => x.id !== p.id));
      if (builtinPuzzles().some((b) => b.id === p.id)) {
        return;
      }
      render();
    });
    const preview = button("Vorschau", () => openPuzzle(p, { onSolved: () => undefined }));
    row.append(label, edit, dup, del, preview);
    list.appendChild(row);
  }
}

function button(text: string, fn: () => void): HTMLButtonElement {
  const b = document.createElement("button");
  b.type = "button";
  b.textContent = text;
  b.onclick = fn;
  return b;
}

function upsert(p: Puzzle): void {
  saveOverrides([...loadOverrides().filter((x) => x.id !== p.id), p]);
  render();
}

function fillForm(p: Puzzle): void {
  (document.getElementById("f-id") as HTMLInputElement).value = p.id;
  (document.getElementById("f-type") as HTMLSelectElement).value = p.type;
  (document.getElementById("f-hint") as HTMLSelectElement).value = p.hintMode;
  (document.getElementById("f-solution") as HTMLInputElement).value = p.solution;
  (document.getElementById("f-voice") as HTMLInputElement).value = p.voiceText;
  (document.getElementById("f-effect") as HTMLInputElement).value = p.effect;
  (document.getElementById("f-prompt") as HTMLInputElement).value = p.prompt;
}

function fromForm(): Puzzle {
  return {
    id: (document.getElementById("f-id") as HTMLInputElement).value.trim() || `custom-${Date.now()}`,
    type: (document.getElementById("f-type") as HTMLSelectElement).value as Puzzle["type"],
    hintMode: (document.getElementById("f-hint") as HTMLSelectElement).value as Puzzle["hintMode"],
    solution: (document.getElementById("f-solution") as HTMLInputElement).value,
    voiceText: (document.getElementById("f-voice") as HTMLInputElement).value,
    effect: (document.getElementById("f-effect") as HTMLInputElement).value as Puzzle["effect"],
    prompt: (document.getElementById("f-prompt") as HTMLInputElement).value,
    anlautVisible: true,
    levelId: "bachbruecke",
  };
}

document.getElementById("f-save")?.addEventListener("click", () => upsert(fromForm()));
document.getElementById("f-new")?.addEventListener("click", () =>
  fillForm({
    id: "",
    type: "word",
    hintMode: "hear",
    solution: "",
    voiceText: "",
    effect: "spawn_bridge",
    prompt: "Schreib das Wort.",
    anlautVisible: true,
    levelId: "bachbruecke",
  }),
);
document.getElementById("f-export")?.addEventListener("click", () => {
  const blob = new Blob([exportPuzzlesJson(merged())], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "puzzles.json";
  a.click();
});
document.getElementById("f-import")?.addEventListener("change", async (ev) => {
  const file = (ev.target as HTMLInputElement).files?.[0];
  if (!file) return;
  saveOverrides(parsePuzzlesJson(await file.text()));
  render();
});

render();
