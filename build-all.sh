#!/usr/bin/env bash

set -euo pipefail

# -------- Config --------
DIST_DIR="dist"
BUILD_DIR="build"

# -------- Helpers --------
log() {
  echo "▶ $1"
}

error() {
  echo "✖ ERROR: $1" >&2
  exit 1
}

check_command() {
  command -v "$1" >/dev/null 2>&1 || error "El comando '$1' no está instalado"
}

run_step() {
  log "$1"
  shift
  "$@" || error "Falló el paso: $1"
}

# -------- Validaciones iniciales --------
check_command npm

[ -f package.json ] || error "No se encontró package.json (ejecutá el script desde la raíz del proyecto)"

# -------- Limpieza --------
log "Limpiando builds anteriores"
rm -rf dist* build || error "No se pudo limpiar dist/build"

# -------- Descargar Deps --------
run_step "Descargar Deps" \
  npm i --save-dev

# -------- Builds --------
run_step "Build macOS (arm64 + x64)" \
  npm run build:mac -- dmg --arm64 --x64

run_step "Build Windows (arm64 + x64)" \
  npm run build:windows -- zip --arm64 --x64

run_step "Build Linux (arm64 + x64)" \
  npm run build:linux -- deb --x64

[ -d "$DIST_DIR" ] || error "No existe el directorio dist luego del build"

DMG_COUNT=$(ls dist/*.dmg 2>/dev/null | wc -l || true)
ZIP_COUNT=$(ls dist/*.zip 2>/dev/null | wc -l || true)
DEB_COUNT=$(ls dist/*.deb 2>/dev/null | wc -l || true)

if [ "$DMG_COUNT" -gt 0 ]; then
  log "DMGs generados: $DMG_COUNT"
elif [ "$ZIP_COUNT" -gt 0 ]; then
  log "ZIPs generados: $ZIP_COUNT"
else
  error "No se generaron archivos .dmg o .zip"
fi

if [ "$DEB_COUNT" -gt 0 ]; then
  log "DEBs generados: $DEB_COUNT"
else
  log "No se generaron .deb (puede ser esperado)"
fi

# -------- Organizar salida --------
log "Creando directorio build/"
mkdir -p "$BUILD_DIR"

log "Moviendo artefactos a build/"
mv dist/*.dmg "$BUILD_DIR/" 2>/dev/null || true
mv dist/*.zip "$BUILD_DIR/" 2>/dev/null || true
mv dist/*.deb "$BUILD_DIR/" 2>/dev/null || true

rm -rf "$DIST_DIR"*

log "Build finalizado correctamente 🎉"
log "Artefactos disponibles en ./$BUILD_DIR"
