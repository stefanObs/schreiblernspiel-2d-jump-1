# Plan: <kurzname> / Slice <id>

**Status:** Entwurf | Erledigt  
**Typ:** Feature | Bugfix | Art  
**Datum:** YYYY-MM-DD  
**Owner:** …  
**Parent-INDEX:** `docs/plans/<aufgabe>/INDEX.md`  
**Slice-Datei:** `docs/plans/<aufgabe>/S<nn>-<slug>.md`  
**Hängt ab von:** — | S01 | …  
**Pfad:** Fast-Path | Voller Loop

Planner nur bei Bugs/Art-Dateien/Multi-System/unklarem Scope — zuerst Cursor-Plan-Modus, Slice-Datei erst nach Freigabe im Agent-Modus. Sonst Stub + Implementer ergänzt Testplan/Akzeptanz hier.

**Gates:** Review nur spielsichtbar/nicht trivial. Verifier-Subagent nur wenn Suite nicht grün / kein Handoff / Nachcode. Physisch nur auf User-Anforderung. Git: commit + push (Tag via CI).

## Ziel

…

## Scope

- In:
- Nicht:

## Systeme

…

## Repro & RCA (Pflicht bei Typ = Bugfix)

Vor Phase 2. Zuerst Plan-Modus (RCA vorlegen, keine Writes); nach Freigabe im Agent-Modus diesen Abschnitt füllen. Features: weglassen oder „n/a“.

### Reproduktion

- [ ] Repro bestätigt
- [ ] Nicht reproduzierbar (kein Fix ohne weitere Daten)

| Feld | Inhalt |
|------|--------|
| Schritte | 1. … |
| Erwartet | … |
| Tatsächlich | … |
| Umgebung | Branch, Browser, Station/Rätsel-ID |
| Evidenz | Logs / failender Test |

### Root-Cause-Analyse

| Feld | Inhalt |
|------|--------|
| Hypothesen | … |
| Bestätigte Ursache | … |
| Nicht die Ursache | … |
| Fix-Richtung | … |
| Risiken | … |

- [ ] RCA dokumentiert

## Technische Schritte

1. …
2. …

## Testplan

### Automatisiert / headless (Pflicht bei Code)

- [ ] …
- [ ] Bugfix: Regressionstest zuerst rot, nach Fix grün

### Manuell / physisch (nur auf User-Anforderung)

- [ ] n/a

## Art-Bedarf

- [ ] Keine neuen Assets — Platzhalter/CSS/SVG
- [ ] `comic-rettung-art` **nur** für diese Dateien:
  - …

## Akzeptanzkriterien

- [ ] …
- [ ] Bugfix: Repro + RCA
- [ ] Automatisierte Tests grün (oder Docs-only n/a)
- [ ] Review: Pflicht / Skip (Grund: …)
- [ ] Verifier-Subagent: Pflicht / Skip (Suite schon grün)
- [ ] Physischer Test: n/a außer User verlangt
