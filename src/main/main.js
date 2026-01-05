const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const https = require('https');
const http = require('http');
const chokidar = require('chokidar');

let mainWindow;
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

// Almacenar watchers activos por repositorio
const activeWatchers = new Map();

// Función para iniciar el watcher de un repositorio
function startRepositoryWatcher(repoPath) {
  // Si ya existe un watcher para este repo, no crear otro
  if (activeWatchers.has(repoPath)) {
    return;
  }

  if (!fs.existsSync(repoPath) || !fs.existsSync(path.join(repoPath, '.git'))) {
    return;
  }

  // Crear watcher que monitorea todo el directorio del repositorio
  // Excluir .git para evitar loops infinitos
  const watcher = chokidar.watch(repoPath, {
    ignored: [
      /(^|[\/\\])\../, // Ignorar archivos ocultos
      /node_modules/,
      /\.git\/objects/,
      /\.git\/refs/,
      /\.git\/index\.lock/,
      /\.git\/logs/
    ],
    persistent: true,
    ignoreInitial: true, // No disparar eventos para archivos existentes
    awaitWriteFinish: {
      stabilityThreshold: 500, // Esperar 500ms de estabilidad antes de disparar
      pollInterval: 100
    }
  });

  // Debounce para evitar demasiadas actualizaciones
  let debounceTimer;
  const debounceDelay = 1000; // 1 segundo

  const notifyStatusChange = () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('git-status-changed', repoPath);
      }
    }, debounceDelay);
  };

  // Escuchar cambios en archivos
  watcher.on('change', (filePath) => {
    notifyStatusChange();
  });

  watcher.on('add', (filePath) => {
    notifyStatusChange();
  });

  watcher.on('unlink', (filePath) => {
    notifyStatusChange();
  });

  watcher.on('error', (error) => {
    console.error('Error en watcher del repositorio:', error);
  });

  activeWatchers.set(repoPath, watcher);
  console.log(`Watcher iniciado para: ${repoPath}`);
}

// Función para detener el watcher de un repositorio
function stopRepositoryWatcher(repoPath) {
  const watcher = activeWatchers.get(repoPath);
  if (watcher) {
    watcher.close();
    activeWatchers.delete(repoPath);
    console.log(`Watcher detenido para: ${repoPath}`);
  }
}

// Limpiar todos los watchers cuando la app se cierra
app.on('before-quit', () => {
  activeWatchers.forEach((watcher, repoPath) => {
    watcher.close();
  });
  activeWatchers.clear();
});

// Función helper para obtener el tamaño y posición guardados de la ventana
function getWindowBounds() {
  try {
    const os = require('os');
    const configDir = path.join(os.homedir(), 'Documents', 'Tuco');
    const configFile = path.join(configDir, 'tuco-settings.json');

    if (fs.existsSync(configFile)) {
      const configData = JSON.parse(fs.readFileSync(configFile, 'utf-8'));
      const windowBounds = configData.configuracion?.windowBounds;

      if (windowBounds && windowBounds.width && windowBounds.height) {
        // Validar que el tamaño esté dentro de límites razonables
        const minWidth = 800;
        const minHeight = 600;
        const maxWidth = 3840;
        const maxHeight = 2160;

        const width = Math.max(minWidth, Math.min(maxWidth, windowBounds.width));
        const height = Math.max(minHeight, Math.min(maxHeight, windowBounds.height));

        return {
          width,
          height,
          x: windowBounds.x,
          y: windowBounds.y
        };
      }
    }
  } catch (error) {
    console.error('Error al leer windowBounds de configuración:', error);
  }

  // Valores por defecto
  return {
    width: 1200,
    height: 800
  };
}

// Función helper para guardar el tamaño y posición de la ventana
function saveWindowBounds() {
  if (!mainWindow) return;

  try {
    const bounds = mainWindow.getBounds();
    const os = require('os');
    const configDir = path.join(os.homedir(), 'Documents', 'Tuco');
    const configFile = path.join(configDir, 'tuco-settings.json');

    if (fs.existsSync(configFile)) {
      const configData = JSON.parse(fs.readFileSync(configFile, 'utf-8'));

      if (!configData.configuracion) {
        configData.configuracion = {};
      }

      configData.configuracion.windowBounds = {
        width: bounds.width,
        height: bounds.height,
        x: bounds.x,
        y: bounds.y
      };

      configData.ultimaActualizacion = new Date().toISOString();
      fs.writeFileSync(configFile, JSON.stringify(configData, null, 2), 'utf-8');
    }
  } catch (error) {
    console.error('Error al guardar windowBounds:', error);
  }
}

function createWindow() {
  // Obtener la ruta absoluta del preload
  const preloadPath = isDev
    ? path.join(__dirname, '../preload/preload.js')
    : path.join(__dirname, '../preload/preload.js');

  console.log('Preload path:', preloadPath);
  console.log('Preload exists:', fs.existsSync(preloadPath));

  // Obtener tamaño y posición guardados
  const windowBounds = getWindowBounds();

  const windowOptions = {
    width: windowBounds.width,
    height: windowBounds.height,
    webPreferences: {
      preload: preloadPath,
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false // Desactivar sandbox para permitir m?dulos de Node.js en preload
    },
    icon: path.join(__dirname, '../../icons/icon.png')
  };

  // Personalización para macOS
  if (process.platform === 'darwin') {
    windowOptions.titleBarStyle = 'hiddenInset'; // Oculta la barra de título pero mantiene los botones de tráfico con espaciado
    windowOptions.trafficLightPosition = { x: 20, y: 20 }; // Posición personalizada de los botones de tráfico
  }

  // Agregar posición si está disponible
  if (windowBounds.x !== undefined && windowBounds.y !== undefined) {
    windowOptions.x = windowBounds.x;
    windowOptions.y = windowBounds.y;
  }

  mainWindow = new BrowserWindow(windowOptions);

  // En desarrollo, cargar desde Vite dev server (solo localhost)
  // En producci?n, cargar desde archivos compilados
  if (isDev) {
    // Solo permitir localhost en desarrollo para seguridad
    // NOTA: HTTP en localhost es seguro para desarrollo local
    const devUrl = 'http://localhost:5173';
    // Validar que solo sea localhost
    if (devUrl.includes('localhost') || devUrl.includes('127.0.0.1')) {
      mainWindow.loadURL(devUrl).catch((err) => {
        console.error('Error loading dev server:', err);
      });
    } else {
      console.error('Security: Only localhost is allowed in development');
      app.quit();
    }
  } else {
    // En producci?n, cargar desde archivos compilados
    // app.getAppPath() devuelve la ruta correcta tanto en desarrollo como en producción
    const htmlPath = path.join(app.getAppPath(), 'dist-renderer', 'index.html');

    console.log('App path:', app.getAppPath());
    console.log('HTML path:', htmlPath);

    // loadFile maneja automáticamente archivos dentro del .asar
    mainWindow.loadFile(htmlPath).catch((err) => {
      console.error('Error al cargar index.html:', err);
      // Si falla, intentar construir la URL manualmente
      const fileUrl = `file://${htmlPath}`;
      console.log('Intentando con URL manual:', fileUrl);
      mainWindow.loadURL(fileUrl).catch((urlErr) => {
        console.error('Error con URL manual:', urlErr);
        // Último fallback: intentar con __dirname
        const fallbackPath = path.join(__dirname, '../../dist-renderer/index.html');
        console.log('Intentando fallback final:', fallbackPath);
        mainWindow.loadFile(fallbackPath).catch((finalErr) => {
          console.error('Error final:', finalErr);
          app.quit();
        });
      });
    });
  }

  // Guardar tamaño y posición cuando la ventana se redimensione o mueva
  let saveBoundsTimeout;
  const debounceSaveBounds = () => {
    clearTimeout(saveBoundsTimeout);
    saveBoundsTimeout = setTimeout(() => {
      saveWindowBounds();
    }, 500); // Guardar después de 500ms de inactividad
  };

  mainWindow.on('resize', debounceSaveBounds);
  mainWindow.on('move', debounceSaveBounds);

  // Guardar al cerrar la ventana
  mainWindow.on('closed', () => {
    saveWindowBounds();
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Handler para obtener la ruta de documentos del usuario
ipcMain.handle('get-documents-path', async () => {
  const os = require('os');
  return path.join(os.homedir(), 'Documents');
});

// Handler para seleccionar carpeta
ipcMain.handle('select-folder', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory'],
    title: 'Seleccionar carpeta para configuraci?n'
  });

  if (!result.canceled && result.filePaths.length > 0) {
    return result.filePaths[0];
  }
  return null;
});

// Handler para inicializar configuraci?n (crear carpeta y archivo si no existen)
ipcMain.handle('initialize-config', async (event, configPath) => {
  try {
    const configDir = path.join(configPath, 'Tuco');
    const configFile = path.join(configDir, 'tuco-settings.json');

    console.log('Inicializando configuraci?n en:', configDir);

    // Crear carpeta Tuco si no existe
    if (!fs.existsSync(configDir)) {
      console.log('Creando carpeta:', configDir);
      fs.mkdirSync(configDir, { recursive: true });
    } else {
      console.log('La carpeta ya existe:', configDir);
    }

    // Crear archivo tuco-settings.json con configuraci?n base si no existe
    if (!fs.existsSync(configFile)) {
      console.log('Creando archivo de configuraci?n:', configFile);

      // Generar una clave de encriptaci?n aleatoria
      const randomKey = crypto.randomBytes(32);
      const keyHex = randomKey.toString('hex');

      const configBase = {
        version: "1.0.0",
        encryptionKey: keyHex, // Guardar la clave de encriptaci?n
        repositorios: [
          {
            id: "root",
            nombre: "Mis repositorios",
            tipo: "coleccion",
            hijos: []
          }
        ],
        conexiones: [],
        configuracion: {
          tema: "dark",
          temaNombre: "default",
          zoomLevel: 100,
          gitSslVerify: true,
          rutaConfiguracion: configDir,
          windowBounds: {
            width: 1200,
            height: 800
          }
        },
        fechaCreacion: new Date().toISOString(),
        ultimaActualizacion: new Date().toISOString()
      };

      fs.writeFileSync(configFile, JSON.stringify(configBase, null, 2), 'utf-8');
      console.log('Archivo de configuraci?n creado exitosamente con clave de encriptaci?n');
    } else {
      console.log('El archivo de configuraci?n ya existe:', configFile);

      // Asegurar que el archivo existente tenga una clave de encriptaci?n
      const configData = JSON.parse(fs.readFileSync(configFile, 'utf-8'));
      if (!configData.encryptionKey) {
        // Generar y guardar una clave si no existe
        const randomKey = crypto.randomBytes(32);
        const keyHex = randomKey.toString('hex');
        configData.encryptionKey = keyHex;
        configData.ultimaActualizacion = new Date().toISOString();
        fs.writeFileSync(configFile, JSON.stringify(configData, null, 2), 'utf-8');
        console.log('Clave de encriptaci?n agregada al archivo de configuraci?n existente');
      }
    }

    // Leer y retornar la fecha de ?ltima actualizaci?n, el tema y los repositorios
    const configData = JSON.parse(fs.readFileSync(configFile, 'utf-8'));
    return {
      success: true,
      ruta: configDir,
      archivo: configFile,
      ultimaActualizacion: configData.ultimaActualizacion || new Date().toISOString(),
      tema: configData.configuracion?.tema || "dark",
      temaNombre: configData.configuracion?.temaNombre || "default",
      zoomLevel: configData.configuracion?.zoomLevel || 100,
      editorIDE: configData.configuracion?.editorIDE || null,
      gitSslVerify: configData.configuracion?.gitSslVerify !== undefined ? configData.configuracion.gitSslVerify : true,
      gitUserName: configData.configuracion?.gitUserName || "",
      gitUserEmail: configData.configuracion?.gitUserEmail || "",
      repositorios: configData.repositorios || []
    };
  } catch (error) {
    console.error('Error al inicializar configuraci?n:', error);
    return {
      success: false,
      error: error.message
    };
  }
});

