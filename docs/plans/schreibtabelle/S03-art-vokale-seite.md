# Slice: S03 — Stil-C Art: Vokale, Diphthonge, Seitenleiste

**Parent:** `docs/plans/schreibtabelle/INDEX.md`  
**Hängt ab von:** S02

## Feature

Vokalband, Diphthonge und linke Seitenleiste zeigen eigene Stil-C-Anlautbilder (Comic-Rettung) statt Buchstaben-Platzhaltern — Arrangement/Farben bleiben; kein Nachzeichnen kommerzieller Vorlagen.

## In diesem Schritt

- Icons verdrahten in Tile-`image` + UI für diese Gruppen
- Bildworte (Vorschlag, Stil C): Affe, Esel, Insel, Ofen, Uhu, Biene (ie), Ärmel, Öl, Übung; Eule, Eimer, Auto; Qualle, Vogel, Xylophon, Yacht, Clown, Stern, Spinne, Pfeil
- Alpha-Pipeline: transparente Hintergründe, Verify Exit 0

## Nicht (andere Feature-Schritte)

- Mitlaut-Bögen / ng / ch / Dehnungs-e-Icons (S04)
- Layout-Farben neu erfinden

## Art

- ja — **nur** diese Dateien (sonst kein `comic-rettung-art`):
  - `public/art/anlaut_affe.png`
  - `public/art/anlaut_esel.png`
  - `public/art/anlaut_insel.png`
  - `public/art/anlaut_ofen.png`
  - `public/art/anlaut_uhu.png`
  - `public/art/anlaut_biene.png`
  - `public/art/anlaut_aermel.png`
  - `public/art/anlaut_oel.png`
  - `public/art/anlaut_uebung.png`
  - `public/art/anlaut_eule.png`
  - `public/art/anlaut_eimer.png`
  - `public/art/anlaut_auto.png`
  - `public/art/anlaut_qualle.png`
  - `public/art/anlaut_vogel.png`
  - `public/art/anlaut_xylophon.png`
  - `public/art/anlaut_yacht.png`
  - `public/art/anlaut_clown.png`
  - `public/art/anlaut_stern.png`
  - `public/art/anlaut_spinne.png`
  - `public/art/anlaut_pfeil.png`
- Bei `ja`: Hintergründe überall transparent (`process_art_alpha.py` + `verify_art_alpha.py` Exit 0)

## Testplan (optional, 2 Bullets)

- Automatisiert: genannte PNGs existieren; Alpha-Verify Exit 0
- Automatisiert: Vokal-/Seitenleisten-Tiles referenzieren die neuen Pfade (kein leerer `image`)
