# Slice: S01 — Vertrag & Tripo-Pipeline

**Parent:** `docs/plans/kettenhochhaus/INDEX.md`  
**Hängt ab von:** —

## Feature

`kettenhochhaus` hat klaren Agent-Owner und eine Bake-Pipeline analog Ballkanone; keine Überschneidung mit Ballkanone-Pfaden.

## In diesem Schritt

- `docs/AGENT_OWNERS.md` um `public/models/kettenhochhaus/`, `assets/tripo-concepts/kettenhochhaus/`, Bake-Skript erweitern
- Skill/Rule/Agent-Hinweise `tripo-3d-assets` auf zweiten Minispiel-Ordner ausweiten (Ballkanone bleibt gültig)
- Ordnergerüst + Gitignore-Hinweise; `scripts/bake-kettenhochhaus-tripo.mjs` (fail-fast ohne Quellen)
- Kurzer Handoff-Vertrag: Tripo liefert GLBs/`SOURCES.md`; Implementer nur Loader-URLs

## Nicht (andere Feature-Schritte)

- Spielbare Runtime / Stationen / Sim-Regeln
- Tripo-Credits verbrauchen / GLBs erzeugen
- Kettenbruch- oder Lösch-Animation

## Art

- nein

## Testplan (optional, 2 Bullets)

- Automatisiert: Bake-Skript ohne Quellen → Exit ≠ 0 bzw. klare Skip-Warnung
- Ownership-Docs nennen `kettenhochhaus`-Pfade explizit
