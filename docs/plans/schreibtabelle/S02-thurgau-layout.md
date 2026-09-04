# Slice: S02 — Thurgau-Layout + Farben

**Parent:** `docs/plans/schreibtabelle/INDEX.md`  
**Hängt ab von:** S01

## Feature

Die Schreibtabelle erscheint als **eine** Tafel im Thurgau/Abacus-Arrangement: blasslila Grund, pfirsichfarbene Vokalzeile, weiße Kacheln, grüner Akzent für Dehnungs-e; Regionen wie Vorbild (Seitenleiste, Vokalband, Mitlaut-Bögen, Diphthonge oben rechts). Kacheln sind Buchstaben+Farbe-Platzhalter, klickbar mit Ein-Laut aus S01. Sichtbar bei Wort-/Transform-Pausen wenn der Schreibmodus Anlaut zeigt — nicht im Freien Schreiben.

## In diesem Schritt

- `renderAnlaut` / CSS: Regionen statt flacher Liste
  - links: Qu, V, X, Y, C, St, Sp, Pf
  - Mitte oben (peach/orange): I E A O U, ie, Ä Ö Ü
  - Mitte/rechts: Mitlaute auf Bögen (weiß auf Lavendel)
  - rechts ergänzend: ng, ch, kleines e (grün)
  - oben rechts: Eu, Ei, Au
- Farben: pale lavender Hintergrund, peach Vokalband, weiße Kacheln, grüner Akzent Dehnungs-e
- Groß/Klein-Labels auf Kacheln; fehlende Bilder → Buchstaben-Platzhalter
- Responsive genug für Pause-UI (keine Autofill-Änderung)

## Nicht (andere Feature-Schritte)

- Stil-C-Illustrationen (S03/S04)
- TTS-Regel ändern (bereits S01)
- Freies Schreiben / Mathe-Pause erzwingen Anlaut

## Art

- nein — Platzhalter/CSS/SVG (Buchstabe + Regionfarbe)

## Testplan (optional, 2 Bullets)

- Automatisiert: DOM enthält Regions-Container / erwartete Tile-IDs; `showAnlaut=false` (Freies Schreiben) → Host leer/hidden
- Automatisiert: Dehnungs-e-Kachel trägt grünen Akzent-Marker (Klasse/Attribut)
