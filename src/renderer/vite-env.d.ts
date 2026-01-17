/// <reference types="vite/client" />

interface Window {
  electronAPI?: {
    platform: string;
    versions: {
      node: string;
      chrome: string;
      electron: string;
    };
    getAppVersion: () => Promise<string>;
    getDocumentsPath: () => Promise<string>;
    openExternal: (url: string) => Promise<{ success: boolean; error?: string }>;
    selectFolder: () => Promise<string | null>;
    initializeConfig: (configPath: string) => Promise<{
      success: boolean;
      ruta?: string;
      archivo?: string;
      isFirstTime?: boolean;
      ultimaActualizacion?: string;
      tema?: string;
      temaNombre?: string;
      zoomLevel?: number;
      editorIDE?: string | null;
      gitSslVerify?: boolean;
      gitUserName?: string;
      gitUserEmail?: string;
      wizardCompleted?: boolean;
      uiLanguage?: "en" | "es-AR" | "de" | "fr" | "pt" | "ja" | "zh-CN" | "ru";
      repositorios?: any[];
      error?: string;
    }>;
    readConfig: () => Promise<{
      success: boolean;
      config?: any;
      error?: string;
    }>;
    writeConfig: (updates: { tema?: string; temaNombre?: string; zoomLevel?: number; editorIDE?: string | null; repositorios?: any[]; conexiones?: any[]; gitSslVerify?: boolean; gitUserName?: string; gitUserEmail?: string; wizardCompleted?: boolean; uiLanguage?: "en" | "es-AR" | "de" | "fr" | "pt" | "ja" | "zh-CN" | "ru" }) => Promise<{
      success: boolean;
      error?: string;
    }>;
    encryptToken: (token: string) => Promise<{
      success: boolean;
      encryptedToken?: string;
      error?: string;
    }>;
    decryptToken: (encryptedToken: string) => Promise<{
      success: boolean;
      token?: string;
      error?: string;
    }>;
    validateGitToken: (proveedor: string, token: string, urlServidor?: string, gitSslVerify?: boolean) => Promise<{
      success: boolean;
      message?: string;
      user?: string;
      error?: string;
    }>;
    getGitRepositories: (proveedor: string, token: string, urlServidor?: string, gitSslVerify?: boolean) => Promise<{
      success: boolean;
      repositories?: Array<{
        id: string;
        name: string;
        full_name: string;
        description?: string;
        private?: boolean;
        clone_url?: string;
      }>;
      error?: string;
    }>;
    getConnectionDetails: (proveedor: string, token: string, urlServidor?: string, gitSslVerify?: boolean) => Promise<{
      success: boolean;
      data?: {
        userName: string;
        createdAt: string | null;
        organizations: string[];
        totalRepos: number;
        publicRepos: number;
        privateRepos: number;
      };
      error?: string;
    }>;
    detectInstalledEditors: () => Promise<{
      success: boolean;
      editors?: string[];
      error?: string;
    }>;
    cloneRepository: (url: string, destPath: string, repoId: string, sslVerify?: boolean, token?: string) => Promise<{
      success: boolean;
      error?: string;
    }>;
    onCloneProgress: (callback: (data: { repoId: string; progress?: number; message?: string }) => void) => () => void;
    checkPathExists: (pathToCheck: string) => Promise<boolean>;
    deletePath: (pathToDelete: string) => Promise<{
      success: boolean;
      error?: string;
    }>;
    getGitLocalInfo: (repoPath: string) => Promise<{
      success: boolean;
      info?: any;
      error?: string;
    }>;
    getGitLog: (repoPath: string, skip?: number, limit?: number, searchTerm?: string) => Promise<{ success: boolean; commits?: any[]; error?: string }>;
    getCommitDetails: (repoPath: string, commitHash: string) => Promise<{ success: boolean; files?: any[]; stats?: string; fullDiff?: string; error?: string }>;
    getCommitTree: (repoPath: string, commitHash: string) => Promise<{ success: boolean; files?: Array<{ path: string }>; error?: string }>;
    getCommitFileContent: (repoPath: string, commitHash: string, filePath: string) => Promise<{ success: boolean; content?: string; error?: string }>;
    getCommitParents: (repoPath: string, commitHash: string) => Promise<{ success: boolean; parents?: string[]; error?: string }>;
    openInIDE: (path: string, ideName: string) => Promise<{
      success: boolean;
      error?: string;
    }>;
    saveFile: (content: string, defaultFilename?: string) => Promise<{
      success: boolean;
      filePath?: string;
      error?: string;
    }>;
    openFile: () => Promise<string | null>;
    importConfig: (configData: any) => Promise<{
      success: boolean;
      error?: string;
    }>;
    getGitStatus: (repoPath: string) => Promise<{ success: boolean; status?: any; error?: string }>;
    gitStage: (repoPath: string, file: string) => Promise<{ success: boolean; error?: string }>;
    gitUnstage: (repoPath: string, file: string) => Promise<{ success: boolean; error?: string }>;
    gitCommit: (repoPath: string, message: string, authorName: string, authorEmail: string) => Promise<{ success: boolean; error?: string }>;
    gitFetch: (repoPath: string) => Promise<{ success: boolean; error?: string }>;
    gitPull: (repoPath: string) => Promise<{ success: boolean; error?: string }>;
    gitPush: (repoPath: string) => Promise<{ success: boolean; error?: string }>;
    getGitBranches: (repoPath: string) => Promise<{ success: boolean; branches?: any[]; current?: string; error?: string }>;
    gitCreateBranch: (repoPath: string, branchName: string, fromBranch?: string) => Promise<{ success: boolean; error?: string }>;
    gitCheckout: (repoPath: string, branchName: string) => Promise<{ success: boolean; error?: string }>;
    canCherryPickCommit: (repoPath: string, commitHash: string) => Promise<boolean>;
    gitRevert: (repoPath: string, commitHash: string) => Promise<{ success: boolean; error?: string }>;
    gitCherryPick: (repoPath: string, commitHash: string, commitChanges?: boolean, appendOrigin?: boolean) => Promise<{ success: boolean; error?: string }>;
    getPendingOperation: (repoPath: string) => Promise<string | null>;
    abortPendingOperation: (repoPath: string, operation: string) => Promise<{ success: boolean; error?: string }>;
    continuePendingOperation: (repoPath: string, operation: string) => Promise<{ success: boolean; error?: string }>;
    gitCreateTag: (repoPath: string, tagName: string, message: string, commitHash: string, pushToAllRemotes?: boolean) => Promise<{ success: boolean; error?: string }>;
    gitStash: (repoPath: string, includeUntracked?: boolean, message?: string) => Promise<{ success: boolean; error?: string }>;
    getGitStashList: (repoPath: string) => Promise<{ success: boolean; stashes?: any[]; error?: string }>;
    gitStashPop: (repoPath: string, stashRef: string) => Promise<{ success: boolean; error?: string }>;
    gitStashDrop: (repoPath: string, stashRef: string) => Promise<{ success: boolean; error?: string }>;
    gitStashClear: (repoPath: string) => Promise<{ success: boolean; error?: string }>;
    gitClean: (repoPath: string, force?: boolean) => Promise<{ success: boolean; error?: string }>;
    gitResetHard: (repoPath: string) => Promise<{ success: boolean; error?: string }>;
    startRepoWatcher: (repoPath: string) => Promise<void>;
    stopRepoWatcher: (repoPath: string) => Promise<void>;
    onGitStatusChanged: (callback: (repoPath: string) => void) => () => void;
    onNavigateTo: (callback: (data: { tab: string; section?: string }) => void) => () => void;
    decryptToken: (encryptedToken: string) => Promise<{ success: boolean; token?: string; error?: string }>;
  };
}

