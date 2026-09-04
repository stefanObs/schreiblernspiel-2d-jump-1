# Slice: S01 — Bolt Auto solide + Walk

**Parent:** `docs/plans/mech-anim/INDEX.md`  
**Hängt ab von:** —

## Feature

Bolt-Auto lässt keinen Himmel durch Fenster/Leiter scheinen. Walk-Cycle wirkt ruhiger und ohne Löcher in den Schwarzflächen.

## In diesem Schritt

- `bolt_vehicle_side.png` neu (opak Fenster/Aufbau, Alpha nur aussen)
- `bolt_mech_walk_01`…`04.png` neu (konsistente Canvas, solide Cel-Füllungen)
- Walk-Timing / Idle↔Walk ohne Zucken in der Szene

## Nicht (andere Feature-Schritte)

- Marina/Rush Sprites
- Kletter-/Schwing-Animationen

## Art

- ja — **nur** diese Dateien (`comic-rettung-art`):
  - `public/art/bolt_vehicle_side.png`
  - `public/art/bolt_mech_walk_01.png`
  - `public/art/bolt_mech_walk_02.png`
  - `public/art/bolt_mech_walk_03.png`
  - `public/art/bolt_mech_walk_04.png`
- Bei `ja`: Hintergründe überall transparent (`process_art_alpha.py` + `verify_art_alpha.py` Exit 0)

## Testplan

- Automatisiert: `verify_art_alpha.py` Exit 0; bestehende Suite grün
- Manuell: Bolt Auto und Walk im Level ohne durchscheinenden Himmel