// Función helper para obtener el valor de gitSslVerify de la configuración
function getGitSslVerify() {
  try {
    const os = require('os');
    const configDir = path.join(os.homedir(), 'Documents', 'Tuco');
    const configFile = path.join(configDir, 'tuco-settings.json');

    if (fs.existsSync(configFile)) {
      const configData = JSON.parse(fs.readFileSync(configFile, 'utf-8'));
      return configData.configuracion?.gitSslVerify !== undefined
        ? configData.configuracion.gitSslVerify
        : true; // Por defecto true
    }
    return true; // Por defecto true si no existe el archivo
  } catch (error) {
    console.error('Error al leer gitSslVerify de configuración:', error);
    return true; // Por defecto true en caso de error
  }
}

// Handler para leer la configuraci?n
ipcMain.handle('read-config', async () => {
  try {
    const os = require('os');
    const configDir = path.join(os.homedir(), 'Documents', 'Tuco');
    const configFile = path.join(configDir, 'tuco-settings.json');

    if (!fs.existsSync(configFile)) {
      return {
        success: false,
        error: 'Archivo de configuraci?n no existe'
      };
    }

    const configData = JSON.parse(fs.readFileSync(configFile, 'utf-8'));
    return {
      success: true,
      config: configData
    };
  } catch (error) {
    console.error('Error al leer configuraci?n:', error);
    return {
      success: false,
      error: error.message
    };
  }
});

// Handler para escribir/actualizar la configuraci?n
ipcMain.handle('write-config', async (event, updates) => {
  try {
    const os = require('os');
    const configDir = path.join(os.homedir(), 'Documents', 'Tuco');
    const configFile = path.join(configDir, 'tuco-settings.json');

    if (!fs.existsSync(configFile)) {
      return {
        success: false,
        error: 'Archivo de configuraci?n no existe'
      };
    }

    // Leer configuraci?n actual
    const configData = JSON.parse(fs.readFileSync(configFile, 'utf-8'));

    // Actualizar con los nuevos valores
    if (updates.tema !== undefined) {
      if (!configData.configuracion) {
        configData.configuracion = {};
      }
      configData.configuracion.tema = updates.tema;
    }

    if (updates.temaNombre !== undefined) {
      if (!configData.configuracion) {
        configData.configuracion = {};
      }
      configData.configuracion.temaNombre = updates.temaNombre;
    }

    if (updates.zoomLevel !== undefined) {
      if (!configData.configuracion) {
        configData.configuracion = {};
      }
      configData.configuracion.zoomLevel = updates.zoomLevel;
    }

    if (updates.editorIDE !== undefined) {
      if (!configData.configuracion) {
        configData.configuracion = {};
      }
      configData.configuracion.editorIDE = updates.editorIDE;
    }

    if (updates.gitSslVerify !== undefined) {
      if (!configData.configuracion) {
        configData.configuracion = {};
      }
      configData.configuracion.gitSslVerify = updates.gitSslVerify;
    }

    if (updates.gitUserName !== undefined) {
      if (!configData.configuracion) {
        configData.configuracion = {};
      }
      configData.configuracion.gitUserName = updates.gitUserName;
    }

    if (updates.gitUserEmail !== undefined) {
      if (!configData.configuracion) {
        configData.configuracion = {};
      }
      configData.configuracion.gitUserEmail = updates.gitUserEmail;
    }

    if (updates.repositorios !== undefined) {
      console.log('Guardando repositorios:', JSON.stringify(updates.repositorios, null, 2));
      configData.repositorios = updates.repositorios;
    }

    if (updates.conexiones !== undefined) {
      console.log('Guardando conexiones:', JSON.stringify(updates.conexiones, null, 2));
      configData.conexiones = updates.conexiones;
    }

    // Actualizar fecha de ?ltima actualizaci?n
    configData.ultimaActualizacion = new Date().toISOString();

    console.log('Escribiendo configuraci?n actualizada:', JSON.stringify(configData, null, 2));

    // Escribir archivo actualizado
    console.log('Escribiendo configuraci?n actualizada:', JSON.stringify(configData, null, 2));
    fs.writeFileSync(configFile, JSON.stringify(configData, null, 2), 'utf-8');
    console.log('Archivo de configuraci?n actualizado exitosamente');

    return {
      success: true
    };
  } catch (error) {
    console.error('Error al escribir configuraci?n:', error);
    return {
      success: false,
      error: error.message
    };
  }
});

// Handler para importar configuración completa (reemplaza todo el archivo)
ipcMain.handle('import-config', async (event, configData) => {
  try {
    const configFile = getConfigFilePath();
    const configDir = path.dirname(configFile);

    // Asegurar que el directorio existe
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }

    // Validar que configData tenga la estructura básica esperada
    if (!configData || typeof configData !== 'object') {
      return {
        success: false,
        error: 'Datos de configuración inválidos'
      };
    }

    // Actualizar fecha de última actualización
    configData.ultimaActualizacion = new Date().toISOString();

    // Si no tiene fechaCreacion, agregarla
    if (!configData.fechaCreacion) {
      configData.fechaCreacion = new Date().toISOString();
    }

    // Asegurar que tenga encryptionKey (importante para tokens encriptados)
    if (!configData.encryptionKey) {
      // Generar una nueva clave si no existe
      const randomKey = crypto.randomBytes(32);
      configData.encryptionKey = randomKey.toString('hex');
    }

    // Asegurar que tenga la estructura mínima requerida
    if (!configData.repositorios) {
      configData.repositorios = [
        {
          id: "root",
          nombre: "Mis repositorios",
          tipo: "coleccion",
          hijos: []
        }
      ];
    }

    if (!configData.conexiones) {
      configData.conexiones = [];
    }

    if (!configData.configuracion) {
      configData.configuracion = {
        tema: "dark",
        temaNombre: "default",
        zoomLevel: 100,
        gitSslVerify: true,
        rutaConfiguracion: configDir
      };
    }

    // Escribir el archivo completo
    fs.writeFileSync(configFile, JSON.stringify(configData, null, 2), 'utf-8');
    console.log('Configuración importada exitosamente');

    return {
      success: true
    };
  } catch (error) {
    console.error('Error al importar configuración:', error);
    return {
      success: false,
      error: error.message
    };
  }
});

// Funci?n helper para obtener la ruta del archivo de configuraci?n
function getConfigFilePath() {
  const os = require('os');
  const configDir = path.join(os.homedir(), 'Documents', 'Tuco');
  return path.join(configDir, 'tuco-settings.json');
}

// Funci?n para obtener o generar la clave de encriptaci?n
function getEncryptionKey() {
  try {
    const configFile = getConfigFilePath();

    // Si el archivo no existe, generar una clave aleatoria
    if (!fs.existsSync(configFile)) {
      // Generar una clave aleatoria de 32 bytes
      const randomKey = crypto.randomBytes(32);
      const keyHex = randomKey.toString('hex');

      // Crear el archivo de configuraci?n con la clave
      const configDir = path.dirname(configFile);
      if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir, { recursive: true });
      }

      const configBase = {
        version: "1.0.0",
        encryptionKey: keyHex, // Guardar la clave en el archivo
        repositorios: [
          {
            id: "root",
            nombre: "Mis repositorios",
            tipo: "coleccion",
            hijos: []
          }
        ],
        conexiones: [],
        configuracion: {
          tema: "dark",
          temaNombre: "default",
          zoomLevel: 100,
          gitSslVerify: true,
          rutaConfiguracion: configDir
        },
        fechaCreacion: new Date().toISOString(),
        ultimaActualizacion: new Date().toISOString()
      };

      fs.writeFileSync(configFile, JSON.stringify(configBase, null, 2), 'utf-8');
      console.log('Clave de encriptaci?n generada y guardada');
      return randomKey;
    }

    // Leer el archivo de configuraci?n
    const configData = JSON.parse(fs.readFileSync(configFile, 'utf-8'));

    // Si ya existe una clave, usarla
    if (configData.encryptionKey) {
      return Buffer.from(configData.encryptionKey, 'hex');
    }

    // Si no existe la clave, generarla y guardarla
    const randomKey = crypto.randomBytes(32);
    const keyHex = randomKey.toString('hex');

    configData.encryptionKey = keyHex;
    configData.ultimaActualizacion = new Date().toISOString();

    fs.writeFileSync(configFile, JSON.stringify(configData, null, 2), 'utf-8');
    console.log('Clave de encriptaci?n generada y guardada en configuraci?n existente');

    return randomKey;
  } catch (error) {
    console.error('Error al obtener/generar clave de encriptaci?n:', error);
    // Fallback: generar una clave temporal (no se guardar? pero permitir? funcionar)
    return crypto.randomBytes(32);
  }
}

// Handler para encriptar un token
ipcMain.handle('encrypt-token', async (event, token) => {
  try {
    if (!token) {
      return { success: false, error: 'Token vac?o' };
    }

    const key = getEncryptionKey();
    const iv = crypto.randomBytes(12); // IV de 12 bytes para AES-GCM

    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    let encrypted = cipher.update(token, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    // Obtener el tag de autenticaci?n
    const authTag = cipher.getAuthTag();

    // Combinar IV, tag de autenticaci?n y texto encriptado (IV:hex + ':' + authTag:hex + ':' + encrypted:hex)
    const result = iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;

    return {
      success: true,
      encryptedToken: result
    };
  } catch (error) {
    console.error('Error al encriptar token:', error);
    return {
      success: false,
      error: error.message
    };
  }
});

// Handler para desencriptar un token
ipcMain.handle('decrypt-token', async (event, encryptedToken) => {
  try {
    if (!encryptedToken) {
      return { success: false, error: 'Token encriptado vac?o' };
    }

    const key = getEncryptionKey();
    const parts = encryptedToken.split(':');

    // Soporte para formato antiguo (CBC) y nuevo (GCM)
    if (parts.length === 2) {
      // Formato antiguo CBC (para compatibilidad con tokens existentes)
      const iv = Buffer.from(parts[0], 'hex');
      const encrypted = parts[1];

      try {
        const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        return {
          success: true,
          token: decrypted
        };
      } catch (error) {
        return { success: false, error: 'Error al desencriptar token (formato antiguo): ' + error.message };
      }
    } else if (parts.length === 3) {
      // Formato nuevo GCM
      const iv = Buffer.from(parts[0], 'hex');
      const authTag = Buffer.from(parts[1], 'hex');
      const encrypted = parts[2];

      const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
      decipher.setAuthTag(authTag);

      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return {
        success: true,
        token: decrypted
      };
    } else {
      return { success: false, error: 'Formato de token encriptado inv?lido' };
    }
  } catch (error) {
    console.error('Error al desencriptar token:', error);
    return {
      success: false,
      error: error.message
    };
  }
});

// Función helper para obtener URL por defecto
function getUrlPorDefecto(proveedor) {
  if (!proveedor) return '';
  switch (proveedor.toLowerCase()) {
    case 'github':
      return 'https://github.com';
    case 'gitlab':
      return 'https://gitlab.com';
    case 'codeberg':
      return 'https://codeberg.org';
    case 'gitea':
      return '';
    case 'gogs':
      return '';
    default:
      return '';
  }
}

// Función helper para hacer peticiones HTTP/HTTPS
function makeRequest(url, options) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const httpModule = isHttps ? https : http;

    // Determinar si se debe verificar SSL (por defecto true, a menos que se especifique lo contrario)
    const sslVerify = options.sslVerify !== undefined ? options.sslVerify : true;

    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + (urlObj.search || ''),
      method: options.method || 'GET',
      headers: {
        ...options.headers,
        'User-Agent': options.headers['User-Agent'] || 'TucoGit',
        'Accept': options.headers['Accept'] || 'application/json'
      },
      timeout: 10000 // 10 segundos de timeout
    };

    // Para HTTPS, agregar configuración de verificación SSL
    if (isHttps) {
      requestOptions.rejectUnauthorized = sslVerify;
    }

    // Log para debug
    console.log(`[DEBUG makeRequest] URL completa: ${url}`);
    console.log(`[DEBUG makeRequest] hostname: ${requestOptions.hostname}`);
    console.log(`[DEBUG makeRequest] path: ${requestOptions.path}`);
    console.log(`[DEBUG makeRequest] sslVerify: ${sslVerify}`);
    console.log(`[DEBUG makeRequest] rejectUnauthorized: ${requestOptions.rejectUnauthorized}`);
    console.log(`[DEBUG makeRequest] headers:`, JSON.stringify(requestOptions.headers, null, 2));

    const req = httpModule.request(requestOptions, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: data
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Timeout: La petición tardó demasiado'));
    });

    if (options.body) {
      req.write(options.body);
    }

    req.end();
  });
}

