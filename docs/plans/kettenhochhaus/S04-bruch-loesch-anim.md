# Slice: S04 — Kettenbruch- und Lösch-Animation

**Parent:** `docs/plans/kettenhochhaus/INDEX.md`  
**Hängt ab von:** S03

## Feature

Bei Treffer bricht die Kette sichtbar; der Mech rennt zur **nächsten** Kette entlang der Straße (4 Ketten hintereinander). Nach der 4. Kette rennt er zum brennenden Hochhaus und löscht es — danach Rätsel gelöst.

## In diesem Schritt

- Kettenbruch-Animation (Mesh/Partikel/Tween an `chain.glb`; lesbar für Kinder)
- **Straßen-Progression:** nach jedem Treffer Mech-Lauf zur nächsten Kette; Zone-Pads folgen der aktiven Kette
- Sequenz nach 4 Treffern: Mech läuft zum Hochhaus → Löschen mit `hose.glb` / Hochhaus-Zustand → Win/WorldEffect
- Kein Skip der Sequenz als Default; Abbruch nur über bestehendes Overlay-Schließen falls schon üblich

## Nicht (andere Feature-Schritte)

- Neue GLBs erzeugen (bestehende aus S03 nutzen; nur Anim/State)
- Zusätzliche Ketten, Power-ups, Editor
- Comic-Art-PNGs

## Art

- nein — Animation/Runtime auf bestehenden Tripo-GLBs

## Testplan (optional, 2 Bullets)

- Automatisiert: Layout-Ziele (Mech vor Kette i / nach Hit → nächste Kette / Finale Hochhaus); nach 4 Treffern `won`
- Fehlklick unterbricht keine Bruch-Animation und keinen Lauf zur nächsten Kette
