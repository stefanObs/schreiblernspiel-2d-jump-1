# Slices: kettenhochhaus

**Status:** In Arbeit (S01 erledigt)  
**Aufgabe:** Neues 3D-Minispiel: Mech läuft zum brennenden Hochhaus, muss 4 Ketten per Buchstaben-Position (Anfang/Mitte/Ende) durchschlagen, 3 Leben, danach Lösch-Animation.  
**Datum:** 2026-09-12  
**Zuschnitt:** vier Feature-Slices (Vertrag/Pipeline, Runtime+Regeln, Tripo-Assets, Abschluss-Animationen)  
**Pfad:** Voller Loop

Feature-Schritte, keine Prozess-Schritte. Fast-Path: nein (neues 3D-Minispiel + PuzzleType + Tripo-Ordner).

## Reihenfolge

| ID | Datei | Feature | Hängt ab von | Status |
|----|-------|---------|----------------|--------|
| S01 | `S01-vertrag-pipeline.md` | Ownership + Tripo-Pipeline für `kettenhochhaus` | — | erledigt |
| S02 | `S02-runtime-ketten.md` | Spielregeln, 3D-Runtime, Overlay/Pause, Station | S01 | offen |
| S03 | `S03-tripo-assets.md` | Tripo-GLBs (Kette, Hochhaus, Props) verdrahten | S02 | offen |
| S04 | `S04-bruch-loesch-anim.md` | Kettenbruch- + Lauf-/Lösch-Animation | S03 | offen |

Status nur: `offen` → `in Arbeit` → `erledigt` (nach Pass + Git).

## Spielregeln (verbindlich für alle Slices)

- **Ziel:** Mech erreicht das brennende Hochhaus und löscht es, nachdem **4 Ketten** nacheinander durchschlagen sind.
- **Pro Kette:** Ein Buchstabe aus einem Wort; Spieler klickt **Links = Anfang**, **Mitte = Mitte**, **Rechts = Ende** — wo dieser Buchstabe im Wort vorkommt.
- **Treffer:** Mech schlägt zu → Kette bricht (Animation) → nächste Kette bzw. Finale.
- **Fehlklick:** Mech verliert **1 von 3 Leben**.
- **0 Leben:** Level startet von vorne (alle Ketten + Leben zurück).
- **Nach 4 Ketten:** Mech rennt zum Hochhaus und löscht es (Animation) → Rätsel gelöst / WorldEffect wie andere Minispiele.
- **Technik:** Three.js-Overlay wie Ballkanone; Pause beim Minispiel; Hör-Hinweis wiederholbar falls vorhanden; kein Anlaut-Autofill; Transform unverändert `Mech`/`Auto`/`Schiff`/`Flug`.
- **Ownership:** `src/minigames/kettenhochhaus/` → `feature-implementer`; `public/models/kettenhochhaus/` → `tripo-3d-assets`.

## Nicht in dieser Aufgabe

- Editor-UI / Editor-Felder für den Typ
- Comic-Stil-C PNGs unter `public/art/` für dieses Minispiel
- Ballkanone-Varianten oder bestehende Minispiele umbauen
- Schreib-Modus-Textfeld / Pen-Tastatur für diesen Typ (Minispiel-eigene Klick-Steuerung)
- Mehr als 4 Ketten, Schwierigkeitsstufen, Multiplayer
- Anlauttabelle / Autofill ändern
