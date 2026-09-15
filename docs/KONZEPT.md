# Konzept: Schreiblernspiel — 2D Jump & Run

Kindgerechtes Browser-Spiel für die **1. Klasse**: Jump & Run mit Schreib-, Rechen- und Zeichenrätseln. Bedienung rein per **Touch/Pen** auf einem **Surface**; Schreiben über ein **Textfeld** und die **Windows Pen-Tastatur**.

**Figuren:** Rettungsmechs aus *Transformierende Rettungsmechs* (gleicher Git-Space) — **Bolt**, **Marina**, **Rush**, Stil C (Comic-Rettung).

**Zielgruppe:** Primarschule, ca. 1. Klasse · **Plattform:** Browser · **Eingabe:** Touch + Pen (kein Pflicht-Gamepad)

**Entwicklung:** [`docs/ENTWICKLUNGSABLAUF.md`](ENTWICKLUNGSABLAUF.md) · Agent-Ownership [`docs/AGENT_OWNERS.md`](AGENT_OWNERS.md). Default = **Parent-Fast-Path** (eine Runde) für ein klares Slice/Docs/Hotfix; Subagenten nur bei mehreren Slices oder nicht-trivialer Spiel-Logik. Tests headless/automatisiert; Surface/Pen nur auf Anforderung. Version = Laufnummer (`version.txt` / Tag `n<N>`), gesetzt von GitHub Actions — nicht im Agent-Ablauf. Im Plan-Modus bei Unklarheit **immer nachfragen**, nicht raten.

---

## 1. Spielidee

Der Spieler steuert einen Rettungsmech durch kurze Side-View-Level. Fortschritt kommt durch Laufen/Springen **und** dadurch, dass der Mech die Welt „versteht“, was das Kind schreibt oder rechnet.

**Leitidee:** *Was du schreibst, wird wahr.*

Beispiele:

- Wort **Seil** → Seil kommt herunter
- Wort **Brücke** → Brücke senkt sich
- Transform **Schiff** / **Flug** / **Mech** / **Auto** → Mech wechselt die Gestalt
- Mathe-Lösung (Plus, Größer/Kleiner, Zurückzählen, …) → Plattform, Tür oder Zähler wird freigeschaltet
- Nachzeichnen → Brücke, Leiter, Seil, Leitung oder anderer Welteffekt entsteht

---

## 2. Look & Feel

- **Art-Style (Hauptwelt):** Stil C aus *transforming-rescue-mechs* — dicke Konturen (`#1A1A1A`), flache Cel-Farben, kinderserienhaft
- **Perspektive:** 2D Side-View Jump & Run (nicht isometrisch)
- **Welt:** Comic-Rettungsmilieu (Bach, Brücke, Schule, Badi, Baustelle), freundlich, nie gruselig
- **Palette (Orientierung):** Himmel `#4DA3FF`, Gras `#3DCC5A`; Bolt Gelb, Marina Türkis, Rush Rot
- **Minispiele (3D):** Ballkanone nutzt bewusst einen **realistischen** Stil (PBR/Tripo-GLBs: Kanone, Bälle, Hindernisse, Bäume, Laternen, Büsche, Steine) — **nicht** Stil-C-Comic und nicht Asphalt-Comic-Toon. Die 2D-Hauptwelt bleibt Stil C; die Inseln sind klar getrennt (siehe [`AGENT_OWNERS.md`](AGENT_OWNERS.md)).

| Mech   | Farbe   | Stärken im Jump & Run                          |
|--------|---------|------------------------------------------------|
| Bolt   | Gelb    | Leiter, Schlauch, Brücke, Feuer löschen        |
| Marina | Türkis  | Schiff/Wasser, Seil/Boje                       |
| Rush   | Rot     | Auto, Tempo-Abschnitte, Rampen                 |

Start typischerweise mit Bolt; Marina/Rush später freischaltbar.

---

## 3. Bedienung

### 3.1 Laufmodus

- Links: großes Touch-Pad / Joystick (Bewegen)
- Rechts: Springen / Interagieren
- Rein touch-basiert, auf Surface mit Pen ausgelegt (große Trefferflächen)

### 3.2 Schreib- / Rechenmodus

