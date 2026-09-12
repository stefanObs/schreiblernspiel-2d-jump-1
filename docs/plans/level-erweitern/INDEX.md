# Slices: level-erweitern

**Status:** Erledigt  
**Aufgabe:** Bachbrücke-Level erweitern: Höhenplattformen, Kletter-Seil/Leiter, Baumhäuser mit Minispiel, Seen, Straßenüberquerung (Auto/Buchstabenstraße), Hochhaus-Hintergrund.  
**Datum:** 2026-09-12  
**Zuschnitt:** fünf Feature-Slices (Layout → Klettern → Baumhäuser → Straße → Skyline)  
**Pfad:** Voller Loop

Feature-Schritte, keine Prozess-Schritte. Fast-Path: nein (Weltlayout + Climb + Art + Station-Umbau).

## Reihenfolge

| ID | Datei | Feature | Hängt ab von | Status |
|----|-------|---------|----------------|--------|
| S01 | `S01-hoehen-seen-layout.md` | Gestufte Höhen + See + Brücken-Slot | — | erledigt |
| S02 | `S02-klettern-seil-leiter.md` | Mech klettert Seil + Leiter | S01 | erledigt |
| S03 | `S03-baumhaeuser.md` | Baumhaus-Art, Seil-Unlock, Ballkanone oben | S02 | erledigt |
| S04 | `S04-strassen-ueberquerung.md` | Straßenzone → Buchstabenstraße → andere Seite | S01 | erledigt |
| S05 | `S05-hochhaeuser-hintergrund.md` | Hochhaus-PNG + Skyline-Parallax | S01 | erledigt |

Status nur: `offen` → `in Arbeit` → `erledigt` (nach Pass + Git).

## Abhängigkeiten (kurz)

- S02 schließt `docs/plans/seil-spiel/S03-seil-klettern.md` (Climb-Seil) im Bachbrücke-Kontext; Leiter-Climb gehört dazu.
- S03 braucht Climb (S02), damit Baumhaus-Zugang spielbar ist.
- S04/S05 brauchen das erweiterte Layout (S01), nicht zwingend Climb/Baumhaus.

## Nicht in dieser Aufgabe

- Schwing-Seil / Swing-Physik (`seil-spiel` S02 bleibt unberührt)
- Schwimm-Physik / Unterwasser-Steuerung
- Neue Minispiel-Typen außer vorhandener Ballkanone / Buchstabenstraße
- Editor-UI für neue Props/Zonen
- Vollständiges neues Level neben Bachbrücke
