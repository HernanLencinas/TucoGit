/// <reference types="vite/client" />

interface Window {
  electronAPI?: {
    platform: string;
    versions: {
      node: string;
      chrome: string;
      electron: string;
    };
    getDocumentsPath: () => Promise<string>;
    selectFolder: () => Promise<string | null>;
    initializeConfig: (configPath: string) => Promise<{
      success: boolean;
      ruta?: string;
      archivo?: string;
      ultimaActualizacion?: string;
      tema?: string;
      temaNombre?: string;
      zoomLevel?: number;
      editorIDE?: string | null;
      gitSslVerify?: boolean;
      gitUserName?: string;
      gitUserEmail?: string;
      wizardCompleted?: boolean;
      repositorios?: any[];
      error?: string;
    }>;
    readConfig: () => Promise<{
      success: boolean;
      config?: any;
      error?: string;
    }>;
    writeConfig: (updates: { tema?: string; temaNombre?: string; zoomLevel?: number; editorIDE?: string | null; repositorios?: any[]; conexiones?: any[]; gitSslVerify?: boolean; gitUserName?: string; gitUserEmail?: string; wizardCompleted?: boolean }) => Promise<{
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
    saveConfigFile: (configData: any) => Promise<{
      success: boolean;
      filePath?: string;
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
    getGitConfig: (key: string) => Promise<{
      success: boolean;
      value?: string;
      error?: string;
    }>;
    setGitConfig: (key: string, value: string) => Promise<{
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
  };
}