- Eingabe über ein normales **Textfeld** (`<input>` / vergleichbar)
- Das Kind nutzt die **Windows Pen-Tastatur** (Handwriting) oder Soft-Keyboard
- Keine eigene Schrifterkennung für Wörter nötig — Auswertung des Textstrings
- Schreibfeld großzügig, klar, mit viel Padding
- Platzierung so, dass die Pen-Tastatur den Inhalt nicht verdeckt (Panel eher oben/mittig)

### 3.3 Pause (verbindlich)

Beim Schreiben und Rechnen **pausiert das Spiel vollständig**:

- keine Gravitation, keine Gegnerbewegung, kein Timer-Druck
- Mech bleibt sichtbar in Wartepose
- Weiterlaufen erst nach erfolgreicher Lösung (oder erlaubtem Abbrechen)

Gilt für: Wort-Magie, Mathe, Transform-Kommandos, **Minispiele** (Ballkanone, Buchstabenstraße, …).

Nachzeichnen: Pause oder starke Zeitlupe — je nachdem, ob Zeichnen auf der laufenden Welt stört. Textfeld-Rätsel und Minispiel-Overlays immer **harte Pause**.

### 3.4 Spielmodi (Settings)

Das Spiel hat **verschiedene Schreib-Modi**, die in den **Settings** wählbar sind. Der zuletzt gewählte Modus wird **im Browser gespeichert** (z. B. `localStorage`). **Default:** der einfachste Modus (**Buchstaben lernen**).

Zusätzlich lassen sich in den Settings die **Rätsel-Kategorien** einzeln ein- und ausschalten (Wörter, Mathe, Transformieren, Zeichnen, Buchstaben-Position, Buchstaben-Bildwahl, Ballkanone, Buchstabenstraße, Buchstaben-Flieger). Die **Holztafeln** bleiben an ihren Positionen und tragen **eigene Schilde pro Typ**; abgewählte Tafel-Kategorien werden nur durch andere aktive *Tafel*-Rätsel ersetzt (nie durch Minispiele). **Minispiele** stehen nur an Sonderorten (Ballkanone im Baumhaus, Buchstabenstraße vor der Straße, Buchstaben-Flieger am Hangar) und verschwinden dort, wenn die Kategorie aus ist — kein Remapping auf Boden-Tafeln. Beim Anlaufen erscheint ein **zufälliges Rätsel** aus der Kategorie der Tafel bzw. des Sonderorts. Mindestens eine Kategorie bleibt aktiv.

Die Modi steuern, wie stark Schreiben unterstützt wird (Anzeige, Kästchen, Schreibtabelle). Sie gelten vor allem für **Wort-Magie** und verwandte Schreibaufgaben; Mathe/Nachzeichnen bleiben davon unberührt, sofern nicht anders vermerkt.

| Modus | Hilfe | Lösung sichtbar? | Schreibtabelle | Typische Wörter |
|-------|--------|------------------|----------------|-----------------|
| **Buchstaben lernen** | maximal | ja (zum Abschreiben) | ja | kurze, bekannte Wörter |
| **Schreibtabelle üben** | mittel | erst nach mehreren Versuchen | ja | wie bisher / etwas länger |
| **Freies Schreiben** | keine | nein | nein | auch schwierigere Wörter |

#### Buchstaben lernen (Default)

- Das Wort wird **gesagt** und **angezeigt**.
- Das Spiel zeigt das Wort zum Abschreiben: **jeder Buchstabe** steht gemäss der Schreibtabelle in einem **eigenen Kästchen**.
- Das Kind hört das Wort und kann die Buchstaben **abschreiben**.
- Schreibtabelle (Anlauttabelle) ist sichtbar.

#### Schreibtabelle üben

- Die **Schreibtabelle** bleibt angezeigt.
- Die **Lösung wird nicht mehr vorgegeben** (kein fertiges Wort in Kästchen zum Abschreiben).
- Nach **mehreren Fehlversuchen** erscheint die Lösung als Hilfe (freundlich, ohne Strafe) — danach erneut versuchen oder übernehmen und weitermachen, je nach UI.
- Hör-Hinweis („Nochmal hören“) bleibt möglich, soweit der Rätsel-Hinweis-Modus es vorsieht.

#### Freies Schreiben

- **Keine Schreibtabelle**, **keine Buchstaben-Kästchen**.
- Nur Textfeld (und ggf. Hör-/Motiv-Hinweis je nach Station).
- Es können **schwierigere Wörter** vorkommen (längere Wörter, Umlaute, Sondergruppen).