// Handler para obtener repositorios de un proveedor Git
ipcMain.handle('get-git-repositories', async (event, { proveedor, token, urlServidor, gitSslVerify }) => {
  try {
    if (!token || !proveedor) {
      return { success: false, error: 'Token o proveedor no proporcionado' };
    }

    // Obtener gitSslVerify: usar el proporcionado, o leer de la configuración, o true por defecto
    const sslVerify = gitSslVerify !== undefined ? gitSslVerify : getGitSslVerify();

    let apiUrl = '';
    const headers = {
      'User-Agent': 'TucoGit',
      'Accept': 'application/json'
    };

    // Normalizar la URL base
    let baseUrl = (urlServidor || getUrlPorDefecto(proveedor) || '').trim();
    if (baseUrl && baseUrl.endsWith('/')) {
      baseUrl = baseUrl.slice(0, -1);
    }

    switch (proveedor.toLowerCase()) {
      case 'github':
        const isGitHubEnterprise = baseUrl &&
          !baseUrl.toLowerCase().includes('github.com') &&
          !baseUrl.toLowerCase().includes('api.github.com');

        if (isGitHubEnterprise) {
          apiUrl = `${baseUrl.replace(/\/$/, '')}/api/v3/user/repos?per_page=100&sort=updated&affiliation=owner,collaborator`;
        } else {
          apiUrl = 'https://api.github.com/user/repos?per_page=100&sort=updated&affiliation=owner,collaborator';
        }
        headers['Authorization'] = `Bearer ${token}`;
        headers['Accept'] = 'application/vnd.github.v3+json';
        headers['X-GitHub-Api-Version'] = '2022-11-28';
        break;
      case 'gitlab':
        if (baseUrl && baseUrl.includes('/api/v4')) {
          apiUrl = `${baseUrl}/projects?membership=true&per_page=100&order_by=last_activity_at`;
        } else if (baseUrl) {
          apiUrl = `${baseUrl}/api/v4/projects?membership=true&per_page=100&order_by=last_activity_at`;
        } else {
          apiUrl = 'https://gitlab.com/api/v4/projects?membership=true&per_page=100&order_by=last_activity_at';
        }
        headers['PRIVATE-TOKEN'] = token;
        break;
      case 'gitea':
      case 'gogs':
      case 'codeberg':
        if (!baseUrl) {
          return { success: false, error: `URL del servidor requerida para ${proveedor}` };
        }
        if (baseUrl.includes('/api/v1')) {
          apiUrl = `${baseUrl}/user/repos?limit=100`;
        } else {
          apiUrl = `${baseUrl.replace(/\/$/, '')}/api/v1/user/repos?limit=100`;
        }
        headers['Authorization'] = `token ${token}`;
        break;
      default:
        return { success: false, error: 'Proveedor no soportado' };
    }

    console.log(`[DEBUG] Obteniendo repositorios para ${proveedor}`);
    console.log(`[DEBUG] URL API: ${apiUrl}`);
    console.log(`[DEBUG] gitSslVerify: ${sslVerify}`);

    try {
      // Para Gitea, Gogs y Codeberg, necesitamos manejar paginación
      if (proveedor.toLowerCase() === 'gitea' || proveedor.toLowerCase() === 'gogs' || proveedor.toLowerCase() === 'codeberg') {
        let allRepos = [];
        let page = 1;
        const limit = 50; // Usar un límite razonable por página
        let hasMore = true;
        let totalCount = null;
        let lastPageCount = null; // Para detectar si estamos en un bucle
        const maxPages = 1000; // Límite de seguridad para evitar bucles infinitos

        // Normalizar baseUrl para asegurar que no tenga /api/v1 duplicado
        let normalizedBaseUrl = baseUrl;
        if (normalizedBaseUrl.includes('/api/v1')) {
          normalizedBaseUrl = normalizedBaseUrl.replace(/\/api\/v1.*$/, '');
        }
        normalizedBaseUrl = normalizedBaseUrl.replace(/\/$/, '');
        const apiBase = `${normalizedBaseUrl}/api/v1`;

        console.log(`[DEBUG] Base URL normalizada: ${normalizedBaseUrl}`);
        console.log(`[DEBUG] API Base: ${apiBase}`);

        while (hasMore && page <= maxPages) {
          // Construir URL con paginación
          const paginatedUrl = `${apiBase}/user/repos?page=${page}&limit=${limit}`;

          console.log(`[DEBUG] Obteniendo página ${page} de repositorios de ${proveedor}`);
          console.log(`[DEBUG] URL paginada: ${paginatedUrl}`);

          const response = await makeRequest(paginatedUrl, {
            method: 'GET',
            headers: headers,
            sslVerify: sslVerify
          });

          console.log(`[DEBUG] Status code: ${response.statusCode}`);
          console.log(`[DEBUG] Headers de respuesta:`, JSON.stringify(response.headers, null, 2));

          if (response.statusCode >= 200 && response.statusCode < 300) {
            let reposData;
            try {
              reposData = JSON.parse(response.data);
            } catch (e) {
              console.error(`[DEBUG] Error al parsear JSON:`, e);
              return { success: false, error: 'Error al parsear respuesta del servidor' };
            }

            // Verificar headers de paginación si están disponibles
            const xTotalCount = response.headers['x-total-count'] || response.headers['X-Total-Count'];
            if (xTotalCount) {
              totalCount = parseInt(xTotalCount, 10);
              console.log(`[DEBUG] Total de repositorios según header: ${totalCount}`);
            }

            // Verificar header Link para ver si hay más páginas
            const linkHeader = response.headers['link'] || response.headers['Link'];
            if (linkHeader) {
              console.log(`[DEBUG] Link header: ${linkHeader}`);
              // Buscar si hay un link "next"
              hasMore = linkHeader.includes('rel="next"') || linkHeader.includes('rel=next');
            }

            console.log(`[DEBUG] Repositorios en esta página: ${reposData ? reposData.length : 0}`);

            // Si no hay repositorios en esta página, terminamos
            if (!reposData || reposData.length === 0) {
              console.log(`[DEBUG] No hay más repositorios, terminando paginación`);
              hasMore = false;
              break;
            }

            // Agregar repositorios de esta página
            const pageRepos = reposData.map((repo) => ({
              id: repo.id.toString(),
              name: repo.name,
              full_name: repo.full_name || repo.name,
              description: repo.description || undefined,
              private: repo.private,
              clone_url: repo.clone_url
            }));

            allRepos = allRepos.concat(pageRepos);
            console.log(`[DEBUG] Total acumulado hasta ahora: ${allRepos.length}`);

            // Si tenemos el total del header y ya obtuvimos todos, terminamos
            if (totalCount !== null && allRepos.length >= totalCount) {
              console.log(`[DEBUG] Ya obtuvimos todos los repositorios (${allRepos.length}/${totalCount})`);
              hasMore = false;
              break;
            }

            // Detectar si estamos obteniendo la misma cantidad en páginas consecutivas sin headers
            // Esto puede indicar que el servidor tiene un límite fijo y estamos en la última página
            if (lastPageCount !== null && lastPageCount === reposData.length && !linkHeader && totalCount === null) {
              // Si obtuvimos la misma cantidad que la página anterior y no hay headers, probablemente es la última
              hasMore = false;
              console.log(`[DEBUG] Detectada misma cantidad de repositorios (${reposData.length}) en páginas consecutivas sin headers, asumiendo última página`);
              break;
            }
            lastPageCount = reposData.length;

            // Determinar si hay más páginas
            // Prioridad: 1) Link header, 2) Total count, 3) Cantidad de repositorios
            if (linkHeader) {
              // Si hay link header, usarlo para determinar si hay más páginas
              // hasMore ya fue establecido arriba basado en linkHeader
              if (hasMore) {
                page++;
                console.log(`[DEBUG] Hay más páginas según Link header, continuando con página ${page}`);
              } else {
                console.log(`[DEBUG] No hay más páginas según Link header`);
              }
            } else if (totalCount !== null) {
              // Si no hay link header pero tenemos total count, comparar
              if (allRepos.length < totalCount) {
                hasMore = true;
                page++;
                console.log(`[DEBUG] Hay más repositorios (${allRepos.length}/${totalCount}), continuando con página ${page}`);
              } else {
                hasMore = false;
                console.log(`[DEBUG] Ya obtuvimos todos los repositorios (${allRepos.length}/${totalCount})`);
              }
            } else {
              // Si no hay headers de paginación, usar la cantidad de repositorios
              // Si obtuvimos exactamente el límite solicitado, probablemente hay más páginas
              // Si obtuvimos menos, puede ser la última página O el servidor tiene un límite menor
              // Para estar seguros, intentaremos la siguiente página si obtuvimos al menos 30 repos
              // (ya que el default de Gitea es 30, si obtenemos menos de 30 es definitivamente la última)
              if (reposData.length === limit) {
                hasMore = true;
                page++;
                console.log(`[DEBUG] Obtuvimos ${limit} repositorios (límite solicitado), asumiendo que hay más páginas. Continuando con página ${page}`);
              } else if (reposData.length >= 30) {
                // Si obtuvimos entre 30 y el límite, puede haber más (el servidor puede tener un límite menor)
                // Intentar la siguiente página para estar seguros
                hasMore = true;
                page++;
                console.log(`[DEBUG] Obtuvimos ${reposData.length} repositorios (entre 30 y ${limit}), intentando siguiente página para verificar`);
              } else {
                // Si obtuvimos menos de 30, es definitivamente la última página
                hasMore = false;
                console.log(`[DEBUG] Obtuvimos ${reposData.length} repositorios (menos de 30), última página confirmada`);
              }
            }
          } else if (response.statusCode === 401 || response.statusCode === 403) {
            return { success: false, error: 'Token inválido o sin permisos suficientes' };
          } else {
            const errorMsg = response.data ? response.data.substring(0, 200) : 'Sin detalles';
            console.error(`[DEBUG] Error del servidor: ${response.statusCode} - ${errorMsg}`);
            return { success: false, error: `Error del servidor: ${response.statusCode} - ${errorMsg}` };
          }
        }

        if (page > maxPages) {
          console.warn(`[DEBUG] Se alcanzó el límite máximo de páginas (${maxPages}), deteniendo paginación`);
        }

        console.log(`[DEBUG] Paginación completada. Total de repositorios obtenidos: ${allRepos.length}`);
        if (totalCount !== null) {
          console.log(`[DEBUG] Total esperado según servidor: ${totalCount}`);
        }

        return {
          success: true,
          repositories: allRepos
        };
      }

      // Para GitHub y GitLab, usar la lógica original (ellos manejan paginación diferente)
      const response = await makeRequest(apiUrl, {
        method: 'GET',
        headers: headers,
        sslVerify: sslVerify
      });

      if (response.statusCode >= 200 && response.statusCode < 300) {
        let reposData;
        try {
          reposData = JSON.parse(response.data);
        } catch (e) {
          return { success: false, error: 'Error al parsear respuesta del servidor' };
        }

        // Normalizar los datos según el proveedor
        let repos = [];
        if (proveedor.toLowerCase() === 'github') {
          repos = reposData.map((repo) => ({
            id: repo.id.toString(),
            name: repo.name,
            full_name: repo.full_name,
            description: repo.description || undefined,
            private: repo.private,
            clone_url: repo.clone_url
          }));
        } else if (proveedor.toLowerCase() === 'gitlab') {
          repos = reposData.map((repo) => ({
            id: repo.id.toString(),
            name: repo.name,
            full_name: repo.path_with_namespace || repo.name,
            description: repo.description || undefined,
            private: repo.visibility !== 'public',
            clone_url: repo.http_url_to_repo
          }));
        }

        return {
          success: true,
          repositories: repos
        };
      } else if (response.statusCode === 401 || response.statusCode === 403) {
        return { success: false, error: 'Token inválido o sin permisos suficientes' };
      } else {
        const errorMsg = response.data ? response.data.substring(0, 200) : 'Sin detalles';
        return { success: false, error: `Error del servidor: ${response.statusCode} - ${errorMsg}` };
      }
    } catch (error) {
      if (error.message.includes('Timeout')) {
        return { success: false, error: 'Timeout: No se pudo conectar al servidor' };
      } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
        return { success: false, error: 'No se pudo conectar al servidor. Verifica la URL.' };
      }
      return { success: false, error: `Error de conexión: ${error.message}` };
    }
  } catch (error) {
    console.error('Error al obtener repositorios:', error);
    return {
      success: false,
      error: error.message || 'Error desconocido al obtener repositorios'
    };
  }
});

