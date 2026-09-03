#!/usr/bin/env bash
# Download a portable Node.js into .tools/ if needed (no system npm required).
set -euo pipefail

node_version() {
  tr -d '[:space:]' < "$ROOT/scripts/lib/node-version.txt"
}

node_arch() {
  local m
  m="$(uname -m)"
  case "$m" in
    x86_64|amd64) echo x64 ;;
    arm64|aarch64) echo arm64 ;;
    *)
      echo "Nicht unterstützte CPU: $m" >&2
      return 1
      ;;
  esac
}

download_file() {
  local url="$1" dest="$2"
  if command -v curl >/dev/null 2>&1; then
    curl -fsSL "$url" -o "$dest"
  elif command -v wget >/dev/null 2>&1; then
    wget -q "$url" -O "$dest"
  elif command -v python3 >/dev/null 2>&1; then
    python3 -c "import urllib.request; urllib.request.urlretrieve('$url', '$dest')"
  else
    echo "Zum Download wird curl, wget oder python3 benötigt." >&2
    return 1
  fi
}

# Sets NODE_BIN and NPM_BIN
ensure_portable_node() {
  local ver plat arch tarball url dir
  ver="$(node_version)"
  arch="$(node_arch)"
  case "$(uname -s)" in
    Linux) plat="linux" ;;
    Darwin) plat="darwin" ;;
    *)
      echo "Bitte play-windows.bat unter Windows verwenden." >&2
      return 1
      ;;
  esac
  dir="$ROOT/.tools/node-v${ver}-${plat}-${arch}"
  NODE_BIN="$dir/bin/node"
  NPM_BIN="$dir/bin/npm"
  if [[ -x "$NODE_BIN" && -e "$NPM_BIN" ]]; then
    return 0
  fi
  mkdir -p "$ROOT/.tools"
  tarball="$ROOT/.tools/node-v${ver}-${plat}-${arch}.tar.gz"
  url="https://nodejs.org/dist/v${ver}/node-v${ver}-${plat}-${arch}.tar.gz"
  echo "Lade Node.js v${ver} (${plat}-${arch}) …"
  download_file "$url" "$tarball"
  tar -xzf "$tarball" -C "$ROOT/.tools"
  rm -f "$tarball"
  if [[ ! -x "$NODE_BIN" ]]; then
    echo "Node-Download unvollständig: $NODE_BIN" >&2
    return 1
  fi
}

run_game() {
  ensure_portable_node
  export PATH="$(dirname "$NODE_BIN"):$PATH"
  echo "Node: $("$NODE_BIN" -v)  npm: $("$NPM_BIN" -v)"
  cd "$ROOT"
  echo "Installiere Abhängigkeiten …"
  "$NPM_BIN" install
  echo "Starte Spiel (Browser öffnet sich) …"
  exec "$NPM_BIN" run dev -- --host 0.0.0.0 --open
}
