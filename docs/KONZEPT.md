# Konzept: Schreiblernspiel — 2D Jump & Run

Kindgerechtes Browser-Spiel für die **1. Klasse**: Jump & Run mit Schreib-, Rechen- und Zeichenrätseln. Bedienung rein per **Touch/Pen** auf einem **Surface**; Schreiben über ein **Textfeld** und die **Windows Pen-Tastatur**.

**Figuren:** Rettungsmechs aus *Transformierende Rettungsmechs* (gleicher Git-Space) — **Bolt**, **Marina**, **Rush**, Stil C (Comic-Rettung).

**Zielgruppe:** Primarschule, ca. 1. Klasse · **Plattform:** Browser · **Eingabe:** Touch + Pen (kein Pflicht-Gamepad)

---

## 1. Spielidee

Der Spieler steuert einen Rettungsmech durch kurze Side-View-Level. Fortschritt kommt durch Laufen/Springen **und** dadurch, dass der Mech die Welt „versteht“, was das Kind schreibt oder rechnet.

**Leitidee:** *Was du schreibst, wird wahr.*

Beispiele:

- Wort **Seil** → Seil kommt herunter
- Wort **Brücke** → Brücke senkt sich
- Transform **Schiff** / **Flug** / **Mech** / **Auto** → Mech wechselt die Gestalt
- Mathe-Lösung → Plattform, Tür oder Zähler wird freigeschaltet
- Nachzeichnen eines Pfads → Leitung, Brücke oder Effekt entsteht

---

## 2. Look & Feel

- **Art-Style:** Stil C aus *transforming-rescue-mechs* — dicke Konturen (`#1A1A1A`), flache Cel-Farben, kinderserienhaft
- **Perspektive:** 2D Side-View Jump & Run (nicht isometrisch)
- **Welt:** Comic-Rettungsmilieu (Bach, Brücke, Schule, Badi, Baustelle), freundlich, nie gruselig
- **Palette (Orientierung):** Himmel `#4DA3FF`, Gras `#3DCC5A`; Bolt Gelb, Marina Türkis, Rush Rot

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

Gilt für: Wort-Magie, Mathe, Transform-Kommandos.

Nachzeichnen: Pause oder starke Zeitlupe — je nachdem, ob Zeichnen auf der laufenden Welt stört. Textfeld-Rätsel immer **harte Pause**.

---

## 4. Rätselarten

### 4.1 Wort-Magie

An einer Station löst das Kind ein Wort; der Effekt erscheint in der Welt.

**Zwei Hinweis-Modi** (im Level/über Missionen wechselnd):

| Modus    | Visuell                                      | Audio                                      |
|----------|----------------------------------------------|--------------------------------------------|
| **Hören** | Kein Lösungsmotiv; Mech + Textfeld + Anlauttabelle | Windows-Stimme sagt das Wort (z. B. „Seil“) |
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

- Aufgabe als Text/Darstellung (z. B. `3 + 2 = ?`, abzählen)
- Antwort im Textfeld (Zahl)
- Richtige Zahl → Plattform, Tür, Zähler, „genau so viele“ Objekte

### 4.3 Nachzeichnen

- Gestrichelte Form auf dem Monitor (Pfad, Welle, Kreis, Buchstabenform)
- Mit Pen ausreichend genau nachzeichnen
- Großzügige Toleranz; positives Einrast-Feedback
- Löst z. B. Leitung, Laserbrücke oder Start einer Animation

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

---

## 5. Anlauttabelle

Im Schreibmodus ist eine **Anlauttabelle** sichtbar (Vorbild: Leseschlau-Anlauttabelle / Basisschrift, z. B. Lehrmittel Shop TG).

Anforderungen:

- Didaktische Struktur wie gewohnt: Anlautbilder + Groß/Klein (`Aa`, `Sch sch`), Sondergruppen (`St`, `Sp`, `Pf`, `Eu`/`Ei`/`Au`, …)
- Eigene Illustrationen im Mech-Comic-Stil (keine 1:1-Kopie kommerzieller Vorlagen)
- Tippen auf Kachel: Windows-Stimme spricht Anlaut/Bildwort — **wiederholbar**
- Tippen fügt **keine** Buchstaben automatisch ins Textfeld ein (Schreiben bleibt Aufgabe des Kindes)
- Bei höherer Schwierigkeit im Editor optional ausblendbar

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
4. Optional: Schlauch-Pfad nachzeichnen → Rauch verschwindet (niedlich)
5. Ziel erreicht → Stern / nächstes Level