// Handler para validar un token de Git
ipcMain.handle('validate-git-token', async (event, { proveedor, token, urlServidor, gitSslVerify }) => {
  try {
    if (!token || !proveedor) {
      return { success: false, error: 'Token o proveedor no proporcionado' };
    }

    // Obtener gitSslVerify: usar el proporcionado, o leer de la configuración, o true por defecto
    const sslVerify = gitSslVerify !== undefined ? gitSslVerify : getGitSslVerify();

    let apiUrl = '';
    const headers = {
      'User-Agent': 'TucoGit',
      'Accept': 'application/json'
    };

    // Normalizar la URL base (remover trailing slash y espacios)
    let baseUrl = (urlServidor || getUrlPorDefecto(proveedor) || '').trim();
    if (baseUrl && baseUrl.endsWith('/')) {
      baseUrl = baseUrl.slice(0, -1);
    }

    switch (proveedor.toLowerCase()) {
      case 'github':
        // Para GitHub.com público, SIEMPRE usar api.github.com/user
        // Solo usar la URL base si es GitHub Enterprise (no contiene github.com)
        const isGitHubEnterprise = baseUrl &&
          !baseUrl.toLowerCase().includes('github.com') &&
          !baseUrl.toLowerCase().includes('api.github.com');

        if (isGitHubEnterprise) {
          // GitHub Enterprise Server - usar /api/v3/user
          apiUrl = `${baseUrl.replace(/\/$/, '')}/api/v3/user`;
        } else {
          // GitHub.com público - SIEMPRE usar api.github.com/user
          apiUrl = 'https://api.github.com/user';
        }
        headers['Authorization'] = `Bearer ${token}`;
        break;
      case 'gitlab':
        apiUrl = `${baseUrl}/api/v4/user`;
        headers['Authorization'] = `Bearer ${token}`;
        break;
      case 'gitea':
        if (!baseUrl) {
          return { success: false, error: 'URL del servidor requerida para Gitea' };
        }
        apiUrl = `${baseUrl}/api/v1/user`;
        headers['Authorization'] = `token ${token}`;
        break;
      case 'codeberg':
        apiUrl = `${baseUrl}/api/v1/user`;
        headers['Authorization'] = `token ${token}`;
        break;
      case 'gogs':
        if (!baseUrl) {
          return { success: false, error: 'URL del servidor requerida para Gogs' };
        }
        apiUrl = `${baseUrl}/api/v1/user`;
        headers['Authorization'] = `token ${token}`;
        break;
      default:
        return { success: false, error: 'Proveedor no soportado' };
    }

    console.log(`[DEBUG] Validando token para ${proveedor}`);
    console.log(`[DEBUG] URL base: ${baseUrl}`);
    console.log(`[DEBUG] URL API: ${apiUrl}`);
    console.log(`[DEBUG] gitSslVerify: ${sslVerify}`);
    console.log(`[DEBUG] Headers Authorization: ${headers['Authorization'] ? 'Presente' : 'Ausente'}`);

    try {
      const response = await makeRequest(apiUrl, {
        method: 'GET',
        headers: headers,
        sslVerify: sslVerify
      });

      console.log(`[DEBUG] Respuesta status: ${response.statusCode}`);
      console.log(`[DEBUG] Respuesta data (primeros 200 chars): ${response.data ? response.data.substring(0, 200) : 'vacío'}`);

      if (response.statusCode >= 200 && response.statusCode < 300) {
        // Token válido
        let userData;
        try {
          userData = JSON.parse(response.data);
        } catch (e) {
          // Si no se puede parsear, pero el status es 200, asumimos que es válido
          return { success: true, message: 'Token válido' };
        }

        return {
          success: true,
          message: 'Token válido',
          user: userData.login || userData.username || userData.name || 'Usuario'
        };
      } else if (response.statusCode === 401 || response.statusCode === 403) {
        return { success: false, error: 'Token inválido o sin permisos suficientes' };
      } else {
        const errorMsg = response.data ? response.data.substring(0, 200) : 'Sin detalles';
        return { success: false, error: `Error del servidor: ${response.statusCode} - ${errorMsg}` };
      }
    } catch (error) {
      if (error.message.includes('Timeout')) {
        return { success: false, error: 'Timeout: No se pudo conectar al servidor' };
      } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
        return { success: false, error: 'No se pudo conectar al servidor. Verifica la URL.' };
      }
      return { success: false, error: `Error de conexión: ${error.message}` };
    }
  } catch (error) {
    console.error('Error al validar token:', error);
    return {
      success: false,
      error: error.message || 'Error desconocido al validar el token'
    };
  }
});

// Handler para obtener información detallada de una conexión Git
ipcMain.handle('get-connection-details', async (event, { proveedor, token, urlServidor, gitSslVerify }) => {
  try {
    if (!token || !proveedor) {
      return { success: false, error: 'Token o proveedor no proporcionado' };
    }

    const sslVerify = gitSslVerify !== undefined ? gitSslVerify : getGitSslVerify();
    let baseUrl = (urlServidor || getUrlPorDefecto(proveedor) || '').trim();
    if (baseUrl && baseUrl.endsWith('/')) {
      baseUrl = baseUrl.slice(0, -1);
    }

    const headers = {
      'User-Agent': 'TucoGit',
      'Accept': 'application/json'
    };

    let userApiUrl = '';
    let orgsApiUrl = '';
    let reposApiUrl = '';

    switch (proveedor.toLowerCase()) {
      case 'github':
        const isGitHubEnterprise = baseUrl &&
          !baseUrl.toLowerCase().includes('github.com') &&
          !baseUrl.toLowerCase().includes('api.github.com');

        if (isGitHubEnterprise) {
          userApiUrl = `${baseUrl.replace(/\/$/, '')}/api/v3/user`;
          orgsApiUrl = `${baseUrl.replace(/\/$/, '')}/api/v3/user/orgs?per_page=100`;
          reposApiUrl = `${baseUrl.replace(/\/$/, '')}/api/v3/user/repos?per_page=100&affiliation=owner,collaborator`;
        } else {
          userApiUrl = 'https://api.github.com/user';
          orgsApiUrl = 'https://api.github.com/user/orgs?per_page=100';
          reposApiUrl = 'https://api.github.com/user/repos?per_page=100&affiliation=owner,collaborator';
        }
        headers['Authorization'] = `Bearer ${token}`;
        headers['Accept'] = 'application/vnd.github.v3+json';
        headers['X-GitHub-Api-Version'] = '2022-11-28';
        break;
      case 'gitlab':
        if (baseUrl && baseUrl.includes('/api/v4')) {
          userApiUrl = `${baseUrl}/user`;
          orgsApiUrl = `${baseUrl}/groups?per_page=100`;
          reposApiUrl = `${baseUrl}/projects?membership=true&per_page=100`;
        } else if (baseUrl) {
          userApiUrl = `${baseUrl}/api/v4/user`;
          orgsApiUrl = `${baseUrl}/api/v4/groups?per_page=100`;
          reposApiUrl = `${baseUrl}/api/v4/projects?membership=true&per_page=100`;
        } else {
          userApiUrl = 'https://gitlab.com/api/v4/user';
          orgsApiUrl = 'https://gitlab.com/api/v4/groups?per_page=100';
          reposApiUrl = 'https://gitlab.com/api/v4/projects?membership=true&per_page=100';
        }
        headers['Authorization'] = `Bearer ${token}`;
        break;
      case 'gitea':
      case 'codeberg':
        if (!baseUrl) {
          return { success: false, error: `URL del servidor requerida para ${proveedor}` };
        }
        if (baseUrl.includes('/api/v1')) {
          userApiUrl = `${baseUrl}/user`;
          orgsApiUrl = `${baseUrl}/user/orgs`;
          reposApiUrl = `${baseUrl}/user/repos?limit=1`;
        } else {
          userApiUrl = `${baseUrl.replace(/\/$/, '')}/api/v1/user`;
          orgsApiUrl = `${baseUrl.replace(/\/$/, '')}/api/v1/user/orgs`;
          reposApiUrl = `${baseUrl.replace(/\/$/, '')}/api/v1/user/repos?limit=1`;
        }
        headers['Authorization'] = `token ${token}`;
        break;
      case 'gogs':
        if (!baseUrl) {
          return { success: false, error: 'URL del servidor requerida para Gogs' };
        }
        if (baseUrl.includes('/api/v1')) {
          userApiUrl = `${baseUrl}/user`;
          orgsApiUrl = `${baseUrl}/user/orgs`;
          reposApiUrl = `${baseUrl}/user/repos?limit=1`;
        } else {
          userApiUrl = `${baseUrl.replace(/\/$/, '')}/api/v1/user`;
          orgsApiUrl = `${baseUrl.replace(/\/$/, '')}/api/v1/user/orgs`;
          reposApiUrl = `${baseUrl.replace(/\/$/, '')}/api/v1/user/repos?limit=1`;
        }
        headers['Authorization'] = `token ${token}`;
        break;
      default:
        return { success: false, error: 'Proveedor no soportado' };
    }

    // Obtener información del usuario
    const userResponse = await makeRequest(userApiUrl, {
      method: 'GET',
      headers: headers,
      sslVerify: sslVerify
    });

    if (userResponse.statusCode < 200 || userResponse.statusCode >= 300) {
      return { success: false, error: 'Error al obtener información del usuario' };
    }

    const userData = JSON.parse(userResponse.data);
    const userName = userData.login || userData.username || userData.name || 'Usuario';
    const createdAt = userData.created_at || null;

    // Obtener organizaciones
    let organizations = [];
    try {
      const orgsResponse = await makeRequest(orgsApiUrl, {
        method: 'GET',
        headers: headers,
        sslVerify: sslVerify
      });

      if (orgsResponse.statusCode >= 200 && orgsResponse.statusCode < 300) {
        const orgsData = JSON.parse(orgsResponse.data);
        organizations = orgsData.map((org) => {
          // GitHub usa 'login', GitLab usa 'path' o 'full_path', Gitea/Gogs usan 'username' o 'full_name'
          return org.login || org.username || org.name || org.path || org.full_name || org.full_path || String(org);
        });
      }
    } catch (error) {
      console.error('Error al obtener organizaciones:', error);
    }

    // Obtener total de repositorios (usando headers de paginación)
    let totalRepos = 0;
    let publicRepos = 0;
    let privateRepos = 0;

    try {
      // Construir URL para obtener repositorios con paginación
      let reposUrl = reposApiUrl;
      if (proveedor.toLowerCase() === 'github') {
        reposUrl = reposApiUrl.replace('per_page=1', 'per_page=100');
      } else if (proveedor.toLowerCase() === 'gitlab') {
        reposUrl = reposApiUrl.replace('per_page=1', 'per_page=100');
      } else {
        reposUrl = reposApiUrl.replace('limit=1', 'limit=100');
      }

      const reposResponse = await makeRequest(reposUrl, {
        method: 'GET',
        headers: headers,
        sslVerify: sslVerify
      });

      if (reposResponse.statusCode >= 200 && reposResponse.statusCode < 300) {
        const reposData = JSON.parse(reposResponse.data);

        // Contar públicos y privados
        reposData.forEach((repo) => {
          if (repo.private === false || repo.visibility === 'public') {
            publicRepos++;
          } else {
            privateRepos++;
          }
        });

        // Intentar obtener el total del header Link o Content-Range
        const linkHeader = reposResponse.headers?.['link'] || reposResponse.headers?.['Link'];
        if (linkHeader) {
          const match = linkHeader.match(/page=(\d+)>; rel="last"/);
          if (match) {
            const lastPage = parseInt(match[1], 10);
            totalRepos = (lastPage - 1) * 100 + reposData.length;
          } else {
            totalRepos = reposData.length;
          }
        } else {
          totalRepos = reposData.length;
        }
      }
    } catch (error) {
      console.error('Error al obtener repositorios:', error);
    }

    return {
      success: true,
      data: {
        userName,
        createdAt,
        organizations,
        totalRepos,
        publicRepos,
        privateRepos
      }
    };
  } catch (error) {
    console.error('Error al obtener detalles de conexión:', error);
    return {
      success: false,
      error: error.message || 'Error desconocido al obtener detalles de conexión'
    };
  }
});

