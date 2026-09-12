# Slice: S01 — Wortbild und Klick-Replay

**Parent:** `docs/plans/letterpos-wortbild/INDEX.md`  
**Hängt ab von:** —

## Feature

Beim Buchstabenpositions-Rätsel sieht das Kind das **Bild des Wortes**. Tippen aufs Bild (oder „Wort hören“) spricht das Wort erneut. Der Pool nutzt nur Wörter mit Bild (Anlaut/Props + 6 neue Wortbilder).

## In diesem Schritt

- Bild-Lookup pro Wort; UI-Button mit Bild → Speak-Replay
- Pool 100 Einträge (34/33/33), nur Wörter mit Art
- Sechs neue Stil-C-Wortbilder für Lückenwörter

## Nicht (andere Feature-Schritte)

- Anlauttabelle ändern
- TTS-Clips vorab aufnehmen

## Art

- ja — **comic-rettung-art**, nur:
  - `public/art/word_hund.png`
  - `public/art/word_fisch.png`
  - `public/art/word_topf.png`
  - `public/art/word_rad.png`
  - `public/art/word_kuh.png`
  - `public/art/word_bus.png`

## Testplan

- Automatisiert: jedes Pool-Item hat Bild-URL; Realize setzt letterPosWord; Zonen weiter eindeutig
- Manuell: Bild sichtbar, Klick spricht Wort

## Akzeptanz

- [x] Wortbild im Overlay
- [x] Klick auf Bild spricht Wort erneut
- [x] 100 Beispiele mit Bild
- [x] Alpha-Verify der 6 neuen PNGs Exit 0
- [x] Git: commit + push
