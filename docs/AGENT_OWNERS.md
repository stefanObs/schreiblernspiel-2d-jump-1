# Agent Ownership (Pfad = Wahrheit)

Verhindert Überschneidungen zwischen Subagenten. Jeder Slice nennt **genau einen** Asset-Owner.

## Matrix

| Agent | Darf | Darf nicht |
|-------|------|------------|
| `comic-rettung-art` | `public/art/**` Stil-C PNG | `public/models/**`, Tripo, `src/minigames/**`, `assets/tripo-concepts/**` |
| `tripo-3d-assets` | Concept → `tripo make` → bake → `public/models/ballkanone/**`, `public/models/kettenhochhaus/**`, `scripts/bake-*-tripo.mjs`, `.cursor/skills/tripo-3d-assets/` | Phaser-Szenen, Puzzle-UI, Sim-Regeln, `public/art/**`, `src/minigames/**` (außer Loader-URL-Hinweise im Handoff) |
| `feature-implementer` | `src/minigames/**` (u. a. `ballkanone`, `buchstabenstrasse`, `buchstabenflieger`, `kettenhochhaus`), Station-Hooks, `src/logic` Puzzle-Typen, Tests | `tripo make`, Bake ausführen, neue GLBs erzeugen, Stil-C-Sprites „mitdenken“ |
| `code-reviewer` / `automated-verifier` | Review / Verify | Scope erweitern, Assets regenerieren |
| `task-slicer` | INDEX / Slices mit klaren **Nicht**-Grenzen und Art-Owner | Implementieren |
| `feature-planner` | Slice-Plan ausbauen | Implementieren, Assets erzeugen |

## Slice-Regel Art

Jeder Slice setzt genau eine Variante:

- `Art: nein` — Platzhalter / CSS / procedurale Fallbacks
- `Art: comic-rettung-art` + konkrete `public/art/…`-Dateinamen
- `Art: tripo-3d-assets` + konkrete GLB-Namen unter `public/models/ballkanone/` oder `public/models/kettenhochhaus/`

`feature-implementer` startet `tripo-3d-assets` **nur**, wenn der Slice `Art: tripo-3d-assets` sagt.

## Handoff-Vertrag (Tripo ↔ Implementer)

1. Tripo-Agent liefert nur: gebackene GLBs, `SOURCES.md`, kurze Mount-/Scale-Hinweise.
2. Implementer verdrahtet Loader-URLs in `src/minigames/<minigame>/loadModels.ts` (z. B. `ballkanone`, `kettenhochhaus`).
3. Kein gemeinsames Editieren derselben Datei in einem Slice.

## Ballkanone-Pfade

| Pfad | Owner |
|------|-------|
| `src/minigames/ballkanone/` | `feature-implementer` |
| `public/models/ballkanone/` | `tripo-3d-assets` |
| `assets/tripo-concepts/ballkanone/` | `tripo-3d-assets` |
| `assets/tripo-out/` (gitignore) | nie committen |
| `scripts/bake-ballkanone-tripo.mjs` | `tripo-3d-assets` |

## Kettenhochhaus-Pfade

| Pfad | Owner |
|------|-------|
| `src/minigames/kettenhochhaus/` | `feature-implementer` |
| `public/models/kettenhochhaus/` | `tripo-3d-assets` |
| `assets/tripo-concepts/kettenhochhaus/` | `tripo-3d-assets` |
| `assets/tripo-out/` (gitignore) | nie committen |
| `scripts/bake-kettenhochhaus-tripo.mjs` | `tripo-3d-assets` |

Siehe auch [ENTWICKLUNGSABLAUF.md](ENTWICKLUNGSABLAUF.md) und `.cursor/skills/tripo-3d-assets/SKILL.md`.
