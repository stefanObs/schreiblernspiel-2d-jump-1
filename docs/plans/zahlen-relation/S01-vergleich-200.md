# Slice: S01 — Vergleich mit 200 Optionen

**Parent:** `docs/plans/zahlen-relation/INDEX.md`
**Hängt ab von:** —

## Feature

Beim Öffnen von „Zahlen in Relation zueinander“ erscheint ein zufälliges Zahlenpaar. Es gibt Ausprägungen **größer**, **kleiner** und **gleich**. Antwort: korrektes Zeichen `<` / `>` / `=` oder die größere Zahl. Encoding: links kleiner → `<`, links größer → `>`, gleich → `=`.

## In diesem Schritt

- Pool `COMPARE_OPTIONS` mit genau 200 Paaren (alle drei Relationen)
- `realizeMathPuzzle` setzt left/right, Prompt und Lösung
- Match-Logik nutzt korrektes Zeichen-Encoding
- Builtin-Prompt-Titel „Zahlen in Relation zueinander“
- Automatisierte Tests für Pool, Relationen und Match

## Nicht (andere Feature-Schritte)

- Editor-UI für Vergleichspaare
- Neue PNG-Motive

## Art

- nein — Platzhalter/CSS/SVG

## Testplan (optional, 2 Bullets)

- Automatisiert: 200 Optionen; größer/kleiner/gleich jeweils vertreten
- Automatisiert: `4 □ 7` → `<` oder `7`; `7 □ 4` → `>`; `5 □ 5` → `=`

## Akzeptanz

- [x] Station `bach-compare` realisiert zufälliges Paar aus 200
- [x] Encoding `<` / `>` / `=` mathematisch korrekt
- [x] Suite grün
