# Slice: S01 — Typen-Schilder + Minispiel-Sonderorte

**Parent:** `docs/plans/station-schilde/INDEX.md`  
**Hängt ab von:** —

## Feature

Jede Rätsel-Kategorie hat ein eigenes Holztafel-Icon. Minispiele (Ballkanone, Buchstabenstraße) erscheinen nur an Sonderorten (Baumhaus bzw. vor der Straße) und werden nie auf normale Boden-Tafeln remappt.

## In diesem Schritt

- BOARD vs MINIGAME trennen; Remapping nur unter Board-Typen
- Minispiel-Slot ausblenden wenn Kategorie aus; Straßen-Schild nur bei aktiver Buchstabenstraße
- Typ-Sprites laden und an Stationen / Straßen-Schild nutzen
- KONZEPT §3.4 anpassen

## Nicht (andere Feature-Schritte)

- Kettenhochhaus-Weltstation
- Neue Level-Geometrie

## Art

- ja — **nur** diese Dateien:
  - `public/art/station_sign_word.png`
  - `public/art/station_sign_math.png`
  - `public/art/station_sign_transform.png`
  - `public/art/station_sign_trace.png`
  - `public/art/station_sign_letter_pos.png`
  - `public/art/station_sign_letter_pick.png`
  - `public/art/station_sign_ballkanone.png`
  - `public/art/station_sign_buchstabenstrasse.png`
- Bei `ja`: Hintergründe überall transparent (`process_art_alpha.py` + `verify_art_alpha.py` Exit 0)

## Testplan (optional, 2 Bullets)

- Automatisiert: Remapping wirft nie Minispiele auf Boden-Slots; Ballkanone-Slot fehlt wenn aus
- Street-Schild / BOARD_CATEGORIES ohne ballkanone in Layout-Tests

## Akzeptanzkriterien

- [x] Pro aktivem Board-/Minispiel-Typ sichtbares Typ-Schild
- [x] Ballkanone nur Baumhaus; Buchstabenstraße nur Straßen-Schild
- [x] Suite grün (puzzleCategories + levelLayout)
- [x] Review: Pflicht (spielsichtbar)
- [x] Verifier: Skip (Suite grün)
- [x] Physischer Test: n/a
