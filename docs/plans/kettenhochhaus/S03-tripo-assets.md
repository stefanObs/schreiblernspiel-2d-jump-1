# Slice: S03 — Tripo-Assets verdrahten

**Parent:** `docs/plans/kettenhochhaus/INDEX.md`  
**Hängt ab von:** S02

## Feature

Kette, brennendes Hochhaus und Szene-Props sind echte Tripo-GLBs im realistischen Stil; Runtime lädt sie statt Platzhaltern.

## In diesem Schritt

- Concept PNGs → `tripo make` → bake → GLBs unter `public/models/kettenhochhaus/`
- Loader verdrahten; Fallback nur bei Load-Fehler
- `SOURCES.md` + Mount-/Scale-Hinweise für Implementer

## Nicht (andere Feature-Schritte)

- Neue Spielregeln / Leben / Klick-Logik ändern
- Kettenbruch- und Lösch-Animationen ausarbeiten (S04; Meshes dürfen Mount-Points haben)
- Stil-C Sprites unter `public/art/`

## Art

- Art: tripo-3d-assets
  - `public/models/kettenhochhaus/chain.glb`
  - `public/models/kettenhochhaus/highrise.glb`
  - `public/models/kettenhochhaus/hose.glb`
  - `public/models/kettenhochhaus/ground.glb`

## Testplan (optional, 2 Bullets)

- Bake schreibt die genannten GLBs; Runtime lädt ohne Fallback-Warnung wenn Dateien da
- Keine Änderung an Sim-Win/Lose-Vertrag gegenüber S02
