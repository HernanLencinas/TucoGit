#!/bin/bash

# Script para construir la aplicación para Mac, Windows y Linux
# Guarda los builds en build/ con subcarpetas por sistema operativo

# Colores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Directorio base
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Crear carpeta build si no existe
BUILD_DIR="build"
mkdir -p "$BUILD_DIR"

# Limpiar builds anteriores si existen
echo -e "${YELLOW}Limpiando builds anteriores...${NC}"
rm -rf "$BUILD_DIR/mac" "$BUILD_DIR/windows" "$BUILD_DIR/linux"
rm -rf dist  # Limpiar también el directorio dist temporal

# Configurar caché local para evitar problemas de permisos
echo -e "${YELLOW}Configurando caché de Electron...${NC}"
LOCAL_CACHE_DIR="$SCRIPT_DIR/.electron-cache"
mkdir -p "$LOCAL_CACHE_DIR"

# Intentar arreglar permisos de la caché del sistema
ELECTRON_CACHE_DIR="$HOME/Library/Caches/electron"
if [ -d "$ELECTRON_CACHE_DIR" ]; then
    # Intentar arreglar permisos
    chmod -R u+w "$ELECTRON_CACHE_DIR" 2>/dev/null || true
    # Intentar limpiar la caché
    rm -rf "$ELECTRON_CACHE_DIR"/* 2>/dev/null || {
        echo -e "${YELLOW}⚠ Problemas con la caché del sistema, usando caché local${NC}"
        # Usar caché local como alternativa
        export ELECTRON_CACHE="$LOCAL_CACHE_DIR"
        export ELECTRON_GET_USE_PROXY="false"
    }
else
    # Si no existe, usar caché local
    export ELECTRON_CACHE="$LOCAL_CACHE_DIR"
    export ELECTRON_GET_USE_PROXY="false"
fi

# Limpiar también la caché de app-builder
APP_BUILDER_CACHE="$HOME/Library/Caches/app-builder"
if [ -d "$APP_BUILDER_CACHE" ]; then
    chmod -R u+w "$APP_BUILDER_CACHE" 2>/dev/null || true
    rm -rf "$APP_BUILDER_CACHE"/* 2>/dev/null || true
fi

# Si aún hay problemas, usar caché completamente local
if [ -z "$ELECTRON_CACHE" ]; then
    export ELECTRON_CACHE="$LOCAL_CACHE_DIR"
fi

# Función para limpiar archivos innecesarios de una carpeta de build
clean_build_dir() {
    local platform_dir=$1
    local platform_name=$2
    
    if [ ! -d "$platform_dir" ]; then
        return
    fi
    
    echo -e "${YELLOW}Limpiando archivos innecesarios de $platform_name...${NC}"
    
    # Eliminar archivos .yml (metadatos de auto-update y debug)
    find "$platform_dir" -maxdepth 1 -type f \( -name "*.yml" -o -name "*.yaml" \) -delete 2>/dev/null || true
    
    # Eliminar archivos .blockmap (solo necesarios para auto-update)
    find "$platform_dir" -maxdepth 1 -type f -name "*.blockmap" -delete 2>/dev/null || true
    
    # Eliminar carpetas unpacked (aplicaciones descomprimidas)
    find "$platform_dir" -maxdepth 1 -type d \( -name "*-unpacked" -o -name "mac-arm64" -o -name "win-*-unpacked" -o -name "linux-*-unpacked" \) -exec rm -rf {} + 2>/dev/null || true
    
    echo -e "${GREEN}✓ Archivos innecesarios eliminados de $platform_name${NC}"
}

# Función para mover archivos de dist a la carpeta correspondiente
move_build() {
    local platform=$1
    local target_dir="$BUILD_DIR/$platform"
    
    if [ -d "dist" ] && [ "$(ls -A dist 2>/dev/null)" ]; then
        mkdir -p "$target_dir"
        mv dist/* "$target_dir/" 2>/dev/null || true
        echo -e "${GREEN}✓ Build de $platform guardado en $target_dir${NC}"
        
        # Limpiar archivos innecesarios después de mover
        clean_build_dir "$target_dir" "$platform"
    else
        echo -e "${YELLOW}⚠ No se encontraron archivos de build para $platform${NC}"
    fi
}

# Verificar que electron-builder esté instalado
if ! command -v electron-builder &> /dev/null && [ ! -f "node_modules/.bin/electron-builder" ]; then
    echo -e "${YELLOW}electron-builder no encontrado. Instalando dependencias...${NC}"
    npm install
fi

# Usar electron-builder local si existe
ELECTRON_BUILDER="npx electron-builder"

# Función para construir una plataforma
build_platform() {
    local platform=$1
    local platform_name=$2
    local flag=$3
    
    echo -e "\n${BLUE}Construyendo para $platform_name...${NC}"
    
    if $ELECTRON_BUILDER $flag; then
        move_build "$platform"
        return 0
    else
        echo -e "${RED}✗ Error al construir para $platform_name${NC}"
        return 1
    fi
}

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Iniciando build multiplataforma${NC}"
echo -e "${BLUE}========================================${NC}"

# Contadores de éxito/fallo
SUCCESS_COUNT=0
FAIL_COUNT=0

# Build para macOS
if build_platform "mac" "macOS" "--mac"; then
    ((SUCCESS_COUNT++))
else
    ((FAIL_COUNT++))
fi

# Build para Windows
if build_platform "windows" "Windows" "--win"; then
    ((SUCCESS_COUNT++))
else
    ((FAIL_COUNT++))
fi

# Build para Linux
if build_platform "linux" "Linux" "--linux"; then
    ((SUCCESS_COUNT++))
else
    ((FAIL_COUNT++))
fi

# Limpiar directorio dist si quedó vacío
rmdir dist 2>/dev/null || true

# Limpieza final de archivos innecesarios en todas las carpetas de build
echo -e "\n${YELLOW}Realizando limpieza final de archivos innecesarios...${NC}"
clean_build_dir "$BUILD_DIR/mac" "macOS"
clean_build_dir "$BUILD_DIR/windows" "Windows"
clean_build_dir "$BUILD_DIR/linux" "Linux"

# Limpiar todas las cachés al finalizar
echo -e "\n${YELLOW}Limpiando cachés...${NC}"

# Limpiar caché local
if [ -d "$LOCAL_CACHE_DIR" ]; then
    rm -rf "$LOCAL_CACHE_DIR"/* 2>/dev/null || true
    rmdir "$LOCAL_CACHE_DIR" 2>/dev/null || true
    echo -e "${GREEN}✓ Caché local eliminada${NC}"
fi

# Limpiar caché del sistema de Electron
if [ -d "$ELECTRON_CACHE_DIR" ]; then
    chmod -R u+w "$ELECTRON_CACHE_DIR" 2>/dev/null || true
    rm -rf "$ELECTRON_CACHE_DIR"/* 2>/dev/null || true
    echo -e "${GREEN}✓ Caché del sistema de Electron eliminada${NC}"
fi

# Limpiar caché de app-builder
if [ -d "$APP_BUILDER_CACHE" ]; then
    chmod -R u+w "$APP_BUILDER_CACHE" 2>/dev/null || true
    rm -rf "$APP_BUILDER_CACHE"/* 2>/dev/null || true
    echo -e "${GREEN}✓ Caché de app-builder eliminada${NC}"
fi

echo -e "\n${BLUE}========================================${NC}"
if [ $FAIL_COUNT -eq 0 ]; then
    echo -e "${GREEN}✓ Build completado exitosamente${NC}"
    echo -e "${GREEN}  Todas las plataformas construidas correctamente${NC}"
else
    echo -e "${YELLOW}⚠ Build completado con algunos errores${NC}"
    echo -e "${GREEN}  Exitosos: $SUCCESS_COUNT${NC}"
    echo -e "${RED}  Fallidos: $FAIL_COUNT${NC}"
fi
echo -e "${BLUE}========================================${NC}"

echo -e "\nBuilds guardados en:"
[ -d "$BUILD_DIR/mac" ] && echo -e "  ${GREEN}✓ macOS:${NC}   $BUILD_DIR/mac/" || echo -e "  ${RED}✗ macOS:${NC}   (no disponible)"
[ -d "$BUILD_DIR/windows" ] && echo -e "  ${GREEN}✓ Windows:${NC} $BUILD_DIR/windows/" || echo -e "  ${RED}✗ Windows:${NC} (no disponible)"
[ -d "$BUILD_DIR/linux" ] && echo -e "  ${GREEN}✓ Linux:${NC}    $BUILD_DIR/linux/" || echo -e "  ${RED}✗ Linux:${NC}    (no disponible)"

# Salir con código de error si hubo fallos
if [ $FAIL_COUNT -gt 0 ]; then
    exit 1
fi