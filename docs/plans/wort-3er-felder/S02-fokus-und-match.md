# Slice: S02 — Fokus-Weiter + Match ohne Lückenpflicht

**Parent:** `docs/plans/wort-3er-felder/INDEX.md`  
**Hängt ab von:** S01

## Feature

Nach einem Buchstaben springt der Fokus auf das **nächste leere** Feld (Kind kann trotzdem ein anderes antippen). Beim Prüfen werden nur **nicht-leere** Slots von links nach rechts verkettet — Lücken dazwischen sind erlaubt und zählen nicht als Zeichen.

## In diesem Schritt

- Nach gültigem 1-Buchstaben-Input: Fokus auf nächstes leeres Feld in Slot-Reihenfolge (L→R); manuelles Antippen bleibt möglich
- `matchPuzzle` / Antwort-String: Concatenation aller nicht-leeren Slots L→R (leere überspringen); Normalisierung wie bisher
- Beispiele: `[S][ ][E] [ ][I][L]` → `SEIL`; `[ ][S][E] [I][L][ ]` → `SEIL`
- Wort und Transform nutzen diese Regel; Mathe unverändert

## Nicht (andere Feature-Schritte)

- UI-Layout der 2×3-Gruppen neu bauen (S01)
- Mathe-Felder ändern
- Autofill von Anlaut-Kacheln

## Art

- nein — Platzhalter/CSS/SVG

## Testplan (optional, 2 Bullets)

- Automatisiert: Fokus nach Eingabe springt aufs nächste leere Slot; manuelles Fokus-Setzen überschreibt
- Automatisiert: Match akzeptiert nicht-zusammenhängende Füllung bei korrekter L→R-Concatenation; falsche Buchstabenfolge scheitert