**Hinweis:** Die bisherigen **Hinweis-Modi** Hören / Motiv (Abschnitt 4.1) bleiben Station-/Level-Eigenschaften. Die Settings-Modi oben sind die **globale Schreib-Unterstützung** und überlagern, wie stark Lösung und Schreibtabelle helfen.

### 3.5 Debug-Modus

Mit **F1** lässt sich ein **Debug-Modus** ein- und ausschalten (Toggle). Der Zustand wird **im Browser gespeichert** (wie der Schreib-Modus) und bleibt nach Reload erhalten.

Im Debug-Modus:

- Bei **jedem Rätsel** (während der Pause) erscheint ein **Dropdown**, mit dem man sofort zwischen den Schreib-Modi wechseln kann: *Buchstaben lernen* · *Schreibtabelle üben* · *Freies Schreiben*.
- Der Wechsel gilt für die aktuelle Session-Ansicht und speichert den Settings-Default **nicht**.
- **Auto-Lösen (Karte):** Checkbox im Debug-Panel; Stationen werden beim Annähern sofort gelöst (Welt-Effekte ohne Rätsel-UI), zum Testen der Level-Karte. Zustand wird im Browser gespeichert; wirkt nur bei aktivem Debug-Modus.
- **Direkt-Einstieg Ballkanone:** Button „Ballkanone“ (nur bei aktivem Debug) öffnet das Minispiel sofort, ohne zur Station zu laufen.
- Debug-UI ist klar als Entwicklerhilfe erkennbar (z. B. kleines Panel), nicht kindgerecht gestaltet nötig.
- Ohne Debug-Modus ist das Dropdown unsichtbar; Kinder sehen nur den in den Settings gewählten Modus.

---

## 4. Rätselarten

### 4.1 Wort-Magie

An einer Station löst das Kind ein Wort; der Effekt erscheint in der Welt.

**Zwei Hinweis-Modi** (im Level/über Missionen wechselnd):

| Modus    | Visuell                                      | Audio                                      |
|----------|----------------------------------------------|--------------------------------------------|
| **Hören** | Kein Lösungsmotiv; Mech + Textfeld + Schreibtabelle (je nach Spielmodus) | Windows-Stimme sagt das Wort (z. B. „Seil“) |
| **Motiv** | Großes Motiv (z. B. Seil-Icon), ohne geschriebenes Lösungswort | Kein Vorlesen der Lösung                   |

**Hör-Modus — Wiederholbarkeit:**

- Beim Öffnen einmal automatisch vorlesen (`speechSynthesis`, `de-DE`)
- Großer Button **Nochmal hören** — beliebig oft, ohne Strafe
- Optional: Tippen auf den Mech = nochmal vorlesen
- Sprechrate leicht reduziert (z. B. ~0,85), ruhig und klar

**Textauswertung:**

- Groß/Klein egal
- Trim von Leerzeichen
- Optional: `Brücke` / `Bruecke` akzeptieren
- Bei Fehler: freundliches Feedback, erneut versuchen, keine Bestrafung

Beispiele Effekte: Seil, Brücke, Tür/Auf, Ball, Leiter, …

### 4.2 Mathe

Aufgabe erscheint als Text/Bild; Antwort im **Textfeld** (Spiel pausiert). Richtige Lösung → Welteffekt (Plattform, Tür, Zähler, Objekte).

**Aufgabentypen (1. Klasse, erweiterbar im Editor):**

| Typ | Beispiel | Eingabe |
|-----|----------|---------|
| **Plus / Minus** | `3 + 2 = ?`, `5 − 1 = ?` | Zahl |
| **Abzählen** | Sterne/Steine auf dem Schild zählen | Zahl |
| **Größer / Kleiner** | `4 □ 7` oder „Welche Zahl ist größer?“ mit zwei Mengen | `<` / `>` / Zahl / Wort je nach Variante |
| **Vergleich wählen** | Zwei Bilder: links 3 Äpfel, rechts 5 — „Wo sind mehr?“ | `links`/`rechts` oder die größere Zahl |
| **Zurückzählen** | Von 5 auf 0 (Countdown-Schild, Treppe, Rakete) | nächste Zahl oder Sequenz Schritt für Schritt |
| **Zahlenreihe** | `2, 3, _, 5` | fehlende Zahl |
| **Gleich viel** | Zwei Gruppen angleichen / „genau so viele“ | Zahl |

