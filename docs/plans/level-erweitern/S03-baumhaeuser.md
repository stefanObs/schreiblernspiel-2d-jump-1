# Slice: S03 — Baumhäuser

**Parent:** `docs/plans/level-erweitern/INDEX.md`  
**Hängt ab von:** S02

## Feature

In der Höhe erscheinen Baumhäuser (Comic-Art). Zugang per Seil-Unlock; im Baumhaus startet eine Ballkanone-Station.

## In diesem Schritt

- Neues Prop `public/art/prop_treehouse.png` (Stil C, transparenter Hintergrund) in der Szene platzieren
- Seil-Unlock führt zum / in das Baumhaus (Welteffekt nach Rätsel, bestehendes `spawn_rope`-Muster)
- Ballkanone-Station im Baumhaus (eine Station; bestehende Ballkanone-Pipeline, kein neues Minispiel)
- Zugang setzt Climb aus S02 voraus (Spieler kann das Haus erreichen)

## Nicht (andere Feature-Schritte)

- Straßenüberquerung (S04)
- Hochhaus-Skyline (S05)
- Neues Minispiel / Tripo-Assets fürs Baumhaus
- Schwing-Seil, Schwimm-Physik
- Mehrere Baumhaus-Varianten oder Editor-UI

## Art

- ja — **nur** diese Dateien (sonst kein `comic-rettung-art`):
  - `public/art/prop_treehouse.png`
- Bei `ja`: Hintergründe überall transparent (`process_art_alpha.py` + `verify_art_alpha.py` Exit 0)

## Testplan (optional, 2 Bullets)

- Automatisiert: Baumhaus-Prop geladen; Ballkanone-Station im Baumhaus-Slot verdrahtet
- Smoke: nach Seil-Unlock Climb → Baumhaus → Ballkanone öffnet und pausiert die Welt
