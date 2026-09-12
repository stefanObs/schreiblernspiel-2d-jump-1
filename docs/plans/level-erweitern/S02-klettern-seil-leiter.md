# Slice: S02 — Klettern Seil + Leiter

**Parent:** `docs/plans/level-erweitern/INDEX.md`  
**Hängt ab von:** S01

## Feature

Im Mech kann der Spieler an Seil und Leiter vertikal klettern und so die neuen Höhen erreichen. Schließt `seil-spiel` S03 (Climb-Seil) im Bachbrücke-Level; Leiter-Climb gehört dazu. Kein Schwing-Seil.

## In diesem Schritt

- Climb-State nur für Mech (nicht Auto/Schiff/Flug)
- Kletter-Seil: hoch/runter, Loslassen/Abstieg klar; schließt `docs/plans/seil-spiel/S03-seil-klettern.md`
- Leiter: gleicher Climb-State / Eingabe entlang der Leiter-Geometrie
- Erhöhte Plattformen aus S01 per Seil und/oder Leiter erreichbar
- Bestehende Mech-Sprites / Posen für Climb ok (kein neues Art-Asset)

## Nicht (andere Feature-Schritte)

- Schwing-Seil / Swing-Physik (`seil-spiel` S02)
- Baumhaus-Station / `prop_treehouse` (S03)
- Straßenzone (S04), Skyline (S05)
- Schwimm-Physik
- Motiv-PNGs `prop_rope.png` / `prop_ladder.png` ersetzen

## Art

- nein — Animation über bestehende Mech-Sprites / Code-Posen

## Testplan (optional, 2 Bullets)

- Automatisiert: Climb nur im Mech-Modus; Seil- und Leiter-Climb teilen denselben Climb-State (kein Swing an Climb-Seil)
- Smoke: Mech erreicht eine S01-Höhenplattform über Seil und über Leiter
