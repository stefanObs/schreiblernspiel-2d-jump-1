# Slice: S01 — Regeln, Runtime, Hangar-Station

**Parent:** `docs/plans/buchstabenflieger/INDEX.md`  
**Hängt ab von:** —

## Feature

Spieler erreicht den Hangar, Welt pausiert, fliegt in drei Höhen-Spuren: Radar-Booster (Buchstabe im Wort?) freischaltet Membership-Welle, Spur-Booster (Anfang/Mitte/Ende) freischaltet Panzer-Gegner — Sterne über Fehlversuche.

## In diesem Schritt

- Puzzle-Typ `buchstabenflieger` + Builtin + Kategorie/Settings/Debug
- Pure Sim: Phasen radar_prompt → radar_wave → lane_prompt → armor_wave → won
- Overlay HTML/CSS + `openBuchstabenflieger` (Pause, Hear, Success/Continue)
- 2D-Canvas-Runtime: Spuren, Gegner, Mech-Platzhalter-Sprite
- Hangar-Schild + Trigger in Bachbrücke (Sonderort, kein Board-Remap)
- Vitest Sim-Tests
- Konzept `docs/minigames/buchstabenflieger.md` + KONZEPT-Eintrag

## Nicht (andere Feature-Schritte)

- Editor-UI, Tripo, neue Comic-Art
- Zufalls-Wortschatz-Modul jenseits `letterPositionPuzzle`-Pool
- Schwierigkeitsstufen / Multiplayer

## Art

- nein — Platzhalter/CSS/Canvas; Mech = bestehende `*_mech_side.png`

## Testplan

- Automatisiert: Radar Ja/Nein; Membership hit/miss/dodge; Spur-Antwort; Panzer nur richtige Spur; Win
- Open/Close-Typ-Branch / Builtin vorhanden
