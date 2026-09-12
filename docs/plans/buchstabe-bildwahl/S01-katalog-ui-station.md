# Slice: S01 — Katalog, UI und Station

**Parent:** `docs/plans/buchstabe-bildwahl/INDEX.md`  
**Hängt ab von:** —  
**Typ:** Feature · **Pfad:** Voller Loop · **Datum:** 2026-09-12

## Feature

Das Kind sieht **einen Buchstaben** (a–z), **fünf Wortbilder**, wählt **genau eines**, klickt **Fertig**. Genau ein Bildwort enthält den Buchstaben irgendwo; die anderen vier nicht. Klick aufs Bild **spricht das Wort** (wiederholbar). Richtig → gelöst wie andere Rätsel; falsch → Fail-Pfad wie bisher.

## In diesem Schritt

- Katalog **26 × 30 = 780** Einträge in `src/logic/letterPickPuzzle.ts` (Wort, Key, Slug, `artPath`)
- Contains-Matching laut INDEX (NFC, ä≠a, ö≠o, ü≠u, ß≠s)
- Puzzle-Typ `letterPick` in Types / `matchPuzzle` / Realize (1 Treffer + 4 Distraktoren)
- UI: großer Buchstabe, 5 Bildkacheln (Einfachauswahl), Hör-Feedback bei Klick, **Fertig**
- Builtin-Station `bach-letter-pick` im Bachbrücken-Level
- Platzhalter wenn PNG fehlt (`img.onerror` → Buchstaben-Fallback)

## Nicht (andere Feature-Schritte)

- Stil-C-PNGs (S02–S06, Owner `comic-rettung-art`)
- Editor-Felder
- Anlaut-Bilder stillschweigend umbiegen

## Art

- nein — Platzhalter/CSS bis S02–S06; `artPath` zeigt auf `public/art/letterpick/<letter>/<slug>.png`

## Testplan

- Automatisiert: 780 Einträge; Pool enthält Key; Realize 1+4; Match nur bei Treffer-ID
- Automatisiert: ä/ö/ü/ß-Negativfälle (`Bär`⊭`a`, `groß`⊭`s`, …)

## Akzeptanz

- [x] Station `bach-letter-pick` im Level
- [x] Beim Öffnen: Buchstabe, 5 Kacheln, Fertig; Bildklick spricht
- [x] Katalog 780, Contains-Regeln, Tests grün
- [x] Review: Pflicht (spielsichtbar) — Station-Abstand + striktes ID-Match + Labels entfernt
- [x] Verifier: Skip (Suite grün)
- [ ] Git: commit + push

## Katalog (verbindlich für Art-Pfade)

Siehe Listen in der ersten Stub-Version / INDEX-Namensschema — Daten liegen in `LETTER_PICK_ITEMS`.
