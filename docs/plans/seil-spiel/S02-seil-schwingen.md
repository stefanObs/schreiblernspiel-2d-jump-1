# Slice: S02 — Seil schwingen (separat)

**Parent:** `docs/plans/seil-spiel/INDEX.md`  
**Hängt ab von:** S01

## Feature

Der Mech kann an einem **Schwing-Seil** über Hindernisse schwingen. Das ist ein eigener Seil-Typ / eigene Instanz — kein Klettern an demselben Seil. Passende Swing-Animation.

## In diesem Schritt

- Level-/Effekt-Unterscheidung für Schwing-Seil (z. B. eigener Effect/Flag oder getrennte Spawn-Variante); nicht mit Climb teilen
- Greifen/Loslassen und Pendel-/Swing-Bewegung über mindestens ein Hindernis im Bachbrücken-Kontext
- Player-Animation/Pose fürs Schwingen (bestehende Mech-Sprites + Tween/Frames ok)
- Collider/Sensor nur für Swing-Use; Welten-Visual aus S01 nutzen

## Nicht (andere Feature-Schritte)

- Kletter-Seil und Climb-Animation (S03)
- Motiv-Art ändern
- Welten-Seil-Art neu zeichnen (S01)

## Art

- nein — Animation über bestehende Mech-Sprites / Code-Posen; kein neues PNG in diesem Slice

## Testplan (optional, 2 Bullets)

- Automatisiert: Schwing-Seil-Spawn ist von Climb-Seil unterscheidbar (Typ/Flag/Effect)
- Automatisiert / Smoke: Kontakt am Schwing-Seil startet Swing-State; Spieler kommt über Hindernis-Zone ohne Climb-State
