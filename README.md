# Schreiblernspiel — 2D Jump & Run

Browser-Spiel (1. Klasse): Jump & Run mit Schreib-/Rechenrätseln. Konzept: [`docs/KONZEPT.md`](docs/KONZEPT.md). Ablauf: [`docs/ENTWICKLUNGSABLAUF.md`](docs/ENTWICKLUNGSABLAUF.md). MVP-Phasen: [`docs/plans/mvp/INDEX.md`](docs/plans/mvp/INDEX.md).

## Starten (ohne Vorinstallation)

Node.js und npm werden beim ersten Start nach `.tools/` heruntergeladen (Internet nötig). Danach:

| System | Starter |
|--------|---------|
| Linux | `./play-linux.sh` |
| macOS | `./play-macos.sh` oder Doppelklick `play-macos.command` |
| Windows | Doppelklick `play-windows.bat` |

Der Server lauscht auf allen Netzwerkkarten (`0.0.0.0:5173`), nicht nur localhost. Aufruf z. B. `http://<öffentliche-oder-LAN-IP>:5173/` und Editor `http://<IP>:5173/editor.html`. Firewall/Router müssen Port **5173** durchlassen.

Entwicklung mit bereits vorhandenem Node:

```bash
npm install
npm test
npm run dev
```

- Spiel: http://localhost:5173/ oder `http://<IP>:5173/`
- Editor: http://localhost:5173/editor.html

Steuerung: Touch-Buttons unten **oder Tastatur** (Pfeile / WASD, Springen mit Leertaste oder ↑). Beim Schreiben im Rätsel bleibt die Tastatur beim Textfeld.

Build: `npm run build`
