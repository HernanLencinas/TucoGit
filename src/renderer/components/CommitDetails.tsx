/**
 * @fileoverview Componente para mostrar detalles completos de un commit de Git.
 * 
 * Este módulo proporciona un componente completo para visualizar información
 * detallada de un commit, incluyendo archivos modificados, diffs, árbol de archivos
 * y contenido de archivos específicos.
 */

import React, { useEffect, useState, useMemo } from 'react';
import { FileCode, FilePlus, FileMinus, FileDiff, X, GitBranch, File, Folder, RefreshCw, FileJson, ChevronRight, ChevronDown, FolderOpen, Info, AlertCircle, Copy, Check, TrendingUp, TrendingDown, FileText } from 'lucide-react';
import { getAvatarUrl } from '@/renderer/utils/avatar';
import { cn } from '@/lib/utils';

/**
 * Propiedades del componente CommitDetails.
 * 
 * @interface CommitDetailsProps
 * @property {Object} commit - Información del commit
 * @property {string} commit.hash - Hash del commit
 * @property {string} commit.message - Mensaje del commit
 * @property {Object} commit.author - Información del autor
 * @property {string} commit.author.name - Nombre del autor
 * @property {string} commit.author.email - Email del autor
 * @property {string} commit.date - Fecha del commit
 * @property {string[]} [commit.parents] - Array de hashes de commits padres
 * @property {string} repoPath - Ruta del repositorio Git
 * @property {Function} onClose - Callback cuando se cierra el panel
 * @property {string} [provider] - Proveedor Git (opcional)
 * @property {string} [host] - Host del servidor Git (opcional)
 */
interface CommitDetailsProps {
    commit: {
        hash: string;
        message: string;
        author: { name: string; email: string };
        date: string;
        parents?: string[];
    };
    repoPath: string;
    onClose: () => void;
    provider?: string;
    host?: string;
}

/**
 * Interfaz que representa un archivo modificado en un commit.
 * 
 * @interface FileChange
 * @property {string} path - Ruta del archivo
 * @property {string} status - Estado del cambio (M, A, D, R, etc.)
 */
interface FileChange {
    path: string;
    status: string; // M, A, D, R, etc.
}

/**
 * Interfaz que representa un archivo en el árbol del commit.
 * 
 * @interface TreeFile
 * @property {string} path - Ruta del archivo
 */
interface TreeFile {
    path: string;
}

/**
 * Interfaz que representa un nodo en el árbol de archivos.
 * 
 * @interface TreeNode
 * @property {string} name - Nombre del archivo o carpeta
 * @property {string} path - Ruta completa
 * @property {'file'|'folder'} type - Tipo de nodo
 * @property {TreeNode[]} [children] - Hijos del nodo (solo para carpetas)
 */
interface TreeNode {
    name: string;
    path: string;
    type: 'file' | 'folder';
    children?: TreeNode[];
}

/**
 * Estado interno del componente para los detalles del commit.
 * 
 * @interface DetailsState
 * @property {FileChange[]} files - Archivos modificados en el commit
 * @property {string} stats - Estadísticas del commit (inserciones, deleciones)
 * @property {string} fullDiff - Diff completo del commit
 * @property {boolean} loading - Indica si se está cargando información
 * @property {string|null} error - Mensaje de error si existe
 * @property {Object} [committer] - Información del committer (puede diferir del autor)
 * @property {string} [committer.name] - Nombre del committer
 * @property {string} [committer.email] - Email del committer
 * @property {string} [committer.date] - Fecha del commit
 */
interface DetailsState {
    files: FileChange[];
    stats: string;
    fullDiff: string;
    loading: boolean;
    error: string | null;
    committer?: {
        name: string;
        email: string;
        date: string;
    };
}

/**
 * Tipo de pestaña activa en el panel de detalles.
 * 
 * @typedef {'detail'|'modified'|'tree'} TabType
 */
type TabType = 'detail' | 'modified' | 'tree';

/**
 * Componente para mostrar detalles completos de un commit.
 * 
 * @description
 * Panel deslizable que muestra información detallada de un commit:
 * - Pestaña Detalle: Información del commit, autor, fecha, hashes, estadísticas
 * - Pestaña Archivos Modificados: Lista de archivos y diffs
 * - Pestaña Árbol: Estructura de archivos del commit y contenido
 * 
 * Incluye funcionalidades como:
 * - Visualización de diffs con colores
 * - Navegación por árbol de archivos
 * - Visualización de contenido de archivos
 * - Copia de hashes al portapapeles
 * 
 * @param {CommitDetailsProps} props - Propiedades del componente
 * @param {Object} props.commit - Información del commit a mostrar
 * @param {string} props.repoPath - Ruta del repositorio Git
 * @param {Function} props.onClose - Función para cerrar el panel
 * @param {string} [props.provider] - Proveedor Git opcional
 * @param {string} [props.host] - Host del servidor Git opcional
 * @returns {JSX.Element} Componente de detalles del commit
 * 
 * @example
 * ```tsx
 * <CommitDetails
 *   commit={{
 *     hash: 'abc123',
 *     message: 'Fix bug',
 *     author: { name: 'John', email: 'john@example.com' },
 *     date: '2024-01-15T10:30:00Z'
 *   }}
 *   repoPath="/path/to/repo"
 *   onClose={() => setShowDetails(false)}
 * />
 * ```
 */