Größer/Kleiner und Zurückzählen sind **eigene Rätselvarianten**, nicht nur Plus-Aufgaben — im Editor als Mathe-Untertyp wählbar.

### 4.3 Nachzeichnen

- Gestrichelte Vorlage auf dem Monitor (erkennbares Motiv: Haus, Auto, Brücke mit Geländer, Leiter, Segelschiff, Sonne, … — ca. 20 Vorlagen)
- Mit Pen ausreichend genau nachzeichnen (mehrere Striche erlaubt)
- Großzügige Toleranz; positives Einrast-Feedback
- Nach erfolgreichem Nachzeichnen entsteht der **Welteffekt** — dieselben Bausteine wie bei Wort-Magie, nur ausgelöst durch Zeichnen:

| Nachgezeichnet | Effekt in der Welt |
|----------------|--------------------|
| Brücke (Laufsteg + Geländer) | **Brücke** klappt herunter oder erscheint |
| Leiter mit Sprossen | **Leiter** fährt aus oder wird begehbar |
| Seilkurve / Wellenlinie | **Seil** kommt herunter |
| Schlauch- / Leitungspfad | Wasser/Strom fließt, Rauch verschwindet |
| Rampe / Schräge | Auffahrt für **Auto** |
| Flugbogen | kurze Flug-/Gleitstrecke |
| Weitere Motive (Haus, Auto, Segelschiff, …) | Slot-Effekt der Station / Editor |

Wort-Magie und Nachzeichnen können denselben Effekt auslösen (z. B. Brücke per Wort *oder* per Nachzeichnen) — der Level-Designer / Editor wählt den Auslöser.

### 4.4 Transform per Schreibkommando

Der Mech verändert sich auf Kommando:

| Kommando | Form     | Nutzung                              |
|----------|----------|--------------------------------------|
| **Mech** | Robot    | Standard: laufen, springen, klettern |
| **Auto** | Fahrzeug | flache Strecken, Rampen, Tunnel      |
| **Schiff** | Boot   | Wasser, Bach, Badi                   |
| **Flug** | Flugform | kurze Luftstrecken, hohe Lücken      |

Auslöser:

1. **Frei** an einer Transform-Station
2. **Erzwungen** durch Level-Situation (z. B. Wasser → ohne Schiff geht es nicht)

Nach korrekter Eingabe: kurze Transform-Animation, dann neue Physik/Steuerung. Zurück mit **Mech** oder am Checkpoint.

Zuordnung zu Figuren (Schwerpunkte):

- Bolt: Mech + Auto (+ begrenztes Flug/Schiff)
- Marina: Schiff stark
- Rush: Auto stark

Falsche Form am falschen Ort: Hinweis („Hier brauchst du ein Schiff“), kein Schaden.

### 4.5 Minispiele (Pause-Overlays)

Neben Textfeld-Rätseln gibt es **eigene Stationen/Kategorien**, die ein Minispiel als Vollbild-Overlay öffnen. Die 2D-Welt pausiert hart (wie bei Wort/Mathe). Anlaut-/Textfeld-Invarianten gelten **nicht** für diese Overlays — Eingabe ist Tippen/Klicken bzw. Spurwechsel.

#### Ballkanone (`type: "ballkanone"`)

**Idee:** Für ein Zielwort die Buchstaben **in der richtigen Reihenfolge** mit einer Ballkanone abschießen (Tippen/Klicken auf den Buchstaben).

**Umsetzung (Stand):**

