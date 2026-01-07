import React, { useState, useEffect } from 'react';
import {
    Plus,
    AlertCircle,
    RefreshCw,
    File,
    FileText,
    FileCode,
    Image,
    FileJson,
    FileType,
    Database,
    Settings,
    Package,
    FileCheck,
    Folder,
    Minus,
    CheckCircle2
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface GitFile {
    path: string;
    status: string;
}

interface GitStatusPanelProps {
    repoPath: string;
    onRefreshGraph: () => void;
}

export const GitStatusPanel: React.FC<GitStatusPanelProps> = ({ repoPath, onRefreshGraph }) => {
    const [stagedFiles, setStagedFiles] = useState<GitFile[]>([]);
    const [unstagedFiles, setUnstagedFiles] = useState<GitFile[]>([]);
    const [commitMessage, setCommitMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentBranch, setCurrentBranch] = useState<string>('');
    const [commitButtonBehavior, setCommitButtonBehavior] = useState<"commit" | "commit-push" | "commit-sync">("commit");

    const loadStatus = async () => {
        if (!repoPath) return;
        setLoading(true);
        try {
            const result = await (window as any).electronAPI.getGitStatus(repoPath);
            if (result.success) {
                setStagedFiles(result.staged);
                setUnstagedFiles(result.unstaged);
                setCurrentBranch(result.branch || '');
                setError(null);
            } else {
                setError(result.error);
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Efecto para cargar el estado inicial
    useEffect(() => {
        loadStatus();
    }, [repoPath]);

    // Función para cargar configuración del comportamiento del botón de commit
    const loadCommitBehavior = async () => {
        try {
            if ((window as any).electronAPI?.readConfig) {
                const configResult = await (window as any).electronAPI.readConfig();
                if (configResult.success && configResult.config?.configuracion?.commitButtonBehavior) {
                    setCommitButtonBehavior(configResult.config.configuracion.commitButtonBehavior);
                }
            }
        } catch (err) {
            console.error('Error al cargar configuración del botón de commit:', err);
        }
    };

    // Cargar configuración del comportamiento del botón de commit al montar
    useEffect(() => {
        loadCommitBehavior();
    }, []);

    // Recargar configuración cuando la ventana recibe foco (para detectar cambios)
    useEffect(() => {
        const handleFocus = () => {
            loadCommitBehavior();
        };
        
        window.addEventListener('focus', handleFocus);
        
        return () => {
            window.removeEventListener('focus', handleFocus);
        };
    }, []);

    // También recargar periódicamente cada 2 segundos para detectar cambios
    useEffect(() => {
        const interval = setInterval(() => {
            loadCommitBehavior();
        }, 2000);

        return () => clearInterval(interval);
    }, []);

    // Efecto para iniciar/detener el watcher cuando cambia el repositorio
    useEffect(() => {
        if (!repoPath) return;

        // Iniciar el watcher
        (window as any).electronAPI.startRepoWatcher(repoPath).catch((err: any) => {
            console.error('Error al iniciar watcher:', err);
        });

        // Escuchar cambios
        const unsubscribe = (window as any).electronAPI.onGitStatusChanged((changedRepoPath: string) => {
            // Solo actualizar si el cambio es del repositorio actual
            if (changedRepoPath === repoPath) {
                loadStatus();
            }
        });

        // Cleanup: detener el watcher y remover el listener
        return () => {
            unsubscribe();
            (window as any).electronAPI.stopRepoWatcher(repoPath).catch((err: any) => {
                console.error('Error al detener watcher:', err);
            });
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [repoPath]);

    const handleStage = async (file: string) => {
        try {
            const result = await (window as any).electronAPI.gitStage(repoPath, file);
            if (result.success) loadStatus();
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleUnstage = async (file: string) => {
        try {
            const result = await (window as any).electronAPI.gitUnstage(repoPath, file);
            if (result.success) loadStatus();
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleCommit = async () => {
        if (!commitMessage.trim()) return;
        setLoading(true);
        setError(null);
        try {
            // Realizar commit
            const commitResult = await (window as any).electronAPI.gitCommit(repoPath, commitMessage);
            if (commitResult.success) {
                setCommitMessage("");
                loadStatus();
                onRefreshGraph();
                
                // Ejecutar acción adicional según la configuración
                if (commitButtonBehavior === "commit-push" || commitButtonBehavior === "commit-sync") {
                    try {
                        // Para commit-sync, primero hacer fetch y pull
                        if (commitButtonBehavior === "commit-sync") {
                            // Fetch
                            const fetchResult = await (window as any).electronAPI.gitFetch?.(repoPath);
                            if (!fetchResult?.success) {
                                console.warn('Fetch falló:', fetchResult?.error);
                            }
                            
                            // Pull
                            const pullResult = await (window as any).electronAPI.gitPull?.(repoPath);
                            if (!pullResult?.success) {
                                const errorMessage = pullResult?.error || "";
                                if (errorMessage.includes("conflict") || errorMessage.includes("CONFLICT")) {
                                    setError(`Commit realizado exitosamente, pero el pull falló por conflictos: ${errorMessage}. Resuelve los conflictos manualmente.`);
                                    loadStatus();
                                    onRefreshGraph();
                                    return;
                                } else {
                                    console.warn('Pull falló:', pullResult?.error);
                                }
                            }
                        }
                        
                        // Push (para ambos commit-push y commit-sync)
                        const pushResult = await (window as any).electronAPI.gitPush?.(repoPath);
                        if (pushResult?.success) {
                            // Actualizar el estado después del push
                            loadStatus();
                            onRefreshGraph();
                        } else {
                            // Si el push falla, mostrar el error pero el commit ya se hizo
                            const errorMessage = pushResult?.error || "";
                            if (errorMessage.includes("non-fast-forward") || errorMessage.includes("behind") || errorMessage.includes("Updates were rejected")) {
                                setError(`Commit realizado exitosamente, pero el push falló: ${errorMessage}. Puede que necesites hacer pull primero.`);
                            } else {
                                setError(`Commit realizado exitosamente, pero el push falló: ${errorMessage}`);
                            }
                        }
                    } catch (pushErr: any) {
                        setError(`Commit realizado exitosamente, pero la operación adicional falló: ${pushErr.message}`);
                    }
                }
            } else {
                setError(commitResult.error);
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status.toUpperCase()) {
            case 'M': return 'text-amber-700 dark:text-amber-400';
            case 'A': return 'text-green-700 dark:text-green-400';
            case 'D': return 'text-red-700 dark:text-red-400';
            case '?': return 'text-orange-700 dark:text-orange-400';
            default: return 'text-slate-400';
        }
    };

    const getStatusBgColor = (status: string) => {
        switch (status.toUpperCase()) {
            case 'M': return 'bg-amber-100 dark:bg-amber-900/30';
            case 'A': return 'bg-green-100 dark:bg-green-900/30';
            case 'D': return 'bg-red-100 dark:bg-red-900/30';
            case '?': return 'bg-orange-100 dark:bg-orange-900/30';
            default: return 'bg-slate-100 dark:bg-slate-800';
        }
    };

    const getFileIcon = (filePath: string) => {
        // Check if it's a folder (path ends with / or has no extension and no filename)
        const isFolder = filePath.endsWith('/') || (!filePath.includes('.') && !filePath.split('/').pop());
        
        if (isFolder) return Folder;
        
        const extension = filePath.split('.').pop()?.toLowerCase() || '';
        const fileName = filePath.split('/').pop()?.toLowerCase() || '';

        // Config files
        if (['json', 'jsonc'].includes(extension)) return FileJson;
        if (['yml', 'yaml'].includes(extension)) return Settings;
        if (['toml', 'ini', 'conf', 'config'].includes(extension)) return Settings;
        if (fileName === 'package.json' || fileName === 'package-lock.json' || fileName === 'yarn.lock' || fileName === 'pnpm-lock.yaml') return Package;
        
        // Code files
        if (['js', 'jsx', 'ts', 'tsx', 'mjs', 'cjs'].includes(extension)) return FileCode;
        if (['py', 'pyw', 'pyi'].includes(extension)) return FileCode;
        if (['java', 'class', 'jar'].includes(extension)) return FileCode;
        if (['cpp', 'cxx', 'cc', 'c', 'h', 'hpp'].includes(extension)) return FileCode;
        if (['go', 'rs', 'swift', 'kt', 'scala'].includes(extension)) return FileCode;
        if (['php', 'rb', 'pl', 'pm'].includes(extension)) return FileCode;
        if (['sh', 'bash', 'zsh', 'fish', 'ps1'].includes(extension)) return FileCode;
        if (['html', 'htm', 'xml', 'svg'].includes(extension)) return FileCode;
        if (['css', 'scss', 'sass', 'less', 'styl'].includes(extension)) return FileCode;
        if (['vue', 'svelte', 'jsx', 'tsx'].includes(extension)) return FileCode;
        
        // Data files
        if (['sql', 'db', 'sqlite', 'sqlite3'].includes(extension)) return Database;
        if (['csv', 'tsv'].includes(extension)) return Database;
        
        // Text files
        if (['md', 'markdown', 'txt', 'readme'].includes(extension) || fileName === 'readme' || fileName === 'license') return FileText;
        if (['log', 'out', 'err'].includes(extension)) return FileText;
        
        // Image files
        if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'ico', 'bmp', 'tiff'].includes(extension)) return Image;
        
        // Font files
        if (['ttf', 'otf', 'woff', 'woff2', 'eot'].includes(extension)) return FileType;
        
        // Default
        return File;
    };

    const renderFileRow = (file: GitFile, type: 'staged' | 'unstaged') => {
        const isFolder = file.path.endsWith('/') || (!file.path.includes('.') && !file.path.split('/').pop());
        const pathParts = file.path.split('/').filter(Boolean);
        
        // For folders, get the folder name
        // For files, show full path if it's inside a folder, otherwise just the filename
        const hasDirectory = pathParts.length > 1;
        const displayName = isFolder 
            ? (pathParts[pathParts.length - 1] || pathParts[pathParts.length - 2] || 'folder')
            : hasDirectory 
                ? file.path  // Show full path for files in folders
                : (pathParts[pathParts.length - 1] || file.path);
        
        const directory = isFolder 
            ? pathParts.slice(0, -1).join('/')
            : hasDirectory 
                ? undefined  // Don't show directory separately when showing full path
                : pathParts.slice(0, -1).join('/');
        
        const FileIcon = getFileIcon(file.path);
        
        // Get status display text
        const getStatusText = (status: string) => {
            switch (status.toUpperCase()) {
                case '?': return '?';
                case 'A': return 'A';
                case 'M': return 'M';
                case 'D': return 'D';
                default: return status;
            }
        };
        
        const isTextStatus = ['?', 'A', 'M', 'D'].includes(file.status.toUpperCase());

        return (
            <div
                key={file.path}
                className="group flex items-center px-4 py-0.5 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors border-b border-transparent hover:border-slate-200 dark:hover:border-slate-700/50"
            >
                {/* File/Folder Icon */}
                <div className="mr-3 flex-shrink-0">
                    <FileIcon className={cn(
                        "h-4 w-4",
                        isFolder 
                            ? "text-blue-500 dark:text-blue-400" 
                            : "text-slate-400 dark:text-slate-500"
                    )} />
                </div>

                {/* File/Folder Info */}
                <div className="flex-1 min-w-0 pr-2">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-slate-700 dark:text-slate-200 truncate" title={file.path}>
                            {displayName || 'folder'}
                        </span>
                        {isTextStatus ? (
                            <span className={cn(
                                "text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded-sm",
                                getStatusColor(file.status),
                                getStatusBgColor(file.status)
                            )}>
                                {getStatusText(file.status)}
                            </span>
                        ) : (
                            <span className={cn(
                                "text-[10px] font-bold uppercase",
                                getStatusColor(file.status)
                            )}>
                                {getStatusText(file.status)}
                            </span>
                        )}
                    </div>
                    {directory && (
                        <div className="text-[10px] text-slate-400 dark:text-slate-500 truncate" title={directory}>
                            {directory}
                        </div>
                    )}
                </div>

                {/* Stage/Unstage Button */}
                {type === 'unstaged' && (
                    <div className="flex items-center gap-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-900/20"
                            onClick={() => handleStage(file.path)}
                            title={isFolder ? "Stage folder" : "Stage file"}
                        >
                            <Plus className="h-3.5 w-3.5" />
                        </Button>
                    </div>
                )}
                {type === 'staged' && (
                    <div className="flex items-center gap-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-900/20"
                            onClick={() => handleUnstage(file.path)}
                            title={isFolder ? "Unstage folder" : "Unstage file"}
                        >
                            <Minus className="h-3.5 w-3.5" />
                        </Button>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="flex flex-col h-full bg-white dark:bg-[#011627] border-r border-slate-200 dark:border-slate-700/50">
            {/* Unstaged Changes Section */}
            <div className="flex flex-col flex-1 min-h-0 border-b border-slate-200 dark:border-slate-700/50">
                <div className="h-9 px-4 flex items-center justify-between bg-slate-50/80 dark:bg-[#0b253a]/30 border-b border-slate-200 dark:border-slate-700/50 sticky top-0 z-10">
                    <div className="flex items-center gap-2">
                        <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Unstaged Changes</h3>
                        <span className="text-[10px] bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded-sm font-mono">
                            {unstagedFiles.length}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                            onClick={loadStatus}
                            disabled={loading}
                        >
                            <RefreshCw className={cn("h-3 w-3", loading && "animate-spin")} />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-[10px] font-semibold text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={() => handleStage('*')}
                            disabled={unstagedFiles.length === 0 || loading}
                        >
                            Stage All
                        </Button>
                    </div>
                </div>
                <div className="flex-1 overflow-auto">
                    {unstagedFiles.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center p-6 text-center">
                            <CheckCircle2 className="h-8 w-8 text-slate-300 dark:text-slate-600 mb-2" />
                            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">No hay cambios pendientes</span>
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">Todos los archivos están sincronizados</span>
                        </div>
                    ) : (
                        unstagedFiles.map(file => renderFileRow(file, 'unstaged'))
                    )}
                </div>
            </div>

            {/* Staged Changes Section */}
            <div className="flex flex-col flex-1 min-h-0">
                <div className="h-9 px-4 flex items-center justify-between bg-slate-50/80 dark:bg-[#0b253a]/30 border-b border-slate-200 dark:border-slate-700/50 sticky top-0 z-10">
                    <div className="flex items-center gap-2">
                        <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Staged Changes</h3>
                        <span className="text-[10px] bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded-sm font-mono">
                            {stagedFiles.length}
                        </span>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-[10px] font-semibold text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={() => handleUnstage('*')}
                        disabled={stagedFiles.length === 0 || loading}
                    >
                        Unstage All
                    </Button>
                </div>
                <div className="flex-1 overflow-auto">
                    {stagedFiles.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center p-6 text-center">
                            <CheckCircle2 className="h-8 w-8 text-slate-300 dark:text-slate-600 mb-2" />
                            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">No hay cambios en stage</span>
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">Stagea archivos para preparar tu commit</span>
                        </div>
                    ) : (
                        stagedFiles.map(file => renderFileRow(file, 'staged'))
                    )}
                </div>
            </div>

            {/* Commit Area */}
            <div className="flex flex-col border-t border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-[#0b253a]/20">
                <div className="h-9 px-4 flex items-center bg-slate-50/80 dark:bg-[#0b253a]/30 border-b border-slate-200 dark:border-slate-700/50">
                    <div className="flex items-center gap-2">
                        <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Commit Message</h3>
                    </div>
                </div>
                <div className="p-4">
                    <div className="mb-3">
                        <textarea
                            className="w-full h-24 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md p-3 text-xs outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all resize-none text-slate-700 dark:text-slate-200 placeholder:text-slate-400 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-100 dark:disabled:bg-slate-800/50"
                            placeholder={stagedFiles.length === 0 ? "Stagea archivos para poder hacer commit" : "Enter commit message..."}
                            value={commitMessage}
                            onChange={(e) => setCommitMessage(e.target.value)}
                            maxLength={300}
                            disabled={stagedFiles.length === 0 || loading}
                        />
                    </div>

                    <Button
                        className="w-full bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-300 disabled:text-slate-500 dark:disabled:bg-slate-700 dark:disabled:text-slate-600 text-white text-xs font-semibold h-9 shadow-sm transition-all active:scale-[0.98]"
                        disabled={!commitMessage.trim() || stagedFiles.length === 0 || loading}
                        onClick={handleCommit}
                    >
                        {loading ? (
                            <>
                                <RefreshCw className="h-3.5 w-3.5 animate-spin mr-2" />
                                {commitButtonBehavior === "commit" && <>Committing{currentBranch ? ` to '${currentBranch}'` : ''}...</>}
                                {commitButtonBehavior === "commit-push" && <>Committing & Pushing{currentBranch ? ` to '${currentBranch}'` : ''}...</>}
                                {commitButtonBehavior === "commit-sync" && <>Committing & Syncing{currentBranch ? ` to '${currentBranch}'` : ''}...</>}
                            </>
                        ) : (
                            <>
                                {commitButtonBehavior === "commit" && <>Commit{currentBranch ? ` to '${currentBranch}'` : ''}</>}
                                {commitButtonBehavior === "commit-push" && <>Commit + Push{currentBranch ? ` to '${currentBranch}'` : ''}</>}
                                {commitButtonBehavior === "commit-sync" && <>Commit + Sync{currentBranch ? ` to '${currentBranch}'` : ''}</>}
                            </>
                        )}
                    </Button>

                    {error && (
                        <div className="mt-3 text-[10px] text-red-500 flex items-start gap-2 p-2.5 bg-red-50 dark:bg-red-900/20 rounded-md border border-red-100 dark:border-red-900/30">
                            <AlertCircle className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
                            <span className="break-all leading-relaxed">{error}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
