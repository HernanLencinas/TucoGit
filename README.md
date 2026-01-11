# TucoGit

Aplicación de escritorio multiplataforma para gestionar y organizar tus repositorios Git. Construida con Electron, React, Vite y shadcn/ui.

## Características Principales

### Gestión de Repositorios
- **Organización en colecciones**: Organiza tus repositorios en colecciones personalizadas
- **Búsqueda avanzada**: Busca repositorios por nombre o descripción
- **Sistema de favoritos**: Marca tus repositorios más importantes
- **Vista de tarjetas**: Visualiza tus repositorios en tarjetas con información detallada
- **Clonación de repositorios**: Clona repositorios directamente desde la aplicación con barra de progreso

### Integración con Git
- **Gestión de branches**: Visualiza, crea y cambia entre branches locales y remotos
- **Historial Visual (Commit Graph)**: Visualización avanzada del historial con líneas de ramas y resaltado de selección
- **Gestión de cambios**: Detecta cambios sin commitear, stage/unstage de archivos, y commits
- **Detalles de Commit**: Vista detallada de cambios por archivo con resaltado de sintaxis
- **Configuración SSL**: Controla la verificación SSL de Git
- **Gestión de tags**: Crea y gestiona tags de Git
- **Stash**: Guarda temporalmente cambios con stash y gestiona múltiples stashes
- **Operaciones Git**: Fetch, pull, push y otras operaciones Git comunes

### Persistencia y Multitarea
- **Persistencia de Pestañas**: Cambia entre Inicio, Repositorios y Conexiones sin perder el estado de tu trabajo
- **Cliente Multi-repositorio**: Mantén varios repositorios abiertos simultáneamente y cambia entre ellos mediante chips persistentes
- **Estado Independiente**: Cada repositorio mantiene su propia posición de scroll y commit seleccionado

### Conexiones con Proveedores
- **Múltiples proveedores**: Soporte para GitHub, GitLab, Codeberg, Gitea, Gogs y servidores Git personalizados
- **Gestión de tokens**: Almacenamiento seguro de tokens de acceso con encriptación
- **Sincronización**: Refresca y sincroniza tus repositorios desde los proveedores
- **Edición de conexiones**: Edita y gestiona tus conexiones guardadas
- **Detalles de conexión**: Visualiza información detallada de tus cuentas (usuario, organizaciones, repositorios)

### Integración con IDEs
- **Apertura en IDEs**: Abre repositorios directamente en tu IDE favorito
- **Soporte múltiple**: Visual Studio Code, IntelliJ IDEA, PyCharm, Android Studio, Xcode, y más
- **Configuración personalizada**: Selecciona tu IDE predeterminado

### Personalización
- **Temas personalizables**: Múltiples temas claros y oscuros
- **Modo claro/oscuro**: Cambia entre temas según tu preferencia
- **Zoom configurable**: Ajusta el nivel de zoom de la interfaz
- **Interfaz responsiva**: Diseño adaptable a diferentes tamaños de ventana

### Características Técnicas
- Compatible con Linux, Windows y macOS
- React 18 con Vite para desarrollo rápido
- shadcn/ui como framework UI por defecto
- Tailwind CSS para estilos
- Configuración de seguridad (Context Isolation)
- Build automatizado para todas las plataformas
- Hot Module Replacement (HMR) en desarrollo

## Instalación

```bash
npm install--save-dev
```

## Desarrollo

Para ejecutar la aplicación en modo desarrollo (con HMR):

```bash
npm start
```

Esto iniciará el servidor de desarrollo de Vite y Electron automáticamente.

## Construcción

### Construir para todas las plataformas:
```bash
npm run build:all
```

### Construir para una plataforma específica:

**Linux:**
```bash
npm run build:linux
```

**Windows:**
```bash
npm run build:windows
```

**macOS:**
```bash
npm run build:mac
```

Los archivos construidos se encontrarán en la carpeta `dist/`.

## Estructura del Proyecto

