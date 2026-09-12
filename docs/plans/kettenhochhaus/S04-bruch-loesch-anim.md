# Slice: S04 — Kettenbruch- und Lösch-Animation

**Parent:** `docs/plans/kettenhochhaus/INDEX.md`  
**Hängt ab von:** S03

## Feature

Bei Treffer bricht die Kette sichtbar; nach der 4. Kette rennt der Mech zum brennenden Hochhaus und löscht es — danach Rätsel gelöst.

## In diesem Schritt

- Kettenbruch-Animation (Mesh/Partikel/Tween an `chain.glb`; lesbar für Kinder)
- Sequenz nach 4 Treffern: Mech läuft zum Hochhaus → Löschen mit `hose.glb` / Hochhaus-Zustand → Win/WorldEffect
- Kein Skip der Sequenz als Default; Abbruch nur über bestehendes Overlay-Schließen falls schon üblich

## Nicht (andere Feature-Schritte)

- Neue GLBs erzeugen (bestehende aus S03 nutzen; nur Anim/State)
- Zusätzliche Ketten, Power-ups, Editor
- Comic-Art-PNGs

## Art

- nein — Animation/Runtime auf bestehenden Tripo-GLBs

## Testplan (optional, 2 Bullets)

- Automatisiert: nach 4 Treffern Sim/State erreicht Finale/`won` (Animation darf zeitgesteuert gemockt sein)
- Fehlklick unterbricht keine Bruch-Animation der falschen Kette (kein Bruch bei Miss)
