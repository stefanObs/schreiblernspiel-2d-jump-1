# Slice: S01 — Debug-Picker für alle Rätsel

**Parent:** `docs/plans/debug-raetsel-picker/INDEX.md`  
**Hängt ab von:** —

## Feature

Im Debug-Modus (F1) erscheint ein **Auswahlmenü aller Level-Rätsel**; mit „Öffnen“ startet das gewählte Rätsel sofort, ohne zur Station zu laufen.

## In diesem Schritt

- Debug-UI: Select + Öffnen statt nur Ballkanone/Groß-klein-Buttons
- Szene öffnet Rätsel per Event mit Puzzle-ID
- Automatisierter Test für Optionsliste/Labels

## Nicht (andere Feature-Schritte)

- Neue Rätseltypen
- Art

## Art

- nein

## Testplan

- Automatisiert: Optionen decken alle builtin/merged IDs ab; Labels nicht leer
- Manuell: F1 → Rätsel wählen → Overlay öffnet

## Akzeptanz

- [x] F1 zeigt Picker mit allen Level-Rätseln
- [x] Öffnen startet das gewählte Rätsel
- [x] Review/Verifier: Skip (Fast-Path, Suite grün)
- [x] Git: commit + push
