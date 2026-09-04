# Slice: S01 — Ein-Laut-TTS + Vollkatalog-Daten

**Parent:** `docs/plans/schreibtabelle/INDEX.md`  
**Hängt ab von:** —

## Feature

Tippen auf eine Anlaut-Kachel spricht **nur einen** phonetischen Laut (z. B. „aaa“, „buh“, „sch“) — wiederholbar. Keine Buchstabennamen, kein „A wie Affe“, kein Groß+Klein in der Stimme. Datenmodell deckt den gesamten Vollkatalog ab (alle Regionen), auch wenn die UI noch die bisherige flache Liste zeigt.

## In diesem Schritt

- `speak` / TTS-Pfad: nur Laut (`aaa`, `eee`, `buh`, `sch`, `st`, …); `speakAnlaut` bevorzugt phonetischen String
- Keine Legacy-Formeln „… wie Affe“ und keine Clip-Keys, die Bildwort mitaussagen (Fallback nur Laut oder stumm→Synth)
- Vollständiger Tile-Katalog in `anlaut.ts` für alle Regionen (Groß/Klein-Label, Laut, Bildwort-Feld für spätere Art, optionales `image`)
  - Seitenleiste: Qu, V, X, Y, C, St, Sp, Pf
  - Vokale: I E A O U, ie, Ä Ö Ü
  - Diphthonge: Eu, Ei, Au
  - Mitlaute-Bögen: B D F G H J K L M N P R S T W Z Sch + ng, ch, Dehnungs-e
- Bestehende Puzzle-Sichtbarkeit unverändert nutzen (`showAnlaut` / nicht Freies Schreiben); Klick füllt Input nicht

## Nicht (andere Feature-Schritte)

- Thurgau-Regionen-Layout und Referenzfarben (S02)
- Stil-C-PNG-Icons (S03/S04)
- Neue Clip-WAVs pro Laut

## Art

- nein — Platzhalter/CSS/SVG; vorhandene `/art/anlaut_*.png`-Pfade dürfen bleiben, fehlende Bilder als Buchstaben-Fallback

## Testplan (optional, 2 Bullets)

- Automatisiert: jeder Tile hat nicht-leeren `speak` ohne „wie“/Buchstabennamen; Klick-Handler ruft nur Laut auf und ändert Input nicht
- Automatisiert: Katalog enthält alle geforderten IDs (Seitenleiste, Vokale, Diphthonge, Mitlaute inkl. ng/ch/e)