- Eigenes Modul unter `src/minigames/ballkanone/`
- **Three.js**-Canvas über der Phaser-Welt (kein Shared-WebGL); Dispose beim Schließen
- Variante **`static`** (MVP): Buchstaben schweben im Feld (Idle-Bewegung), bunte **3D-Buchstaben** (TextGeometry / Fallback ohne Platte)
- Kanone, Bälle, Kiste, Barriere sowie Szenerie (**Baum, Laterne, Busch, Stein**) als **Tripo3D → Bake → GLB** unter `public/models/ballkanone/` (realistisch/PBR)
- Zielwort unten im HUD; Lücken/Fortschritt und Fehlversuch-Zähler oben; Treffer-/Fehler-Feedback (Burst, Cue, Wegfliegen)
- Richtige Treffer nur für den **nächsten** Buchstaben; Fehlschüsse zählen; Sterne wie bei anderen Rätseln
- Eigene Stationen zusätzlich zu Wort-Rätseln (Textfeld bleibt unberührt)
- Pipeline: Concept-PNG → `tripo make` → `npm run ballkanone:bake-tripo`; Runtime ruft Tripo **nie** auf
- Agent-Trennung: [`docs/AGENT_OWNERS.md`](AGENT_OWNERS.md), Skill `.cursor/skills/tripo-3d-assets/`

**Geplante Varianten** (noch nicht Spiel-MVP): `track`, `peek`, Silben-Stops — siehe [`docs/minigames/ballkanone-varianten.md`](minigames/ballkanone-varianten.md).

#### Buchstabenstraße (`type: "buchstabenstrasse"`)

**Idee:** Mit dem **Auto** des gewählten Mechs in drei Spuren fahren; Straße scrollt; Buchstaben kommen entgegen. Nur Buchstaben **mit Membership im Zielwort** einsammeln, sonst ausweichen, bis das Multiset des Worts leer ist.

- Modul `src/minigames/buchstabenstrasse/` — aktuell **2D-Canvas** (kein Tripo)
- Pause + Overlay wie Ballkanone; Sterne über Fehlversuche

#### Buchstaben-Flieger (`type: "buchstabenflieger"`)

**Idee:** Mech fliegt in drei Höhen-Spuren. **Radar-Booster** (Ja/Nein: steckt der Buchstabe im Wort?) und **Spur-Booster** (Anfang/Mitte/Ende) schalten Membership-Welle bzw. Panzer-Gegner frei — dieselben Fragen wie `letterPos` / Membership, als Flug-Minispiel.

- Modul `src/minigames/buchstabenflieger/` — **2D-Canvas**; Hangar-Sonderort
- Konzept: [`docs/minigames/buchstabenflieger.md`](minigames/buchstabenflieger.md)

#### Weitere Kategorien (Kurz)

| Typ | Kurzbeschreibung |
|-----|------------------|
| **Buchstaben-Position** (`letterPos`) | Position eines Buchstabens im Wort (Schreiben/Markieren) |
| **Buchstaben-Bildwahl** (`letterPick`) | Zum Buchstaben das passende Bild wählen (Katalog unter `public/art/letterpick/`) |

---

## 5. Schreibtabelle (Anlauttabelle)

Im Schreibmodus ist eine **Schreibtabelle** / **Anlauttabelle** sichtbar (Vorbild: Leseschlau-Anlauttabelle / Basisschrift, z. B. Lehrmittel Shop TG) — sofern der gewählte Spielmodus sie vorsieht (Abschnitt 3.4).

Anforderungen:

- Didaktische Struktur wie gewohnt: Anlautbilder + Groß/Klein (`Aa`, `Sch sch`), Sondergruppen (`St`, `Sp`, `Pf`, `Eu`/`Ei`/`Au`, …)
- Eigene Illustrationen im Mech-Comic-Stil (keine 1:1-Kopie kommerzieller Vorlagen)
- Tippen auf Kachel: Windows-Stimme spricht Anlaut/Bildwort — **wiederholbar**
- Tippen fügt **keine** Buchstaben automatisch ins Textfeld ein (Schreiben bleibt Aufgabe des Kindes)
- Sichtbarkeit und Buchstaben-Kästchen hängen vom **Spielmodus** ab (Buchstaben lernen / Schreibtabelle üben / Freies Schreiben); im Editor zusätzlich optional steuerbar

---

## 6. Level-Rhythmik

Nicht dauernd schreiben — Mischung aus Bewegung und Rätsel.

Typischer Abschnitt (~2–3 Minuten):

1. Laufen & springen
2. Ein Schreib-/Rechen-/Zeichenrätsel (Pause)
3. Belohnung: Effekt, Tool oder Transform
4. Weiterlaufen mit dem neuen Zustand

Fehlerfreundlich: Soft-Respawn an Checkpoints; Schreibversuche unbegrenzt.

Kurze Sessions (ca. 5–10 Minuten) anstreben.

---

## 7. Beispiel-Mission „Bachbrücke“

