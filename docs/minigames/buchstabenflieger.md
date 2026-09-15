# Buchstaben-Flieger

Minispiel-Overlay: Mech in Flug-Pose, drei Höhen-Spuren, Gegner mit Buchstaben. Dieselben Didaktik-Fragen wie **Buchstaben-Position** (`letterPos`) und **Membership** (Buchstabenstraße / Bildwahl) — verpackt als **Booster**, die schwierige Gegner erst freischalten.

## Lernziel

| Booster | Frage (wie Tafel-Rätsel) | Spiel-Gestaltung |
|---------|--------------------------|------------------|
| **Radar** | Steckt der Buchstabe im Wort? (Ja/Nein) | Richtig → Membership-Welle: nur Buchstaben **im Wort** abschießen, andere ausweichen |
| **Spur** | Wo steckt der Buchstabe? Anfang / Mitte / Ende | Richtig → Panzer-Gegner nur aus der passenden Höhen-Spur zerstörbar |

Daten: `letterPositionPuzzle` (exklusive Position) + Membership über Wortzeichen; keine Textfeld-/Anlaut-Eingabe.

## Ablauf (eine Mission)

1. Zielwort hören (wiederholbar) + Anzeige.
2. **Radar-Frage** → bei Treffer Radar-Booster.
3. **Radar-Welle:** Buchstaben-Vögel kommen entgegen (eine Instanz, 3 Spuren). Schießen nur Membership; Distraktoren ausweichen. Nach N Treffern weiter.
4. **Spur-Frage** (Anfang/Mitte/Ende) → bei Treffer Spur-Booster.
5. **Panzer-Welle:** ein gepanzerter Gegner; Schuss nur wirksam in der richtigen Spur (Anfang=oben, Mitte, Ende=unten).
6. Win → Sterne über Fehlversuche → Continue → WorldEffect.

Falsche Booster-Antwort oder Fehlschuss/Kollision: `wrongAttempts++` (Sterne); Booster-Frage bleibt bis richtig.

## Steuerung

- Spur hoch/tief (Tasten ↑↓ / W S, Overlay-Buttons)
- Schießen (Leertaste / Schuss-Button) — nur in Wellen
- Booster-Fragen: große Ja/Nein- bzw. Anfang/Mitte/Ende-Buttons

## Technik

- Modul `src/minigames/buchstabenflieger/` — **2D-Canvas** (kein Tripo/Three)
- Pause + Overlay wie Ballkanone / Buchstabenstraße
- Sprite: bestehende Mech-Side-Art (`artPublicPath(…, "mech")`) als Platzhalter-Flug
- Sonderort: Hangar-Schild / Trigger (nicht auf Boden-Holztafeln remappen)
- Kategorie `buchstabenflieger` in Settings

## Abgrenzung

| Bestehend | Flieger |
|-----------|---------|
| `letterPos`-Tafel | Drei Buttons ohne Flug |
| Kettenhochhaus | Ketten + Axt, nur Position |
| Buchstabenstraße | Auto, nur Membership sammeln |
| Ballkanone | Wortreihenfolge schießen |

## Nicht (MVP)

- Neue Comic-/Tripo-Assets
- Editor-Felder
- Mehrere Wellen-Stufen / Schwierigkeitsgrade
- Echte Flug-Transform-Art