Transform-Beispiel: Wasserabschnitt → Kind muss **Schiff** schreiben, danach wieder **Mech**.

---

## 8. Rätsel-Editor

Es gibt einen **Editor**, mit dem Eltern/Lehrpersonen Mathe- und Schreibrätsel selbst erfassen. So wird das Spiel schwerer, wenn das Kind besser schreiben/rechnen kann — ohne Code-Änderung.

### 8.1 Erfassbare Daten

| Feld        | Inhalt                                              |
|-------------|-----------------------------------------------------|
| Typ         | Wort-Magie · Mathe · Transform                      |
| Hinweis     | Hören / Motiv / Wechsel                             |
| Lösung      | z. B. `Seil`, `Schiff`, `7`                          |
| Stimme      | Vorlese-Text (oft = Lösungswort)                    |
| Motiv       | Bild wählen oder hochladen                          |
| Effekt      | Seil, Brücke, Transform, Tür, …                     |
| Schwierigkeit | Stufe oder Freischalt-Bedingung                   |
| Ort         | Level + Station                                     |

Mathe: Aufgabentext/Darstellung + erwartete Zahl.

### 8.2 Progression

- Rätsel in **Sets** („Woche 1“, „längere Wörter“, „Umlaute“, …)
- Start: kurze Wörter (3–4 Buchstaben), einfache Rechnungen
- Später: längere Wörter, nur Hören ohne Motiv, Anlauttabelle aus, schwierigere Mathe
- Freischaltung manuell oder nach Spielerfolg

### 8.3 Editor-Funktionen

- Liste: Neu, Duplizieren, Löschen
- Vorschau der Pause-UI (Textfeld, Hör-Button, Anlauttabelle)
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

- Browser-Spiel (z. B. Phaser oder Pixi + eigene Physik)
- Pointer/Touch/Pen-Events; Textfeld-Fokus für Windows Pen-Tastatur
- Sprache: Web Speech API (`speechSynthesis`, `de-DE`)
- Content als datengetriebene Rätsel (JSON), vom Editor pflegbar
- Mech-Assets: Seitenansicht-Sprites (neu oder abgeleitet aus dem Mech-Projekt; Iso-Sprites reichen für Side-View oft nicht)

---

## 10. MVP

1. Ein Level, nur **Bolt**
2. Laufen/Springen per Touch
3. Pause + Textfeld + Windows-Pen-Tastatur
4. Wort-Magie: **Brücke** + **Seil** (Hör- und Motiv-Modus)
5. Hör-Button wiederholbar
6. Einfache Anlauttabelle (Teilmenge)
7. Transform mindestens **Mech** / **Auto** (oder Schiff)
8. Ein Mathe-Schild
9. Minimaler Editor: Wort + Lösung + Hinweis-Modus speichern/laden

---

## 11. Designprinzipien

- Schreiben = Weltmacht und Mech-Gestalt, nicht reines Quiz-Overlay
- Bei Textfeld-Rätseln immer pausieren
- Pen-Tastatur nutzen; Auswertung als Text
- Hör-Hinweise immer wiederholbar
- Anlauttabelle als Hilfsmittel, nicht als Autovervollständigung
- Fehlerfreundlich, kurze Sessions, klare visuelle Belohnung in der Welt
- Schwierigkeit über den Editor steigerbar, wenn das Kind Fortschritte macht
- Mechs als Helfer-Helden, Stil C, freundlich

---

## 12. Offene Punkte

- Exakter Tech-Stack und Projektstruktur im Repo
- Umfang der ersten Anlauttabelle (Vollsatz vs. Teilmenge)
- Ob Nachzeichnen im MVP enthalten ist
- Speichern von Editor-Inhalten nur lokal vs. Cloud/Datei-Sync
- Rechte/Credits für Anlaut-Didaktik (eigene Art, Leseschlau nur als strukturelles Vorbild)
```