1. Bolt bis zum Bach — Brücke oben
2. Station: Hör- oder Motiv-Modus → Kind schreibt **Brücke** (Pause) → Brücke klappt herunter
3. Leiter zu hoch → **Leiter**
4. Optional: Brückenlinie oder Leiter **nachzeichnen** statt (oder zusätzlich zum) Wort — gleicher Welteffekt
5. Optional: Schlauch-Pfad nachzeichnen → Rauch verschwindet (niedlich)
6. Mathe-Station z. B. Größer/Kleiner oder Zurückzählen → Plattform freigeben
7. Ziel erreicht → Stern / nächstes Level

Transform-Beispiel: Wasserabschnitt → Kind muss **Schiff** schreiben, danach wieder **Mech**.

---

## 8. Rätsel-Editor

Es gibt einen **Editor**, mit dem Eltern/Lehrpersonen Mathe- und Schreibrätsel selbst erfassen. So wird das Spiel schwerer, wenn das Kind besser schreiben/rechnen kann — ohne Code-Änderung.

### 8.1 Erfassbare Daten

| Feld        | Inhalt                                              |
|-------------|-----------------------------------------------------|
| Typ         | Wort-Magie · Mathe · Transform · Nachzeichnen · Ballkanone · Buchstabenstraße · Buchstaben-Flieger · Buchstaben-Position · Buchstaben-Bildwahl |
| Hinweis     | Hören / Motiv / Wechsel (bei Wort)                  |
| Lösung      | z. B. `Seil`, `Schiff`, `7`, `<`                     |
| Stimme      | Vorlese-Text (oft = Lösungswort)                    |
| Motiv       | Bild wählen oder hochladen                          |
| Effekt      | Seil, Brücke, Leiter, Transform, Tür, …             |
| Schwierigkeit | Stufe oder Freischalt-Bedingung                   |
| Ort         | Level + Station                                     |

**Mathe im Editor:** Untertyp wählen (Plus/Minus, Abzählen, Größer/Kleiner, Zurückzählen, Zahlenreihe, …) + Aufgabendarstellung + erwartete Antwort(en).

**Nachzeichnen im Editor:** Vorlage (Pfad/Form) + Effekt (`spawn_bridge`, `spawn_ladder`, `spawn_rope`, …) — Brücke/Leiter/Seil also auch ohne Schreibwort möglich.

### 8.2 Progression

- Rätsel in **Sets** („Woche 1“, „längere Wörter“, „Umlaute“, …)
- Start: kurze Wörter (3–4 Buchstaben), einfaches Plus/Abzählen, Nachzeichnen von Brücke/Leiter; Spielmodus-Default **Buchstaben lernen**
- Später: längere Wörter, nur Hören ohne Motiv, Modus **Schreibtabelle üben** bzw. **Freies Schreiben**, Größer/Kleiner, Zurückzählen, Zahlenreihen
- Freischaltung manuell oder nach Spielerfolg
- Gewählter Spielmodus bleibt gerätebezogen im Browser gespeichert

### 8.3 Editor-Funktionen

- Liste: Neu, Duplizieren, Löschen
- Vorschau der Pause-UI (Textfeld, Hör-Button, Schreibtabelle, ggf. Buchstaben-Kästchen je nach Modus)
- Test: Stimme, Eingabe, Effekt-Simulation
- Speichern lokal (z. B. JSON / IndexedDB)
- Export/Import zum Teilen

### 8.4 Datenformat (Skizze)

```json
{
  "id": "bach-seil-1",
  "type": "word",
  "hintMode": "hear",
  "solution": "seil",
  "voiceText": "Seil",
  "motifId": "rope",
  "effect": "spawn_rope",
  "difficulty": 1,
  "levelId": "bachbruecke"
}
```

Transform-Beispiel: `"type": "transform"`, `"solution": "schiff"`, `"effect": "transform_ship"`.

Der Editor ändert **Inhalt und Schwierigkeit**; Steuerung (Pause, Textfeld, Pen-Tastatur) bleibt gleich.

---

## 9. Technik-Skizze

