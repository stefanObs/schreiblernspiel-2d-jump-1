# Slice: S04 — Straßen-Überquerung

**Parent:** `docs/plans/level-erweitern/INDEX.md`  
**Hängt ab von:** S01

## Feature

Eine Straßen-Weltzone auf Bachbrücke: Anlaufen startet immer Buchstabenstraße; nach Erfolg/Abschluss steht der Mech auf der anderen Straßenseite. Die Holztafel `slot-buchstabenstrasse` entfällt bzw. wird umgewidmet.

## In diesem Schritt

- Straßen-Zone im Level-Layout (Trigger-Bereich, visuelle Platzhalter ok)
- Anlaufen der Zone → immer Buchstabenstraße (kein Zufalls-Kategorie-Board an dieser Stelle)
- Nach erfolgreichem Minispiel: Spawn/Fortsetzung auf der anderen Straßenseite
- `slot-buchstabenstrasse` entfernen oder umwidmen (kein doppelter Einstieg über alte Tafel)
- Bestehende Buchstabenstraße-Runtime wiederverwenden; Transform Auto wie im Minispiel üblich

## Nicht (andere Feature-Schritte)

- Baumhäuser (S03), Skyline (S05) — unabhängig parallel möglich nach S01
- Climb-Änderungen (S02) außer ggf. Layout-Koordinaten
- Neues Straßen-Minispiel; Schwing-Seil; Schwimm-Physik
- Neue Comic-Art für Straße/Autos in diesem Slice

## Art

- nein — Platzhalter/CSS/Canvas bzw. bestehende Buchstabenstraße-Darstellung

## Testplan (optional, 2 Bullets)

- Automatisiert: Straßen-Zone-Trigger startet Buchstabenstraße; `slot-buchstabenstrasse` nicht mehr als Board-Slot aktiv
- Smoke: nach Win erscheint der Mech auf der anderen Straßenseite
