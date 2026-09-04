# Slice: S01 — Welten-Seil Visual von oben

**Parent:** `docs/plans/seil-spiel/INDEX.md`  
**Hängt ab von:** —

## Feature

Das **Welt**-Seil kommt von ganz oben und wirkt deutlich dünner als bisher. Das kurze, dicke Collider-/Prop-Seil bei ~1480 wird ersetzt. Puzzle-Motiv bleibt `prop_rope.png` (Textbox/Hinweis unverändert).

## In diesem Schritt

- Neues Welten-Asset laden und für `spawn_rope` / Prop-View nutzen (nicht das Motiv-PNG skalieren)
- Seil-Grafik von Canvas-/Welt-Oberkante nach unten zeichnen; Display-Breite klar schmaler als heutige ~40px-Prop
- Alten kurzen Solid-Collider bei ~1480 und dicke `prop-rope`-Weltansicht entfernen bzw. durch dünnes Welt-Setup ersetzen (Collider-Verhalten für Swing/Climb folgt in S02/S03; hier Visual + sinnvolle Basis-Geometrie)
- `motifArt` / Textbox-Motiv weiter `prop_rope.png`

## Nicht (andere Feature-Schritte)

- Schwing-Mechanik und Swing-Animation (S02)
- Kletter-Mechanik und Climb-Animation (S03)
- Ein kombiniertes Seil mit beiden Uses

## Art

- ja — **nur** diese Dateien:
  - `public/art/prop_rope_world.png` — dünnes vertikales Welten-Seil (Stil C, transparenter Hintergrund); Motiv `prop_rope.png` unverändert lassen
- Bei `ja`: Hintergründe überall transparent (`process_art_alpha.py` + `verify_art_alpha.py` Exit 0)

## Testplan (optional, 2 Bullets)

- Automatisiert: Motiv-Pfad für `rope` bleibt `/art/prop_rope.png`; Welt-Prop nutzt `prop_rope_world` / neuen Key
- Smoke: nach `spawn_rope` ist Seil von oben sichtbar und schmaler als das alte kurze Prop
