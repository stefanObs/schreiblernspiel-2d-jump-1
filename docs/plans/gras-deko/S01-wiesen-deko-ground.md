# Slice: S01 — Wiesen-Deko auf Graslinie

**Parent:** `docs/plans/gras-deko/INDEX.md`  
**Hängt ab von:** —

## Feature

Blumen, Grasbüschel und Bäume sitzen sichtbar und sauber **auf** der schwarzen Graslinie (`GROUND`). Zusätzlich stehen einige kleinere Büschel und Blumen **im Grün unter** der Linie. Bestehende Props aus `placeMeadowDecor` / `placeTown`.

## In diesem Schritt

- `prop-grass-tuft`, `prop-flowers`, `prop-tree` an der schwarzen Graslinie ausrichten (Origin/Y so, dass sie auf `GROUND` stehen, nicht schweben oder einsinken)
- Teil der Büschel/Blumen bewusst kleiner und mit Y **unter** der Linie im grünen Bankbereich platzieren
- Bestehende Keys/Assets nutzen; Layout in `BachbrueckeScene` (`placeMeadowDecor`, `placeTown`) nachziehen

## Nicht (andere Feature-Schritte)

- Neue PNG-Props oder Art-Pipeline
- Physik-/Walk-Linie ändern (außer nötige Deko-Y-Korrektur)
- Seil, Rätsel-UI, Stationen

## Art

- nein — vorhandene Props reichen

## Testplan (optional, 2 Bullets)

- Automatisiert / Smoke: Deko-Platzierung setzt Origin-Y-Bezug auf `GROUND` für Linien-Props; Unter-Linien-Props haben Y > `GROUND`
- Visuell im Scene-Setup: Bäume/Blumen/Büschel sitzen auf der schwarzen Linie; kleinere Varianten im Grün darunter sichtbar
