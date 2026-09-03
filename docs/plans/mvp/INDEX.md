# Slices: mvp

**Status:** Erledigt  
**Aufgabe:** MVP laut Konzept Abschnitt 10, Phasen P0–P6 nacheinander  
**Datum:** 2026-09-03  
**Zuschnitt:** eine Phase = ein Slice  
**Pfad:** Voller Loop (Implement + Tests; Review/Verifier nach Ablauf-Skip-Regeln)

Feature-Schritte, keine Prozess-Schritte.

## Reihenfolge

| ID | Datei | Feature | Hängt ab von | Status |
|----|-------|---------|----------------|--------|
| S01 | `S01-projektgeruest.md` | Vite/Phaser/Vitest-Gerüst | — | erledigt |
| S02 | `S02-lauf-sprung.md` | Touch Laufen/Springen | S01 | erledigt |
| S03 | `S03-pause-textfeld.md` | Pause + Textfeld | S02 | erledigt |
| S04 | `S04-wort-magie.md` | Brücke + Seil, Hören/Motiv | S03 | erledigt |
| S05 | `S05-transform-anlaut.md` | Mech/Auto + Anlaut-Teilmenge | S04 | erledigt |
| S06 | `S06-mathe-zeichnen.md` | Plus, Vergleich, Nachzeichnen | S05 | erledigt |
| S07 | `S07-editor-level.md` | Mini-Editor + Bachbrücke | S06 | erledigt |

Status nur: `offen` → `in Arbeit` → `erledigt`.

## Nicht in dieser Aufgabe

- Marina/Rush, Schiff/Flug, volle Anlauttabelle, Cloud, echte Stil-C-Sprites, physischer Surface-Test als Gate
