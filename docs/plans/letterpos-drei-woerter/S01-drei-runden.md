# Slice: S01 — Drei Wörter raten

**Parent:** `docs/plans/letterpos-drei-woerter/INDEX.md`  
**Hängt ab von:** —

## Feature

Beim Buchstabenpositions-Rätsel muss das Kind **drei Wörter** hintereinander lösen (jeweils Anfang/Mitte/Ende). Fortschritt „Wort n von 3“; erst nach dem dritten Treffer ist die Station geschafft.

## In diesem Schritt

- Drei unterschiedliche Pool-Items pro Öffnen
- UI: Fortschritt, nach richtigem Tipp nächstes Wort (Bild/Buchstabe/Stimme)
- Fehlversuche zählen über alle drei Runden
- Tests für Rundenzahl und eindeutige Picks

## Nicht (andere Feature-Schritte)

- Sterne-Formel ändern
- Art

## Art

- nein

## Testplan

- Automatisiert: genau 3 Items, alle Keys unterschiedlich; apply setzt Felder
- Automatisiert: bestehende Pool-/Match-Tests bleiben grün

## Akzeptanz

- [x] Drei Wörter pro Öffnen
- [x] Fortschritt sichtbar
- [x] Erfolg erst nach dem dritten Wort
- [x] Git: commit + push
