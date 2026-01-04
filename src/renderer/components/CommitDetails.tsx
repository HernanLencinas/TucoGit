import React, { useEffect, useState, useMemo } from 'react';
import { FileCode, FilePlus, FileMinus, FileDiff, X } from 'lucide-react';
import { getAvatarUrl } from '@/renderer/utils/avatar';

interface CommitDetailsProps {
    commit: {
        hash: string;
        message: string;
        author: { name: string; email: string };
        date: string;
    };
    repoPath: string;
    onClose: () => void;
    provider?: string;
    host?: string;
}

interface FileChange {
    path: string;
    status: string; // M, A, D, R, etc.
}

interface DetailsState {
    files: FileChange[];
    stats: string;
    fullDiff: string;
    loading: boolean;
    error: string | null;
}

export const CommitDetails: React.FC<CommitDetailsProps> = ({ commit, repoPath, onClose, provider, host }) => {
    const [details, setDetails] = useState<DetailsState>({
        files: [],
        stats: '',
        fullDiff: '',
        loading: true,
        error: null
    });

    const [selectedFile, setSelectedFile] = useState<string | null>(null);

    useEffect(() => {
        const fetchDetails = async () => {
            setDetails(prev => ({ ...prev, loading: true, error: null }));
            setSelectedFile(null); // Reset selection on new commit
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
                        error: null
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

    const getStatusIcon = (status: string) => {
        switch (status.charAt(0).toUpperCase()) {
            case 'A': return <FilePlus className="h-4 w-4 text-green-400" />;
            case 'D': return <FileMinus className="h-4 w-4 text-red-500" />;
            case 'M': return <FileCode className="h-4 w-4 text-yellow-400" />;
            default: return <FileDiff className="h-4 w-4 text-slate-400" />;
        }
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
                {/* File List */}
                <div className="w-1/3 border-r border-slate-200 dark:border-slate-700 flex flex-col bg-slate-50 dark:bg-[#0b253a]/30">
                    <div className="px-3 py-2 text-[10px] font-semibold text-slate-500 uppercase flex-shrink-0 bg-slate-100 dark:bg-[#0b253a]/50">
                        Archivos Modificados ({details.files.length})
                    </div>
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
                                    className={`flex items-center gap-2 px-3 py-1.5 cursor-pointer text-[11px] border-l-2 transition-colors
                                        ${selectedFile === file.path
                                            ? 'bg-slate-200 dark:bg-slate-800 border-cyan-500 text-slate-900 dark:text-white'
                                            : 'border-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'
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
                    <div className="px-4 py-1 text-xs font-semibold text-slate-500 uppercase border-b border-slate-200 dark:border-slate-700 flex-shrink-0 bg-white dark:bg-[#011627]">
                        {selectedFile ? `Diff: ${selectedFile}` : 'Detalle'}
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
            </div>
        </div>
    );
};
