const { contextBridge, ipcRenderer } = require('electron');

// Exponer APIs seguras al renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
  versions: {
    node: process.versions.node,
    chrome: process.versions.chrome,
    electron: process.versions.electron
  },
  // Obtener la ruta de documentos del usuario
  getDocumentsPath: () => {
    return ipcRenderer.invoke('get-documents-path');
  },

  // Abrir diálogo para seleccionar carpeta
  selectFolder: () => {
    return ipcRenderer.invoke('select-folder');
  },

  // Inicializar configuración (crear carpeta y archivo si no existen)
  initializeConfig: (configPath) => {
    return ipcRenderer.invoke('initialize-config', configPath);
  },

  // Leer configuración
  readConfig: () => {
    return ipcRenderer.invoke('read-config');
  },

  // Escribir/actualizar configuración
  writeConfig: (updates) => {
    return ipcRenderer.invoke('write-config', updates);
  },

  // Encriptar token
  encryptToken: (token) => {
    return ipcRenderer.invoke('encrypt-token', token);
  },

  // Desencriptar token
  decryptToken: (encryptedToken) => {
    return ipcRenderer.invoke('decrypt-token', encryptedToken);
  },

  // Validar token de Git
  validateGitToken: (proveedor, token, urlServidor, gitSslVerify) => {
    return ipcRenderer.invoke('validate-git-token', { proveedor, token, urlServidor, gitSslVerify });
  },

  // Obtener repositorios de un proveedor Git
  getGitRepositories: (proveedor, token, urlServidor, gitSslVerify) => {
    return ipcRenderer.invoke('get-git-repositories', { proveedor, token, urlServidor, gitSslVerify });
  },

  // Obtener detalles de una conexión Git
  getConnectionDetails: (proveedor, token, urlServidor, gitSslVerify) => {
    return ipcRenderer.invoke('get-connection-details', { proveedor, token, urlServidor, gitSslVerify });
  },

  // Detectar editores IDE instalados
  detectInstalledEditors: () => {
    return ipcRenderer.invoke('detect-installed-editors');
  },

  // Guardar archivo de configuración
  saveConfigFile: (configData) => {
    return ipcRenderer.invoke('save-config-file', configData);
  },

  // Clonar repositorio
  cloneRepository: (url, destPath, repoId, sslVerify, token) => {
    return ipcRenderer.invoke('clone-repository', { url, destPath, repoId, sslVerify, token });
  },

  // Escuchar progreso de clonación
  onCloneProgress: (callback) => {
    const subscription = (event, data) => callback(data);
    ipcRenderer.on('clone-progress', subscription);
    return () => ipcRenderer.removeListener('clone-progress', subscription);
  },

  // Eliminar una ruta
  deletePath: (pathToDelete) => {
    return ipcRenderer.invoke('delete-path', pathToDelete);
  },

  // Verificar si existe una ruta
  checkPathExists: (pathToCheck) => {
    return ipcRenderer.invoke('check-path-exists', pathToCheck);
  },

  // Obtener info de git local
  getGitLocalInfo: (repoPath) => {
    return ipcRenderer.invoke('get-git-local-info', repoPath);
  },

  // Obtener grafo de commits
  getGitLog: (repoPath, skip = 0, limit = 50, searchTerm = '') => {
    return ipcRenderer.invoke('get-git-log', repoPath, skip, limit, searchTerm);
  },

  // Obtener detalles de un commit
  getCommitDetails: (repoPath, commitHash) => {
    return ipcRenderer.invoke('get-commit-details', { repoPath, commitHash });
  },

  // Abrir carpeta en IDE
  openInIDE: (path, ideName) => {
    return ipcRenderer.invoke('open-in-ide', { path, ideName });
  },

  // Leer configuración de Git
  getGitConfig: (key) => {
    return ipcRenderer.invoke('get-git-config', key);
  },

  // Configurar Git globalmente
  setGitConfig: (key, value) => {
    return ipcRenderer.invoke('set-git-config', { key, value });
  },

  // Configurar Git localmente en un repositorio
  setGitConfigLocal: (repoPath, key, value) => {
    return ipcRenderer.invoke('set-git-config-local', { repoPath, key, value });
  },

  // Obtener estado de Git
  getGitStatus: (repoPath) => {
    return ipcRenderer.invoke('get-git-status', repoPath);
  },

  // Poner en stage
  gitStage: (repoPath, file) => {
    return ipcRenderer.invoke('git-stage', { repoPath, file });
  },

  // Quitar de stage
  gitUnstage: (repoPath, file) => {
    return ipcRenderer.invoke('git-unstage', { repoPath, file });
  },

  // Realizar commit
  gitCommit: (repoPath, message) => {
    return ipcRenderer.invoke('git-commit', { repoPath, message });
  },

  // Git fetch
  gitFetch: (repoPath) => {
    return ipcRenderer.invoke('git-fetch', repoPath);
  },

  // Git pull
  gitPull: (repoPath) => {
    return ipcRenderer.invoke('git-pull', repoPath);
  },

  // Git push
  gitPush: (repoPath) => {
    return ipcRenderer.invoke('git-push', repoPath);
  },

  // Obtener branches locales y remotos
  getGitBranches: (repoPath) => {
    return ipcRenderer.invoke('get-git-branches', repoPath);
  },

  // Crear un nuevo branch
  gitCreateBranch: (repoPath, branchName, fromBranch) => {
    return ipcRenderer.invoke('git-create-branch', { repoPath, branchName, fromBranch });
  },

  // Hacer checkout de un branch
  gitCheckout: (repoPath, branchName) => {
    return ipcRenderer.invoke('git-checkout', { repoPath, branchName });
  },

  // Verificar si un commit puede ser cherry-picked
  canCherryPickCommit: (repoPath, commitHash) => {
    return ipcRenderer.invoke('can-cherry-pick-commit', { repoPath, commitHash });
  },

  // Hacer revert de un commit
  gitRevert: (repoPath, commitHash) => {
    return ipcRenderer.invoke('git-revert', { repoPath, commitHash });
  },

  // Hacer cherry-pick de un commit
  gitCherryPick: (repoPath, commitHash, commitChanges, appendOrigin) => {
    return ipcRenderer.invoke('git-cherry-pick', { repoPath, commitHash, commitChanges, appendOrigin });
  },

  // Crear un tag
  gitCreateTag: (repoPath, tagName, message, commitHash, pushToAllRemotes) => {
    return ipcRenderer.invoke('git-create-tag', { repoPath, tagName, message, commitHash, pushToAllRemotes });
  },

  // Git stash
  gitStash: (repoPath, includeUntracked = false, message = '') => {
    // Asegurarse de que el mensaje sea un string válido
    const normalizedMessage = (message && typeof message === 'string') ? message : '';
    return ipcRenderer.invoke('git-stash', { repoPath, includeUntracked, message: normalizedMessage });
  },

  // Obtener lista de stashes
  getGitStashList: (repoPath) => {
    return ipcRenderer.invoke('get-git-stash-list', repoPath);
  },

  // Aplicar (pop) un stash específico
  gitStashPop: (repoPath, stashRef) => {
    return ipcRenderer.invoke('git-stash-pop', { repoPath, stashRef });
  },

  // Eliminar (drop) un stash específico
  gitStashDrop: (repoPath, stashRef) => {
    return ipcRenderer.invoke('git-stash-drop', { repoPath, stashRef });
  },

  // Limpiar todos los stashes
  gitStashClear: (repoPath) => {
    return ipcRenderer.invoke('git-stash-clear', repoPath);
  },

  // Git clean
  gitClean: (repoPath, force = false) => {
    return ipcRenderer.invoke('git-clean', { repoPath, force });
  },

  // Git reset hard
  gitResetHard: (repoPath) => {
    return ipcRenderer.invoke('git-reset-hard', repoPath);
  },

  // Guardar archivo (genérico)
  saveFile: (content, defaultFilename) => {
    return ipcRenderer.invoke('save-file', content, defaultFilename);
  },

  // Abrir archivo (genérico)
  openFile: () => {
    return ipcRenderer.invoke('open-file');
  },

  // Importar configuración completa
  importConfig: (configData) => {
    return ipcRenderer.invoke('import-config', configData);
  },

  // Iniciar monitoreo de cambios en repositorio
  startRepoWatcher: (repoPath) => {
    return ipcRenderer.invoke('start-repo-watcher', repoPath);
  },

  // Detener monitoreo de cambios en repositorio
  stopRepoWatcher: (repoPath) => {
    return ipcRenderer.invoke('stop-repo-watcher', repoPath);
  },

  // Escuchar cambios en el estado de Git
  onGitStatusChanged: (callback) => {
    const subscription = (event, repoPath) => callback(repoPath);
    ipcRenderer.on('git-status-changed', subscription);
    return () => ipcRenderer.removeListener('git-status-changed', subscription);
  }
});