// Handler para detectar editores IDE instalados
ipcMain.handle('detect-installed-editors', async () => {
  try {
    const os = require('os');
    const platform = process.platform;
    const installedEditors = [];

    // Mapeo de editores a sus rutas comunes según el sistema operativo
    const editorPaths = {
      'Visual Studio Code': {
        darwin: ['/Applications/Visual Studio Code.app'],
        win32: [
          path.join(process.env['ProgramFiles'] || 'C:\\Program Files', 'Microsoft VS Code', 'Code.exe'),
          path.join(process.env['LOCALAPPDATA'] || '', 'Programs', 'Microsoft VS Code', 'Code.exe')
        ],
        linux: [
          '/usr/bin/code',
          '/usr/local/bin/code',
          path.join(os.homedir(), '.local', 'bin', 'code')
        ]
      },
      'Cursor': {
        darwin: ['/Applications/Cursor.app'],
        win32: [
          path.join(process.env['LOCALAPPDATA'] || '', 'Programs', 'cursor', 'Cursor.exe'),
          path.join(process.env['ProgramFiles'] || 'C:\\Program Files', 'Cursor', 'Cursor.exe')
        ],
        linux: [
          '/usr/bin/cursor',
          path.join(os.homedir(), '.local', 'bin', 'cursor')
        ]
      },
      'Atom': {
        darwin: ['/Applications/Atom.app'],
        win32: [
          path.join(process.env['LOCALAPPDATA'] || '', 'atom', 'atom.exe'),
          path.join(process.env['ProgramFiles'] || 'C:\\Program Files', 'Atom', 'atom.exe')
        ],
        linux: [
          '/usr/bin/atom',
          path.join(os.homedir(), '.local', 'bin', 'atom')
        ]
      },
      'Sublime Text': {
        darwin: ['/Applications/Sublime Text.app'],
        win32: [
          path.join(process.env['ProgramFiles'] || 'C:\\Program Files', 'Sublime Text', 'sublime_text.exe')
        ],
        linux: [
          '/usr/bin/subl',
          '/opt/sublime_text/sublime_text'
        ]
      },
      'IntelliJ IDEA': {
        darwin: ['/Applications/IntelliJ IDEA.app', '/Applications/IntelliJ IDEA CE.app', '/Applications/IntelliJ IDEA Ultimate.app'],
        win32: [
          path.join(process.env['LOCALAPPDATA'] || '', 'Programs', 'JetBrains', 'IntelliJ IDEA Community Edition', 'bin', 'idea64.exe'),
          path.join(process.env['ProgramFiles'] || 'C:\\Program Files', 'JetBrains', 'IntelliJ IDEA Community Edition', 'bin', 'idea64.exe')
        ],
        linux: [
          path.join(os.homedir(), '.local', 'share', 'JetBrains', 'Toolbox', 'apps', 'IDEA-C', 'ch-0', 'bin', 'idea.sh'),
          '/usr/local/bin/idea'
        ]
      },
      'PyCharm': {
        darwin: ['/Applications/PyCharm.app', '/Applications/PyCharm CE.app', '/Applications/PyCharm Professional.app'],
        win32: [
          path.join(process.env['LOCALAPPDATA'] || '', 'Programs', 'JetBrains', 'PyCharm Community Edition', 'bin', 'pycharm64.exe'),
          path.join(process.env['ProgramFiles'] || 'C:\\Program Files', 'JetBrains', 'PyCharm Community Edition', 'bin', 'pycharm64.exe')
        ],
        linux: [
          path.join(os.homedir(), '.local', 'share', 'JetBrains', 'Toolbox', 'apps', 'PyCharm-C', 'ch-0', 'bin', 'pycharm.sh'),
          '/usr/local/bin/pycharm'
        ]
      },
      'WebStorm': {
        darwin: ['/Applications/WebStorm.app'],
        win32: [
          path.join(process.env['LOCALAPPDATA'] || '', 'Programs', 'JetBrains', 'WebStorm', 'bin', 'webstorm64.exe'),
          path.join(process.env['ProgramFiles'] || 'C:\\Program Files', 'JetBrains', 'WebStorm', 'bin', 'webstorm64.exe')
        ],
        linux: [
          path.join(os.homedir(), '.local', 'share', 'JetBrains', 'Toolbox', 'apps', 'WebStorm', 'ch-0', 'bin', 'webstorm.sh'),
          '/usr/local/bin/webstorm'
        ]
      },
      'Android Studio': {
        darwin: ['/Applications/Android Studio.app'],
        win32: [
          path.join(process.env['LOCALAPPDATA'] || '', 'Programs', 'Android', 'Android Studio', 'bin', 'studio64.exe'),
          path.join(process.env['ProgramFiles'] || 'C:\\Program Files', 'Android', 'Android Studio', 'bin', 'studio64.exe')
        ],
        linux: [
          path.join(os.homedir(), '.local', 'share', 'applications', 'jetbrains-studio.desktop'),
          '/opt/android-studio/bin/studio.sh'
        ]
      },
      'Xcode': {
        darwin: ['/Applications/Xcode.app'],
        win32: [],
        linux: []
      },
      'Google Antigravity': {
        darwin: ['/Applications/Google Antigravity.app'],
        win32: [
          path.join(process.env['LOCALAPPDATA'] || '', 'Programs', 'Google Antigravity', 'antigravity.exe')
        ],
        linux: [
          path.join(os.homedir(), '.local', 'bin', 'antigravity')
        ]
      }
    };

    // Verificar cada editor
    for (const [editorName, paths] of Object.entries(editorPaths)) {
      const platformPaths = paths[platform] || [];

      for (const editorPath of platformPaths) {
        try {
          if (fs.existsSync(editorPath)) {
            installedEditors.push(editorName);
            break;
          }
        } catch (err) {
          // Continuar con el siguiente path
          continue;
        }
      }
    }

    // Para macOS, también verificar con mdfind para algunos editores
    if (platform === 'darwin') {
      const { execSync } = require('child_process');
      const editorsToCheck = {
        'IntelliJ IDEA': ['IntelliJ IDEA', 'IntelliJ'],
        'PyCharm': ['PyCharm'],
        'WebStorm': ['WebStorm'],
        'Android Studio': ['Android Studio'],
        'Cursor': ['Cursor'],
        'Sublime Text': ['Sublime Text'],
        'Atom': ['Atom'],
        'Visual Studio Code': ['Visual Studio Code', 'Code'],
        'Xcode': ['Xcode'],
        'Google Antigravity': ['Antigravity', 'Google Antigravity']
      };

      for (const [editorName, searchTerms] of Object.entries(editorsToCheck)) {
        if (!installedEditors.includes(editorName)) {
          for (const searchTerm of searchTerms) {
            try {
              const result = execSync(`mdfind "kMDItemKind == 'Application' && kMDItemDisplayName == '*${searchTerm}*'"`, { encoding: 'utf-8', timeout: 2000, stdio: 'pipe' });
              if (result.trim()) {
                installedEditors.push(editorName);
                break;
              }
            } catch (err) {
              // Ignorar errores de mdfind
              continue;
            }
          }
        }
      }
    }

    return {
      success: true,
      editors: installedEditors
    };
  } catch (error) {
    console.error('Error al detectar editores instalados:', error);
    return {
      success: false,
      error: error.message,
      editors: []
    };
  }
});

// Handler para abrir una carpeta en un IDE específico
ipcMain.handle('open-in-ide', async (event, { path: repoPath, ideName }) => {
  const { exec } = require('child_process');

  return new Promise((resolve) => {
    try {
      if (!fs.existsSync(repoPath)) {
        console.error(`[DEBUG] Error: La ruta no existe: ${repoPath}`);
        return resolve({ success: false, error: 'La ruta del repositorio no existe localmente.' });
      }

      let command = '';
      const isMac = process.platform === 'darwin';

      switch (ideName) {
        case 'Visual Studio Code':
          command = isMac ? `open -a "Visual Studio Code" "${repoPath}"` : `code "${repoPath}"`;
          break;
        case 'Cursor':
          // En Mac, intentar con 'open -a Cursor' primero, luego con el comando 'cursor'
          command = isMac ? `open -a "Cursor" "${repoPath}" || cursor "${repoPath}"` : `cursor "${repoPath}"`;
          break;
        case 'IntelliJ IDEA':
          command = isMac ? `open -a "IntelliJ IDEA" "${repoPath}"` : `idea "${repoPath}"`;
          break;
        case 'PyCharm':
          command = isMac ? `open -a "PyCharm" "${repoPath}"` : `pycharm "${repoPath}"`;
          break;
        case 'WebStorm':
          command = isMac ? `open -a "WebStorm" "${repoPath}"` : `webstorm "${repoPath}"`;
          break;
        case 'Android Studio':
          command = isMac ? `open -a "Android Studio" "${repoPath}"` : `studio "${repoPath}"`;
          break;
        case 'Sublime Text':
          command = isMac ? `open -a "Sublime Text" "${repoPath}"` : `subl "${repoPath}"`;
          break;
        case 'Atom':
          command = isMac ? `open -a "Atom" "${repoPath}"` : `atom "${repoPath}"`;
          break;
        case 'Xcode':
          command = `open -a Xcode "${repoPath}"`;
          break;
        case 'Google Antigravity':
          if (isMac) {
            // Antigravity requiere usar el binario directamente con el flag -n
            const antigravityPaths = [
              '/Applications/Antigravity.app/Contents/Resources/app/bin/antigravity',
              '/Applications/Google Antigravity.app/Contents/Resources/app/bin/antigravity'
            ];
            
            // Buscar el binario disponible
            let antigravityBin = null;
            for (const binPath of antigravityPaths) {
              if (fs.existsSync(binPath)) {
                antigravityBin = binPath;
                break;
              }
            }
            
            if (antigravityBin) {
              // Usar el binario directamente con el flag -n para abrir en nueva ventana
              command = `"${antigravityBin}" -n "${repoPath}"`;
            } else {
              // Fallback: intentar con open -a usando diferentes nombres
              command = `open -a "Antigravity" "${repoPath}" || open -a "Google Antigravity" "${repoPath}"`;
            }
          } else {
            command = `antigravity "${repoPath}"`;
          }
          break;
        default:
          return resolve({ success: false, error: 'IDE no soportado' });
      }

      console.log(`[DEBUG] Intentando abrir IDE con comando: ${command}`);

      exec(command, { shell: true }, (error, stdout, stderr) => {
        if (error) {
          console.error(`[DEBUG] Error al ejecutar comando IDE (${ideName}):`, error);
          console.error(`[DEBUG] Stderr: ${stderr}`);
          // Intentar abrir con Finder como último recurso en Mac
          if (isMac) {
            console.log('[DEBUG] Intentando abrir con Finder como fallback...');
            exec(`open "${repoPath}"`);
          }
          return resolve({ success: false, error: stderr || error.message });
        }
        console.log(`[DEBUG] Comando IDE ejecutado exitosamente`);
        resolve({ success: true });
      });
    } catch (error) {
      console.error('[DEBUG] Error en open-in-ide handler:', error);
      resolve({ success: false, error: error.message });
    }
  });
});

