# Slice: S01 — Höhen, Seen, Layout

**Parent:** `docs/plans/level-erweitern/INDEX.md`  
**Hängt ab von:** —

## Feature

Die Bachbrücke-Welt wird länger/höher: gestufte Plattformen, mindestens ein See (procedural wie der Bach), und ein Brücken-Spawn-Slot über dem See — spielbar ohne Klettern/Minispiele.

## In diesem Schritt

- Bachbrücke-Welt erweitern (Breite/Höhe der Kamera-Welt, Ground-/Bank-Geometrie)
- Gestufte Höhenplattformen (erreichbar per Sprung/Weg, noch ohne Pflicht-Climb)
- Mindestens ein See: procedural wie Stream (Lücke/Wasserfläche + Ufer), kein Schwimmen
- Brücken-Spawn-Slot über dem See (bestehender `spawn_bridge` / Prop-Pfad, sichtbar nach Rätsel-Effekt)

## Nicht (andere Feature-Schritte)

- Climb-State an Seil/Leiter (S02)
- Baumhäuser / Ballkanone oben (S03)
- Straßenüberquerung / Buchstabenstraße-Weltzone (S04)
- Hochhaus-Skyline (S05)
- Schwing-Seil, Schwimm-Physik

## Art

- nein — Platzhalter/CSS/SVG bzw. bestehende Props (`prop_bridge` etc.)

## Testplan (optional, 2 Bullets)

- Automatisiert: See-/Stream-ähnliche Lücke und Brücken-Slot existieren in der Bachbrücke-Layout-Konfiguration
- Smoke: Kamera/Weltgrenzen decken die neuen Höhenplattformen und den See ab
