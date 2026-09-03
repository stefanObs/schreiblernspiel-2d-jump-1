#!/usr/bin/env bash
# Startet das Schreiblernspiel unter macOS ohne vorinstalliertes Node/npm.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
# shellcheck source=scripts/lib/node_runtime.sh
source "$ROOT/scripts/lib/node_runtime.sh"
run_game