// Handler para clonar un repositorio
ipcMain.handle('clone-repository', async (event, { url, destPath, repoId, sslVerify, token }) => {
  const { spawn } = require('child_process');
  const fsPromises = require('fs').promises;

  return new Promise(async (resolve) => {
    try {
      // Asegurar que el directorio de destino existe de forma asíncrona
      try {
        if (!fs.existsSync(destPath)) {
          await fsPromises.mkdir(destPath, { recursive: true });
        }
      } catch (err) {
        if (err.code !== 'EEXIST') {
          return resolve({ success: false, error: `No se pudo crear el directorio: ${err.message}` });
        }
      }

      // Preparar la URL con token si se proporciona
      let cloneUrl = url;
      if (token) {
        try {
          const urlObj = new URL(url);
          if (urlObj.protocol === 'http:' || urlObj.protocol === 'https:') {
            // Detectar el proveedor basándose en el hostname
            const hostname = urlObj.hostname.toLowerCase();

            // Para GitLab, usar oauth2 como usuario y el token como contraseña
            if (hostname.includes('gitlab.com') || hostname.includes('gitlab')) {
              urlObj.username = 'oauth2';
              urlObj.password = token;
              console.log(`[DEBUG] Formato GitLab detectado, usando oauth2:token`);
            } else {
              // Para GitHub, Gitea, Gogs y otros, usar el token directamente como usuario
              urlObj.username = token;
              console.log(`[DEBUG] Formato estándar detectado, usando token como usuario`);
            }

            cloneUrl = urlObj.toString();
            // Ocultar el token en los logs por seguridad
            const safeUrl = cloneUrl.replace(/:(.*?)@/, ':****@');
            console.log(`[DEBUG] URL de clonación preparada: ${safeUrl}`);
          }
        } catch (e) {
          console.error('Error al procesar la URL para clonación:', e);
        }
      }

      console.log(`[DEBUG] Iniciando git clone en: ${destPath} (incluyendo todos los branches remotos)`);
      console.log(`[DEBUG] SSL Verify configurado: ${sslVerify}`);

      // Argumentos para clonar incluyendo todos los branches remotos explicitly
      const args = ['clone', '--progress', '--no-single-branch'];
      
      // Configurar SSL verification explícitamente
      // Usar el valor de sslVerify si está definido, de lo contrario usar true por defecto
      const sslVerifyValue = sslVerify !== undefined ? sslVerify : true;
      args.push('-c', `http.sslVerify=${sslVerifyValue}`);
      
      args.push(cloneUrl, '.');

      console.log(`[DEBUG] Comando git: git ${args.join(' ')}`);

      const gitProcess = spawn('git', args, {
        cwd: destPath,
        env: {
          ...process.env,
          GIT_TERMINAL_PROMPT: '0',
          GIT_ASKPASS: '',
          SSH_ASKPASS: ''
        }
      });

      let errorOutput = '';

      gitProcess.stderr.on('data', (data) => {
        const line = data.toString();
        errorOutput += line;

        // Intentar parsear el progreso y el mensaje (ej: Receiving objects:  50% (5/10))
        const match = line.match(/(.*?):\s+(\d+)%/);
        if (match) {
          const message = match[1].trim();
          const progress = parseInt(match[2], 10);
          event.sender.send('clone-progress', { repoId, progress, message });
        } else {
          // Si no hay porcentaje, intentar enviar el mensaje de estado si parece relevante
          const statusMatch = line.match(/(.*?):/);
          if (statusMatch && statusMatch[1].length < 50) {
            event.sender.send('clone-progress', { repoId, message: statusMatch[1].trim() });
          }
        }
      });

      gitProcess.on('close', (code) => {
        if (code === 0) {
          resolve({ success: true });
        } else {
          console.error(`Error en git clone (código ${code}):`, errorOutput);
          let cleanError = errorOutput;
          if (token) {
            const escapedToken = token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            cleanError = cleanError.replace(new RegExp(escapedToken, 'g'), '****');
          }
          resolve({ success: false, error: `Git clone finalizó con código ${code}. ${cleanError || ''}`.trim() });
        }
      });

      gitProcess.on('error', (err) => {
        resolve({ success: false, error: err.message });
      });
    } catch (error) {
      resolve({ success: false, error: error.message });
    }
  });
});

// Handler para eliminar una ruta de forma asíncrona
ipcMain.handle('delete-path', async (event, pathToDelete) => {
  try {
    if (fs.existsSync(pathToDelete)) {
      // Usar la versión asíncrona de rm para no bloquear el proceso principal
      await fs.promises.rm(pathToDelete, { recursive: true, force: true });
    }
    return { success: true };
  } catch (error) {
    console.error('Error al eliminar ruta:', error);
    return { success: false, error: error.message };
  }
});

// Handler para verificar si una carpeta existe
ipcMain.handle('check-path-exists', async (event, pathToCheck) => {
  return fs.existsSync(pathToCheck);
});

// Handler para obtener información de Git de un repositorio local
ipcMain.handle('get-git-local-info', async (event, repoPath) => {
  const { exec } = require('child_process');
  const util = require('util');
  const execPromise = util.promisify(exec);

  try {
    if (!fs.existsSync(repoPath)) {
      return { success: false, error: 'La ruta no existe' };
    }

    // Verificar si es un repo git
    if (!fs.existsSync(path.join(repoPath, '.git'))) {
      return { success: false, error: 'No es un repositorio Git' };
    }

    // 1. Obtener branch actual
    const { stdout: branch } = await execPromise('git branch --show-current', { cwd: repoPath });

    // 2. Obtener commits pendientes (ahead/behind) y cambios sin commitear
    let ahead = 0;
    let behind = 0;
    let uncommitted = 0;

    try {
      // Intentar fetch silencioso para actualizar info del remoto
      // Timeout de 5s para no bloquear si no hay conexión
      await execPromise('git fetch --timeout=5', { cwd: repoPath }).catch(() => { });

      const { stdout: counts } = await execPromise('git rev-list --left-right --count HEAD...@{u}', { cwd: repoPath });
      const [a, b] = counts.trim().split('\t');
      ahead = parseInt(a, 10) || 0;
      behind = parseInt(b, 10) || 0;
    } catch (e) {
      // Si falla @{u}, intentar contra origin/branch_actual como fallback
      try {
        const { stdout: counts } = await execPromise(`git rev-list --left-right --count HEAD...origin/${branch.trim()}`, { cwd: repoPath });
        const [a, b] = counts.trim().split('\t');
        ahead = parseInt(a, 10) || 0;
        behind = parseInt(b, 10) || 0;
      } catch (fallbackError) {
        // Ignorar si tampoco tiene origin/branch
      }
    }

    try {
      const { stdout: status } = await execPromise('git status --porcelain', { cwd: repoPath });
      uncommitted = status.trim() ? status.trim().split('\n').length : 0;
    } catch (e) {
      // Ignorar error en status
    }

    // 3. Obtener último commit info (autor, fecha relativa, hash corto)
    const { stdout: lastCommit } = await execPromise('git log -1 --format="%an|%ar|%h"', { cwd: repoPath });
    const [author, date, hash] = lastCommit.trim().split('|');

    return {
      success: true,
      info: {
        branch: branch.trim(),
        ahead,
        behind,
        uncommitted,
        author,
        date,
        hash
      }
    };
  } catch (error) {
    console.error('Error al obtener info de Git:', error);
    return { success: false, error: error.message };
  }
});

// Handler para obtener el estado de Git (staged y unstaged)
ipcMain.handle('get-git-status', async (event, repoPath) => {
  const { exec } = require('child_process');
  const util = require('util');
  const execPromise = util.promisify(exec);

  try {
    if (!fs.existsSync(repoPath)) {
      return { success: false, error: 'La ruta no existe' };
    }

    const { stdout } = await execPromise('git status --porcelain', { cwd: repoPath });
    const lines = stdout.split('\n').filter(Boolean);

    const staged = [];
    const unstaged = [];

    lines.forEach(line => {
      const status = line.substring(0, 2);
      const filePath = line.substring(3).replace(/^"(.*)"$/, '$1');

      const x = status[0];
      const y = status[1];

      // Handle untracked files (??)
      if (x === '?' && y === '?') {
        unstaged.push({ path: filePath, status: '?' });
      } else {
        // Handle staged files
        if (x !== ' ' && x !== '?') {
          staged.push({ path: filePath, status: x });
        }

        // Handle unstaged files
        if (y !== ' ') {
          unstaged.push({ path: filePath, status: y });
        }
      }
    });

    // Get current branch
    let branch = '';
    try {
      const { stdout: branchOutput } = await execPromise('git branch --show-current', { cwd: repoPath });
      branch = branchOutput.trim();
    } catch (e) {
      // If branch command fails, try alternative
      try {
        const { stdout: branchOutput } = await execPromise('git rev-parse --abbrev-ref HEAD', { cwd: repoPath });
        branch = branchOutput.trim();
      } catch (e2) {
        branch = '';
      }
    }

    return { success: true, staged, unstaged, branch };
  } catch (error) {
    console.error('Error al obtener status de Git:', error);
    return { success: false, error: error.message };
  }
});

// Handler para poner archivos en stage
ipcMain.handle('git-stage', async (event, { repoPath, file }) => {
  const { exec } = require('child_process');
  const util = require('util');
  const execPromise = util.promisify(exec);

  try {
    const command = file === '*' ? 'git add .' : `git add "${file}"`;
    await execPromise(command, { cwd: repoPath });
    return { success: true };
  } catch (error) {
    console.error('Error al poner en stage:', error);
    return { success: false, error: error.message };
  }
});

// Handler para quitar archivos de stage
ipcMain.handle('git-unstage', async (event, { repoPath, file }) => {
  const { exec } = require('child_process');
  const util = require('util');
  const execPromise = util.promisify(exec);

  try {
    const command = file === '*' ? 'git reset HEAD' : `git reset HEAD "${file}"`;
    await execPromise(command, { cwd: repoPath });
    return { success: true };
  } catch (error) {
    console.error('Error al quitar de stage:', error);
    return { success: false, error: error.message };
  }
});

