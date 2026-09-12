# Slice: S02 — Runtime Ketten-Rätsel + Station

**Parent:** `docs/plans/kettenhochhaus/INDEX.md`  
**Hängt ab von:** S01

## Feature

Spieler öffnet eine Kettenhochhaus-Station, pausiert, sieht 4 Ketten nacheinander und klickt Anfang/Mitte/Ende für den gezeigten Buchstaben; 3 Leben, bei 0 Neustart; nach 4 Treffern Win (Finale noch Platzhalter).

## In diesem Schritt

- Puzzle-Typ `kettenhochhaus`, Overlay + Three.js-Runtime mit **proceduralen Platzhalter-Meshes**
- Sim: 4 Ketten in Sequenz; Klick L/M/R; Treffer → nächste Kette; Fehlklick → −1 Leben; 0 Leben → Restart; Win nach 4 Treffern
- Mech schlägt bei Klick zu (einfaches Feedback); Kettenbruch nur grob/Platzhalter
- Vitest für Sim (Treffer/Fehl/Leben/Restart/Win)
- 1 Builtin-Station in Bachbrücke (oder gleiches Stationsmuster wie Ballkanone)

## Nicht (andere Feature-Schritte)

- Tripo generate / echte GLBs
- Ausgefeilte Bruch- und Lösch-Animationen (S04)
- Editor-UI

## Art

- nein — procedurale Fallbacks

## Testplan (optional, 2 Bullets)

- Automatisiert: Sim Treffer/Fehlschuss/Leben/Restart/Win für 4 Ketten
- Overlay öffnet/schließt ohne Crash (soweit testbar)

## Repro & RCA (Softlock Station)

**Repro:** Station/`bach-kettenhochhaus` → `openPuzzleNow` → Welt pausiert → generisches Puzzle-Overlay statt 3D-Minispiel → `matchPuzzle` scheitert → Pause bleibt.

**Ursache:** In `BachbrueckeScene.openPuzzleNow` fehlten Import und Branch für `openKettenhochhaus`; Typ fiel auf `openPuzzle` durch.

**Nicht-Ursache:** Sim, Overlay-HTML/CSS und `openKettenhochhaus` selbst (in Isolation ok).

**Fix-Richtung:** Branch wie Ballkanone + Regressionstest auf den Dispatch.

**Risiken:** Gering (gleiches Minispiel-Muster).
