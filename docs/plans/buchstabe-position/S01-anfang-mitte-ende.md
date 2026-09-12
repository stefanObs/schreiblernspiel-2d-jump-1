# Slice: S01 — Buchstabenposition Anfang / Mitte / Ende

**Parent:** `docs/plans/buchstabe-position/INDEX.md`  
**Hängt ab von:** —

## Feature

Das Kind sieht einen **Buchstaben**, hört ein **Wort** und wählt, ob der Buchstabe am **Anfang**, in der **Mitte** oder am **Ende** des Wortes vorkommt. Pro Runde ein zufälliges Beispiel aus 100 Einträgen (je etwa ein Drittel pro Position).

## In diesem Schritt

- Pool mit 100 eindeutigen (Buchstabe, Wort, Position)-Beispielen
- Builtin-Rätsel `bach-letter-pos` (Typ `letterPos`), Realisierung beim Öffnen
- UI: großer Buchstabe + Hör-Button + drei Antwort-Buttons
- Station im Bachbrücken-Level
- Automatisierte Tests für Pool, Klassifikation und Match

## Nicht (andere Feature-Schritte)

- Editor-Felder
- Neue Motive

## Art

- nein — Platzhalter/CSS

## Testplan (optional, 2 Bullets)

- Automatisiert: genau 100 Einträge; Position eindeutig; ~1/3 je Kategorie; Match nur bei richtiger Wahl
- Automatisiert: Realisierung setzt Prompt, voiceText und solution

## Akzeptanz

- [x] Station `bach-letter-pos` im Level
- [x] Beim Öffnen: Buchstabe sichtbar, Wort hörbar, drei Optionen
- [x] 100 Beispiele, ausgewogen Anfang/Mitte/Ende
- [x] Review: Skip (Fast-Path)
- [x] Verifier: Skip (Suite grün, 79 Tests)
- [x] Git: commit + push
