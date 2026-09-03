# Schreiblernspiel — 2D Jump & Run

Browser-Spiel (1. Klasse): Jump & Run mit Schreib-/Rechenrätseln. Konzept: [`docs/KONZEPT.md`](docs/KONZEPT.md). Ablauf: [`docs/ENTWICKLUNGSABLAUF.md`](docs/ENTWICKLUNGSABLAUF.md). MVP-Phasen: [`docs/plans/mvp/INDEX.md`](docs/plans/mvp/INDEX.md).

## Starten (ohne Vorinstallation)

Node.js und npm werden beim ersten Start nach `.tools/` heruntergeladen (Internet nötig). Danach:

| System | Starter |
|--------|---------|
| Linux | `./play-linux.sh` |
| macOS | `./play-macos.sh` oder Doppelklick `play-macos.command` |
| Windows | Doppelklick `play-windows.bat` |

Der Browser öffnet das Spiel (Vite, http://127.0.0.1:5173/). Editor: http://127.0.0.1:5173/editor.html

Entwicklung mit bereits vorhandenem Node:

```bash
npm install
npm test
npm run dev
```

- Spiel: http://localhost:5173/
- Editor: http://localhost:5173/editor.html

Steuerung: Touch-Buttons unten (Links/Rechts/Sprung). Schreiben: natives Textfeld + Windows Pen-Tastatur. Schwierigere Wörter: Editor → Speichern (localStorage) oder JSON exportieren.

Build: `npm run build`
