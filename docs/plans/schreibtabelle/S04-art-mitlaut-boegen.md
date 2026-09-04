# Slice: S04 — Stil-C Art: Mitlaut-Bögen

**Parent:** `docs/plans/schreibtabelle/INDEX.md`  
**Hängt ab von:** S02

## Feature

Mitlaut-Bögen (Mitte/rechts) inkl. Sch, ng, ch und Dehnungs-e zeigen eigene Stil-C-Anlautbilder; Klick bleibt Ein-Laut; grüner e-Akzent aus S02 bleibt.

## In diesem Schritt

- Icons verdrahten für Bogen-Mitlaute + ng/ch/e
- Bildworte (Vorschlag, Stil C): Besen, Dach, Fisch, Gans, Haus, Jacke, Katze, Lampe, Mantel, Nest, Pilz, Regen, Sonne, Tasse, Welle, Zaun, Schuhe, Ring (ng), Buch (ch), Hase (Dehnungs-e)
- Alpha-Pipeline wie S03

## Nicht (andere Feature-Schritte)

- Vokal-/Seitenleisten-Art (S03)
- Neue Laute oder Layout-Regionen

## Art

- ja — **nur** diese Dateien (sonst kein `comic-rettung-art`):
  - `public/art/anlaut_besen.png`
  - `public/art/anlaut_dach.png`
  - `public/art/anlaut_fisch.png`
  - `public/art/anlaut_gans.png`
  - `public/art/anlaut_haus.png`
  - `public/art/anlaut_jacke.png`
  - `public/art/anlaut_katze.png`
  - `public/art/anlaut_lampe.png`
  - `public/art/anlaut_mantel.png`
  - `public/art/anlaut_nest.png`
  - `public/art/anlaut_pilz.png`
  - `public/art/anlaut_regen.png`
  - `public/art/anlaut_sonne.png`
  - `public/art/anlaut_tasse.png`
  - `public/art/anlaut_welle.png`
  - `public/art/anlaut_zaun.png`
  - `public/art/anlaut_schuhe.png`
  - `public/art/anlaut_ring.png`
  - `public/art/anlaut_buch.png`
  - `public/art/anlaut_hase.png`
- Bei `ja`: Hintergründe überall transparent (`process_art_alpha.py` + `verify_art_alpha.py` Exit 0)

## Testplan (optional, 2 Bullets)

- Automatisiert: genannte PNGs existieren; Alpha-Verify Exit 0
- Automatisiert: Bogen-Tiles inkl. ng/ch/e referenzieren die neuen Pfade