```
TucoGit/
├── src/
│   ├── main/
│   │   └── main.js          # Proceso principal de Electron (IPC handlers, configuración)
│   ├── preload/
│   │   └── preload.js       # Script de preload para seguridad (API bridge)
│   ├── renderer/
│   │   ├── index.html       # HTML principal
│   │   ├── main.tsx         # Punto de entrada React
│   │   ├── App.tsx          # Componente principal de la aplicación
│   │   ├── index.css        # Estilos globales con Tailwind
│   │   ├── components/
│   │   │   ├── CommitDetails.tsx    # Vista de cambios en commits
│   │   │   ├── CommitGraph.tsx      # Visualización gráfica del historial
│   │   │   ├── GitStatusPanel.tsx    # Panel de estado de Git
│   │   │   ├── RepositoryDetails.tsx # Cliente Git principal (Vista detalle)
│   │   │   ├── Inicio/              # Vista de inicio
│   │   │   │   └── InicioView.tsx
│   │   │   └── Layout/              # Componentes de layout
│   │   │       └── Footer.tsx
│   │   ├── hooks/           # Custom hooks
│   │   │   ├── useConfig.ts
│   │   │   ├── useDebounce.ts
│   │   │   ├── useKeyboardShortcuts.ts
│   │   │   ├── useRepositories.ts
│   │   │   └── useTheme.ts
│   │   ├── types/           # Definiciones de tipos TypeScript
│   │   │   └── index.ts
│   │   └── utils/           # Utilidades
│   │       ├── avatar.ts
│   │       ├── date.ts
│   │       ├── repositories.ts
│   │       └── themes.ts
│   ├── components/
│   │   └── ui/              # Componentes shadcn/ui
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── toast.tsx
│   │       └── toaster.tsx
│   └── lib/
│       ├── utils.ts         # Utilidades (cn function)
│       └── use-toast.ts     # Hook para toasts
├── icons/                   # Iconos de la aplicación
│   ├── icon.icns            # Icono para macOS
│   ├── icon.ico             # Icono para Windows
│   └── icon.png             # Icono para Linux
├── vite.config.js           # Configuración de Vite
├── tailwind.config.js       # Configuración de Tailwind CSS
├── postcss.config.js        # Configuración de PostCSS
├── tsconfig.json            # Configuración de TypeScript
├── tsconfig.node.json       # Configuración de TypeScript para Node
├── components.json          # Configuración de shadcn/ui
├── package.json             # Configuración del proyecto
├── build-all.sh             # Script para construir todas las plataformas
└── README.md                # Documentación
```

## Componentes UI

Este proyecto usa **shadcn/ui** como framework UI por defecto. Los componentes están en `src/components/ui/`.

Para agregar más componentes de shadcn/ui, puedes usar:
```bash
npx shadcn-ui@latest add [component-name]
```

## Seguridad

Este proyecto implementa las mejores prácticas de seguridad de Electron:
- Context Isolation habilitado
- Node Integration deshabilitado en el renderer
- Preload script para comunicación segura
- Content Security Policy configurado

## Uso

### Primera Configuración

1. **Configuración inicial**: La aplicación creará automáticamente un archivo de configuración en `Documents/Tuco/tuco-settings.json` al iniciar por primera vez.

2. **Agregar conexiones**: 
   - Ve a la pestaña "Conexiones"
   - Haz clic en "Nueva Conexión"
   - Selecciona tu proveedor (GitHub, GitLab, Codeberg, Gitea, Gogs, etc.)
   - Ingresa tu token de acceso y URL del servidor (si aplica)
   - Valida la conexión

3. **Agregar repositorios**:
   - Ve a la pestaña "Repositorios"
   - Haz clic en "Nuevo Repositorio"
   - Selecciona una conexión
   - Elige el repositorio de la lista
   - Organízalo en una colección

4. **Clonar repositorios**:
   - Haz clic en el botón de clonar en cualquier tarjeta de repositorio
   - Selecciona la carpeta de destino
   - La aplicación mostrará el progreso de clonación

5. **Navegación entre Repositorios**:
   - Al abrir un repositorio, se añade un "chip" en la parte inferior
   - Puedes abrir múltiples repositorios y cambiar entre ellos instantáneamente
   - El estado de cada uno (commit seleccionado, scroll) se mantiene al cambiar de repo o de pestaña

### Atajos de Teclado

- `Ctrl/Cmd + K`: Búsqueda rápida
- `Ctrl/Cmd + ,`: Abrir configuración
- `Ctrl/Cmd + 1-4`: Cambiar entre pestañas

## Notas

### Requisitos Previos

- Node.js 18 o superior
- npm o yarn
- Git instalado en el sistema

### Iconos para Build

Los iconos ya están incluidos en la carpeta `icons/`:
- `icon.png` (para Linux)
- `icon.ico` (para Windows)
- `icon.icns` (para macOS)

### Configuración

La configuración de la aplicación se guarda en:
- **Linux/macOS**: `~/Documents/Tuco/tuco-settings.json`
- **Windows**: `%USERPROFILE%\Documents\Tuco\tuco-settings.json`

Este archivo contiene:
- Estructura de repositorios y colecciones
- Conexiones a proveedores Git (tokens encriptados)
- Preferencias de tema y zoom
- Configuración de IDE predeterminado
- Configuración de Git SSL, usuario y email
- Posición y tamaño de la ventana

### Seguridad

- Los tokens de acceso se almacenan encriptados en el archivo de configuración
- Cada instalación genera una clave de encriptación única
- Los tokens nunca se transmiten fuera de la aplicación
