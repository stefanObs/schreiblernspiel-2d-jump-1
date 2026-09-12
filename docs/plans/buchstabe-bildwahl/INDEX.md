# Slices: buchstabe-bildwahl

**Status:** Erledigt  
**Aufgabe:** Neues Rätsel: einen Buchstaben a–z sehen, unter 5 Wortbildern genau das eine Wort wählen, das den Buchstaben irgendwo enthält; Bildklick spricht das Wort; Fertig löst/fehlschlägt wie andere Rätsel.  
**Datum:** 2026-09-12  
**Zuschnitt:** sechs Feature-Slices (spielbar mit Platzhaltern, danach Art-Batches a–z)  
**Pfad:** Voller Loop

Feature-Schritte, keine Prozess-Schritte. Fast-Path: nein (neuer Typ + 780 Motive).

## Reihenfolge

| ID | Datei | Feature | Hängt ab von | Status |
|----|-------|---------|----------------|--------|
| S01 | `S01-katalog-ui-station.md` | Katalog, Contains-Regeln, Realisierung, UI, Station | — | erledigt |
| S02 | `S02-art-a-e.md` | Stil-C-Motive Buchstaben a–e | S01 | erledigt |
| S03 | `S03-art-f-j.md` | Stil-C-Motive Buchstaben f–j | S01 | erledigt |
| S04 | `S04-art-k-o.md` | Stil-C-Motive Buchstaben k–o | S01 | erledigt |
| S05 | `S05-art-p-t.md` | Stil-C-Motive Buchstaben p–t | S01 | erledigt |
| S06 | `S06-art-u-z.md` | Stil-C-Motive Buchstaben u–z | S01 | erledigt |

Status nur: `offen` → `in Arbeit` → `erledigt` (nach Pass + Git).

## Namensschema Art

`public/art/letterpick/<letter>/<slug>.png`  
Slug: NFC-Kleinbuchstaben, `ä→ae`, `ö→oe`, `ü→ue`, `ß→ss`, nur `[a-z0-9]`.  
Pro Buchstaben-Key **30** Einträge → **780** PNGs. Gleicher Wortstamm unter zwei Keys = **zwei** Dateien (Ordner trennt).

## Contains-Matching (verbindlich)

- Keys nur `a–z` (keine ä/ö/ü/ß als Puzzle-Buchstabe).
- Vergleich auf NFC + lowercase.
- **`ä`/`ö`/`ü` zählen nicht als `a`/`o`/`u`.**
- **`ß` zählt nicht als `s`.**
- „enthält“ = der exakte Key-Buchstabe kommt im normalisierten Wort vor (irgendwo, nicht nur Anlaut).

## Nicht in dieser Aufgabe

- Editor-Felder / Editor-UI für den Typ
- ä/ö/ü/ß als eigene Puzzle-Buchstaben
- Anlauttabelle ändern oder Anlaut-Autofill
- Neue Voice-WAVs Pflicht (TTS/`voiceText` wie bestehende Hören-Muster reicht)
- Wiederverwenden von `public/art/anlaut_*.png` außer Wort+Dateiname explizit im Art-Slice steht
