# Slice: S01 — Drei Wortwahl-Runden

**Parent:** `docs/plans/letterpick-drei-raetsel/INDEX.md`  
**Hängt ab von:** —

## Feature

Beim Rätsel „Welches Wort hat den Buchstaben?“ müssen **drei Runden** hintereinander gelöst werden. Fortschritt „Wort n von 3“; erst nach dem dritten Treffer ist die Station geschafft.

## In diesem Schritt

- Drei unterschiedliche Treffer-Wörter pro Öffnen
- UI: Fortschritt, nach richtigem Fertig nächste Runde (neuer Buchstabe + fünf Bilder)
- Fehlversuche über alle Runden
- Tests

## Nicht (andere Feature-Schritte)

- Art
- Sterne-Formel

## Art

- nein

## Testplan

- Automatisiert: Session mit 3 distinct hit-ids; apply setzt Felder
- Automatisiert: bestehende Realize-/Match-Tests grün

## Akzeptanz

- [x] Drei Runden pro Öffnen
- [x] Fortschritt sichtbar
- [x] Erfolg erst nach der dritten Runde
- [x] Git: commit + push