export const CommitDetails: React.FC<CommitDetailsProps> = ({ commit, repoPath, onClose, provider, host }) => {
    const [details, setDetails] = useState<DetailsState>({
        files: [],
        stats: '',
        fullDiff: '',
        loading: true,
        error: null,
        committer: undefined
    });

    const [selectedFile, setSelectedFile] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<TabType>('detail');
    const [treeFiles, setTreeFiles] = useState<TreeFile[]>([]);
    const [loadingTree, setLoadingTree] = useState(false);
    const [treeError, setTreeError] = useState<string | null>(null);
    const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
    const [treeStructure, setTreeStructure] = useState<TreeNode[]>([]);
    const [selectedTreeFile, setSelectedTreeFile] = useState<string | null>(null);
    const [fileContent, setFileContent] = useState<string | null>(null);
    const [loadingFileContent, setLoadingFileContent] = useState(false);
    const [fileContentError, setFileContentError] = useState<string | null>(null);
    const [commitParents, setCommitParents] = useState<string[]>([]);
    const [copiedHash, setCopiedHash] = useState<string | null>(null);
    const [copiedParentHash, setCopiedParentHash] = useState<string | null>(null);

    /**
     * Construye una estructura de árbol jerárquica a partir de una lista plana de archivos.
     * 
     * @description
     * Convierte un array de rutas de archivos en una estructura de árbol
     * con carpetas y archivos anidados. Ordena alfabéticamente con
     * carpetas primero.
     * 
     * @param {TreeFile[]} files - Array de archivos con sus rutas
     * @returns {TreeNode[]} Estructura de árbol jerárquica
     * @private
     */
    const buildTreeStructure = (files: TreeFile[]): TreeNode[] => {
        const root: { [key: string]: TreeNode } = {};

        files.forEach(file => {
            const parts = file.path.split('/').filter(Boolean);
            let current = root;

            parts.forEach((part, index) => {
                const isLast = index === parts.length - 1;
                const path = parts.slice(0, index + 1).join('/');

                if (!current[part]) {
                    current[part] = {
                        name: part,
                        path: path,
                        type: isLast ? 'file' : 'folder',
                        children: isLast ? undefined : {}
                    } as any;
                }

                if (!isLast && current[part].children) {
                    current = current[part].children as any;
                }
            });
        });

        // Convertir el objeto anidado a array y ordenar
        const convertToArray = (node: any): TreeNode[] => {
            return Object.values(node)
                .map((n: any) => ({
                    ...n,
                    children: n.children ? convertToArray(n.children) : undefined
                }))
                .sort((a, b) => {
                    // Carpetas primero, luego archivos, ambos alfabéticamente
                    if (a.type !== b.type) {
                        return a.type === 'folder' ? -1 : 1;
                    }
                    return a.name.localeCompare(b.name);
                });
        };

        return convertToArray(root);
    };

    /**
     * Carga el árbol de archivos del commit.
     * 
     * @description
     * Obtiene la lista de archivos del commit y construye la estructura
     * de árbol para visualización.
     * 
     * @returns {Promise<void>} Promesa que se resuelve cuando se completa la carga
     * @private
     */
    const loadCommitTree = async () => {
        if (!repoPath || !commit.hash) return;
        setLoadingTree(true);
        setTreeError(null);
        try {
            const result = await (window as any).electronAPI.getCommitTree?.(repoPath, commit.hash);
            if (result.success) {
                const files = result.files || [];
                setTreeFiles(files);
                const tree = buildTreeStructure(files);
                setTreeStructure(tree);
                // Iniciar con todas las carpetas colapsadas
                setExpandedFolders(new Set());
            } else {
                setTreeError(result.error || "Error al cargar el árbol");
            }
        } catch (err: any) {
            setTreeError(err.message);
        } finally {
            setLoadingTree(false);
        }
    };

    /**
     * Alterna el estado de expansión de una carpeta en el árbol.
     * 
     * @param {string} path - Ruta de la carpeta a expandir/colapsar
     * @private
     */
    const toggleFolder = (path: string) => {
        setExpandedFolders(prev => {
            const next = new Set(prev);
            if (next.has(path)) {
                next.delete(path);
            } else {
                next.add(path);
            }
            return next;
        });
    };

    /**
     * Carga el contenido de un archivo específico del commit.
     * 
     * @param {string} filePath - Ruta del archivo a cargar
     * @returns {Promise<void>} Promesa que se resuelve cuando se completa la carga
     * @private
     */
    const loadFileContent = async (filePath: string) => {
        if (!repoPath || !commit.hash) return;
        setSelectedTreeFile(filePath);
        setLoadingFileContent(true);
        setFileContentError(null);
        setFileContent(null);
        try {
            const result = await (window as any).electronAPI.getCommitFileContent?.(repoPath, commit.hash, filePath);
            if (result.success) {
                setFileContent(result.content || '');
            } else {
                setFileContentError(result.error || "Error al cargar el archivo");
            }
        } catch (err: any) {
            setFileContentError(err.message);
        } finally {
            setLoadingFileContent(false);
        }
    };

    useEffect(() => {
        const fetchDetails = async () => {
            setDetails(prev => ({ ...prev, loading: true, error: null }));
            setSelectedFile(null); // Reset selection on new commit
            setSelectedTreeFile(null); // Reset tree file selection
            setFileContent(null); // Reset file content
            setActiveTab('detail'); // Reset to detail tab
            
            // Establecer parents del commit si están disponibles
            if (commit.parents && commit.parents.length > 0) {
                setCommitParents(commit.parents);
            } else {
                // Si no están disponibles, intentar obtenerlos usando el handler IPC
                try {
                    const result = await (window as any).electronAPI?.getCommitParents?.(repoPath, commit.hash);
                    if (result?.success && result.parents) {
                        setCommitParents(result.parents);
                    } else {
                        setCommitParents([]);
                    }
                } catch (err) {
                    console.error('Error al obtener los padres del commit:', err);
                    setCommitParents([]);
                }
            }
            
            try {
                if (!window.electronAPI?.getCommitDetails) {
                    throw new Error("API not available");
                }
                const result = await window.electronAPI.getCommitDetails(repoPath, commit.hash);
                if (result.success) {
                    const files = result.files || [];
                    setDetails({
                        files: files,
                        stats: result.stats || '',
                        fullDiff: result.fullDiff || '',
                        loading: false,
                        error: null,
                        committer: result.committer
                    });
                    // Auto-select first file if available
                    if (files.length > 0) {
                        setSelectedFile(files[0].path);
                    }
                } else {
                    throw new Error(result.error || "Failed to load details");
                }
            } catch (err: any) {
                setDetails(prev => ({
                    ...prev,
                    loading: false,
                    error: err.message
                }));
            }
        };

        if (commit && repoPath) {
            fetchDetails();
        }
    }, [commit.hash, repoPath]);

    // Cargar el árbol cuando se cambia a la tab de árbol
    useEffect(() => {
        if (activeTab === 'tree' && commit.hash && repoPath) {
            loadCommitTree();
        }
    }, [activeTab, commit.hash, repoPath]);

    /**
     * Copia un hash al portapapeles.
     * 
     * @param {string} text - Texto (hash) a copiar
     * @param {'hash'|'parent'} type - Tipo de hash (para mostrar feedback visual)
     * @returns {Promise<void>} Promesa que se resuelve cuando se completa la copia
     * @private
     */
    const copyToClipboard = async (text: string, type: 'hash' | 'parent') => {
        try {
            await navigator.clipboard.writeText(text);
            if (type === 'hash') {
                setCopiedHash(text);
                setTimeout(() => setCopiedHash(null), 2000);
            } else {
                setCopiedParentHash(text);
                setTimeout(() => setCopiedParentHash(null), 2000);
            }
        } catch (err) {
            console.error('Error al copiar al portapapeles:', err);
        }
    };

    /**
     * Obtiene el icono apropiado según el estado del archivo.
     * 
     * @param {string} status - Estado del archivo (A, D, M, etc.)
     * @returns {JSX.Element} Componente de icono
     * @private
     */
    const getStatusIcon = (status: string) => {
        switch (status.charAt(0).toUpperCase()) {
            case 'A': return <FilePlus className="h-4 w-4 text-green-400" />;
            case 'D': return <FileMinus className="h-4 w-4 text-red-500" />;
            case 'M': return <FileCode className="h-4 w-4 text-yellow-400" />;
            default: return <FileDiff className="h-4 w-4 text-slate-400" />;
        }
    };

    /**
     * Obtiene el icono apropiado según el tipo de archivo.
     * 
     * @param {string} filePath - Ruta del archivo
     * @returns {React.ComponentType} Componente de icono de Lucide React
     * @private
     */
    const getFileIcon = (filePath: string) => {
        const isFolder = filePath.endsWith('/');
        if (isFolder) return Folder;
        
        const extension = filePath.split('.').pop()?.toLowerCase() || '';
        const fileName = filePath.split('/').pop()?.toLowerCase() || '';

        // Config files
        if (['json', 'jsonc'].includes(extension)) return FileJson;
        if (['yml', 'yaml'].includes(extension)) return FileCode;
        if (['toml', 'ini', 'conf', 'config'].includes(extension)) return FileCode;
        if (fileName === 'package.json' || fileName === 'package-lock.json' || fileName === 'yarn.lock') return FileCode;
        
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
        if (['vue', 'svelte'].includes(extension)) return FileCode;
        
        // Text files
        if (['md', 'markdown', 'txt', 'readme'].includes(extension) || fileName === 'readme' || fileName === 'license') return FileCode;
        if (['log', 'out', 'err'].includes(extension)) return FileCode;
        
        // Default
        return File;
    };

    // Extract diff for the selected file from the full diff
    const activeDiff = useMemo(() => {
        if (!selectedFile || !details.fullDiff) return null;

        const diffs = details.fullDiff.split('diff --git ');
        const match = diffs.find(chunk => {
            if (!chunk) return false;
            const firstLine = chunk.split('\n')[0];
            return firstLine.includes(selectedFile);
        });

        if (!match) return null;

        return match;
    }, [selectedFile, details.fullDiff]);

    /**
     * Renderiza el contenido de un diff con colores y números de línea.
     * 
     * @description
     * Procesa el texto del diff y lo renderiza con:
     * - Números de línea para código antiguo y nuevo
     * - Colores diferenciados para inserciones (verde) y deleciones (rojo)
     * - Headers de hunks formateados
     * 
     * @param {string} diffText - Texto del diff a renderizar
     * @returns {JSX.Element|null} Elemento JSX del diff renderizado o null si está vacío
     * @private
     */
    const renderDiffContent = (diffText: string) => {
        if (!diffText) return null;

        const lines = diffText.split('\n');
        const renderedLines: JSX.Element[] = [];

        let oldLineNum = 0;
        let newLineNum = 0;
        let inHunk = false;

        lines.forEach((line, idx) => {
            // Skip metadata headers until we find the first hunk
            if (!inHunk) {
                if (line.startsWith('@@')) {
                    inHunk = true;
                } else {
                    return; // Skip git metadata lines (index, ---, +++, etc.)
                }
            }

            // Headers: @@ -old,count +new,count @@
            if (line.startsWith('@@')) {
                const match = line.match(/^@@ -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@/);
                if (match) {
                    oldLineNum = parseInt(match[1], 10);
                    newLineNum = parseInt(match[2], 10);
                }
                // Render hunk header nicely
                const isFirstHunk = renderedLines.length === 0;
                renderedLines.push(
                    <div key={`hunk-${idx}`} className={`flex bg-slate-100 dark:bg-[#112a40] text-slate-500 font-mono text-[10px] py-1 mb-1 ${isFirstHunk ? '' : 'mt-4'}`}>
                        <div className="w-12 text-right select-none opacity-50 px-2">...</div>
                        <div className="w-12 text-right select-none opacity-50 px-2">...</div>
                        <div className="flex-1 px-4 opacity-70">{line}</div>
                    </div>
                );
                return;
            }

            let type: 'context' | 'add' | 'remove' = 'context';
            let bgClass = '';
            let textClass = 'text-slate-600 dark:text-slate-300';
            let currentOld = oldLineNum.toString();
            let currentNew = newLineNum.toString();

            if (line.startsWith('+')) {
                type = 'add';
                bgClass = 'bg-green-100 dark:bg-green-500/10';
                textClass = 'text-green-800 dark:text-green-300';
                currentOld = ''; // No old line number for additions
                oldLineNum--; // Don't increment old
            } else if (line.startsWith('-')) {
                type = 'remove';
                bgClass = 'bg-red-500/10 dark:bg-red-500/10'; // Red light is nice on white too if subtle
                textClass = 'text-red-800 dark:text-red-300';
                currentNew = ''; // No new line number for deletions
                newLineNum--; // Don't increment new
            }

            renderedLines.push(
                <div key={idx} className={`flex ${bgClass} font-mono text-[10px] leading-4 hover:bg-slate-50 dark:hover:bg-white/5`}>
                    {/* Old Line Number */}
                    <div className="w-12 text-right text-slate-400 dark:text-slate-600 select-none px-2 border-r border-slate-200 dark:border-slate-700/50">
                        {currentOld}
                    </div>
                    {/* New Line Number */}
                    <div className="w-12 text-right text-slate-400 dark:text-slate-600 select-none px-2 border-r border-slate-200 dark:border-slate-700/50">
                        {currentNew}
                    </div>
                    {/* Code Content */}
                    <div className={`flex-1 px-4 whitespace-pre-wrap ${textClass}`}>
                        {line.substring(1) || ' '}
                    </div>
                </div>
            );

            if (type !== 'remove') newLineNum++;
            if (type !== 'add') oldLineNum++;
        });

        return <div>{renderedLines}</div>;
    };

    /**
     * Renderiza el contenido de un archivo con estilo de editor.
     * 
     * @description
     * Muestra el contenido del archivo con números de línea,
     * similar a un editor de código.
     * 
     * @param {string} content - Contenido del archivo a renderizar
     * @returns {JSX.Element|null} Elemento JSX del contenido o null si está vacío
     * @private
     */
    const renderFileContent = (content: string) => {
        if (!content) return null;

        const lines = content.split('\n');
        
        return (
            <div>
                {lines.map((line, idx) => (
                    <div key={idx} className="flex font-mono text-[10px] leading-4 hover:bg-slate-50 dark:hover:bg-white/5">
                        {/* Número de línea */}
                        <div className="w-12 text-right text-slate-400 dark:text-slate-600 select-none px-2 border-r border-slate-200 dark:border-slate-700/50">
                            {idx + 1}
                        </div>
                        {/* Contenido */}
                        <div className="flex-1 px-4 whitespace-pre-wrap text-slate-600 dark:text-slate-300">
                            {line || ' '}
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    /**
     * Renderiza recursivamente un nodo del árbol de archivos.
     * 
     * @description
     * Renderiza un nodo y sus hijos de forma recursiva, con
     * soporte para expandir/colapsar carpetas y seleccionar archivos.
     * 
     * @param {TreeNode} node - Nodo a renderizar
     * @param {number} [level=0] - Nivel de anidación (para indentación)
     * @returns {JSX.Element} Elemento JSX del nodo y sus hijos
     * @private
     */
    const renderTreeNode = (node: TreeNode, level: number = 0): JSX.Element => {
        const isExpanded = expandedFolders.has(node.path);
        const hasChildren = node.children && node.children.length > 0;
        const indent = level * 16;

        if (node.type === 'folder') {
            return (
                <div key={node.path}>
                    <div
                        className="flex items-center gap-1 px-3 py-1 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors cursor-pointer text-[11px]"
                        style={{ paddingLeft: `${12 + indent}px` }}
                        onClick={() => toggleFolder(node.path)}
                    >
                        <div className="w-3 h-3 flex items-center justify-center flex-shrink-0">
                            {hasChildren ? (
                                isExpanded ? (
                                    <ChevronDown className="h-3 w-3 text-slate-400" />
                                ) : (
                                    <ChevronRight className="h-3 w-3 text-slate-400" />
                                )
                            ) : (
                                <div className="w-3" />
                            )}
                        </div>
                        {isExpanded ? (
                            <FolderOpen className="h-4 w-4 text-blue-500 dark:text-blue-400 flex-shrink-0" />
                        ) : (
                            <Folder className="h-4 w-4 text-blue-500 dark:text-blue-400 flex-shrink-0" />
                        )}
                        <span className="text-slate-700 dark:text-slate-300 truncate flex-1">{node.name}</span>
                    </div>
                    {isExpanded && hasChildren && (
                        <div>
                            {node.children!.map(child => renderTreeNode(child, level + 1))}
                        </div>
                    )}
                </div>
            );
        } else {
            const FileIcon = getFileIcon(node.path);
            const isSelected = selectedTreeFile === node.path;
            return (
                <div
                    key={node.path}
                    onClick={() => loadFileContent(node.path)}
                    className={cn(
                        "flex items-center gap-1 px-3 py-1 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors text-[11px] cursor-pointer",
                        isSelected 
                            ? "bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white" 
                            : "text-slate-500 dark:text-slate-400"
                    )}
                    style={{ paddingLeft: `${12 + indent}px` }}
                >
                    <div className="w-3 h-3 flex-shrink-0" />
                    <FileIcon className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate flex-1" title={node.path}>{node.name}</span>
                </div>
            );
        }
    };

    return (
        <div className="h-full flex flex-col bg-white dark:bg-[#011627] border-t border-slate-200 dark:border-slate-700 shadow-xl">
            {/* Header */}
            <div className="flex items-start justify-between px-4 py-2 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0b253a]">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                    {/* Avatar a la izquierda */}
                    <div className="w-8 h-8 rounded-sm mt-1 bg-slate-200 dark:bg-slate-700 flex items-center justify-center overflow-hidden flex-shrink-0">
                        <img
                            src={getAvatarUrl({ email: commit.author.email, provider, host })}
                            alt={commit.author.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                console.log('[Avatar Debug] Error al cargar imagen de avatar');
                                console.log('[Avatar Debug] Email del commit:', commit.author.email);
                                console.log('[Avatar Debug] URL que falló:', e.currentTarget.src);
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.nextElementSibling?.classList.remove('hidden');
                            }}
                            onLoad={(e) => {
                                console.log('[Avatar Debug] Avatar cargado exitosamente');
                                console.log('[Avatar Debug] Email del commit:', commit.author.email);
                                console.log('[Avatar Debug] URL cargada:', e.currentTarget.src);
                            }}
                        />
                        <span className="hidden text-[10px] text-slate-600 dark:text-slate-300">{commit.author.name.charAt(0).toUpperCase()}</span>
                    </div>
                    {/* Contenido a la derecha del avatar */}
                    <div className="flex flex-col flex-1 min-w-0">
                        {/* Línea 1: Mensaje del commit y hash como chip */}
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-slate-900 dark:text-white text-xs line-clamp-1">{commit.message}</span>
                            <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-600 flex-shrink-0">
                                {commit.hash.substring(0, 7)}
                            </span>
                        </div>
                        {/* Línea 2: Autor, email, stats */}
                        <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                            <span className="font-medium">{commit.author.name}</span>
                            <span>&lt;{commit.author.email}&gt;</span>
                            <span>•</span>
                            {(() => {
                                // Parsear las estadísticas para colorear inserciones y deleciones
                                const statsText = details.stats;
                                if (!statsText) return <span>{statsText}</span>;

                                // Patrón para encontrar inserciones y deleciones
                                // Ejemplo: "2 files changed, 15 insertions(+), 3 deletions(-)"
                                const insertionMatch = statsText.match(/(\d+)\s*insertions?/i);
                                const deletionMatch = statsText.match(/(\d+)\s*deletions?/i);

                                if (!insertionMatch && !deletionMatch) {
                                    return <span>{statsText}</span>;
                                }

                                const parts: JSX.Element[] = [];
                                let lastIndex = 0;

                                // Encontrar todas las coincidencias y sus posiciones
                                const matches: Array<{ index: number, length: number, type: 'insertion' | 'deletion' }> = [];

                                if (insertionMatch && insertionMatch.index !== undefined) {
                                    matches.push({
                                        index: insertionMatch.index,
                                        length: insertionMatch[0].length,
                                        type: 'insertion'
                                    });
                                }

                                if (deletionMatch && deletionMatch.index !== undefined) {
                                    matches.push({
                                        index: deletionMatch.index,
                                        length: deletionMatch[0].length,
                                        type: 'deletion'
                                    });
                                }

                                // Ordenar por posición
                                matches.sort((a, b) => a.index - b.index);

                                // Construir el JSX con las partes coloreadas
                                matches.forEach((match) => {
                                    // Agregar texto antes de la coincidencia
                                    if (match.index > lastIndex) {
                                        parts.push(
                                            <span key={`text-${lastIndex}`}>
                                                {statsText.substring(lastIndex, match.index)}
                                            </span>
                                        );
                                    }

                                    // Agregar la coincidencia con color
                                    const text = statsText.substring(match.index, match.index + match.length);
                                    parts.push(
                                        <span
                                            key={`${match.type}-${match.index}`}
                                            className={match.type === 'insertion'
                                                ? 'text-green-600 dark:text-green-400 font-medium'
                                                : 'text-red-600 dark:text-red-400 font-medium'
                                            }
                                        >
                                            {text}
                                        </span>
                                    );

                                    lastIndex = match.index + match.length;
                                });

                                // Agregar texto restante
                                if (lastIndex < statsText.length) {
                                    parts.push(
                                        <span key={`text-${lastIndex}`}>
                                            {statsText.substring(lastIndex)}
                                        </span>
                                    );
                                }

                                return <span>{parts}</span>;
                            })()}
                        </div>
                    </div>
                </div>
                <button onClick={onClose} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md text-slate-400 hover:text-slate-900 dark:hover:text-white flex-shrink-0">
                    <X className="h-4 w-4" />
                </button>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Tabs Verticales */}
                <div className="flex flex-col border-r border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-[#0b253a]/50">
                    <button
                        onClick={() => setActiveTab('detail')}
                        className={cn(
                            "px-3 py-3 transition-colors border-r-2 flex items-center justify-center",
                            activeTab === 'detail'
                                ? "text-cyan-600 dark:text-cyan-400 border-cyan-600 dark:border-cyan-400 bg-slate-50 dark:bg-[#0b253a]/30"
                                : "text-slate-500 dark:text-slate-400 border-transparent hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#0b253a]/30"
                        )}
                        title="Detalle del Commit"
                    >
                        <Info className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => setActiveTab('modified')}
                        className={cn(
                            "px-3 py-3 transition-colors border-r-2 flex items-center justify-center",
                            activeTab === 'modified'
                                ? "text-cyan-600 dark:text-cyan-400 border-cyan-600 dark:border-cyan-400 bg-slate-50 dark:bg-[#0b253a]/30"
                                : "text-slate-500 dark:text-slate-400 border-transparent hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#0b253a]/30"
                        )}
                        title={`Archivos Modificados (${details.files.length})`}
                    >
                        <FileDiff className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => setActiveTab('tree')}
                        className={cn(
                            "px-3 py-3 transition-colors border-r-2 flex items-center justify-center",
                            activeTab === 'tree'
                                ? "text-cyan-600 dark:text-cyan-400 border-cyan-600 dark:border-cyan-400 bg-slate-50 dark:bg-[#0b253a]/30"
                                : "text-slate-500 dark:text-slate-400 border-transparent hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#0b253a]/30"
                        )}
                        title={`Árbol del Commit (${treeFiles.length})`}
                    >
                        <GitBranch className="h-4 w-4" />
                    </button>
                </div>

                {/* Contenido según la tab activa */}
                {activeTab === 'detail' ? (
                    /* Tab Detalle: Solo el panel con el detalle del commit */
                    <div className="flex-1 overflow-auto bg-slate-50 dark:bg-[#0b253a]/30 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
                        <div className="p-5">
                            {/* Mensaje del Commit y Hashes en 2 columnas */}
                            <div className="mb-5 pb-4">
                                <div className="grid grid-cols-2 gap-6">
                                    {/* Columna Izquierda: Descripción del Commit, Autor y Fecha */}
                                    <div className="space-y-4">
                                        <div className="pb-4 border-b border-slate-200 dark:border-slate-700">
                                            <div className="text-[10px] font-semibold uppercase text-slate-500 dark:text-slate-400 mb-2 tracking-wider">
                                                Descripción
                                            </div>
                                            <div className="text-sm font-semibold text-slate-900 dark:text-white leading-relaxed">
                                                {commit.message}
                                            </div>
                                        </div>
                                        
                                        <div>
                                            <div className="text-[10px] font-semibold uppercase text-slate-500 dark:text-slate-400 mb-2 tracking-wider">
                                                Autor
                                            </div>
                                            <div className="space-y-1">
                                                <div className="text-xs font-medium text-slate-700 dark:text-slate-300">
                                                    {commit.author.name}
                                                </div>
                                                <div className="text-[10px] text-slate-500 dark:text-slate-400">
                                                    {commit.author.email}
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <div className="text-[10px] font-semibold uppercase text-slate-500 dark:text-slate-400 mb-2 tracking-wider">
                                                Fecha
                                            </div>
                                            <div className="text-xs text-slate-700 dark:text-slate-300">
                                                {new Date(commit.date).toLocaleString('es-ES', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </div>
                                            <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                                                {(() => {
                                                    const now = new Date();
                                                    const commitDate = new Date(commit.date);
                                                    const diffMs = now.getTime() - commitDate.getTime();
                                                    const diffSecs = Math.floor(diffMs / 1000);
                                                    const diffMins = Math.floor(diffSecs / 60);
                                                    const diffHours = Math.floor(diffMins / 60);
                                                    const diffDays = Math.floor(diffHours / 24);
                                                    const diffWeeks = Math.floor(diffDays / 7);
                                                    const diffMonths = Math.floor(diffDays / 30);
                                                    const diffYears = Math.floor(diffDays / 365);

                                                    if (diffYears > 0) return `Hace ${diffYears} año${diffYears > 1 ? 's' : ''}`;
                                                    if (diffMonths > 0) return `Hace ${diffMonths} mes${diffMonths > 1 ? 'es' : ''}`;
                                                    if (diffWeeks > 0) return `Hace ${diffWeeks} semana${diffWeeks > 1 ? 's' : ''}`;
                                                    if (diffDays > 0) return `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
                                                    if (diffHours > 0) return `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
                                                    if (diffMins > 0) return `Hace ${diffMins} minuto${diffMins > 1 ? 's' : ''}`;
                                                    return 'Hace unos segundos';
                                                })()}
                                            </div>
                                        </div>

                                        {details.committer && 
                                         (details.committer.name !== commit.author.name || 
                                          details.committer.email !== commit.author.email) && (
                                            <>
                                                <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                                                    <div className="text-[10px] font-semibold uppercase text-slate-500 dark:text-slate-400 mb-2 tracking-wider">
                                                        Committer
                                                    </div>
                                                    <div className="space-y-1">
                                                        <div className="text-xs font-medium text-slate-700 dark:text-slate-300">
                                                            {details.committer.name}
                                                        </div>
                                                        <div className="text-[10px] text-slate-500 dark:text-slate-400">
                                                            {details.committer.email}
                                                        </div>
                                                    </div>
                                                </div>

                                                {details.committer.date && (
                                                    <div>
                                                        <div className="text-[10px] font-semibold uppercase text-slate-500 dark:text-slate-400 mb-2 tracking-wider">
                                                            Fecha de Commit
                                                        </div>
                                                        <div className="text-xs text-slate-700 dark:text-slate-300">
                                                            {new Date(details.committer.date).toLocaleString('es-ES', {
                                                                year: 'numeric',
                                                                month: 'long',
                                                                day: 'numeric',
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            })}
                                                        </div>
                                                        <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                                                            {(() => {
                                                                const now = new Date();
                                                                const commitDate = new Date(details.committer.date);
                                                                const diffMs = now.getTime() - commitDate.getTime();
                                                                const diffSecs = Math.floor(diffMs / 1000);
                                                                const diffMins = Math.floor(diffSecs / 60);
                                                                const diffHours = Math.floor(diffMins / 60);
                                                                const diffDays = Math.floor(diffHours / 24);
                                                                const diffWeeks = Math.floor(diffDays / 7);
                                                                const diffMonths = Math.floor(diffDays / 30);
                                                                const diffYears = Math.floor(diffDays / 365);

                                                                if (diffYears > 0) return `Hace ${diffYears} año${diffYears > 1 ? 's' : ''}`;
                                                                if (diffMonths > 0) return `Hace ${diffMonths} mes${diffMonths > 1 ? 'es' : ''}`;
                                                                if (diffWeeks > 0) return `Hace ${diffWeeks} semana${diffWeeks > 1 ? 's' : ''}`;
                                                                if (diffDays > 0) return `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
                                                                if (diffHours > 0) return `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
                                                                if (diffMins > 0) return `Hace ${diffMins} minuto${diffMins > 1 ? 's' : ''}`;
                                                                return 'Hace unos segundos';
                                                            })()}
                                                        </div>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                    
                                    {/* Columna Derecha: Hashes y Estadísticas */}
                                    <div className="space-y-4">
                                        <div>
                                            <div className="text-[10px] font-semibold uppercase text-slate-500 dark:text-slate-400 mb-2 tracking-wider">
                                                Hash del Commit
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="font-mono text-[10px] text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-1.5 rounded border border-slate-200 dark:border-slate-700 flex-1 overflow-hidden text-ellipsis whitespace-nowrap" title={commit.hash}>
                                                    {commit.hash}
                                                </div>
                                                <button
                                                    onClick={() => copyToClipboard(commit.hash, 'hash')}
                                                    className="p-1.5 rounded-md bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors flex-shrink-0"
                                                    title="Copiar hash completo"
                                                >
                                                    {copiedHash === commit.hash ? (
                                                        <Check className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                                                    ) : (
                                                        <Copy className="h-3.5 w-3.5" />
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                        {commitParents.length > 0 && (
                                            <div>
                                                <div className="text-[10px] font-semibold uppercase text-slate-500 dark:text-slate-400 mb-2 tracking-wider">
                                                    {commitParents.length === 1 ? 'Commit Padre' : 'Commits Padres'}
                                                </div>
                                                <div className="space-y-3">
                                                    {commitParents.map((parent, idx) => (
                                                        <div key={idx} className="flex items-center gap-2">
                                                            <div className="font-mono text-[10px] text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-1.5 rounded border border-slate-200 dark:border-slate-700 flex-1 overflow-hidden text-ellipsis whitespace-nowrap" title={parent}>
                                                                {parent}
                                                            </div>
                                                            <button
                                                                onClick={() => copyToClipboard(parent, 'parent')}
                                                                className="p-1.5 rounded-md bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors flex-shrink-0"
                                                                title="Copiar hash del padre"
                                                            >
                                                                {copiedParentHash === parent ? (
                                                                    <Check className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                                                                ) : (
                                                                    <Copy className="h-3.5 w-3.5" />
                                                                )}
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        {details.stats && (
                                            <div>
                                                <div className="text-[10px] font-semibold uppercase text-slate-500 dark:text-slate-400 mb-3 tracking-wider">
                                                    Estadísticas
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    {(() => {
                                                        const statsText = details.stats;
                                                        if (!statsText) return null;

                                                        const insertionMatch = statsText.match(/(\d+)\s*insertions?/i);
                                                        const deletionMatch = statsText.match(/(\d+)\s*deletions?/i);
                                                        const filesMatch = statsText.match(/(\d+)\s*files?/i);

                                                        const filesCount = filesMatch ? parseInt(filesMatch[1], 10) : 0;
                                                        const insertionsCount = insertionMatch ? parseInt(insertionMatch[1], 10) : 0;
                                                        const deletionsCount = deletionMatch ? parseInt(deletionMatch[1], 10) : 0;

                                                        // Si no hay matches, mostrar el texto original
                                                        if (!insertionMatch && !deletionMatch && !filesMatch) {
                                                            return (
                                                                <div className="text-xs text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-2 rounded border border-slate-200 dark:border-slate-700">
                                                                    {statsText}
                                                                </div>
                                                            );
                                                        }

                                                        return (
                                                            <>
                                                                {filesCount > 0 && (
                                                                    <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-blue-200 dark:border-blue-800/50 flex-1 min-w-[130px] hover:border-blue-300 dark:hover:border-blue-700/70 transition-colors">
                                                                        <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex-shrink-0">
                                                                            <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                                                        </div>
                                                                        <div className="flex-1 min-w-0">
                                                                            <div className="text-[10px] text-blue-600 dark:text-blue-400 font-medium uppercase tracking-wide mb-0.5">
                                                                                Archivos
                                                                            </div>
                                                                            <div className="text-base font-bold text-blue-700 dark:text-blue-300 leading-tight">
                                                                                {filesCount}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                                {insertionsCount > 0 && (
                                                                    <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-green-200 dark:border-green-800/50 flex-1 min-w-[130px] hover:border-green-300 dark:hover:border-green-700/70 transition-colors">
                                                                        <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/40 flex-shrink-0">
                                                                            <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                                                                        </div>
                                                                        <div className="flex-1 min-w-0">
                                                                            <div className="text-[10px] text-green-600 dark:text-green-400 font-medium uppercase tracking-wide mb-0.5">
                                                                                Inserciones
                                                                            </div>
                                                                            <div className="text-base font-bold text-green-700 dark:text-green-300 leading-tight">
                                                                                +{insertionsCount}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                                {deletionsCount > 0 && (
                                                                    <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-red-200 dark:border-red-800/50 flex-1 min-w-[130px] hover:border-red-300 dark:hover:border-red-700/70 transition-colors">
                                                                        <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/40 flex-shrink-0">
                                                                            <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
                                                                        </div>
                                                                        <div className="flex-1 min-w-0">
                                                                            <div className="text-[10px] text-red-600 dark:text-red-400 font-medium uppercase tracking-wide mb-0.5">
                                                                                Deleciones
                                                                            </div>
                                                                            <div className="text-base font-bold text-red-700 dark:text-red-300 leading-tight">
                                                                                -{deletionsCount}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </>
                                                        );
                                                    })()}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : activeTab === 'modified' ? (
                    /* Tab Archivos Modificados: Lista de archivos + Panel de diff */
                    <>
                        <div className="w-1/3 border-r border-slate-200 dark:border-slate-700 flex flex-col bg-slate-50 dark:bg-[#0b253a]/30">
                    <div className="flex-1 overflow-auto p-0 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
                        {details.loading ? (
                            <div className="text-center p-4 text-slate-500 text-[10px]">Cargando...</div>
                        ) : details.error ? (
                            <div className="text-center p-4 text-red-400 text-[10px]">{details.error}</div>
                        ) : (
                            details.files.map((file, i) => (
                                <div
                                    key={i}
                                    onClick={() => setSelectedFile(file.path)}
                                            className={`flex items-center gap-2 px-3 py-1.5 cursor-pointer text-[11px] transition-colors
                                        ${selectedFile === file.path
                                                    ? 'bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white'
                                                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'
                                        }`}
                                >
                                    {getStatusIcon(file.status)}
                                    <span className="truncate flex-1">{file.path}</span>
                                    <span className="text-[9px] font-mono opacity-50">{file.status}</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
                {/* Diff View */}
                <div className="flex-1 flex flex-col bg-white dark:bg-[#011627] min-w-0">
                            <div className="px-4 py-1 text-xs text-slate-500 border-b border-slate-200 dark:border-slate-700 flex-shrink-0 bg-white dark:bg-[#011627]">
                                {selectedFile || 'Detalle'}
                    </div>
                    <div className="flex-1 overflow-auto scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
                        {details.loading ? (
                            <div className="flex items-center justify-center h-full">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-cyan-500"></div>
                            </div>
                        ) : activeDiff ? (
                            <div className="pb-4">
                                {renderDiffContent(activeDiff)}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2">
                                <FileCode className="h-8 w-8 opacity-20" />
                                <span className="text-xs">Selecciona un archivo para ver los cambios</span>
                            </div>
                        )}
                    </div>
                </div>
                    </>
                ) : (
                    /* Tab Árbol: Árbol de archivos + Panel de contenido */
                    <>
                        <div className="w-1/3 border-r border-slate-200 dark:border-slate-700 flex flex-col bg-slate-50 dark:bg-[#0b253a]/30">
                            <div className="flex-1 overflow-auto scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
                                {loadingTree ? (
                                    <div className="flex flex-col items-center justify-center p-4 text-slate-500 text-[10px]">
                                        <RefreshCw className="h-4 w-4 animate-spin mb-2" />
                                        <span>Cargando árbol...</span>
                                    </div>
                                ) : treeError ? (
                                    <div className="text-center p-4 text-red-400 text-[10px]">{treeError}</div>
                                ) : treeStructure.length === 0 ? (
                                    <div className="text-center p-4 text-slate-500 text-[10px]">No hay archivos</div>
                                ) : (
                                    <div>
                                        {treeStructure.map(node => renderTreeNode(node))}
                                    </div>
                                )}
                            </div>
                        </div>
                        {/* File Content View */}
                        <div className="flex-1 flex flex-col bg-white dark:bg-[#011627] min-w-0">
                            <div className="px-4 py-1 text-xs text-slate-500 border-b border-slate-200 dark:border-slate-700 flex-shrink-0 bg-white dark:bg-[#011627]">
                                {selectedTreeFile || 'Contenido'}
                            </div>
                            <div className="flex-1 overflow-auto scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
                                {loadingFileContent ? (
                                    <div className="flex items-center justify-center h-full">
                                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-cyan-500"></div>
                                    </div>
                                ) : fileContentError ? (
                                    <div className="flex flex-col items-center justify-center h-full text-red-400 gap-2 p-4">
                                        <AlertCircle className="h-8 w-8 opacity-20" />
                                        <span className="text-xs text-center">{fileContentError}</span>
                                    </div>
                                ) : fileContent !== null ? (
                                    <div className="pb-4">
                                        {renderFileContent(fileContent)}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-500 gap-3">
                                        <FileCode className="h-12 w-12 opacity-40" />
                                        <div className="text-center space-y-1">
                                            <div className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                                Sin archivo seleccionado
                                            </div>
                                            <div className="text-xs text-slate-400 dark:text-slate-500">
                                                Haz clic en un archivo del árbol para ver su contenido
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
