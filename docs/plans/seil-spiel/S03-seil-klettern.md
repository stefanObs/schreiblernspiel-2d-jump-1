# Slice: S03 — Seil klettern (separat)

**Parent:** `docs/plans/seil-spiel/INDEX.md`  
**Hängt ab von:** S01

## Feature

Der Mech kann an einem **Kletter-Seil** (eigene Instanz, nicht das Schwing-Seil) auf erhöhte Plattformen klettern. Passende Climb-Animation.

## In diesem Schritt

- Separater Climb-Seil-Typ / Spawn (nicht S02-Swing wiederverwenden als Dual-Use)
- Vertikales Klettern entlang des dünnen Welten-Seils bis auf erhöhte Plattform(en)
- Player-Animation/Pose fürs Klettern (bestehende Mech-Sprites + Tween/Frames ok)
- Eingabe: hoch/runter am Seil; Abstieg/Loslassen klar; kein Swing-Pendel an diesem Seil

## Nicht (andere Feature-Schritte)

- Schwing-Mechanik (S02)
- Ein Seil mit beiden Uses
- Motiv `prop_rope.png` ändern

## Art

- nein — Animation über bestehende Mech-Sprites / Code-Posen; kein neues PNG in diesem Slice

## Testplan (optional, 2 Bullets)

- Automatisiert: Climb-Seil-Spawn ≠ Swing-Seil-Spawn (getrennte Typen)
- Automatisiert / Smoke: am Climb-Seil erreicht der Spieler eine erhöhte Plattform; kein Swing-State an dieser Instanz
