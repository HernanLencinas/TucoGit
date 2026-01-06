import React, { useEffect, useState } from 'react';
import { ArrowLeft, GitBranch, RotateCw, Search, X, Download, Upload, GitPullRequest, ChevronDown, Plus, ArrowUp, ArrowDown, Trash2, Archive, Tag, Settings, Undo2, GitMerge, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { useToast } from "@/lib/use-toast";
import { FolderItem } from "@/renderer/types";
import { CommitGraph } from "./CommitGraph";
import { CommitDetails } from "./CommitDetails";
import { GitStatusPanel } from "./GitStatusPanel";

interface RepositoryDetailsProps {
    repository: FolderItem;
    configPath: string;
    onBack: () => void;
    onMinimize?: () => void;
}

export const RepositoryDetails: React.FC<RepositoryDetailsProps> = ({ repository, configPath, onBack, onMinimize }) => {
    const { toast } = useToast();
    const [commits, setCommits] = useState<any[]>([]);
    const [selectedCommit, setSelectedCommit] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [skip, setSkip] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const LIMIT = 50;
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
    const scrollContainerRef = React.useRef<HTMLDivElement>(null);
    const [branches, setBranches] = useState<{ local: string[], remote: string[], current: string, headHash?: string | null }>({ local: [], remote: [], current: '' });
    const [branchesOpen, setBranchesOpen] = useState(false);
    const [canCherryPick, setCanCherryPick] = useState(false);
    const branchesDropdownRef = React.useRef<HTMLDivElement>(null);
    const [newBranchMenuOpen, setNewBranchMenuOpen] = useState(false);
    const newBranchMenuRef = React.useRef<HTMLDivElement>(null);
    const [cherryPickMenuOpen, setCherryPickMenuOpen] = useState(false);
    const cherryPickMenuRef = React.useRef<HTMLDivElement>(null);
    const [stashMenuOpen, setStashMenuOpen] = useState(false);
    const stashMenuRef = React.useRef<HTMLDivElement>(null);
    const [showStashModal, setShowStashModal] = useState(false);
    const [stashMessage, setStashMessage] = useState('');
    const [stashIncludeUntracked, setStashIncludeUntracked] = useState(true);
    const [stashing, setStashing] = useState(false);
    const [showStashListModal, setShowStashListModal] = useState(false);
    const [stashList, setStashList] = useState<Array<{ index: number; ref: string; message: string; date: string }>>([]);
    const [loadingStashList, setLoadingStashList] = useState(false);
    const [applyingStash, setApplyingStash] = useState<string | null>(null);
    const [selectedStash, setSelectedStash] = useState<string | null>(null);
    const [stashToDelete, setStashToDelete] = useState<{ ref: string; message: string } | null>(null);
    const [deletingStash, setDeletingStash] = useState(false);
    const [showClearAllConfirm, setShowClearAllConfirm] = useState(false);
    const [clearingAllStashes, setClearingAllStashes] = useState(false);
    const [showNewBranchModal, setShowNewBranchModal] = useState(false);
    const [newBranchName, setNewBranchName] = useState("");
    const [newBranchFrom, setNewBranchFrom] = useState("");
    const [creatingBranch, setCreatingBranch] = useState(false);
    const [isCreatingFromRemote, setIsCreatingFromRemote] = useState(false);
    const [syncInfo, setSyncInfo] = useState<{ ahead: number, behind: number }>({ ahead: 0, behind: 0 });
    const [fetching, setFetching] = useState(false);
    const [pulling, setPulling] = useState(false);
    const [pushing, setPushing] = useState(false);
    const [showPullStrategyModal, setShowPullStrategyModal] = useState(false);
    const [pendingPullRepoPath, setPendingPullRepoPath] = useState<string | null>(null);
    const [selectedPullStrategy, setSelectedPullStrategy] = useState<'merge' | 'rebase' | 'ff-only'>('merge');
    const [pendingPushAfterPull, setPendingPushAfterPull] = useState(false);
    const [showCheckoutConflictModal, setShowCheckoutConflictModal] = useState(false);
    const [conflictFiles, setConflictFiles] = useState<string[]>([]);
    const [pendingCheckoutBranch, setPendingCheckoutBranch] = useState<string | null>(null);
    const [pendingCheckoutRepoPath, setPendingCheckoutRepoPath] = useState<string | null>(null);
    const [resolvingConflict, setResolvingConflict] = useState(false);
    const [selectedCheckoutOption, setSelectedCheckoutOption] = useState<'save' | 'stash' | 'discard'>('save');
    const [isUntrackedConflict, setIsUntrackedConflict] = useState(false);
    const [showNewTagModal, setShowNewTagModal] = useState(false);
    const [tagName, setTagName] = useState("");
    const [tagMessage, setTagMessage] = useState("");
    const [pushToAllRemotes, setPushToAllRemotes] = useState(false);
    const [creatingTag, setCreatingTag] = useState(false);
    const [showRevertModal, setShowRevertModal] = useState(false);
    const [reverting, setReverting] = useState(false);
    const [showCherryPickModal, setShowCherryPickModal] = useState(false);
    const [cherryPickCommitChanges, setCherryPickCommitChanges] = useState(true);
    const [cherryPickAppendOrigin, setCherryPickAppendOrigin] = useState(false);
    const [cherryPicking, setCherryPicking] = useState(false);
    const [pendingOperation, setPendingOperation] = useState<{ operation: string; commitHash?: string } | null>(null);
    const [checkingPendingOperation, setCheckingPendingOperation] = useState(false);
    const [resolvingPendingOperation, setResolvingPendingOperation] = useState(false);

    // Debounce search term
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const loadCommits = async (isInitial = false, search = debouncedSearchTerm) => {
        if (isInitial) {
            setLoading(true);
            setCommits([]);
            setSkip(0);
            setHasMore(true);
        } else {
            if (!hasMore || loadingMore) return;
            setLoadingMore(true);
        }

        setError(null);
        try {
            if (!window.electronAPI?.getGitLog) {
                throw new Error("La API de Git Log no está disponible");
            }

            const orgPath = repository.organizacion ? `${repository.organizacion}/` : "";
            const repoName = repository.nombreGit || repository.nombre;
            const repoPathFull = `${configPath}/repositories/${repository.idConexion || 'unknown'}/${orgPath}${repoName}`;

            const currentSkip = isInitial ? 0 : skip;
            const result = await window.electronAPI.getGitLog(repoPathFull, currentSkip, LIMIT, search);

            if (result.success) {
                const newCommits = result.commits || [];
                if (isInitial) {
                    setCommits(newCommits);
                } else {
                    setCommits(prev => [...prev, ...newCommits]);
                }

                if (newCommits.length < LIMIT) {
                    setHasMore(false);
                }

                if (!isInitial) {
                    setSkip(prev => prev + LIMIT);
                } else {
                    // For initial load, we prepare skip for the NEXT load
                    setSkip(LIMIT);
                }

            } else {
                setError(result.error || "Error desconocido al obtener commits");
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    /**
     * Initial load when repository or search term changes
     */
    useEffect(() => {
        loadCommits(true);
    }, [repository, configPath, debouncedSearchTerm]);

    const loadBranches = async (doFetch = false) => {
        const repoPath = `${configPath}/repositories/${repository.idConexion || 'unknown'}/${repository.organizacion ? `${repository.organizacion}/` : ""}${repository.nombreGit || repository.nombre}`;
        try {
            // Si doFetch es true, hacer fetch primero para actualizar branches remotos
            if (doFetch) {
                try {
                    await (window as any).electronAPI.gitFetch?.(repoPath);
                } catch (fetchErr) {
                    // Ignorar errores de fetch, continuar cargando branches
                    console.warn('Error al hacer fetch antes de cargar branches:', fetchErr);
                }
            }
            const result = await (window as any).electronAPI.getGitBranches?.(repoPath);
            if (result?.success) {
                setBranches(result);
            }
        } catch (err) {
            console.error('Error al cargar branches:', err);
        }
    };

    useEffect(() => {
        loadBranches();
        const interval = setInterval(loadBranches, 30000); // Actualizar cada 30 segundos
        return () => clearInterval(interval);
    }, [repository, configPath]);

    // Cargar información de sincronización (ahead/behind)
    const loadSyncInfo = async () => {
        const repoPath = `${configPath}/repositories/${repository.idConexion || 'unknown'}/${repository.organizacion ? `${repository.organizacion}/` : ""}${repository.nombreGit || repository.nombre}`;
        try {
            const result = await (window as any).electronAPI.getGitLocalInfo?.(repoPath);
            if (result?.success && result.info) {
                setSyncInfo({
                    ahead: result.info.ahead || 0,
                    behind: result.info.behind || 0
                });
            }
        } catch (err) {
            console.error('Error al cargar info de sincronización:', err);
        }
    };

    // Manejar la selección de estrategia de pull
    const handlePullStrategy = async () => {
        if (!pendingPullRepoPath) return;

        const strategy = selectedPullStrategy;
        const shouldPushAfter = pendingPushAfterPull;
        setPulling(true);
        setShowPullStrategyModal(false);

        try {
            let configKey = '';
            let configValue = '';

            if (strategy === 'merge') {
                configKey = 'pull.rebase';
                configValue = 'false';
            } else if (strategy === 'rebase') {
                configKey = 'pull.rebase';
                configValue = 'true';
            } else if (strategy === 'ff-only') {
                configKey = 'pull.ff';
                configValue = 'only';
            }

            // Configurar la estrategia localmente para este repositorio
            const configResult = await (window as any).electronAPI.setGitConfigLocal?.(pendingPullRepoPath, configKey, configValue);
            
            if (configResult?.success) {
                // Reintentar el pull
                const pullResult = await (window as any).electronAPI.gitPull?.(pendingPullRepoPath);
                if (pullResult?.success) {
                    loadCommits(true);
                    loadBranches();
                    await (window as any).electronAPI.gitFetch?.(pendingPullRepoPath).catch(() => {});
                    setTimeout(() => {
                        loadSyncInfo();
                    }, 500);
                    
                    // Si se abrió desde push, reintentar el push después del pull
                    if (shouldPushAfter) {
                        setPushing(true);
                        try {
                            const pushResult = await (window as any).electronAPI.gitPush?.(pendingPullRepoPath);
                            if (pushResult?.success) {
                                loadCommits(true);
                                loadBranches();
                                await (window as any).electronAPI.gitFetch?.(pendingPullRepoPath).catch(() => {});
                                setTimeout(() => {
                                    loadSyncInfo();
                                }, 500);
                                toast({
                                    title: "Push completado",
                                    description: "Pull y push realizados exitosamente",
                                    variant: "success",
                                });
                            } else {
                                toast({
                                    title: "Error al hacer push",
                                    description: pushResult?.error || "No se pudo completar el push después del pull",
                                    variant: "destructive",
                                });
                            }
                        } catch (pushErr: any) {
                            console.error('Error al hacer push después del pull:', pushErr);
                            toast({
                                title: "Error al hacer push",
                                description: pushErr?.message || "Ocurrió un error inesperado al hacer push",
                                variant: "destructive",
                            });
                        } finally {
                            setPushing(false);
                        }
                    } else {
                        toast({
                            title: "Pull completado",
                            description: `Pull realizado exitosamente usando ${strategy === 'merge' ? 'merge' : strategy === 'rebase' ? 'rebase' : 'fast-forward only'}`,
                            variant: "success",
                        });
                    }
                } else {
                    toast({
                        title: "Error al hacer pull",
                        description: pullResult?.error || "No se pudo completar la operación",
                        variant: "destructive",
                    });
                }
            } else {
                toast({
                    title: "Error al configurar Git",
                    description: configResult?.error || "No se pudo configurar la estrategia de pull",
                    variant: "destructive",
                });
            }
        } catch (err: any) {
            console.error('Error al manejar estrategia de pull:', err);
            toast({
                title: "Error",
                description: err?.message || "Ocurrió un error inesperado",
                variant: "destructive",
            });
        } finally {
            setPulling(false);
            setPendingPullRepoPath(null);
            setSelectedPullStrategy('merge');
            setPendingPushAfterPull(false);
        }
    };

    useEffect(() => {
        loadSyncInfo();
        const interval = setInterval(loadSyncInfo, 30000); // Actualizar cada 30 segundos
        return () => clearInterval(interval);
    }, [repository, configPath]);

    // Cerrar modal con tecla Escape
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && showPullStrategyModal) {
                setShowPullStrategyModal(false);
                setPendingPullRepoPath(null);
                setSelectedPullStrategy('merge');
                setPendingPushAfterPull(false);
            }
            if (e.key === 'Escape' && showCheckoutConflictModal) {
                setShowCheckoutConflictModal(false);
                setConflictFiles([]);
                setPendingCheckoutBranch(null);
                setPendingCheckoutRepoPath(null);
                setSelectedCheckoutOption('save');
                setIsUntrackedConflict(false);
            }
            if (e.key === 'Escape' && showStashModal) {
                if (!stashing) {
                    setShowStashModal(false);
                    setStashMessage('');
                    setStashIncludeUntracked(true);
                }
            }
            if (e.key === 'Escape' && showStashListModal) {
                if (!applyingStash) {
                    setShowStashListModal(false);
                    setStashList([]);
                    setSelectedStash(null);
                }
            }
            if (e.key === 'Escape' && showRevertModal) {
                if (!reverting) {
                    setShowRevertModal(false);
                }
            }
            if (e.key === 'Escape' && showCherryPickModal) {
                if (!cherryPicking) {
                    setShowCherryPickModal(false);
                    setCherryPickCommitChanges(true);
                    setCherryPickAppendOrigin(false);
                }
            }
        };

        if (showPullStrategyModal || showCheckoutConflictModal || showStashModal || showStashListModal || showRevertModal || showCherryPickModal) {
            window.addEventListener('keydown', handleEscape);
            return () => {
                window.removeEventListener('keydown', handleEscape);
            };
        }
    }, [showPullStrategyModal, showCheckoutConflictModal, showStashModal, showStashListModal, showRevertModal, showCherryPickModal, stashing, applyingStash, reverting, cherryPicking]);

    // Inicializar el branch base cuando se abre el modal (solo si no viene de un branch remoto)
    useEffect(() => {
        if (showNewBranchModal && branches.current && !isCreatingFromRemote) {
            setNewBranchFrom(branches.current);
        }
    }, [showNewBranchModal, branches.current, isCreatingFromRemote]);

    // Cerrar menú de cherry-pick cuando se hace click fuera
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (cherryPickMenuRef.current && !cherryPickMenuRef.current.contains(event.target as Node)) {
                setCherryPickMenuOpen(false);
            }
        };

        if (cherryPickMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => {
                document.removeEventListener('mousedown', handleClickOutside);
            };
        }
    }, [cherryPickMenuOpen]);

    // Verificar si el commit seleccionado puede ser cherry-picked
    useEffect(() => {
        const checkCherryPick = async () => {
            if (!selectedCommit?.hash) {
                setCanCherryPick(false);
                return;
            }

            const repoPath = `${configPath}/repositories/${repository.idConexion || 'unknown'}/${repository.organizacion ? `${repository.organizacion}/` : ""}${repository.nombreGit || repository.nombre}`;
            try {
                const result = await (window as any).electronAPI.canCherryPickCommit?.(repoPath, selectedCommit.hash);
                if (result?.success) {
                    setCanCherryPick(result.canCherryPick || false);
                } else {
                    setCanCherryPick(false);
                }
            } catch (err: any) {
                console.error('Error al verificar cherry-pick:', err);
                setCanCherryPick(false);
            }
        };

        checkCherryPick();
    }, [selectedCommit?.hash, branches.current, branches.headHash, configPath, repository]);

    // Verificar operaciones pendientes al cargar y periódicamente
    useEffect(() => {
        const orgPath = repository.organizacion ? `${repository.organizacion}/` : "";
        const repoName = repository.nombreGit || repository.nombre;
        const repoPath = `${configPath}/repositories/${repository.idConexion || 'unknown'}/${orgPath}${repoName}`;
        
        const checkPendingOperation = async () => {
            setCheckingPendingOperation(true);
            try {
                const result = await (window as any).electronAPI.getPendingOperation?.(repoPath);
                if (result?.success && result.hasPendingOperation) {
                    setPendingOperation({
                        operation: result.operation,
                        commitHash: result.commitHash
                    });
                } else {
                    setPendingOperation(null);
                }
            } catch (err) {
                console.error('Error al verificar operaciones pendientes:', err);
                setPendingOperation(null);
            } finally {
                setCheckingPendingOperation(false);
            }
        };
        
        checkPendingOperation();
        const interval = setInterval(checkPendingOperation, 2000);
        return () => clearInterval(interval);
    }, [repository, configPath]);

    // Función para abortar operación pendiente
    const handleAbortPendingOperation = async () => {
        if (!pendingOperation) return;
        setResolvingPendingOperation(true);
        try {
            const orgPath = repository.organizacion ? `${repository.organizacion}/` : "";
            const repoName = repository.nombreGit || repository.nombre;
            const repoPath = `${configPath}/repositories/${repository.idConexion || 'unknown'}/${orgPath}${repoName}`;
            const result = await (window as any).electronAPI.abortPendingOperation?.(repoPath, pendingOperation.operation);
            if (result?.success) {
                toast({
                    title: "Operación abortada",
                    description: `La operación ${pendingOperation.operation} ha sido abortada exitosamente`,
                    variant: "success",
                });
                setPendingOperation(null);
                loadCommits(true);
                loadBranches();
            } else {
                toast({
                    title: "Error al abortar operación",
                    description: result?.error || "No se pudo abortar la operación",
                    variant: "destructive",
                });
            }
        } catch (err: any) {
            console.error('Error al abortar operación:', err);
            toast({
                title: "Error al abortar operación",
                description: err?.message || "Ocurrió un error inesperado",
                variant: "destructive",
            });
        } finally {
            setResolvingPendingOperation(false);
        }
    };

    // Función para continuar operación pendiente
    const handleContinuePendingOperation = async () => {
        if (!pendingOperation) return;
        setResolvingPendingOperation(true);
        try {
            const orgPath = repository.organizacion ? `${repository.organizacion}/` : "";
            const repoName = repository.nombreGit || repository.nombre;
            const repoPath = `${configPath}/repositories/${repository.idConexion || 'unknown'}/${orgPath}${repoName}`;
            const result = await (window as any).electronAPI.continuePendingOperation?.(repoPath, pendingOperation.operation);
            if (result?.success) {
                toast({
                    title: "Operación continuada",
                    description: `La operación ${pendingOperation.operation} ha sido continuada exitosamente`,
                    variant: "success",
                });
                setPendingOperation(null);
                loadCommits(true);
                loadBranches();
            } else {
                toast({
                    title: "Error al continuar operación",
                    description: result?.error || "No se pudo continuar la operación. Verifica que no haya conflictos pendientes.",
                    variant: "destructive",
                });
            }
        } catch (err: any) {
            console.error('Error al continuar operación:', err);
            toast({
                title: "Error al continuar operación",
                description: err?.message || "Ocurrió un error inesperado",
                variant: "destructive",
            });
        } finally {
            setResolvingPendingOperation(false);
        }
    };

    // Cerrar menú de stash cuando se hace click fuera
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (stashMenuRef.current && !stashMenuRef.current.contains(event.target as Node)) {
                setStashMenuOpen(false);
            }
        };

        if (stashMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => {
                document.removeEventListener('mousedown', handleClickOutside);
            };
        }
    }, [stashMenuOpen]);

    // Handler para aplicar (pop) el stash seleccionado
    const handleStashPop = async () => {
        if (!selectedStash) {
            toast({
                title: "Selecciona un stash",
                description: "Por favor selecciona un stash para aplicar",
                variant: "destructive",
            });
            return;
        }

        const repoPath = `${configPath}/repositories/${repository.idConexion || 'unknown'}/${repository.organizacion ? `${repository.organizacion}/` : ""}${repository.nombreGit || repository.nombre}`;
        setApplyingStash(selectedStash);
        try {
            const result = await (window as any).electronAPI.gitStashPop?.(repoPath, selectedStash);
            if (result?.success) {
                toast({
                    title: "Stash aplicado",
                    description: "El stash ha sido aplicado y eliminado exitosamente",
                    variant: "success",
                });
                // Recargar la lista de stashes
                const listResult = await (window as any).electronAPI.getGitStashList?.(repoPath);
                if (listResult?.success) {
                    setStashList(listResult.stashes || []);
                    setSelectedStash(null);
                }
                loadCommits(true);
            } else {
                toast({
                    title: "Error al aplicar stash",
                    description: result?.error || "No se pudo aplicar el stash",
                    variant: "destructive",
                });
            }
        } catch (err: any) {
            console.error('Error al aplicar stash:', err);
            toast({
                title: "Error al aplicar stash",
                description: err?.message || "Ocurrió un error inesperado",
                variant: "destructive",
            });
        } finally {
            setApplyingStash(null);
        }
    };

    // Handler para eliminar un stash
    const handleStashDelete = async () => {
        if (!stashToDelete) return;

        const repoPath = `${configPath}/repositories/${repository.idConexion || 'unknown'}/${repository.organizacion ? `${repository.organizacion}/` : ""}${repository.nombreGit || repository.nombre}`;
        setDeletingStash(true);
        try {
            const result = await (window as any).electronAPI.gitStashDrop?.(repoPath, stashToDelete.ref);
            if (result?.success) {
                toast({
                    title: "Stash eliminado",
                    description: "El stash ha sido eliminado exitosamente",
                    variant: "success",
                });
                // Recargar la lista de stashes
                const listResult = await (window as any).electronAPI.getGitStashList?.(repoPath);
                if (listResult?.success) {
                    setStashList(listResult.stashes || []);
                    if (selectedStash === stashToDelete.ref) {
                        setSelectedStash(null);
                    }
                }
                setStashToDelete(null);
            } else {
                toast({
                    title: "Error al eliminar stash",
                    description: result?.error || "No se pudo eliminar el stash",
                    variant: "destructive",
                });
            }
        } catch (err: any) {
            console.error('Error al eliminar stash:', err);
            toast({
                title: "Error al eliminar stash",
                description: err?.message || "Ocurrió un error inesperado",
                variant: "destructive",
            });
        } finally {
            setDeletingStash(false);
        }
    };

    // Handler para limpiar todos los stashes
    const handleClearAllStashes = async () => {
        const repoPath = `${configPath}/repositories/${repository.idConexion || 'unknown'}/${repository.organizacion ? `${repository.organizacion}/` : ""}${repository.nombreGit || repository.nombre}`;
        setClearingAllStashes(true);
        try {
            const result = await (window as any).electronAPI.gitStashClear?.(repoPath);
            if (result?.success) {
                toast({
                    title: "Stashes eliminados",
                    description: "Todos los stashes han sido eliminados exitosamente",
                    variant: "success",
                });
                // Recargar la lista de stashes (debería estar vacía)
                const listResult = await (window as any).electronAPI.getGitStashList?.(repoPath);
                if (listResult?.success) {
                    setStashList(listResult.stashes || []);
                    setSelectedStash(null);
                }
                setShowClearAllConfirm(false);
            } else {
                toast({
                    title: "Error al limpiar stashes",
                    description: result?.error || "No se pudieron eliminar los stashes",
                    variant: "destructive",
                });
            }
        } catch (err: any) {
            console.error('Error al limpiar stashes:', err);
            toast({
                title: "Error al limpiar stashes",
                description: err?.message || "Ocurrió un error inesperado",
                variant: "destructive",
            });
        } finally {
            setClearingAllStashes(false);
        }
    };

    // Handler para ejecutar stash desde el modal
    const handleStash = async () => {
        const repoPath = `${configPath}/repositories/${repository.idConexion || 'unknown'}/${repository.organizacion ? `${repository.organizacion}/` : ""}${repository.nombreGit || repository.nombre}`;
        setStashing(true);
        try {
            console.log('Enviando stash con mensaje:', stashMessage, 'includeUntracked:', stashIncludeUntracked);
            const result = await (window as any).electronAPI.gitStash?.(repoPath, stashIncludeUntracked, stashMessage || '');
            if (result?.success) {
                toast({
                    title: "Stash completado",
                    description: stashIncludeUntracked 
                        ? "Los cambios y archivos sin trackear han sido guardados en el stash"
                        : "Los cambios han sido guardados en el stash",
                    variant: "success",
                });
                setShowStashModal(false);
                setStashMessage('');
                loadCommits(true);
            } else {
                toast({
                    title: "Error al hacer stash",
                    description: result?.error || "No se pudo completar la operación",
                    variant: "destructive",
                });
            }
        } catch (err: any) {
            console.error('Error al hacer stash:', err);
            toast({
                title: "Error al hacer stash",
                description: err?.message || "Ocurrió un error inesperado",
                variant: "destructive",
            });
        } finally {
            setStashing(false);
        }
    };

    const handleCreateBranch = async () => {
        if (!newBranchName.trim()) return;
        
        setCreatingBranch(true);
        const repoPath = `${configPath}/repositories/${repository.idConexion || 'unknown'}/${repository.organizacion ? `${repository.organizacion}/` : ""}${repository.nombreGit || repository.nombre}`;
        
        try {
            const result = await (window as any).electronAPI.gitCreateBranch?.(repoPath, newBranchName.trim(), newBranchFrom);
            if (result?.success) {
                setShowNewBranchModal(false);
                setNewBranchName("");
                setNewBranchFrom("");
                setIsCreatingFromRemote(false);
                loadBranches();
                loadCommits(true);
            } else {
                alert(result?.error || 'Error al crear el branch');
            }
        } catch (err) {
            console.error('Error al crear branch:', err);
            alert('Error al crear el branch');
        } finally {
            setCreatingBranch(false);
        }
    };

    const handleRevert = async () => {
        if (!selectedCommit?.hash) return;
        
        setReverting(true);
        const repoPath = `${configPath}/repositories/${repository.idConexion || 'unknown'}/${repository.organizacion ? `${repository.organizacion}/` : ""}${repository.nombreGit || repository.nombre}`;
        
        try {
            const result = await (window as any).electronAPI.gitRevert?.(repoPath, selectedCommit.hash);
            if (result?.success) {
                toast({
                    title: "Revert completado",
                    description: "El commit ha sido revertido exitosamente",
                    variant: "success",
                });
                setShowRevertModal(false);
                loadCommits(true);
                loadBranches();
            } else {
                toast({
                    title: "Error al hacer revert",
                    description: result?.error || "No se pudo completar la operación",
                    variant: "destructive",
                });
            }
        } catch (err: any) {
            console.error('Error al hacer revert:', err);
            toast({
                title: "Error al hacer revert",
                description: err?.message || "Ocurrió un error inesperado",
                variant: "destructive",
            });
        } finally {
            setReverting(false);
        }
    };

    const handleCherryPick = async () => {
        if (!selectedCommit?.hash) return;
        
        setCherryPicking(true);
        const repoPath = `${configPath}/repositories/${repository.idConexion || 'unknown'}/${repository.organizacion ? `${repository.organizacion}/` : ""}${repository.nombreGit || repository.nombre}`;
        
        try {
            const result = await (window as any).electronAPI.gitCherryPick?.(repoPath, selectedCommit.hash, cherryPickCommitChanges, cherryPickAppendOrigin);
            if (result?.success) {
                toast({
                    title: "Cherry-pick completado",
                    description: cherryPickCommitChanges 
                        ? "El commit ha sido aplicado y commiteado exitosamente"
                        : "El commit ha sido aplicado (sin commit)",
                    variant: "success",
                });
                setShowCherryPickModal(false);
                setCherryPickCommitChanges(true);
                setCherryPickAppendOrigin(false);
                loadCommits(true);
                loadBranches();
            } else {
                const errorMessage = result?.error || "";
                // Detectar si hay conflictos
                if (errorMessage.includes("conflict") || errorMessage.includes("CONFLICT") || errorMessage.includes("could not apply")) {
                    // Cerrar el modal
                    setShowCherryPickModal(false);
                    setCherryPickCommitChanges(true);
                    setCherryPickAppendOrigin(false);
                    // Mostrar toaster informando sobre conflictos
                    toast({
                        title: "Cherry-pick con conflictos",
                        description: "Hay conflictos que necesitan ser resueltos. Usa la barra de notificaciones para resolver o abortar la operación.",
                        variant: "destructive",
                    });
                    // Recargar para que aparezca la barra de notificaciones
                    loadCommits(true);
                    loadBranches();
                } else {
                    toast({
                        title: "Error al hacer cherry-pick",
                        description: errorMessage || "No se pudo completar la operación",
                        variant: "destructive",
                    });
                }
            }
        } catch (err: any) {
            console.error('Error al hacer cherry-pick:', err);
            const errorMessage = err?.message || "";
            // Detectar si hay conflictos en el error
            if (errorMessage.includes("conflict") || errorMessage.includes("CONFLICT") || errorMessage.includes("could not apply")) {
                // Cerrar el modal
                setShowCherryPickModal(false);
                setCherryPickCommitChanges(true);
                setCherryPickAppendOrigin(false);
                // Mostrar toaster informando sobre conflictos
                toast({
                    title: "Cherry-pick con conflictos",
                    description: "Hay conflictos que necesitan ser resueltos. Usa la barra de notificaciones para resolver o abortar la operación.",
                    variant: "destructive",
                });
                // Recargar para que aparezca la barra de notificaciones
                loadCommits(true);
                loadBranches();
            } else {
                toast({
                    title: "Error al hacer cherry-pick",
                    description: errorMessage || "Ocurrió un error inesperado",
                    variant: "destructive",
                });
            }
        } finally {
            setCherryPicking(false);
        }
    };

    const handleCreateTag = async () => {
        if (!tagName.trim() || !selectedCommit) return;
        
        setCreatingTag(true);
        const repoPath = `${configPath}/repositories/${repository.idConexion || 'unknown'}/${repository.organizacion ? `${repository.organizacion}/` : ""}${repository.nombreGit || repository.nombre}`;
        
        try {
            const result = await (window as any).electronAPI.gitCreateTag?.(repoPath, tagName.trim(), tagMessage.trim(), selectedCommit.hash, pushToAllRemotes);
            if (result?.success) {
                setShowNewTagModal(false);
                setTagName("");
                setTagMessage("");
                setPushToAllRemotes(false);
                loadCommits(true);
                toast({
                    title: "Tag creado exitosamente",
                    description: `El tag "${tagName.trim()}" ha sido creado${pushToAllRemotes ? ' y enviado a todos los remotes' : ''}`,
                });
            } else {
                toast({
                    title: "Error al crear tag",
                    description: result?.error || 'Error desconocido',
                    variant: "destructive",
                });
            }
        } catch (err: any) {
            console.error('Error al crear tag:', err);
            toast({
                title: "Error al crear tag",
                description: err.message || 'Error desconocido',
                variant: "destructive",
            });
        } finally {
            setCreatingTag(false);
        }
    };

    const extractConflictFiles = (errorMessage: string): string[] => {
        // Buscar archivos en el mensaje de error
        // Formato 1: "error: The following untracked working tree files would be overwritten by checkout:\nfile1.txt\nfile2.txt"
        // Formato 2: "error: Your local changes to the following files would be overwritten by checkout:\nfile1.txt\nfile2.txt"
        const lines = errorMessage.split('\n');
        const files: string[] = [];
        let foundHeader = false;
        
        for (const line of lines) {
            if (line.includes('untracked working tree files would be overwritten') || 
                line.includes('Your local changes to the following files would be overwritten')) {
                foundHeader = true;
                continue;
            }
            if (foundHeader && line.trim() && 
                !line.includes('Please move or remove') && 
                !line.includes('Please commit your changes') &&
                !line.includes('stash them before') &&
                !line.includes('Aborting')) {
                files.push(line.trim());
            }
        }
        
        return files;
    };

    const handleBranchSelect = async (branch: string, isRemote: boolean = false) => {
        const repoPath = `${configPath}/repositories/${repository.idConexion || 'unknown'}/${repository.organizacion ? `${repository.organizacion}/` : ""}${repository.nombreGit || repository.nombre}`;
        
        if (isRemote) {
            // Si es remoto, verificar si tiene un branch local correspondiente
            // Remover el prefijo "origin/" o similar para obtener el nombre del branch
            const branchName = branch.replace(/^[^/]+\//, '');
            const hasLocalBranch = branches.local.includes(branchName);
            
            if (!hasLocalBranch) {
                // No tiene branch local, abrir modal para crearlo
                setIsCreatingFromRemote(true);
                setNewBranchName(branchName);
                setNewBranchFrom(branch); // branch es el remoto completo (ej: "origin/main")
                setShowNewBranchModal(true);
                setBranchesOpen(false);
            } else {
                // Tiene branch local, hacer checkout
                try {
                    const result = await (window as any).electronAPI.gitCheckout?.(repoPath, branchName);
                    if (result?.success) {
                        loadBranches();
                        loadCommits(true);
                    } else {
                        const errorMessage = result?.error || '';
                        if (errorMessage.includes('untracked working tree files would be overwritten') ||
                            errorMessage.includes('Your local changes to the following files would be overwritten')) {
                            const files = extractConflictFiles(errorMessage);
                            setConflictFiles(files);
                            setPendingCheckoutBranch(branchName);
                            setPendingCheckoutRepoPath(repoPath);
                            setIsUntrackedConflict(errorMessage.includes('untracked working tree files'));
                            setShowCheckoutConflictModal(true);
                        } else {
                            toast({
                                title: "Error al hacer checkout",
                                description: errorMessage,
                                variant: "destructive",
                            });
                        }
                    }
                } catch (err: any) {
                    console.error('Error al hacer checkout:', err);
                    toast({
                        title: "Error al hacer checkout",
                        description: err?.message || "Ocurrió un error inesperado",
                        variant: "destructive",
                    });
                }
                setBranchesOpen(false);
            }
        } else {
            // Es un branch local, hacer checkout directamente
            try {
                const result = await (window as any).electronAPI.gitCheckout?.(repoPath, branch);
                if (result?.success) {
                    loadBranches();
                    loadCommits(true);
                } else {
                    const errorMessage = result?.error || '';
                    if (errorMessage.includes('untracked working tree files would be overwritten') ||
                        errorMessage.includes('Your local changes to the following files would be overwritten')) {
                        const files = extractConflictFiles(errorMessage);
                        setConflictFiles(files);
                        setPendingCheckoutBranch(branch);
                        setPendingCheckoutRepoPath(repoPath);
                        setIsUntrackedConflict(errorMessage.includes('untracked working tree files'));
                        setShowCheckoutConflictModal(true);
                    } else {
                        toast({
                            title: "Error al hacer checkout",
                            description: errorMessage,
                            variant: "destructive",
                        });
                    }
                }
            } catch (err: any) {
                console.error('Error al hacer checkout:', err);
                toast({
                    title: "Error al hacer checkout",
                    description: err?.message || "Ocurrió un error inesperado",
                    variant: "destructive",
                });
            }
            setBranchesOpen(false);
        }
    };

    const handleResolveCheckoutConflict = async (action: 'save' | 'stash' | 'discard') => {
        if (!pendingCheckoutRepoPath || !pendingCheckoutBranch || conflictFiles.length === 0) return;

        setResolvingConflict(true);
        try {
            if (action === 'save') {
                // Guardar archivos: agregar todos los archivos conflictivos al stage
                for (const file of conflictFiles) {
                    await (window as any).electronAPI.gitStage?.(pendingCheckoutRepoPath, file);
                }
                // Hacer commit de los archivos
                const commitMessage = `Guardar archivos antes de cambiar a ${pendingCheckoutBranch}`;
                const commitResult = await (window as any).electronAPI.gitCommit?.(pendingCheckoutRepoPath, commitMessage);
                if (!commitResult?.success) {
                    throw new Error(commitResult?.error || 'Error al hacer commit');
                }
            } else if (action === 'stash') {
                // Stash: esconder archivos temporalmente
                const stashResult = await (window as any).electronAPI.gitStash?.(pendingCheckoutRepoPath, true);
                if (!stashResult?.success) {
                    throw new Error(stashResult?.error || 'Error al hacer stash');
                }
            } else {
                // Discard: descartar cambios
                if (isUntrackedConflict) {
                    // Para archivos sin trackear: usar git clean
                    const cleanResult = await (window as any).electronAPI.gitClean?.(pendingCheckoutRepoPath, true);
                    if (!cleanResult?.success) {
                        throw new Error(cleanResult?.error || 'Error al descartar archivos');
                    }
                } else {
                    // Para archivos modificados: usar git reset --hard
                    const resetResult = await (window as any).electronAPI.gitResetHard?.(pendingCheckoutRepoPath);
                    if (!resetResult?.success) {
                        throw new Error(resetResult?.error || 'Error al descartar cambios');
                    }
                }
            }

            // Intentar checkout nuevamente
            const checkoutResult = await (window as any).electronAPI.gitCheckout?.(pendingCheckoutRepoPath, pendingCheckoutBranch);
            if (checkoutResult?.success) {
                loadBranches();
                loadCommits(true);
                toast({
                    title: "Cambio de rama exitoso",
                    description: `Cambiaste a la rama '${pendingCheckoutBranch}' exitosamente.`,
                    variant: "success",
                });
                setShowCheckoutConflictModal(false);
                setConflictFiles([]);
                setPendingCheckoutBranch(null);
                setPendingCheckoutRepoPath(null);
                setSelectedCheckoutOption('save');
                setIsUntrackedConflict(false);
            } else {
                throw new Error(checkoutResult?.error || 'Error al hacer checkout después de resolver el conflicto');
            }
        } catch (err: any) {
            console.error('Error al resolver conflicto:', err);
            toast({
                title: "Error al resolver conflicto",
                description: err?.message || "Ocurrió un error inesperado",
                variant: "destructive",
            });
        } finally {
            setResolvingConflict(false);
        }
    };

    // Cerrar dropdown al hacer click fuera
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (branchesDropdownRef.current && !branchesDropdownRef.current.contains(event.target as Node)) {
                setBranchesOpen(false);
            }
            if (newBranchMenuRef.current && !newBranchMenuRef.current.contains(event.target as Node)) {
                setNewBranchMenuOpen(false);
            }
        };
        if (branchesOpen || newBranchMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [branchesOpen, newBranchMenuOpen]);

    /**
     * Handle scroll to load more
     */
    const handleScroll = () => {
        if (scrollContainerRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
            // Load more when we are 100px from the bottom
            if (scrollHeight - scrollTop - clientHeight < 100 && hasMore && !loadingMore && !loading) {
                loadCommits(false);
            }
        }
    };

    const handleCommitClick = (commit: any) => {
        setSelectedCommit(commit);
    };

    return (
        <div className="h-full flex flex-col bg-white dark:bg-[#011627] text-slate-600 dark:text-slate-300">
            {/* Top Bar */}
            <div className="h-14 border-b border-slate-200 dark:border-slate-700/50 flex items-center px-4 justify-between bg-background shadow-sm z-10">
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <h2 className="font-bold text-lg text-slate-900 dark:text-white flex items-center justify-center gap-2 mb-0.5">
                            <GitBranch className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                            <span>{repository.nombre}</span>
                        </h2>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                            {repository.nombreGit || repository.nombre}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {onMinimize && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onMinimize}
                            className="text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800"
                            title="Minimizar"
                        >
                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
                            </svg>
                        </Button>
                    )}
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left Sidebar */}
                <div className="w-80 border-r border-slate-200 dark:border-slate-700/50 flex flex-col bg-slate-50 dark:bg-[#0b253a]/50">
                    <GitStatusPanel
                        repoPath={`${configPath}/repositories/${repository.idConexion || 'unknown'}/${repository.organizacion ? `${repository.organizacion}/` : ""}${repository.nombreGit || repository.nombre}`}
                        onRefreshGraph={() => loadCommits(true)}
                    />
                </div>

                {/* Center - Graph & Details */}
                <div className="flex-1 flex flex-col min-w-0 min-h-0">
                    {/* Toolbar - Restricted to Graph width */}
                    <div className="h-11 border-b border-slate-200 dark:border-slate-700/50 bg-slate-50/50 dark:bg-[#0b253a]/30 flex items-center px-4 justify-end gap-2">
                        {/* Dropdown de Branches y Botón Nuevo unificados */}
                        <div className="flex items-center">
                            <div className="relative" ref={branchesDropdownRef}>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        const wasOpen = branchesOpen;
                                        setBranchesOpen(!wasOpen);
                                        if (!wasOpen) {
                                            // Hacer fetch antes de cargar branches para actualizar remotos
                                            loadBranches(true);
                                        }
                                    }}
                                    className="h-7 px-2.5 text-[10px] font-semibold text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-400 dark:hover:border-slate-500 flex items-center gap-1.5 shadow-sm rounded-r-none border-r-0"
                                >
                                    <GitBranch className="h-3.5 w-3.5" />
                                    <span className="max-w-[100px] truncate">
                                        {branches.current || (branches.headHash ? branches.headHash.substring(0, 7) : 'Branch')}
                                    </span>
                                    <ChevronDown className="h-3 w-3" />
                                </Button>
                            {branchesOpen && (
                                <div className="absolute top-full left-0 mt-1 w-64 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md shadow-lg z-50 max-h-96 overflow-auto">
                                    {/* Commit Seleccionado */}
                                    {selectedCommit && (
                                        <div className="p-2 border-b border-slate-200 dark:border-slate-700">
                                            <div className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase px-2 py-1">Commit seleccionado</div>
                                            <button
                                                onClick={async () => {
                                                    const repoPath = `${configPath}/repositories/${repository.idConexion || 'unknown'}/${repository.organizacion ? `${repository.organizacion}/` : ""}${repository.nombreGit || repository.nombre}`;
                                                    try {
                                                        const result = await (window as any).electronAPI.gitCheckout?.(repoPath, selectedCommit.hash);
                                                        if (result?.success) {
                                                            loadBranches();
                                                            loadCommits(true);
                                                            setBranchesOpen(false);
                                                            toast({
                                                                title: "Checkout completado",
                                                                description: `Cambiaste al commit ${selectedCommit.hash.substring(0, 7)}`,
                                                                variant: "success",
                                                            });
                                                        } else {
                                                            const errorMessage = result?.error || '';
                                                            if (errorMessage.includes('untracked working tree files would be overwritten') ||
                                                                errorMessage.includes('Your local changes to the following files would be overwritten')) {
                                                                const files = extractConflictFiles(errorMessage);
                                                                setConflictFiles(files);
                                                                setPendingCheckoutBranch(selectedCommit.hash);
                                                                setPendingCheckoutRepoPath(repoPath);
                                                                setIsUntrackedConflict(errorMessage.includes('untracked working tree files'));
                                                                setShowCheckoutConflictModal(true);
                                                            } else {
                                                                toast({
                                                                    title: "Error al hacer checkout",
                                                                    description: errorMessage,
                                                                    variant: "destructive",
                                                                });
                                                            }
                                                        }
                                                    } catch (err: any) {
                                                        console.error('Error al hacer checkout:', err);
                                                        toast({
                                                            title: "Error al hacer checkout",
                                                            description: err?.message || "Ocurrió un error inesperado",
                                                            variant: "destructive",
                                                        });
                                                    }
                                                }}
                                                className={cn(
                                                    "w-full text-left px-3 py-1.5 text-xs rounded-sm hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2",
                                                    branches.headHash === selectedCommit.hash && "bg-cyan-50 dark:bg-cyan-950/30 text-cyan-600 dark:text-cyan-400 font-medium"
                                                )}
                                            >
                                                <GitBranch className="h-3 w-3" />
                                                <span className="truncate">Checkout Hash... {selectedCommit.hash.substring(0, 7)}</span>
                                                {branches.headHash === selectedCommit.hash && (
                                                    <span className="ml-auto text-[10px] text-cyan-600 dark:text-cyan-400">●</span>
                                                )}
                                            </button>
                                        </div>
                                    )}
                                    {/* Branches Locales */}
                                    {branches.local.length > 0 && (
                                        <div className="p-2">
                                            <div className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase px-2 py-1">Locales</div>
                                            {branches.local.map((branch) => (
                                                <button
                                                    key={branch}
                                                    onClick={() => handleBranchSelect(branch, false)}
                                                    className={cn(
                                                        "w-full text-left px-3 py-1.5 text-xs rounded-sm hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2",
                                                        branch === branches.current && "bg-cyan-50 dark:bg-cyan-950/30 text-cyan-600 dark:text-cyan-400 font-medium"
                                                    )}
                                                >
                                                    <GitBranch className="h-3 w-3" />
                                                    <span className="truncate">{branch}</span>
                                                    {branch === branches.current && (
                                                        <span className="ml-auto text-[10px] text-cyan-600 dark:text-cyan-400">●</span>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                    {/* Branches Remotos */}
                                    {branches.remote.length > 0 && (
                                        <div className="p-2 border-t border-slate-200 dark:border-slate-700">
                                            <div className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase px-2 py-1">Remotos</div>
                                            {branches.remote.map((branch) => (
                                                <button
                                                    key={branch}
                                                    onClick={() => handleBranchSelect(branch, true)}
                                                    className="w-full text-left px-3 py-1.5 text-xs rounded-sm hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2 text-slate-600 dark:text-slate-400"
                                                >
                                                    <GitBranch className="h-3 w-3" />
                                                    <span className="truncate">{branch}</span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                    {branches.local.length === 0 && branches.remote.length === 0 && !selectedCommit && (
                                        <div className="p-4 text-center text-xs text-slate-500 dark:text-slate-400">
                                            No hay branches disponibles
                                        </div>
                                    )}
                                </div>
                                )}
                            </div>
                            {/* Botón de acciones con menú desplegable */}
                            <div className="relative" ref={newBranchMenuRef}>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        setNewBranchMenuOpen(!newBranchMenuOpen);
                                    }}
                                    className="h-7 w-7 p-0 text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-400 dark:hover:border-slate-500 shadow-sm rounded-l-none"
                                    title="Nuevo"
                                >
                                    <Plus className="h-4 w-4" />
                                </Button>
                            {newBranchMenuOpen && (
                                <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md shadow-lg z-50">
                                    <button
                                        onClick={() => {
                                            setNewBranchMenuOpen(false);
                                            setIsCreatingFromRemote(false);
                                            setShowNewBranchModal(true);
                                        }}
                                        className="w-full text-left px-3 py-2 text-xs rounded-sm hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2 text-slate-600 dark:text-slate-400"
                                    >
                                        <GitBranch className="h-3.5 w-3.5" />
                                        <span>Nuevo Branch</span>
                                    </button>
                                    <button
                                        onClick={() => {
                                            setNewBranchMenuOpen(false);
                                            setShowNewTagModal(true);
                                        }}
                                        disabled={!selectedCommit}
                                        className={cn(
                                            "w-full text-left px-3 py-2 text-xs rounded-sm hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2",
                                            selectedCommit 
                                                ? "text-slate-600 dark:text-slate-400" 
                                                : "text-slate-400 dark:text-slate-600 cursor-not-allowed opacity-50"
                                        )}
                                    >
                                        <Tag className="h-3.5 w-3.5" />
                                        <span>Nuevo Tag</span>
                                    </button>
                                </div>
                            )}
                        </div>
                        </div>
                        {/* Separador */}
                        <div className="h-5 w-px bg-slate-300 dark:bg-slate-600"></div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={async () => {
                                const repoPath = `${configPath}/repositories/${repository.idConexion || 'unknown'}/${repository.organizacion ? `${repository.organizacion}/` : ""}${repository.nombreGit || repository.nombre}`;
                                setFetching(true);
                                try {
                                    const result = await (window as any).electronAPI.gitFetch?.(repoPath);
                                    if (result?.success) {
                                        loadCommits(true);
                                        loadBranches();
                                        loadSyncInfo();
                                    } else {
                                        toast({
                                            title: "Error al hacer fetch",
                                            description: result?.error || "No se pudo completar la operación",
                                            variant: "destructive",
                                        });
                                    }
                                } catch (err: any) {
                                    console.error('Error al hacer fetch:', err);
                                    toast({
                                        title: "Error al hacer fetch",
                                        description: err?.message || "Ocurrió un error inesperado",
                                        variant: "destructive",
                                    });
                                } finally {
                                    setFetching(false);
                                }
                            }}
                            disabled={fetching}
                            className="h-7 px-2.5 text-[10px] font-semibold text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-400 dark:hover:border-slate-500 flex items-center gap-1.5 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <svg 
                                className={cn("h-3.5 w-3.5 transition-all", fetching && "animate-bounce")} 
                                viewBox="0 0 24 24" 
                                fill="currentColor"
                            >
                                <path d="m18.707 12.707-1.414-1.414L13 15.586V6h-2v9.586l-4.293-4.293-1.414 1.414L12 19.414z"/>
                            </svg>
                            <span>{fetching ? 'Fetching...' : 'Fetch'}</span>
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={async () => {
                                const repoPath = `${configPath}/repositories/${repository.idConexion || 'unknown'}/${repository.organizacion ? `${repository.organizacion}/` : ""}${repository.nombreGit || repository.nombre}`;
                                setPulling(true);
                                try {
                                    const result = await (window as any).electronAPI.gitPull?.(repoPath);
                                    if (result?.success) {
                                        loadCommits(true);
                                        loadBranches();
                                        // Hacer fetch y luego actualizar syncInfo con un pequeño delay
                                        await (window as any).electronAPI.gitFetch?.(repoPath).catch(() => {});
                                        setTimeout(() => {
                                            loadSyncInfo();
                                        }, 500);
                                    } else {
                                        // Verificar si es el error de branches divergentes
                                        const errorMessage = result?.error || "";
                                        if (errorMessage.includes("divergent branches") || errorMessage.includes("Need to specify how to reconcile")) {
                                            setPendingPullRepoPath(repoPath);
                                            setShowPullStrategyModal(true);
                                        } else {
                                            toast({
                                                title: "Error al hacer pull",
                                                description: errorMessage || "No se pudo completar la operación",
                                                variant: "destructive",
                                            });
                                        }
                                    }
                                } catch (err: any) {
                                    console.error('Error al hacer pull:', err);
                                    const errorMessage = err?.message || "";
                                    if (errorMessage.includes("divergent branches") || errorMessage.includes("Need to specify how to reconcile")) {
                                        setPendingPullRepoPath(repoPath);
                                        setShowPullStrategyModal(true);
                                    } else {
                                        toast({
                                            title: "Error al hacer pull",
                                            description: errorMessage || "Ocurrió un error inesperado",
                                            variant: "destructive",
                                        });
                                    }
                                } finally {
                                    setPulling(false);
                                }
                            }}
                            disabled={pulling}
                            className="h-7 px-2.5 text-[10px] font-semibold text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-400 dark:hover:border-slate-500 flex items-center gap-1.5 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {pulling ? (
                                <svg 
                                    className={cn("h-3.5 w-3.5 transition-all animate-bounce")} 
                                    viewBox="0 0 24 24" 
                                    fill="currentColor"
                                >
                                    <path d="m18.707 12.707-1.414-1.414L13 15.586V6h-2v9.586l-4.293-4.293-1.414 1.414L12 19.414z"/>
                                </svg>
                            ) : (
                                <Download className="h-3.5 w-3.5" />
                            )}
                            <span>{pulling ? 'Pulling...' : 'Pull'}</span>
                            {syncInfo.behind > 0 && !pulling && (
                                <span className="h-4 px-1.5 rounded-sm bg-transparent border border-purple-500 dark:border-purple-400 text-purple-600 dark:text-purple-400 text-[8px] font-bold flex items-center justify-center">
                                    {syncInfo.behind > 9 ? '9+' : syncInfo.behind}
                                </span>
                            )}
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={async () => {
                                const repoPath = `${configPath}/repositories/${repository.idConexion || 'unknown'}/${repository.organizacion ? `${repository.organizacion}/` : ""}${repository.nombreGit || repository.nombre}`;
                                setPushing(true);
                                try {
                                    const result = await (window as any).electronAPI.gitPush?.(repoPath);
                                    if (result?.success) {
                                        loadCommits(true);
                                        loadBranches();
                                        // Hacer fetch y luego actualizar syncInfo con un pequeño delay
                                        await (window as any).electronAPI.gitFetch?.(repoPath).catch(() => {});
                                        setTimeout(() => {
                                            loadSyncInfo();
                                        }, 500);
                                    } else {
                                        // Verificar si es el error de non-fast-forward o behind
                                        const errorMessage = result?.error || "";
                                        if (errorMessage.includes("non-fast-forward") || errorMessage.includes("behind") || errorMessage.includes("Updates were rejected")) {
                                            setPendingPullRepoPath(repoPath);
                                            setPendingPushAfterPull(true);
                                            setShowPullStrategyModal(true);
                                        } else {
                                            toast({
                                                title: "Error al hacer push",
                                                description: errorMessage || "No se pudo completar la operación",
                                                variant: "destructive",
                                            });
                                        }
                                    }
                                } catch (err: any) {
                                    console.error('Error al hacer push:', err);
                                    const errorMessage = err?.message || "";
                                    if (errorMessage.includes("non-fast-forward") || errorMessage.includes("behind") || errorMessage.includes("Updates were rejected")) {
                                        setPendingPullRepoPath(repoPath);
                                        setPendingPushAfterPull(true);
                                        setShowPullStrategyModal(true);
                                    } else {
                                        toast({
                                            title: "Error al hacer push",
                                            description: errorMessage || "Ocurrió un error inesperado",
                                            variant: "destructive",
                                        });
                                    }
                                } finally {
                                    setPushing(false);
                                }
                            }}
                            disabled={pushing}
                            className="h-7 px-2.5 text-[10px] font-semibold text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-400 dark:hover:border-slate-500 flex items-center gap-1.5 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {pushing ? (
                                <svg 
                                    className={cn("h-3.5 w-3.5 transition-all animate-bounce")} 
                                    viewBox="0 0 24 24" 
                                    fill="currentColor"
                                >
                                    <path d="m5.293 11.293 1.414 1.414L11 6.414V18h2V6.414l4.293 4.293 1.414-1.414L12 4.586z"/>
                                </svg>
                            ) : (
                                <Upload className="h-3.5 w-3.5" />
                            )}
                            <span>{pushing ? 'Pushing...' : 'Push'}</span>
                            {syncInfo.ahead > 0 && !pushing && (
                                <span className="h-4 px-1.5 rounded-sm bg-transparent border border-green-500 dark:border-green-400 text-green-600 dark:text-green-400 text-[8px] font-bold flex items-center justify-center">
                                    {syncInfo.ahead > 9 ? '9+' : syncInfo.ahead}
                                </span>
                            )}
                        </Button>
                        {/* Separador */}
                        <div className="h-5 w-px bg-slate-300 dark:bg-slate-600"></div>
                        {/* Botón de Stash dividido: acción principal + menú desplegable */}
                        <div className="relative flex items-center" ref={stashMenuRef}>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    setStashMessage('');
                                    setStashIncludeUntracked(true);
                                    setShowStashModal(true);
                                }}
                                className="h-7 px-2.5 text-[10px] font-semibold text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-400 dark:hover:border-slate-500 flex items-center gap-1.5 shadow-sm rounded-r-none"
                                title="Stash"
                            >
                                <svg
                                    className="h-3.5 w-3.5"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        fillRule="evenodd"
                                        clipRule="evenodd"
                                        d="M3.95526 2.25C3.97013 2.25001 3.98505 2.25001 4.00001 2.25001L20.0448 2.25C20.4776 2.24995 20.8744 2.24991 21.1972 2.29331C21.5527 2.3411 21.9284 2.45355 22.2374 2.76257C22.5465 3.07159 22.6589 3.44732 22.7067 3.8028C22.7501 4.12561 22.7501 4.52245 22.75 4.95526V5.04475C22.7501 5.47757 22.7501 5.8744 22.7067 6.19721C22.6589 6.55269 22.5465 6.92842 22.2374 7.23744C21.9437 7.53121 21.5896 7.64733 21.25 7.69914V13.0564C21.25 14.8942 21.25 16.3498 21.0969 17.489C20.9392 18.6615 20.6071 19.6104 19.8588 20.3588C19.1104 21.1071 18.1615 21.4392 16.989 21.5969C15.8498 21.75 14.3942 21.75 12.5564 21.75H11.4436C9.60583 21.75 8.1502 21.75 7.01098 21.5969C5.83856 21.4392 4.88961 21.1071 4.14125 20.3588C3.39289 19.6104 3.06077 18.6615 2.90314 17.489C2.74998 16.3498 2.74999 14.8942 2.75001 13.0564L2.75001 7.69914C2.41038 7.64733 2.05634 7.53121 1.76257 7.23744C1.45355 6.92842 1.3411 6.55269 1.29331 6.19721C1.24991 5.8744 1.24995 5.47757 1.25 5.04476C1.25001 5.02988 1.25001 5.01496 1.25001 5.00001C1.25001 4.98505 1.25001 4.97013 1.25 4.95526C1.24995 4.52244 1.24991 4.12561 1.29331 3.8028C1.3411 3.44732 1.45355 3.07159 1.76257 2.76257C2.07159 2.45355 2.44732 2.3411 2.8028 2.29331C3.12561 2.24991 3.52244 2.24995 3.95526 2.25ZM4.25001 7.75001V13C4.25001 14.9068 4.2516 16.2615 4.38977 17.2892C4.52503 18.2952 4.7787 18.8749 5.20191 19.2981C5.62512 19.7213 6.20477 19.975 7.21086 20.1102C8.23852 20.2484 9.59319 20.25 11.5 20.25H12.5C14.4068 20.25 15.7615 20.2484 16.7892 20.1102C17.7952 19.975 18.3749 19.7213 18.7981 19.2981C19.2213 18.8749 19.475 18.2952 19.6102 17.2892C19.7484 16.2615 19.75 14.9068 19.75 13V7.75001H4.25001ZM2.82324 3.82324L2.82568 3.82187C2.82761 3.82086 2.83093 3.81924 2.83597 3.81717C2.85775 3.80821 2.90611 3.79291 3.00267 3.77993C3.21339 3.7516 3.5074 3.75001 4.00001 3.75001H20C20.4926 3.75001 20.7866 3.7516 20.9973 3.77993C21.0939 3.79291 21.1423 3.80821 21.164 3.81717C21.1691 3.81924 21.1724 3.82086 21.1743 3.82187L21.1768 3.82323L21.1781 3.82568C21.1792 3.82761 21.1808 3.83093 21.1828 3.83597C21.1918 3.85775 21.2071 3.90611 21.2201 4.00267C21.2484 4.21339 21.25 4.5074 21.25 5.00001C21.25 5.49261 21.2484 5.78662 21.2201 5.99734C21.2071 6.0939 21.1918 6.14226 21.1828 6.16404C21.1808 6.16909 21.1792 6.1724 21.1781 6.17434L21.1768 6.17678L21.1743 6.17815C21.1724 6.17916 21.1691 6.18077 21.164 6.18285C21.1423 6.19181 21.0939 6.2071 20.9973 6.22008C20.7866 6.24841 20.4926 6.25001 20 6.25001H4.00001C3.5074 6.25001 3.21339 6.24841 3.00267 6.22008C2.90611 6.2071 2.85775 6.19181 2.83597 6.18285C2.83093 6.18077 2.82761 6.17916 2.82568 6.17815L2.82324 6.17677L2.82187 6.17434C2.82086 6.1724 2.81924 6.16909 2.81717 6.16404C2.80821 6.14226 2.79291 6.0939 2.77993 5.99734C2.7516 5.78662 2.75001 5.49261 2.75001 5.00001C2.75001 4.5074 2.7516 4.21339 2.77993 4.00267C2.79291 3.90611 2.80821 3.85775 2.81717 3.83597C2.81924 3.83093 2.82086 3.82761 2.82187 3.82568L2.82324 3.82324ZM2.82324 6.17677C2.82284 6.17636 2.82297 6.17644 2.82324 6.17677V6.17677ZM10.4782 9.75001H13.5218C13.736 9.74999 13.9329 9.74998 14.0982 9.76126C14.2759 9.77338 14.4712 9.80099 14.6697 9.88322C15.0985 10.0608 15.4392 10.4015 15.6168 10.8303C15.699 11.0288 15.7266 11.2242 15.7388 11.4018C15.75 11.5671 15.75 11.764 15.75 11.9782V12.0218C15.75 12.236 15.75 12.4329 15.7388 12.5982C15.7266 12.7759 15.699 12.9712 15.6168 13.1697C15.4392 13.5985 15.0985 13.9392 14.6697 14.1168C14.4712 14.199 14.2759 14.2266 14.0982 14.2388C13.9329 14.25 13.736 14.25 13.5218 14.25H10.4782C10.264 14.25 10.0671 14.25 9.9018 14.2388C9.72416 14.2266 9.52881 14.199 9.33031 14.1168C8.90151 13.9392 8.56083 13.5985 8.38322 13.1697C8.30099 12.9712 8.27338 12.7759 8.26126 12.5982C8.24998 12.4329 8.24999 12.236 8.25001 12.0218V11.9782C8.24999 11.764 8.24998 11.5671 8.26126 11.4018C8.27338 11.2242 8.30099 11.0288 8.38322 10.8303C8.56083 10.4015 8.90151 10.0608 9.33031 9.88322C9.52881 9.80099 9.72416 9.77338 9.9018 9.76126C10.0671 9.74998 10.264 9.74999 10.4782 9.75001ZM9.90131 11.2703C9.84248 11.2956 9.79559 11.3425 9.77031 11.4013C9.76844 11.4087 9.76234 11.4371 9.75778 11.5039C9.75041 11.6119 9.75001 11.7568 9.75001 12C9.75001 12.2432 9.75041 12.3881 9.75778 12.4961C9.76234 12.5629 9.76844 12.5913 9.77031 12.5987C9.79559 12.6575 9.84248 12.7044 9.90131 12.7297C9.90867 12.7316 9.93707 12.7377 10.0039 12.7422C10.1119 12.7496 10.2568 12.75 10.5 12.75H13.5C13.7432 12.75 13.8881 12.7496 13.9961 12.7422C14.0629 12.7377 14.0913 12.7316 14.0987 12.7297C14.1575 12.7044 14.2044 12.6575 14.2297 12.5987C14.2316 12.5913 14.2377 12.5629 14.2422 12.4961C14.2496 12.3881 14.25 12.2432 14.25 12C14.25 11.7568 14.2496 11.6119 14.2422 11.5039C14.2377 11.4371 14.2316 11.4087 14.2297 11.4013C14.2044 11.3425 14.1575 11.2956 14.0987 11.2703C14.0913 11.2684 14.0629 11.2623 13.9961 11.2578C13.8881 11.2504 13.7432 11.25 13.5 11.25H10.5C10.2568 11.25 10.1119 11.2504 10.0039 11.2578C9.93707 11.2623 9.90866 11.2684 9.90131 11.2703Z"
                                        fill="currentColor"
                                    />
                                </svg>
                                <span>Stash</span>
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setStashMenuOpen(!stashMenuOpen);
                                }}
                                className="h-7 w-6 p-0 text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-400 dark:hover:border-slate-500 shadow-sm rounded-l-none border-l-0"
                                title="Más opciones de stash"
                            >
                                <ChevronDown className="h-3 w-3" />
                            </Button>
                            {stashMenuOpen && (
                                <div className="absolute top-full right-0 mt-1 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md shadow-lg z-50">
                                    <button
                                        onClick={async () => {
                                            setStashMenuOpen(false);
                                            const repoPath = `${configPath}/repositories/${repository.idConexion || 'unknown'}/${repository.organizacion ? `${repository.organizacion}/` : ""}${repository.nombreGit || repository.nombre}`;
                                            setLoadingStashList(true);
                                            setShowStashListModal(true);
                                            try {
                                                const result = await (window as any).electronAPI.getGitStashList?.(repoPath);
                                                if (result?.success) {
                                                    setStashList(result.stashes || []);
                                                } else {
                                                    toast({
                                                        title: "Error al obtener stashes",
                                                        description: result?.error || "No se pudo obtener la lista de stashes",
                                                        variant: "destructive",
                                                    });
                                                    setShowStashListModal(false);
                                                }
                                            } catch (err: any) {
                                                console.error('Error al obtener stashes:', err);
                                                toast({
                                                    title: "Error al obtener stashes",
                                                    description: err?.message || "Ocurrió un error inesperado",
                                                    variant: "destructive",
                                                });
                                                setShowStashListModal(false);
                                            } finally {
                                                setLoadingStashList(false);
                                            }
                                        }}
                                        className="w-full text-left px-3 py-2 text-xs rounded-sm hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2 text-slate-600 dark:text-slate-400"
                                    >
                                        <svg
                                            className="h-3.5 w-3.5"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path
                                                d="M4 6h16M4 12h16M4 18h16"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                            />
                                        </svg>
                                        <span>Stash List</span>
                                    </button>
                                </div>
                            )}
                        </div>
                        {/* Botón de Acciones con menú desplegable */}
                        <div className="relative" ref={cherryPickMenuRef}>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    setCherryPickMenuOpen(!cherryPickMenuOpen);
                                }}
                                className="h-7 px-2.5 text-[10px] font-semibold text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-400 dark:hover:border-slate-500 shadow-sm flex items-center gap-1.5"
                                title="Acciones"
                            >
                                <svg 
                                    className="h-3.5 w-3.5" 
                                    viewBox="0 -0.5 25 25" 
                                    fill="none" 
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path 
                                        fillRule="evenodd" 
                                        clipRule="evenodd" 
                                        d="M10.759 5L7.5 11.222H10.759L8.315 19L18.5 11.222H14.019L16.463 5H10.759Z" 
                                        stroke="currentColor" 
                                        strokeWidth="1.5" 
                                        strokeLinecap="round" 
                                        strokeLinejoin="round"
                                    />
                                </svg>
                                <span>Acciones</span>
                            </Button>
                            {cherryPickMenuOpen && (
                                <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md shadow-lg z-50">
                                    <button
                                        onClick={() => {
                                            setCherryPickMenuOpen(false);
                                            if (selectedCommit) {
                                                setShowRevertModal(true);
                                            }
                                        }}
                                        disabled={!selectedCommit}
                                        className={cn(
                                            "w-full text-left px-3 py-2 text-xs rounded-sm flex items-center gap-2",
                                            selectedCommit
                                                ? "hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400"
                                                : "text-slate-400 dark:text-slate-600 cursor-not-allowed opacity-50"
                                        )}
                                    >
                                        <Undo2 className="h-3.5 w-3.5" />
                                        <span>Revert commit</span>
                                    </button>
                                    <button
                                        onClick={() => {
                                            setCherryPickMenuOpen(false);
                                            if (canCherryPick && selectedCommit) {
                                                setShowCherryPickModal(true);
                                            }
                                        }}
                                        disabled={!canCherryPick}
                                        className={cn(
                                            "w-full text-left px-3 py-2 text-xs rounded-sm flex items-center gap-2",
                                            canCherryPick
                                                ? "hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400"
                                                : "text-slate-400 dark:text-slate-600 cursor-not-allowed opacity-50"
                                        )}
                                    >
                                        <GitBranch className="h-3.5 w-3.5" />
                                        <span>Cherry-pick</span>
                                    </button>
                                </div>
                            )}
                        </div>
                        <div className="h-5 w-px bg-slate-300 dark:bg-slate-600"></div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => loadCommits(true)}
                            className="h-7 w-7 p-0 text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-400 dark:hover:border-slate-500 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={loading}
                            title="Refrescar"
                        >
                            <RotateCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                        </Button>
                        <div className="relative flex-1 max-w-md group ml-auto">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-cyan-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Buscar commits (mensaje, autor, hash)..."
                                className={cn(
                                    "w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md py-1.5 pl-9 text-xs outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all shadow-sm",
                                    searchTerm ? "pr-28" : "pr-24"
                                )}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm("")}
                                    className="absolute right-20 top-1/2 -translate-y-1/2 text-[10px] font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-700/50 hover:bg-slate-200 dark:hover:bg-slate-600/50 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-600 transition-colors z-10"
                                >
                                    Limpiar
                                </button>
                            )}
                            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 dark:text-slate-500 font-medium pointer-events-none">
                                {commits.length} commits
                        </div>
                        </div>
                    </div>

                    {/* Barra de Notificaciones para Operaciones Pendientes */}
                    {pendingOperation && (
                        <div className="px-4 py-2.5 border-b border-slate-200 dark:border-slate-700/50 bg-amber-50 dark:bg-amber-950/20 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-semibold text-amber-900 dark:text-amber-200">
                                        {pendingOperation.operation === 'cherry-pick' && `Cherry-pick pendiente${pendingOperation.commitHash ? ` (${pendingOperation.commitHash})` : ''}`}
                                        {pendingOperation.operation === 'merge' && `Merge pendiente${pendingOperation.commitHash ? ` (${pendingOperation.commitHash})` : ''}`}
                                        {pendingOperation.operation === 'rebase' && 'Rebase pendiente'}
                                    </p>
                                    <p className="text-[10px] text-amber-700 dark:text-amber-300 mt-0.5">
                                        {pendingOperation.operation === 'cherry-pick' && 'Hay un cherry-pick en progreso. Resuelve los conflictos y continúa o aborta la operación.'}
                                        {pendingOperation.operation === 'merge' && 'Hay un merge en progreso. Resuelve los conflictos y continúa o aborta la operación.'}
                                        {pendingOperation.operation === 'rebase' && 'Hay un rebase en progreso. Resuelve los conflictos y continúa o aborta la operación.'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleContinuePendingOperation}
                                    disabled={resolvingPendingOperation}
                                    className="h-7 px-3 text-[10px] font-semibold text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-400 dark:hover:border-slate-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {resolvingPendingOperation ? (
                                        <>
                                            <RefreshCw className="h-3 w-3 animate-spin mr-1.5" />
                                            Resolviendo...
                                        </>
                                    ) : (
                                        'Resolver'
                                    )}
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleAbortPendingOperation}
                                    disabled={resolvingPendingOperation}
                                    className="h-7 px-3 text-[10px] font-semibold text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-400 dark:hover:border-slate-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {resolvingPendingOperation ? (
                                        <>
                                            <RefreshCw className="h-3 w-3 animate-spin mr-1.5" />
                                            Abortando...
                                        </>
                                    ) : (
                                        'Abortar'
                                    )}
                                </Button>
                            </div>
                        </div>
                    )}

                    <div
                        className="flex-1 overflow-auto bg-white dark:bg-[#011627] relative"
                        ref={scrollContainerRef}
                        onScroll={handleScroll}
                    >
                        {loading ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 dark:bg-[#011627]/90 backdrop-blur-sm z-10">
                                <div className="relative">
                                    {/* Círculo exterior pulsante */}
                                    <div className="absolute inset-0 rounded-full bg-cyan-500/20 animate-ping"></div>
                                    {/* Círculo base */}
                                    <div className="relative rounded-full h-16 w-16 border-4 border-slate-200 dark:border-slate-700"></div>
                                    {/* Arco animado principal */}
                                    <div className="absolute top-0 left-0 rounded-full h-16 w-16 border-4 border-transparent border-t-cyan-500 border-r-cyan-400 animate-spin"></div>
                                    {/* Arco secundario (más lento) */}
                                    <div className="absolute top-2 left-2 rounded-full h-12 w-12 border-2 border-transparent border-b-cyan-300 border-l-cyan-200 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
                                    {/* Punto central pulsante */}
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-3 w-3 rounded-full bg-cyan-500 animate-pulse"></div>
                                </div>
                                <p className="mt-6 text-sm text-slate-600 dark:text-slate-400 font-medium animate-pulse">Cargando commits...</p>
                            </div>
                        ) : error ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-red-400">
                                <p className="mb-2">Error cargando el historial</p>
                                <p className="text-sm text-slate-500">{error}</p>
                                <Button variant="outline" size="sm" onClick={() => loadCommits(true)} className="mt-4 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800">
                                    Reintentar
                                </Button>
                            </div>
                        ) : (
                            <>
                                <CommitGraph
                                    commits={commits}
                                    onCommitClick={handleCommitClick}
                                    selectedHash={selectedCommit?.hash}
                                />
                                {loadingMore && (
                                    <div className="flex flex-col items-center justify-center py-6 bg-white dark:bg-[#011627]">
                                        <div className="relative">
                                            {/* Círculo pulsante de fondo */}
                                            <div className="absolute inset-0 rounded-full bg-cyan-500/15 animate-ping"></div>
                                            {/* Círculo base */}
                                            <div className="relative rounded-full h-10 w-10 border-2 border-slate-200 dark:border-slate-700"></div>
                                            {/* Arco animado principal */}
                                            <div className="absolute top-0 left-0 rounded-full h-10 w-10 border-2 border-transparent border-t-cyan-500 border-r-cyan-400 animate-spin"></div>
                                            {/* Arco secundario */}
                                            <div className="absolute top-1 left-1 rounded-full h-8 w-8 border-2 border-transparent border-b-cyan-300 border-l-cyan-200 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.2s' }}></div>
                                        </div>
                                        <p className="mt-4 text-xs text-slate-500 dark:text-slate-400 animate-pulse">Cargando más commits...</p>
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* Details Panel */}
                    {selectedCommit && (
                        <div className="h-[40%] flex-shrink-0 border-t border-slate-200 dark:border-slate-700 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] dark:shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.3)] z-20">
                            <CommitDetails
                                commit={selectedCommit}
                                repoPath={`${configPath}/repositories/${repository.idConexion || 'unknown'}/${repository.organizacion ? repository.organizacion + '/' : ''}${repository.nombreGit || repository.nombre}`}
                                onClose={() => setSelectedCommit(null)}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Modal para crear nuevo branch */}
            {showNewBranchModal && (
                <div
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
                    onClick={() => {
                        if (!creatingBranch) {
                            setShowNewBranchModal(false);
                            setNewBranchName("");
                            setIsCreatingFromRemote(false);
                        }
                    }}
                >
                    <Card className="w-full max-w-md mx-4 bg-background border-2" onClick={(e) => e.stopPropagation()}>
                        <CardHeader className="p-4">
                            <CardTitle className="text-lg">Nuevo Branch</CardTitle>
                            <CardDescription className="text-sm">
                                Crea un nuevo branch a partir de otro branch existente
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-4 pt-0 space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Nombre del nuevo branch</label>
                                <input
                                    type="text"
                                    value={newBranchName}
                                    onChange={(e) => setNewBranchName(e.target.value)}
                                    placeholder="nombre-del-branch"
                                    className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                                    disabled={creatingBranch}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && newBranchName.trim() && !creatingBranch) {
                                            handleCreateBranch();
                                        }
                                    }}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Crear a partir de</label>
                                <select
                                    value={newBranchFrom}
                                    onChange={(e) => setNewBranchFrom(e.target.value)}
                                    className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                                    disabled={creatingBranch}
                                >
                                    {branches.local.map((branch) => (
                                        <option key={branch} value={branch}>
                                            {branch} {branch === branches.current ? '(actual)' : ''}
                                        </option>
                                    ))}
                                    {branches.remote.length > 0 && (
                                        <>
                                            <optgroup label="Remotos">
                                                {branches.remote.map((branch) => (
                                                    <option key={branch} value={branch}>
                                                        {branch}
                                                    </option>
                                                ))}
                                            </optgroup>
                                        </>
                                    )}
                                </select>
                            </div>
                            <div className="flex gap-2 pt-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1"
                                    onClick={() => {
                                        setShowNewBranchModal(false);
                                        setNewBranchName("");
                                        setIsCreatingFromRemote(false);
                                    }}
                                    disabled={creatingBranch}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    size="sm"
                                    className="flex-1 bg-cyan-600 hover:bg-cyan-700"
                                    onClick={handleCreateBranch}
                                    disabled={!newBranchName.trim() || creatingBranch}
                                >
                                    {creatingBranch ? 'Creando...' : 'Crear Branch'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Modal para crear nuevo tag */}
            {showNewTagModal && (
                <div
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
                    onClick={() => {
                        if (!creatingTag) {
                            setShowNewTagModal(false);
                            setTagName("");
                            setTagMessage("");
                            setPushToAllRemotes(false);
                        }
                    }}
                >
                    <Card className="w-full max-w-md mx-4 bg-background border-2" onClick={(e) => e.stopPropagation()}>
                        <CardHeader className="p-4">
                            <CardTitle className="text-lg">Nuevo Tag</CardTitle>
                            <CardDescription className="text-sm">
                                Crea un nuevo tag en el commit seleccionado
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-4 pt-0 space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Nombre del tag</label>
                                <input
                                    type="text"
                                    value={tagName}
                                    onChange={(e) => setTagName(e.target.value)}
                                    placeholder="v1.0.0"
                                    className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                                    disabled={creatingTag}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && tagName.trim() && !creatingTag) {
                                            handleCreateTag();
                                        }
                                    }}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Mensaje (opcional)</label>
                                <textarea
                                    value={tagMessage}
                                    onChange={(e) => setTagMessage(e.target.value)}
                                    placeholder="Descripción del tag..."
                                    rows={3}
                                    className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 resize-none"
                                    disabled={creatingTag}
                                />
                            </div>
                            <div className="space-y-2 py-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium cursor-pointer" htmlFor="push-to-remotes">
                                        Push to all remotes
                                    </label>
                                    <button
                                        type="button"
                                        id="push-to-remotes"
                                        role="switch"
                                        aria-checked={pushToAllRemotes}
                                        onClick={() => setPushToAllRemotes(!pushToAllRemotes)}
                                        disabled={creatingTag}
                                        className={cn(
                                            "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2",
                                            pushToAllRemotes ? "bg-cyan-600" : "bg-slate-300 dark:bg-slate-600",
                                            creatingTag && "opacity-50 cursor-not-allowed"
                                        )}
                                    >
                                        <span
                                            className={cn(
                                                "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                                                pushToAllRemotes ? "translate-x-6" : "translate-x-1"
                                            )}
                                        />
                                    </button>
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Si está activado, el tag se enviará automáticamente a todos los remotes configurados del repositorio.
                                </p>
                            </div>
                            <div className="flex gap-2 pt-2 justify-end">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        setShowNewTagModal(false);
                                        setTagName("");
                                        setTagMessage("");
                                        setPushToAllRemotes(false);
                                    }}
                                    disabled={creatingTag}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    size="sm"
                                    className="bg-cyan-600 hover:bg-cyan-700"
                                    onClick={handleCreateTag}
                                    disabled={!tagName.trim() || !selectedCommit || creatingTag}
                                >
                                    {creatingTag ? 'Creando...' : 'Crear'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Modal para elegir estrategia de pull cuando hay branches divergentes */}
            {showPullStrategyModal && (
                <div
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
                    onClick={() => {
                        setShowPullStrategyModal(false);
                        setPendingPullRepoPath(null);
                        setSelectedPullStrategy('merge');
                        setPendingPushAfterPull(false);
                    }}
                >
                    <Card className="w-full max-w-2xl mx-4 bg-background border-2 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <CardHeader className="p-4">
                            <CardTitle className="text-lg">
                                {pendingPushAfterPull ? "Push Rechazado - Ramas Divergentes" : "Ramas Divergentes Detectadas"}
                            </CardTitle>
                            <CardDescription className="text-sm">
                                {pendingPushAfterPull 
                                    ? "Tu rama local está detrás de la remota. Necesitas hacer pull primero para integrar los cambios remotos antes de poder hacer push. Elige una estrategia:"
                                    : "Git necesita saber cómo reconciliar las ramas divergentes. Elige una estrategia:"
                                }
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-4 pt-0 space-y-4">
                            {/* Selector de radio buttons */}
                            <div className="space-y-3">
                                {/* Opción 1: Merge */}
                                <label className="flex items-start gap-3 p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors">
                                    <div className="relative mt-1 h-4 w-4">
                                        <input
                                            type="radio"
                                            name="pullStrategy"
                                            value="merge"
                                            checked={selectedPullStrategy === 'merge'}
                                            onChange={() => setSelectedPullStrategy('merge')}
                                            className="h-4 w-4 appearance-none border-2 border-slate-300 dark:border-slate-600 rounded-full bg-transparent checked:border-cyan-600 focus:ring-2 focus:ring-cyan-500 focus:ring-offset-0"
                                        />
                                        {selectedPullStrategy === 'merge' && (
                                            <div className="absolute top-[6px] left-[4px] h-2 w-2 bg-cyan-600 rounded-full" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-sm mb-1">Merge (Mezclar)</h3>
                                        <p className="text-xs text-slate-600 dark:text-slate-400">
                                            La opción clásica por defecto. Crea un nuevo "commit de unión" que junta ambas historias. Verás en tu historial un pequeño círculo donde las ramas se separan y luego se unen. Es ideal si quieres mantener un registro fiel de que hubo dos líneas de trabajo distintas.
                                        </p>
                                    </div>
                                </label>

                                {/* Opción 2: Rebase */}
                                <label className="flex items-start gap-3 p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors">
                                    <div className="relative mt-1 h-4 w-4">
                                        <input
                                            type="radio"
                                            name="pullStrategy"
                                            value="rebase"
                                            checked={selectedPullStrategy === 'rebase'}
                                            onChange={() => setSelectedPullStrategy('rebase')}
                                            className="h-4 w-4 appearance-none border-2 border-slate-300 dark:border-slate-600 rounded-full bg-transparent checked:border-cyan-600 focus:ring-2 focus:ring-cyan-500 focus:ring-offset-0"
                                        />
                                        {selectedPullStrategy === 'rebase' && (
                                            <div className="absolute top-[6px] left-[4px] h-2 w-2 bg-cyan-600 rounded-full" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-sm mb-1">Rebase (Reorganizar)</h3>
                                        <p className="text-xs text-slate-600 dark:text-slate-400">
                                            La opción limpia. En lugar de crear un commit de unión, Git toma tus cambios locales, los "guarda" un momento, descarga los del servidor y luego pone tus cambios encima de lo nuevo. El historial queda como una línea recta perfecta. Es la preferida en equipos profesionales porque hace que el historial sea mucho más fácil de leer.
                                        </p>
                                    </div>
                                </label>

                                {/* Opción 3: Fast-forward only */}
                                <label className="flex items-start gap-3 p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors">
                                    <div className="relative mt-1 h-4 w-4">
                                        <input
                                            type="radio"
                                            name="pullStrategy"
                                            value="ff-only"
                                            checked={selectedPullStrategy === 'ff-only'}
                                            onChange={() => setSelectedPullStrategy('ff-only')}
                                            className="h-4 w-4 appearance-none border-2 border-slate-300 dark:border-slate-600 rounded-full bg-transparent checked:border-cyan-600 focus:ring-2 focus:ring-cyan-500 focus:ring-offset-0"
                                        />
                                        {selectedPullStrategy === 'ff-only' && (
                                            <div className="absolute top-[6px] left-[4px] h-2 w-2 bg-cyan-600 rounded-full" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-sm mb-1">Fast-forward Only</h3>
                                        <p className="text-xs text-slate-600 dark:text-slate-400">
                                            La opción estricta. Solo permite el pull si no tienes cambios locales que entren en conflicto. Si hay divergencia, simplemente te dará un error y no hará nada. Solo permite pulls que puedan hacerse sin crear commits de merge. Si hay conflictos, el pull fallará.
                                        </p>
                                    </div>
                                </label>
                            </div>

                            <div className="flex gap-2 pt-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1"
                    onClick={() => {
                        setShowPullStrategyModal(false);
                        setPendingPullRepoPath(null);
                        setSelectedPullStrategy('merge');
                        setPendingPushAfterPull(false);
                    }}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    size="sm"
                                    className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white"
                                    onClick={handlePullStrategy}
                                    disabled={pulling || pushing}
                                >
                                    {pulling ? 'Pulling...' : pushing ? 'Pushing...' : pendingPushAfterPull ? 'Pull & Push' : 'Pull'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Modal para resolver conflicto de checkout */}
            {showCheckoutConflictModal && (
                <div
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
                    onClick={() => {
                        if (!resolvingConflict) {
                            setShowCheckoutConflictModal(false);
                            setConflictFiles([]);
                            setPendingCheckoutBranch(null);
                            setPendingCheckoutRepoPath(null);
                            setSelectedCheckoutOption('save');
                            setIsUntrackedConflict(false);
                        }
                    }}
                >
                    <Card className="w-full max-w-2xl mx-4 bg-background border-2 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <CardHeader className="p-4">
                            <CardTitle className="text-lg">Cambios detectados</CardTitle>
                            <CardDescription className="text-sm">
                                {isUntrackedConflict 
                                    ? `Hay archivos sin trackear que serían sobrescritos al cambiar a la rama '${pendingCheckoutBranch}'. Elige cómo resolver este conflicto:`
                                    : `Hay cambios locales que serían sobrescritos al cambiar a la rama '${pendingCheckoutBranch}'. Elige cómo resolver este conflicto:`}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-4 pt-0 space-y-4">
                            <div className="space-y-3">
                                {/* Opción 1: Guardar archivos */}
                                <label className="flex items-start gap-3 p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors">
                                    <div className="relative mt-1 h-4 w-4">
                                        <input
                                            type="radio"
                                            name="checkoutConflict"
                                            value="save"
                                            checked={selectedCheckoutOption === 'save'}
                                            onChange={() => setSelectedCheckoutOption('save')}
                                            className="h-4 w-4 appearance-none border-2 border-slate-300 dark:border-slate-600 rounded-full bg-transparent checked:border-cyan-600 focus:ring-2 focus:ring-cyan-500 focus:ring-offset-0"
                                        />
                                        {selectedCheckoutOption === 'save' && (
                                            <div className="absolute top-[6px] left-[4px] h-2 w-2 bg-cyan-600 rounded-full" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-sm mb-1">Guardar el archivo en tu rama actual</h3>
                                        <p className="text-xs text-slate-600 dark:text-slate-400">
                                            Los archivos se agregarán al stage y se hará un commit en la rama actual antes de cambiar de rama. Esto guarda permanentemente los cambios en el historial de Git.
                                        </p>
                                    </div>
                                </label>

                                {/* Opción 2: Stash */}
                                <label className="flex items-start gap-3 p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors">
                                    <div className="relative mt-1 h-4 w-4">
                                        <input
                                            type="radio"
                                            name="checkoutConflict"
                                            value="stash"
                                            checked={selectedCheckoutOption === 'stash'}
                                            onChange={() => setSelectedCheckoutOption('stash')}
                                            className="h-4 w-4 appearance-none border-2 border-slate-300 dark:border-slate-600 rounded-full bg-transparent checked:border-cyan-600 focus:ring-2 focus:ring-cyan-500 focus:ring-offset-0"
                                        />
                                        {selectedCheckoutOption === 'stash' && (
                                            <div className="absolute top-[6px] left-[4px] h-2 w-2 bg-cyan-600 rounded-full" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-sm mb-1">"Esconder" el archivo temporalmente (Stash)</h3>
                                        <p className="text-xs text-slate-600 dark:text-slate-400">
                                            Los archivos se guardarán temporalmente en el stash de Git. Podrás recuperarlos más tarde con 'git stash pop'. Es útil si aún no estás seguro de querer commitear estos cambios.
                                        </p>
                                    </div>
                                </label>

                                {/* Opción 3: Descartar */}
                                <label className="flex items-start gap-3 p-4 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer transition-colors">
                                    <div className="relative mt-1 h-4 w-4">
                                        <input
                                            type="radio"
                                            name="checkoutConflict"
                                            value="discard"
                                            checked={selectedCheckoutOption === 'discard'}
                                            onChange={() => setSelectedCheckoutOption('discard')}
                                            className="h-4 w-4 appearance-none border-2 border-slate-300 dark:border-slate-600 rounded-full bg-transparent checked:border-red-600 focus:ring-2 focus:ring-red-500 focus:ring-offset-0"
                                        />
                                        {selectedCheckoutOption === 'discard' && (
                                            <div className="absolute top-[6px] left-[4px] h-2 w-2 bg-red-600 rounded-full" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-sm mb-1 text-red-700 dark:text-red-400">Descartar todos los cambios y cambiar de rama</h3>
                                        <p className="text-xs text-slate-600 dark:text-slate-400">
                                            <span className="font-semibold text-slate-600 dark:text-slate-400">Advertencia:</span> Esta opción eliminará permanentemente todos los archivos sin trackear. Los cambios no podrán recuperarse. Úsalo solo si estás seguro de que no necesitas estos archivos.
                                        </p>
                                    </div>
                                </label>
                            </div>

                            <div className="flex gap-2 pt-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1"
                                    onClick={() => {
                                        setShowCheckoutConflictModal(false);
                                        setConflictFiles([]);
                                        setPendingCheckoutBranch(null);
                                        setPendingCheckoutRepoPath(null);
                                        setSelectedCheckoutOption('save');
                                        setIsUntrackedConflict(false);
                                    }}
                                    disabled={resolvingConflict}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    size="sm"
                                    className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white"
                                    onClick={() => handleResolveCheckoutConflict(selectedCheckoutOption)}
                                    disabled={resolvingConflict}
                                >
                                    {resolvingConflict ? 'Resolviendo...' : 'Continuar'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Modal para hacer stash */}
            {showStashModal && (
                <div
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
                    onClick={() => {
                        if (!stashing) {
                            setShowStashModal(false);
                            setStashMessage('');
                            setStashIncludeUntracked(true);
                        }
                    }}
                >
                    <Card className="w-full max-w-md mx-4 bg-background border-2" onClick={(e) => e.stopPropagation()}>
                        <CardHeader className="p-4">
                            <CardTitle className="text-lg">Crear Stash</CardTitle>
                            <CardDescription className="text-sm">
                                Guarda temporalmente tus cambios en el stash de Git
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-4 pt-0 space-y-4">
                            {/* Campo de mensaje */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    Mensaje (opcional)
                                </label>
                                <input
                                    type="text"
                                    value={stashMessage}
                                    onChange={(e) => setStashMessage(e.target.value)}
                                    className="w-full px-3 py-2 text-sm rounded-md border border-slate-200 dark:border-slate-700 bg-background focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                                    placeholder="Mensaje para el stash"
                                    autoFocus
                                    disabled={stashing}
                                />
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Si no especificas un mensaje, se usará uno por defecto
                                </p>
                            </div>

                            {/* Switch para incluir archivos sin trackear */}
                            <div className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-700 rounded-lg">
                                <div className="flex-1">
                                    <label className="text-sm font-medium cursor-pointer" htmlFor="stash-untracked">
                                        Incluir archivos sin trackear
                                    </label>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                        También guarda archivos nuevos que aún no están en el repositorio
                                    </p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        id="stash-untracked"
                                        checked={stashIncludeUntracked}
                                        onChange={(e) => setStashIncludeUntracked(e.target.checked)}
                                        disabled={stashing}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-cyan-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
                                </label>
                            </div>

                            <div className="flex gap-2 pt-2 justify-end">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        setShowStashModal(false);
                                        setStashMessage('');
                                        setStashIncludeUntracked(true);
                                    }}
                                    disabled={stashing}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    size="sm"
                                    className="bg-cyan-600 hover:bg-cyan-700 text-white"
                                    onClick={handleStash}
                                    disabled={stashing}
                                >
                                    {stashing ? 'Guardando...' : 'Crear'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Modal para lista de stashes */}
            {showStashListModal && (
                <div
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
                    onClick={() => {
                        if (!applyingStash) {
                            setShowStashListModal(false);
                            setStashList([]);
                            setSelectedStash(null);
                        }
                    }}
                >
                    <Card className="w-full max-w-3xl mx-4 bg-background border-2 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <CardHeader className="p-4">
                            <CardTitle className="text-lg">Lista de Stashes</CardTitle>
                            <CardDescription className="text-sm">
                                Selecciona un stash para aplicarlo (pop)
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                            {loadingStashList ? (
                                <div className="flex items-center justify-center py-8">
                                    <RotateCw className="h-6 w-6 animate-spin text-slate-400" />
                                    <span className="ml-2 text-sm text-slate-600 dark:text-slate-400">Cargando stashes...</span>
                                </div>
                            ) : stashList.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 px-4">
                                    <div className="rounded-full bg-slate-100 dark:bg-slate-800 p-4 mb-4">
                                        <Archive className="h-8 w-8 text-slate-400 dark:text-slate-500" />
                                    </div>
                                    <p className="text-base font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        No hay stashes disponibles
                                    </p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 text-center max-w-sm">
                                        Los stashes te permiten guardar temporalmente cambios sin hacer commit. Crea uno desde el menú de stashes.
                                    </p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full border-collapse">
                                        <thead>
                                            <tr className="border-b border-slate-200 dark:border-slate-700">
                                                <th className="text-left p-3 text-xs font-semibold text-slate-600 dark:text-slate-400 w-12"></th>
                                                <th className="text-left p-3 text-xs font-semibold text-slate-600 dark:text-slate-400">Referencia</th>
                                                <th className="text-left p-3 text-xs font-semibold text-slate-600 dark:text-slate-400">Mensaje</th>
                                                <th className="text-left p-3 text-xs font-semibold text-slate-600 dark:text-slate-400">Fecha</th>
                                                <th className="text-center p-3 text-xs font-semibold text-slate-600 dark:text-slate-400 w-20">Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {stashList.map((stash) => (
                                                <tr
                                                    key={stash.ref}
                                                    className={`border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer ${
                                                        selectedStash === stash.ref ? 'bg-cyan-50 dark:bg-cyan-950/20' : ''
                                                    }`}
                                                    onClick={() => setSelectedStash(stash.ref)}
                                                >
                                                    <td className="p-3">
                                                        <div className="relative flex items-center justify-center">
                                                            <input
                                                                type="radio"
                                                                name="stash-select"
                                                                checked={selectedStash === stash.ref}
                                                                onChange={() => setSelectedStash(stash.ref)}
                                                                className="h-4 w-4 appearance-none border-2 border-slate-300 dark:border-slate-600 rounded-full bg-transparent checked:border-cyan-600 focus:ring-2 focus:ring-cyan-500 focus:ring-offset-0"
                                                            />
                                                            {selectedStash === stash.ref && (
                                                                <div className="absolute top-[6px] left-[4px] h-2 w-2 bg-cyan-600 rounded-full" />
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="p-3">
                                                        <span className="text-xs font-mono text-slate-600 dark:text-slate-400">
                                                            {stash.ref}
                                                        </span>
                                                    </td>
                                                    <td className="p-3">
                                                        <p className="text-sm text-slate-700 dark:text-slate-300 break-words">
                                                            {stash.message}
                                                        </p>
                                                    </td>
                                                    <td className="p-3">
                                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                                            {new Date(stash.date).toLocaleString()}
                                                        </p>
                                                    </td>
                                                    <td className="p-3">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-7 w-7 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setStashToDelete({ ref: stash.ref, message: stash.message });
                                                            }}
                                                            disabled={applyingStash !== null || deletingStash || clearingAllStashes}
                                                            title="Eliminar stash"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            <div className="flex gap-2 pt-4 mt-4 justify-end">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        setShowStashListModal(false);
                                        setStashList([]);
                                        setSelectedStash(null);
                                    }}
                                    disabled={applyingStash !== null || deletingStash || clearingAllStashes}
                                >
                                    Cerrar
                                </Button>
                                {stashList.length > 0 && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="text-red-600 dark:text-red-400 border-red-300 dark:border-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                                        onClick={() => setShowClearAllConfirm(true)}
                                        disabled={applyingStash !== null || deletingStash || clearingAllStashes}
                                    >
                                        <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                                        Limpiar Todos
                                    </Button>
                                )}
                                <Button
                                    size="sm"
                                    className="bg-cyan-600 hover:bg-cyan-700 text-white"
                                    onClick={handleStashPop}
                                    disabled={applyingStash !== null || deletingStash || clearingAllStashes || !selectedStash}
                                >
                                    {applyingStash ? (
                                        <>
                                            <RotateCw className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                                            Aplicando...
                                        </>
                                    ) : (
                                        'Aplicar'
                                    )}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Modal de confirmación para eliminar stash */}
            {stashToDelete && (
                <div
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]"
                    onClick={() => {
                        if (!deletingStash) {
                            setStashToDelete(null);
                        }
                    }}
                >
                    <Card className="w-full max-w-md mx-4 bg-background border-2" onClick={(e) => e.stopPropagation()}>
                        <CardHeader className="p-4">
                            <CardTitle className="text-lg">Confirmar Eliminación</CardTitle>
                            <CardDescription className="text-sm">
                                ¿Estás seguro de que deseas eliminar este stash?
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-4 pt-0 space-y-4">
                            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                                <p className="text-xs font-mono text-slate-600 dark:text-slate-400 mb-2">
                                    {stashToDelete.ref}
                                </p>
                                <p className="text-sm text-slate-700 dark:text-slate-300">
                                    {stashToDelete.message}
                                </p>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Esta acción no se puede deshacer. El stash será eliminado permanentemente.
                            </p>
                            <div className="flex gap-2 pt-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1"
                                    onClick={() => setStashToDelete(null)}
                                    disabled={deletingStash}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    size="sm"
                                    className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                                    onClick={handleStashDelete}
                                    disabled={deletingStash}
                                >
                                    {deletingStash ? (
                                        <>
                                            <RotateCw className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                                            Eliminando...
                                        </>
                                    ) : (
                                        'Eliminar'
                                    )}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Modal de confirmación para limpiar todos los stashes */}
            {showClearAllConfirm && (
                <div
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]"
                    onClick={() => {
                        if (!clearingAllStashes) {
                            setShowClearAllConfirm(false);
                        }
                    }}
                >
                    <Card className="w-full max-w-md mx-4 bg-background border-2" onClick={(e) => e.stopPropagation()}>
                        <CardHeader className="p-4">
                            <CardTitle className="text-lg">Confirmar Limpieza</CardTitle>
                            <CardDescription className="text-sm">
                                ¿Estás seguro de que deseas eliminar todos los stashes?
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-4 pt-0 space-y-4">
                            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                                <p className="text-sm text-slate-700 dark:text-slate-300 mb-1">
                                    Se eliminarán <span className="font-semibold">{stashList.length}</span> {stashList.length === 1 ? 'stash' : 'stashes'}.
                                </p>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Esta acción no se puede deshacer. Todos los stashes serán eliminados permanentemente.
                            </p>
                            <div className="flex gap-2 pt-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1"
                                    onClick={() => setShowClearAllConfirm(false)}
                                    disabled={clearingAllStashes}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    size="sm"
                                    className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                                    onClick={handleClearAllStashes}
                                    disabled={clearingAllStashes}
                                >
                                    {clearingAllStashes ? (
                                        <>
                                            <RotateCw className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                                            Eliminando...
                                        </>
                                    ) : (
                                        'Eliminar Todos'
                                    )}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Modal para Revert */}
            {showRevertModal && selectedCommit && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                    onClick={() => {
                        if (!reverting) {
                            setShowRevertModal(false);
                        }
                    }}
                >
                    <Card className="w-full max-w-lg mx-4 bg-background border border-slate-200 dark:border-slate-700 shadow-xl" onClick={(e) => e.stopPropagation()}>
                        <CardHeader className="pb-4 border-b border-slate-200 dark:border-slate-700">
                            <CardTitle className="text-xl font-semibold">Revert Commit</CardTitle>
                            <CardDescription className="text-sm mt-1">
                                Crear un nuevo commit que deshace los cambios de este commit
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Commit a revertir:</label>
                                <div className="px-4 py-3 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800/50 flex items-center gap-3 shadow-sm">
                                    <div className="p-1.5 bg-orange-100 dark:bg-orange-900/30 rounded-md">
                                        <Undo2 className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="text-slate-600 dark:text-slate-400 font-mono text-xs bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded">{selectedCommit.hash.substring(0, 7)}</span>
                                            <span className="text-slate-800 dark:text-slate-200 font-medium truncate">{selectedCommit.message}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="p-4 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-900/20">
                                <p className="text-xs text-amber-800 dark:text-amber-200 leading-relaxed">
                                    Esto creará un nuevo commit que revierte los cambios realizados en el commit seleccionado. El commit original permanecerá en el historial.
                                </p>
                            </div>

                            <div className="flex gap-3 pt-4 justify-end">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        setShowRevertModal(false);
                                    }}
                                    disabled={reverting}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    size="sm"
                                    className="bg-orange-600 hover:bg-orange-700 text-white shadow-sm"
                                    onClick={handleRevert}
                                    disabled={reverting}
                                >
                                    {reverting ? (
                                        <>
                                            <RotateCw className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                                            Revirtiendo...
                                        </>
                                    ) : (
                                        'Revertir'
                                    )}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Modal para Cherry-pick */}
            {showCherryPickModal && selectedCommit && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                    onClick={() => {
                        if (!cherryPicking) {
                            setShowCherryPickModal(false);
                            setCherryPickCommitChanges(true);
                            setCherryPickAppendOrigin(false);
                        }
                    }}
                >
                    <Card className="w-full max-w-lg mx-4 bg-background border border-slate-200 dark:border-slate-700 shadow-xl" onClick={(e) => e.stopPropagation()}>
                        <CardHeader className="pb-4 border-b border-slate-200 dark:border-slate-700">
                            <CardTitle className="text-xl font-semibold">Cherry Pick</CardTitle>
                            <CardDescription className="text-sm mt-1">
                                Aplicar cambios del commit individual
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Commit a aplicar:</label>
                                <div className="px-4 py-3 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800/50 flex items-center gap-3 shadow-sm">
                                    <div className="p-1.5 bg-cyan-100 dark:bg-cyan-900/30 rounded-md">
                                        <GitBranch className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="text-slate-600 dark:text-slate-400 font-mono text-xs bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded">{selectedCommit.hash.substring(0, 7)}</span>
                                            <span className="text-slate-800 dark:text-slate-200 font-medium truncate">{selectedCommit.message}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="space-y-5">
                                <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 space-y-1.5">
                                            <label htmlFor="cherry-pick-commit" className="text-sm font-semibold text-slate-800 dark:text-slate-200 block cursor-pointer">
                                                Hacer commit de los cambios
                                            </label>
                                            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                                                Crear automáticamente un commit con los cambios cherry-picked. Si está desactivado, los cambios quedarán en staging pero no se hará commit, permitiéndote revisarlos y modificarlos antes de hacer commit.
                                            </p>
                                        </div>
                                        <div className="pt-0.5">
                                            <Switch
                                                id="cherry-pick-commit"
                                                checked={cherryPickCommitChanges}
                                                onCheckedChange={setCherryPickCommitChanges}
                                                disabled={cherryPicking}
                                            />
                                        </div>
                                    </div>
                                </div>
                                
                                <div className={cn(
                                    "p-4 rounded-lg border transition-all",
                                    cherryPickCommitChanges
                                        ? "border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30"
                                        : "border-slate-200/50 dark:border-slate-700/50 bg-slate-50/30 dark:bg-slate-800/20 opacity-60"
                                )}>
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 space-y-1.5">
                                            <label htmlFor="cherry-pick-append" className={cn(
                                                "text-sm font-semibold block",
                                                cherryPickCommitChanges 
                                                    ? "text-slate-800 dark:text-slate-200 cursor-pointer" 
                                                    : "text-slate-500 dark:text-slate-500 cursor-not-allowed"
                                            )}>
                                                Agregar origen al mensaje del commit
                                            </label>
                                            <p className={cn(
                                                "text-xs leading-relaxed",
                                                cherryPickCommitChanges 
                                                    ? "text-slate-600 dark:text-slate-400" 
                                                    : "text-slate-400 dark:text-slate-600"
                                            )}>
                                                Agregar una referencia al commit original al final del mensaje del commit (ej: "(cherry picked from commit abc1234")). Esto ayuda a rastrear de dónde vinieron los cambios en el historial de git. Solo disponible cuando "Hacer commit de los cambios" está habilitado.
                                            </p>
                                        </div>
                                        <div className="pt-0.5">
                                            <Switch
                                                id="cherry-pick-append"
                                                checked={cherryPickAppendOrigin}
                                                onCheckedChange={setCherryPickAppendOrigin}
                                                disabled={cherryPicking || !cherryPickCommitChanges}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4 justify-end">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        setShowCherryPickModal(false);
                                        setCherryPickCommitChanges(true);
                                        setCherryPickAppendOrigin(false);
                                    }}
                                    disabled={cherryPicking}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    size="sm"
                                    className="bg-cyan-600 hover:bg-cyan-700 text-white shadow-sm"
                                    onClick={handleCherryPick}
                                    disabled={cherryPicking}
                                >
                                    {cherryPicking ? (
                                        <>
                                            <RotateCw className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                                            Aplicando...
                                        </>
                                    ) : (
                                        'Aplicar'
                                    )}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
};
