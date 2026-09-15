# Slices: buchstabenflieger

**Status:** Erledigt  
**Aufgabe:** Neues Minispiel Buchstaben-Flieger: Flug in 3 Höhen-Spuren; Radar-Booster (Membership Ja/Nein) und Spur-Booster (Anfang/Mitte/Ende); Wellen mit Buchstaben-Gegnern und Panzer; Sterne; Hangar-Sonderort.  
**Datum:** 2026-09-15  
**Zuschnitt:** ein Feature-Slice (Runtime+Station+beide Booster)  
**Pfad:** Fast-Path (Parent) — neues Minispiel, aber ein klarer Slice

Feature-Schritte, keine Prozess-Schritte.

## Reihenfolge

| ID | Datei | Feature | Hängt ab von | Status |
|----|-------|---------|----------------|--------|
| S01 | `S01-regeln-runtime-station.md` | Regeln, 2D-Runtime, Overlay/Pause, Hangar-Station | — | erledigt |

Status nur: `offen` → `in Arbeit` → `erledigt` (nach Pass + Git).

## Spielregeln (verbindlich)

- **Radar:** Ja/Nein „steckt Buchstabe im Wort?“ → bei richtig Membership-Welle (abschießen nur wenn im Wort, sonst ausweichen).
- **Spur:** Anfang/Mitte/Ende für exklusiven `letterPos`-Buchstaben → bei richtig Panzer nur aus der Spur (oben=Anfang, Mitte, unten=Ende).
- **Miss:** falsche Booster-Antwort, Schuss auf Distraktor, Kollision, Panzer-Schuss aus falscher Spur.
- **Win:** Radar-Welle (N Membership-Treffer) + Panzer zerstört.
- **Technik:** 2D Canvas; Pause-Overlay; kein Textfeld; Hör-Hinweis wiederholbar.

## Nicht in dieser Aufgabe

- Editor-UI / Tripo / neue PNGs
- Kettenhochhaus oder letterPos-Tafel umbauen
- Mehrere Stationen / Zufalls-Wortliste jenseits letterPos-Pool