// Handler para realizar un commit
ipcMain.handle('git-commit', async (event, { repoPath, message }) => {
  const { exec } = require('child_process');
  const util = require('util');
  const execPromise = util.promisify(exec);

  try {
    const escapedMessage = message.replace(/"/g, '\\"');
    await execPromise(`git commit -m "${escapedMessage}"`, { cwd: repoPath });
    return { success: true };
  } catch (error) {
    console.error('Error al realizar commit:', error);
    return { success: false, error: error.message };
  }
});

// Handler para git fetch
ipcMain.handle('git-fetch', async (event, repoPath) => {
  const { exec } = require('child_process');
  const util = require('util');
  const execPromise = util.promisify(exec);

  try {
    await execPromise('git fetch', { cwd: repoPath });
    return { success: true };
  } catch (error) {
    console.error('Error al hacer fetch:', error);
    return { success: false, error: error.message };
  }
});

// Handler para git pull
ipcMain.handle('git-pull', async (event, repoPath) => {
  const { exec } = require('child_process');
  const util = require('util');
  const execPromise = util.promisify(exec);

  try {
    await execPromise('git pull', { cwd: repoPath });
    return { success: true };
  } catch (error) {
    console.error('Error al hacer pull:', error);
    return { success: false, error: error.message };
  }
});

// Handler para git push
ipcMain.handle('git-push', async (event, repoPath) => {
  const { exec } = require('child_process');
  const util = require('util');
  const execPromise = util.promisify(exec);

  try {
    await execPromise('git push', { cwd: repoPath });
    return { success: true };
  } catch (error) {
    console.error('Error al hacer push:', error);
    return { success: false, error: error.message };
  }
});

// Handler para obtener branches locales y remotos
ipcMain.handle('get-git-branches', async (event, repoPath) => {
  const { exec } = require('child_process');
  const util = require('util');
  const execPromise = util.promisify(exec);

  try {
    if (!fs.existsSync(repoPath)) {
      return { success: false, error: 'La ruta no existe' };
    }

    // Obtener branches locales
    const { stdout: localBranches } = await execPromise('git branch --format="%(refname:short)"', { cwd: repoPath });
    const local = localBranches.trim().split('\n').filter(Boolean);

    // Obtener branches remotos
    let remote = [];
    try {
      const { stdout: remoteBranches } = await execPromise('git branch -r --format="%(refname:short)"', { cwd: repoPath });
      remote = remoteBranches.trim().split('\n').filter(Boolean).filter(b => !b.includes('HEAD'));
    } catch (e) {
      // Si no hay remotos, continuar con array vacío
    }

    // Obtener branch actual
    let current = '';
    let headHash = null;
    try {
      const { stdout: currentBranch } = await execPromise('git branch --show-current', { cwd: repoPath });
      current = currentBranch.trim();
      
      // Si no hay branch actual (detached HEAD), obtener el hash del HEAD
      if (!current || current === '') {
        try {
          const { stdout: hash } = await execPromise('git rev-parse HEAD', { cwd: repoPath });
          headHash = hash.trim();
        } catch (e) {
          // Ignorar error
        }
      }
    } catch (e) {
      // Ignorar error
    }

    return { success: true, local, remote, current, headHash };
  } catch (error) {
    console.error('Error al obtener branches:', error);
    return { success: false, error: error.message };
  }
});

// Handler para crear un nuevo branch
ipcMain.handle('git-create-branch', async (event, { repoPath, branchName, fromBranch }) => {
  const { exec } = require('child_process');
  const util = require('util');
  const execPromise = util.promisify(exec);

  try {
    if (!fs.existsSync(repoPath)) {
      return { success: false, error: 'La ruta no existe' };
    }

    // Validar nombre del branch
    if (!branchName || !branchName.trim()) {
      return { success: false, error: 'El nombre del branch no puede estar vacío' };
    }

    // Crear el branch desde el branch especificado
    const command = fromBranch 
      ? `git checkout -b "${branchName.trim()}" "${fromBranch}"`
      : `git checkout -b "${branchName.trim()}"`;
    
    await execPromise(command, { cwd: repoPath });
    return { success: true };
  } catch (error) {
    console.error('Error al crear branch:', error);
    return { success: false, error: error.message };
  }
});

// Handler para hacer checkout de un branch
ipcMain.handle('git-checkout', async (event, { repoPath, branchName }) => {
  const { exec } = require('child_process');
  const util = require('util');
  const execPromise = util.promisify(exec);

  try {
    if (!fs.existsSync(repoPath)) {
      return { success: false, error: 'La ruta no existe' };
    }

    await execPromise(`git checkout "${branchName}"`, { cwd: repoPath });
    return { success: true };
  } catch (error) {
    console.error('Error al hacer checkout:', error);
    return { success: false, error: error.message };
  }
});

// Handler para verificar si un commit puede ser cherry-picked al branch actual
ipcMain.handle('can-cherry-pick-commit', async (event, { repoPath, commitHash }) => {
  const { exec } = require('child_process');
  const util = require('util');
  const execPromise = util.promisify(exec);

  try {
    if (!fs.existsSync(repoPath)) {
      return { success: false, error: 'La ruta no existe' };
    }

    // Verificar si el commit existe
    try {
      await execPromise(`git cat-file -e ${commitHash}`, { cwd: repoPath });
    } catch (e) {
      return { success: false, error: 'El commit no existe' };
    }

    // Obtener el branch actual o HEAD si estamos en detached HEAD
    let currentBranch = '';
    let headHash = '';
    try {
      const { stdout: branchOutput } = await execPromise('git branch --show-current', { cwd: repoPath });
      currentBranch = branchOutput.trim();
      
      const { stdout: headOutput } = await execPromise('git rev-parse HEAD', { cwd: repoPath });
      headHash = headOutput.trim();
    } catch (e) {
      return { success: false, error: 'No se pudo obtener información del branch actual' };
    }

    // Si el commit es el HEAD actual, no puede ser cherry-picked
    if (headHash === commitHash) {
      return { success: true, canCherryPick: false, reason: 'El commit es el HEAD actual' };
    }

    // Verificar si el commit ya está en el historial del branch actual
    // Usamos git merge-base --is-ancestor para verificar si el commit es ancestro del HEAD
    // Este comando devuelve código 0 si es ancestro, y código no 0 si no lo es
    try {
      await execPromise(`git merge-base --is-ancestor ${commitHash} HEAD`, { cwd: repoPath });
      // Si el comando no falla (código 0), significa que el commit es ancestro del HEAD
      // Por lo tanto, ya está en el historial y no puede ser cherry-picked
      return { success: true, canCherryPick: false, reason: 'El commit ya está en el historial del branch actual' };
    } catch (e) {
      // Si el comando falla (código no 0), significa que el commit NO es ancestro del HEAD
      // Por lo tanto, puede ser cherry-picked (continuar con la verificación)
    }

    // Verificar si el commit es un merge commit (cherry-pick de merges es más complejo)
    // Por ahora permitimos cherry-pick de merge commits, aunque podría requerir manejo especial
    try {
      const { stdout: parentCount } = await execPromise(`git cat-file -p ${commitHash} | grep "^parent " | wc -l`, { cwd: repoPath });
      const count = parseInt(parentCount.trim(), 10);
      if (count > 1) {
        // Es un merge commit, técnicamente puede ser cherry-picked pero es más complejo
        // Por ahora lo permitimos
      }
    } catch (e) {
      // Ignorar error
    }

    return { success: true, canCherryPick: true };
  } catch (error) {
    console.error('Error al verificar si el commit puede ser cherry-picked:', error);
    return { success: false, error: error.message };
  }
});

// Handler para hacer revert de un commit
ipcMain.handle('git-revert', async (event, { repoPath, commitHash }) => {
  const { exec } = require('child_process');
  const util = require('util');
  const execPromise = util.promisify(exec);

  try {
    if (!fs.existsSync(repoPath)) {
      return { success: false, error: 'La ruta no existe' };
    }

    // Ejecutar git revert
    await execPromise(`git revert --no-edit ${commitHash}`, { cwd: repoPath });
    return { success: true };
  } catch (error) {
    console.error('Error al hacer revert:', error);
    return { success: false, error: error.message };
  }
});

// Handler para crear un tag
ipcMain.handle('git-create-tag', async (event, { repoPath, tagName, message, commitHash, pushToAllRemotes }) => {
  const { exec } = require('child_process');
  const util = require('util');
  const execPromise = util.promisify(exec);

  try {
    if (!fs.existsSync(repoPath)) {
      return { success: false, error: 'La ruta no existe' };
    }

    // Validar nombre del tag
    if (!tagName || !tagName.trim()) {
      return { success: false, error: 'El nombre del tag no puede estar vacío' };
    }

    // Crear el tag
    // Si hay mensaje, crear un tag anotado, si no, crear un tag ligero
    let tagCommand;
    if (message && message.trim()) {
      // Tag anotado con mensaje
      const escapedMessage = message.replace(/"/g, '\\"');
      tagCommand = commitHash 
        ? `git tag -a "${tagName.trim()}" -m "${escapedMessage}" ${commitHash}`
        : `git tag -a "${tagName.trim()}" -m "${escapedMessage}"`;
    } else {
      // Tag ligero
      tagCommand = commitHash 
        ? `git tag "${tagName.trim()}" ${commitHash}`
        : `git tag "${tagName.trim()}"`;
    }

    await execPromise(tagCommand, { cwd: repoPath });

    // Si se debe hacer push a todos los remotes
    if (pushToAllRemotes) {
      try {
        // Obtener lista de remotes
        const { stdout: remotesOutput } = await execPromise('git remote', { cwd: repoPath });
        const remotes = remotesOutput.trim().split('\n').filter(Boolean);

        // Hacer push del tag a cada remote
        for (const remote of remotes) {
          try {
            await execPromise(`git push ${remote} "${tagName.trim()}"`, { cwd: repoPath });
          } catch (pushError) {
            console.error(`Error al hacer push del tag a ${remote}:`, pushError);
            // Continuar con los demás remotes aunque uno falle
          }
        }
      } catch (remoteError) {
        console.error('Error al obtener remotes o hacer push:', remoteError);
        // No fallar la creación del tag si el push falla
      }
    }

    return { success: true };
  } catch (error) {
    console.error('Error al crear tag:', error);
    return { success: false, error: error.message };
  }
});

// Handler para hacer stash de archivos
ipcMain.handle('git-stash', async (event, { repoPath, includeUntracked = false, message = '' }) => {
  const { exec } = require('child_process');
  const util = require('util');
  const execPromise = util.promisify(exec);

  try {
    if (!fs.existsSync(repoPath)) {
      return { success: false, error: 'La ruta no existe' };
    }

    // Normalizar el mensaje: si es undefined, null o string vacío después de trim, usar el por defecto
    const normalizedMessage = (message && typeof message === 'string') ? message.trim() : '';
    const userMessage = normalizedMessage || 'Stash automático antes de cambiar de rama';
    
    // Agregar solo el prefijo "WIP: " al mensaje (Git ya agrega "On <branch>:" automáticamente)
    const stashMessage = `WIP: ${userMessage}`;
    
    // Escapar comillas dobles y caracteres especiales en el mensaje para evitar problemas con el shell
    // Usar comillas simples para evitar problemas con caracteres especiales
    const escapedMessage = stashMessage.replace(/'/g, "'\\''");
    
    const command = includeUntracked 
      ? `git stash push --include-untracked -m '${escapedMessage}'`
      : `git stash push -m '${escapedMessage}'`;
    
    console.log('Ejecutando stash con mensaje:', stashMessage);
    await execPromise(command, { cwd: repoPath });
    return { success: true };
  } catch (error) {
    console.error('Error al hacer stash:', error);
    return { success: false, error: error.message };
  }
});

// Handler para obtener la lista de stashes
ipcMain.handle('get-git-stash-list', async (event, repoPath) => {
  const { exec } = require('child_process');
  const util = require('util');
  const execPromise = util.promisify(exec);

  try {
    if (!fs.existsSync(repoPath)) {
      return { success: false, error: 'La ruta no existe' };
    }

    // Obtener la lista de stashes
    // Usar --format para obtener información estructurada
    const { stdout } = await execPromise('git stash list --format="%gd|%gs|%ci"', { cwd: repoPath });
    
    const stashes = [];
    if (stdout.trim()) {
      const lines = stdout.trim().split('\n');
      lines.forEach((line, index) => {
        // El formato es: stash@{0}|mensaje|fecha
        const parts = line.split('|');
        if (parts.length >= 2) {
          const ref = parts[0].trim();
          const message = parts.slice(1, -1).join('|').trim(); // El mensaje puede contener |
          const date = parts[parts.length - 1].trim();
          
          stashes.push({
            index: index,
            ref: ref, // stash@{0}, stash@{1}, etc.
            message: message, // El mensaje del stash
            date: date // Fecha de creación
          });
        }
      });
    }

    return { success: true, stashes };
  } catch (error) {
    // Si no hay stashes, git stash list devuelve error, pero eso es normal
    if (error.message.includes('No stash entries')) {
      return { success: true, stashes: [] };
    }
    console.error('Error al obtener lista de stashes:', error);
    return { success: false, error: error.message };
  }
});

// Handler para aplicar (pop) un stash específico
ipcMain.handle('git-stash-pop', async (event, { repoPath, stashRef }) => {
  const { exec } = require('child_process');
  const util = require('util');
  const execPromise = util.promisify(exec);

  try {
    if (!fs.existsSync(repoPath)) {
      return { success: false, error: 'La ruta no existe' };
    }

    // Aplicar el stash específico (pop lo aplica y lo elimina)
    await execPromise(`git stash pop ${stashRef}`, { cwd: repoPath });
    return { success: true };
  } catch (error) {
    console.error('Error al aplicar stash:', error);
    return { success: false, error: error.message };
  }
});

// Handler para eliminar (drop) un stash específico
ipcMain.handle('git-stash-drop', async (event, { repoPath, stashRef }) => {
  const { exec } = require('child_process');
  const util = require('util');
  const execPromise = util.promisify(exec);

  try {
    if (!fs.existsSync(repoPath)) {
      return { success: false, error: 'La ruta no existe' };
    }

    // Eliminar el stash específico sin aplicarlo
    await execPromise(`git stash drop ${stashRef}`, { cwd: repoPath });
    return { success: true };
  } catch (error) {
    console.error('Error al eliminar stash:', error);
    return { success: false, error: error.message };
  }
});

// Handler para limpiar todos los stashes
ipcMain.handle('git-stash-clear', async (event, repoPath) => {
  const { exec } = require('child_process');
  const util = require('util');
  const execPromise = util.promisify(exec);

  try {
    if (!fs.existsSync(repoPath)) {
      return { success: false, error: 'La ruta no existe' };
    }

    // Eliminar todos los stashes
    await execPromise('git stash clear', { cwd: repoPath });
    return { success: true };
  } catch (error) {
    console.error('Error al limpiar stashes:', error);
    return { success: false, error: error.message };
  }
});

// Handler para limpiar archivos sin trackear
ipcMain.handle('git-clean', async (event, { repoPath, force = false }) => {
  const { exec } = require('child_process');
  const util = require('util');
  const execPromise = util.promisify(exec);

  try {
    if (!fs.existsSync(repoPath)) {
      return { success: false, error: 'La ruta no existe' };
    }

    // -f: force, -d: incluye directorios
    const command = force ? 'git clean -fd' : 'git clean -fd';
    
    await execPromise(command, { cwd: repoPath });
    return { success: true };
  } catch (error) {
    console.error('Error al limpiar archivos:', error);
    return { success: false, error: error.message };
  }
});

// Handler para resetear cambios (descartar cambios en archivos modificados)
ipcMain.handle('git-reset-hard', async (event, repoPath) => {
  const { exec } = require('child_process');
  const util = require('util');
  const execPromise = util.promisify(exec);

  try {
    if (!fs.existsSync(repoPath)) {
      return { success: false, error: 'La ruta no existe' };
    }

    await execPromise('git reset --hard HEAD', { cwd: repoPath });
    return { success: true };
  } catch (error) {
    console.error('Error al resetear cambios:', error);
    return { success: false, error: error.message };
  }
});

// Handler para obtener el log de commits (grafo)
ipcMain.handle('get-git-log', async (event, repoPath, skip = 0, limit = 50, searchTerm = '') => {
  const { exec, spawn } = require('child_process');
  const readline = require('readline');
  const fs = require('fs');

  try {
    if (!fs.existsSync(repoPath)) {
      return { success: false, error: 'La ruta no existe' };
    }

    const format = "%H|%P|%an|%ae|%aI|%s|%D";
    const separator = "|";

    if (!searchTerm || !searchTerm.trim()) {
      // Caso optimizado: Sin búsqueda, usamos git log directo con skip y limit
      const util = require('util');
      const execPromise = util.promisify(exec);
      const { stdout } = await execPromise(`git log --all --date-order --pretty=format:"${format}" --skip=${skip} -n ${limit}`, {
        cwd: repoPath,
        maxBuffer: 1024 * 1024 * 10
      });

      const commits = stdout.trim().split('\n').filter(Boolean).map(line => {
        const parts = line.split(separator);
        if (parts.length < 6) return null;
        const [hash, parents, authorName, authorEmail, date, message, refs] = parts;
        return {
          hash,
          parents: parents ? parents.split(' ') : [],
          author: { name: authorName, email: authorEmail },
          date,
          message,
          refs: refs ? refs.trim() : ''
        };
      }).filter(Boolean);

      return { success: true, commits };
    }

    // Caso con búsqueda: Usamos spawn y filtramos manualmente (Lógica OR)
    return new Promise((resolve) => {
      const lowTerm = searchTerm.toLowerCase();
      const commits = [];
      let matchesFound = 0;
      let matchesSkipped = 0;

      const gitProcess = spawn('git', ['log', '--all', '--date-order', `--pretty=format:${format}`], {
        cwd: repoPath
      });

      const rl = readline.createInterface({
        input: gitProcess.stdout,
        terminal: false
      });

      rl.on('line', (line) => {
        if (matchesFound >= limit) {
          gitProcess.kill();
          return;
        }

        const parts = line.split(separator);
        if (parts.length < 6) return;

        const [hash, parents, authorName, authorEmail, date, message, refs] = parts;

        // Lógica OR: mensaje, autor (nombre/email), hash o refs
        const matches =
          message.toLowerCase().includes(lowTerm) ||
          authorName.toLowerCase().includes(lowTerm) ||
          authorEmail.toLowerCase().includes(lowTerm) ||
          hash.toLowerCase().includes(lowTerm) ||
          (refs && refs.toLowerCase().includes(lowTerm));

        if (matches) {
          if (matchesSkipped < skip) {
            matchesSkipped++;
          } else {
            commits.push({
              hash,
              parents: parents ? parents.split(' ') : [],
              author: { name: authorName, email: authorEmail },
              date,
              message,
              refs: refs ? refs.trim() : ''
            });
            matchesFound++;
          }
        }
      });

      rl.on('close', () => {
        resolve({ success: true, commits });
      });

      gitProcess.on('error', (err) => {
        resolve({ success: false, error: err.message });
      });

      gitProcess.stderr.on('data', (data) => {
        console.error('Git log search error:', data.toString());
      });
    });

  } catch (error) {
    console.error('Error al obtener git log:', error);
    return { success: false, error: error.message };
  }
});

// Handler para obtener detalles de un commit (archivos modificados y diff)
ipcMain.handle('get-commit-details', async (event, { repoPath, commitHash }) => {
  const { exec } = require('child_process');
  const util = require('util');
  const execPromise = util.promisify(exec);
  const fs = require('fs');

  try {
    if (!fs.existsSync(repoPath)) {
      return { success: false, error: 'La ruta no existe' };
    }

    // 1. Obtener lista de archivos modificados
    // git show --first-parent --name-status --pretty=format:"" <hash>
    // --first-parent: Para merges, mostrar diff contra el primer padre (la rama destino)
    const { stdout: filesOutput } = await execPromise(`git show --first-parent --name-status --pretty=format:"" ${commitHash}`, { cwd: repoPath });

    const files = filesOutput.trim().split('\n').filter(Boolean).map(line => {
      const parts = line.split('\t');
      // parts[0] is status, parts[1] is path
      // sometimes status includes score (e.g. R100), so just take charAt(0) or split by space if tab is missing?
      // git show --name-status uses tabs by default.
      if (parts.length >= 2) {
        return {
          status: parts[0].trim(),
          path: parts[1].trim()
        };
      }
      return null;
    }).filter(Boolean);

    // 2. Obtener estadísticas (insertions/deletions)
    // git show --first-parent --shortstat --pretty=format:"" <hash>
    const { stdout: statsOutput } = await execPromise(`git show --first-parent --shortstat --pretty=format:"" ${commitHash}`, { cwd: repoPath });

    // 3. Obtener el diff completo
    // Warn: can be huge.
    const { stdout: diffOutput } = await execPromise(`git show --first-parent ${commitHash}`, {
      cwd: repoPath,
      maxBuffer: 1024 * 1024 * 5 // 5MB limit
    });

    return {
      success: true,
      files,
      stats: statsOutput.trim(),
      fullDiff: diffOutput
    };

  } catch (error) {
    console.error('Error al obtener detalles del commit:', error);
    return { success: false, error: error.message };
  }
});

// Handler para leer configuración de Git
ipcMain.handle('get-git-config', async (event, key) => {
  const { spawn } = require('child_process');

  return new Promise((resolve) => {
    try {
      const gitProcess = spawn('git', ['config', '--global', '--get', key], {
        env: { ...process.env }
      });

      let output = '';
      let errorOutput = '';

      gitProcess.stdout.on('data', (data) => {
        output += data.toString();
      });

      gitProcess.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      gitProcess.on('close', (code) => {
        if (code === 0) {
          resolve({ success: true, value: output.trim() });
        } else {
          // Si no existe la configuración, retornar éxito con valor vacío
          resolve({ success: true, value: '' });
        }
      });

      gitProcess.on('error', (error) => {
        resolve({ success: false, error: error.message });
      });
    } catch (error) {
      resolve({ success: false, error: error.message });
    }
  });
});

// Handler para configurar Git globalmente
ipcMain.handle('set-git-config', async (event, { key, value }) => {
  const { spawn } = require('child_process');

  return new Promise((resolve) => {
    try {
      const gitProcess = spawn('git', ['config', '--global', key, value], {
        env: { ...process.env }
      });

      let errorOutput = '';

      gitProcess.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      gitProcess.on('close', (code) => {
        if (code === 0) {
          resolve({ success: true });
        } else {
          resolve({ success: false, error: errorOutput || `Git config falló con código ${code}` });
        }
      });

      gitProcess.on('error', (error) => {
        resolve({ success: false, error: error.message });
      });
    } catch (error) {
      resolve({ success: false, error: error.message });
    }
  });
});

// Handler para configurar Git localmente en un repositorio
ipcMain.handle('set-git-config-local', async (event, { repoPath, key, value }) => {
  const { exec } = require('child_process');
  const util = require('util');
  const execPromise = util.promisify(exec);

  try {
    await execPromise(`git config ${key} ${value}`, { cwd: repoPath });
    return { success: true };
  } catch (error) {
    console.error('Error al configurar git local:', error);
    return { success: false, error: error.message };
  }
});

// Handler para iniciar el monitoreo de cambios en un repositorio
ipcMain.handle('start-repo-watcher', async (event, repoPath) => {
  try {
    startRepositoryWatcher(repoPath);
    return { success: true };
  } catch (error) {
    console.error('Error al iniciar watcher:', error);
    return { success: false, error: error.message };
  }
});

// Handler para detener el monitoreo de cambios en un repositorio
ipcMain.handle('stop-repo-watcher', async (event, repoPath) => {
  try {
    stopRepositoryWatcher(repoPath);
    return { success: true };
  } catch (error) {
    console.error('Error al detener watcher:', error);
    return { success: false, error: error.message };
  }
});

// Handler para guardar archivo de configuración
ipcMain.handle('save-config-file', async (event, configData) => {
  try {
    const result = await dialog.showSaveDialog({
      title: 'Guardar archivo de configuración',
      defaultPath: 'tuco-settings.json',
      filters: [
        { name: 'JSON Files', extensions: ['json'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    });

    if (!result.canceled && result.filePath) {
      fs.writeFileSync(result.filePath, JSON.stringify(configData, null, 2), 'utf-8');
      return { success: true, filePath: result.filePath };
    }

    return { success: false, error: 'Operación cancelada' };
  } catch (error) {
    console.error('Error al guardar archivo:', error);
    return { success: false, error: error.message };
  }
});

// Handler para guardar un archivo (genérico)
ipcMain.handle('save-file', async (event, content, defaultFilename) => {
  try {
    const result = await dialog.showSaveDialog({
      title: 'Guardar archivo',
      defaultPath: defaultFilename || 'file.txt',
      filters: [
        { name: 'JSON Files', extensions: ['json'] },
        { name: 'Text Files', extensions: ['txt'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    });

    if (!result.canceled && result.filePath) {
      fs.writeFileSync(result.filePath, content, 'utf-8');
      return { success: true, filePath: result.filePath };
    }

    return { success: false, error: 'Operación cancelada' };
  } catch (error) {
    console.error('Error al guardar archivo:', error);
    return { success: false, error: error.message };
  }
});

// Handler para abrir un archivo (genérico)
ipcMain.handle('open-file', async (event) => {
  try {
    const result = await dialog.showOpenDialog({
      title: 'Abrir archivo',
      properties: ['openFile'],
      filters: [
        { name: 'JSON Files', extensions: ['json'] },
        { name: 'Text Files', extensions: ['txt'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    });

    if (!result.canceled && result.filePaths.length > 0) {
      const filePath = result.filePaths[0];
      const content = fs.readFileSync(filePath, 'utf-8');
      return content;
    }

    return null;
  } catch (error) {
    console.error('Error al abrir archivo:', error);
    throw error;
  }
});

