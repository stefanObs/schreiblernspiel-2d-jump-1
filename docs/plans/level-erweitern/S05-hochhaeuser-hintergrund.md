# Slice: S05 — Hochhäuser-Hintergrund

**Parent:** `docs/plans/level-erweitern/INDEX.md`  
**Hängt ab von:** S01

## Feature

Im Hintergrund der erweiterten Bachbrücke erscheinen Hochhäuser als Parallax-Skyline — Atmosphäre ohne Gameplay-Kollision.

## In diesem Schritt

- Neues Prop `public/art/prop_hochhaus.png` (Stil C, transparenter Hintergrund)
- `placeSkyline` (oder gleichwertige Platzierung) mit Parallax hinter dem Spielgeschehen
- Mehrere Instanzen / Staffelung ok; keine Kollision, kein Climb an Hochhäusern

## Nicht (andere Feature-Schritte)

- Gameplay-Plattformen auf Hochhäusern
- Baumhäuser, Straße, Climb (andere Slices)
- Schwing-Seil, Schwimm-Physik
- Editor-UI für Skyline

## Art

- ja — **nur** diese Dateien (sonst kein `comic-rettung-art`):
  - `public/art/prop_hochhaus.png`
- Bei `ja`: Hintergründe überall transparent (`process_art_alpha.py` + `verify_art_alpha.py` Exit 0)

## Testplan (optional, 2 Bullets)

- Automatisiert: `prop_hochhaus` geladen und Skyline-Platzierung aufgerufen
- Smoke: Skyline parallax bewegt sich hinter dem Ground; kein Body/Collider am Hochhaus