- **Hauptspiel:** Browser · **Phaser 3** (Arcade Physics) · TypeScript · Vite
- **Minispiel Ballkanone:** zweites **Three.js**-Canvas im DOM-Overlay (Phaser pausiert); gebackene GLBs unter `public/models/ballkanone/`
- **Tripo3D:** nur Authoring (Concept → `tripo make` → Bake-Script); nie zur Laufzeit
- Pointer/Touch/Pen-Events; Textfeld-Fokus für Windows Pen-Tastatur (Textfeld-Rätsel)
- Sprache: Web Speech API (`speechSynthesis`, `de-DE`) + optionale WAV-Clips
- Content als datengetriebene Rätsel (`puzzleStore` / JSON / Editor-Overrides)
- Debug: F1 toggelt Debug-UI inkl. Modus-Dropdown; Direkt-Button Ballkanone
- Mech-Assets: Seitenansicht-Sprites Stil C unter `public/art/`
- Agent-Workflow: [`ENTWICKLUNGSABLAUF.md`](ENTWICKLUNGSABLAUF.md) · Ownership [`AGENT_OWNERS.md`](AGENT_OWNERS.md)

---

## 10. MVP

1. Ein Level, nur **Bolt** (Marina/Rush wählbar, soweit Assets da)
2. Laufen/Springen per Touch
3. Pause + Textfeld + Windows-Pen-Tastatur
4. Wort-Magie: **Brücke** + **Seil** (Hör- und Motiv-Modus)
5. Hör-Button wiederholbar
6. Einfache Schreibtabelle / Anlauttabelle (Teilmenge)
7. Spielmodi in Settings: mindestens **Buchstaben lernen** (Default, mit Kästchen) und Umschalten speichern; weitere Modi möglichst schon skizziert
8. **Debug-Modus** per **F1**: Dropdown am Rätsel zum Umschalten der Schreib-Modi
9. Transform mindestens **Mech** / **Auto** (oder Schiff)
10. Mathe: mindestens Plus **und** eine Vergleichs- oder Zurückzähl-Variante
11. Nachzeichnen: mindestens eine **Brücke** oder **Leiter** per Pfad
12. Minimaler Editor: Wort/Mathe-Untertyp + Lösung + Hinweis-Modus (+ Nachzeichneffekt) speichern/laden
13. **Ballkanone** (static): eigene Station(en), Tripo-Props, Debug-Direkt-Einstieg
14. Kategorie-Filter in Settings (Wörter, Mathe, …, Ballkanone, Buchstabenstraße, …)

---

## 11. Designprinzipien

- Schreiben = Weltmacht und Mech-Gestalt, nicht reines Quiz-Overlay
- Bei Textfeld-Rätseln immer pausieren
- Pen-Tastatur nutzen; Auswertung als Text
- Hör-Hinweise immer wiederholbar
- Schreibtabelle als Hilfsmittel, nicht als Autovervollständigung
- Schreib-Unterstützung über Settings-Modi (Default = einfachste Stufe); letzter Stand im Browser
- Fehlerfreundlich, kurze Sessions, klare visuelle Belohnung in der Welt
- Schwierigkeit über Spielmodus und Editor steigerbar, wenn das Kind Fortschritte macht
- Mechs als Helfer-Helden, Stil C, freundlich
- **3D-Minispiele** als eigene Inseln (Ordner + Agent-Owner); Stil darf realistisch/Tripo sein, ohne die 2D-Comic-Welt zu überschreiben

---

## 12. Offene Punkte

- Umfang der ersten Schreibtabelle / Anlauttabelle (Vollsatz vs. Teilmenge)
- Ab wann genau die Lösung bei **Schreibtabelle üben** erscheint (Versuchszahl, Button „Tipp“)
- Ob **Freies Schreiben** nur die Hilfe abschaltet oder zusätzlich einen schwierigeren Wortschatz erzwingt
- Eingabeformate für Größer/Kleiner (`<`/`>` vs. Wörter vs. Zahl wählen)
- Speichern von Editor-Inhalten nur lokal vs. Cloud/Datei-Sync
- Rechte/Credits für Anlaut-Didaktik (eigene Art, Leseschlau nur als strukturelles Vorbild)
- Ballkanone-Varianten `track` / `peek` / Silben (nur spezifiziert, nicht gebaut)
- Buchstabenstraße: ggf. spätere 3D-/Tripo-Aufwertung
- Weitere 3D-Minispiele (z. B. Kettenhochhaus-Pläne) vs. reine 2D-Overlays
