# Slices: schreibtabelle

**Status:** In Arbeit  
**Aufgabe:** Eigene Voll-Schreibtabelle (Thurgau/Abacus-Anordnung + Farben, Stil-C-Icons), Klick spricht nur einen phonetischen Laut; sichtbar in Schreib-Modi mit Anlaut (nicht Freies Schreiben).  
**Datum:** 2026-09-04  
**Zuschnitt:** vier Feature-Slices (TTS+Katalog, Layout+Farben, Art Vokale/Seitenleiste, Art Mitlaut-Bögen)  
**Pfad:** Voller Loop

Feature-Schritte, keine Prozess-Schritte. Fast-Path: Parent setzt um. Sonst: Plan nur wenn nötig → Implement + Tests → Review nur wenn spielsichtbar/nicht trivial → Verifier nur wenn Suite nicht schon grün → commit + push. Laufnummer-Tag via GitHub Action.

## Reihenfolge

| ID | Datei | Feature | Hängt ab von | Status |
|----|-------|---------|----------------|--------|
| S01 | `S01-ein-laut-tts.md` | Ein-Laut-TTS + Vollkatalog-Daten | — | erledigt |
| S02 | `S02-thurgau-layout.md` | Regionen-Layout + Farben + klickbare Platzhalter | S01 | erledigt |
| S03 | `S03-art-vokale-seite.md` | Stil-C-Icons Vokale/Diphthonge + Seitenleiste | S02 | erledigt |
| S04 | `S04-art-mitlaut-boegen.md` | Stil-C-Icons Mitlaut-Bögen inkl. ng/ch/e | S02 | erledigt |

Status nur: `offen` → `in Arbeit` → `erledigt` (nach Pass + Git).

## Nicht in dieser Aufgabe

- Autofill / Klick schreibt ins Textfeld (Invariant)
- Freies Schreiben zeigt die Tafel
- 1:1-Kopie kommerzieller Anlautbilder (nur strukturelles/farbliches Vorbild)
- Alphabet-Buchstabennamen oder „A wie Affe“ / Groß+Klein gesprochen
- Editor-UI zum Umschalten einzelner Kacheln
