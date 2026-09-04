# Slice: S01 — Zwei Dreier-Gruppen UI

**Parent:** `docs/plans/wort-3er-felder/INDEX.md`  
**Hängt ab von:** —

## Feature

Bei Wort-Magie und Transform erscheinen immer genau **zwei Gruppen à drei Felder** (6 Slots). Das mittlere Feld jeder Dreiergruppe hat eine andere Farbe. Das Kind tippt ein Feld an und schreibt **einen** Buchstaben (native Inputs, `maxlength=1`, Pen-Tastatur). Mathe behält das bisherige einzelne Textfeld.

## In diesem Schritt

- Pause-UI: für `word` / `transform` statt einem Mehrzeichen-Input die 2×3-Slot-Anordnung rendern
- Mittleres Feld je Trio visuell abweichend (Farbe/CSS)
- Tippen/Fokus auf beliebiges Feld; jedes Feld nur 1 Zeichen; Pen-/native-Keyboard
- Mathe (und andere Nicht-Wort/Transform-Typen) unverändert mit Einzel-Textfeld
- Pause-, Hör-Hinweis- und Anlaut-Invarianten bleiben (kein Autofill)

## Nicht (andere Feature-Schritte)

- Autofokus nach Eingabe aufs nächste leere Feld (S02)
- Match-Regel „nicht-leere Slots L→R verketten“ (S02) — S01 darf vorerst naiv concatenieren oder Submit blockieren, solange S02 folgt
- Lernmodus-Abschreib-Kästchen ersetzen (Hinweis-UI); Fokus ist die **Eingabe**-Slots

## Art

- nein — Platzhalter/CSS/SVG

## Testplan (optional, 2 Bullets)

- Automatisiert: Wort/Transform-UI erzeugt genau 6 Inputs mit `maxlength=1` in 2 Gruppen; Mathe bleibt 1 Textfeld
- Automatisiert: mittleres Feld je Trio trägt abweichende CSS-Klasse/Farbe
