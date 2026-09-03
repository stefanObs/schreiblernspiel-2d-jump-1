#!/bin/bash
# Doppelklick unter macOS: Terminal öffnen und Spiel starten.
cd "$(dirname "$0")" || exit 1
exec ./play-macos.sh
