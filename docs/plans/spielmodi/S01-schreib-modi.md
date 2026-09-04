# Slice: S01 — Schreib-Modi

**Parent:** `docs/plans/spielmodi/INDEX.md`  
**Hängt ab von:** —

## Feature

In den Settings wählbare Schreib-Modi (Buchstaben lernen / Schreibtabelle üben / Freies Schreiben), im Browser gespeichert; Default = Buchstaben lernen. F1 öffnet Debug: Dropdown am Rätsel zum Moduswechsel.

## In diesem Schritt

- Persistenz des gewählten Modus (`localStorage`)
- Mode-abhängige Puzzle-UI: Abschreib-Kästchen, Schreibtabelle, progressive Hilfe / Lösungs-Tipp
- Settings-Dialog in der Spiel-Nav
- Debug per F1 + Dropdown am Rätsel (Session-Override, speichert Settings nicht)

## Nicht (andere Feature-Schritte)

- Eigenen Free-Mode-Wortschatz im Content
- Editor-UI für Modi pro Rätsel

## Art

- nein — Platzhalter/CSS/SVG

## Testplan

- Automatisiert: Mode-Defaults, Persistenz-Parsing, UI-Flags, Reveal-Schwelle, Debug-Toggle/Override
- Manuell optional: F1 am offenen Rätsel, Settings speichern und neu laden
