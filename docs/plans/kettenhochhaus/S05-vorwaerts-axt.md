# Slice: S05 — Vorwärtslauf, Querkette, Axt (Tripo)

**Parent:** `docs/plans/kettenhochhaus/INDEX.md`  
**Hängt ab von:** S04

## Feature

Der Mech läuft **nach vorne** zur nächsten Kette. Jede Kette spannt **links→rechts** über den Bildschirm und wird mit einer **Axt** zerteilt. Axt- und Ketten-Meshes kommen von Tripo.

## In diesem Schritt

- Tripo: `axe.glb`; Querkette `chain.glb` neu (lang, für L→R-Spannung)
- Layout: Vorwärts entlang der Straße (+Z); Ketten quer (+X); Pads Anfang/Mitte/Ende an aktiver Kette
- Treffer: Axt-Schwung → Kette teilt sich (links/rechts) → Mech rennt zur nächsten Kette; nach 4. → Hochhaus löschen
- Loader + Bake-Job für `axe`; Tests für Layout-Richtung und Prop-URLs

## Nicht (andere Feature-Schritte)

- Editor-UI, mehr als 4 Ketten
- Neue Stil-C PNGs unter `public/art/`
- Ballkanone-Assets anfassen

## Art

- Art: tripo-3d-assets
  - `public/models/kettenhochhaus/axe.glb`
  - `public/models/kettenhochhaus/chain.glb` (neu, Querspannung)

## Hinweis S05

- `axe.glb` geliefert und verdrahtet.
- Neue lange Querkette: Concept `chain.png` bereit; Tripo-Regen **blockiert** (Credits ~35, brauchen ~70). Runtime spannt die bestehende `chain.glb` bereits L→R und teilt sie mit der Axt.
