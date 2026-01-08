/**
 * @fileoverview Componente para visualizar el grafo de commits de Git.
 * 
 * Este módulo proporciona un componente React que renderiza un grafo
 * visual de commits con sus relaciones padre-hijo, colores por rama
 * y navegación interactiva.
 */

import React, { useMemo } from 'react';
import { formatCommitDate } from '@/renderer/utils/date';

/**
 * Interfaz que representa un commit.
 * 
 * @interface Commit
 * @property {string} hash - Hash único del commit
 * @property {string[]} parents - Array de hashes de commits padres
 * @property {Object} author - Información del autor
 * @property {string} author.name - Nombre del autor
 * @property {string} author.email - Email del autor
 * @property {string} date - Fecha del commit en formato ISO
 * @property {string} message - Mensaje del commit
 * @property {string} refs - Referencias (branches, tags) asociadas
 */
interface Commit {
    hash: string;
    parents: string[];
    author: {
        name: string;
        email: string;
    };
    date: string;
    message: string;
    refs: string;
}

/**
 * Propiedades del componente CommitGraph.
 * 
 * @interface CommitGraphProps
 * @property {Commit[]} commits - Array de commits a visualizar
 * @property {Function} [onCommitClick] - Callback opcional cuando se hace clic en un commit
 * @property {string} [selectedHash] - Hash del commit seleccionado
 */
interface CommitGraphProps {
    commits: Commit[];
    onCommitClick?: (commit: Commit) => void;
    selectedHash?: string;
}

/**
 * Colores disponibles para las ramas del grafo.
 * 
 * @const {string[]} COLORS
 */
const COLORS = [
    '#00d8ff', // cyan
    '#ff00ff', // magenta
    '#42b983', // green
    '#ffeb3b', // yellow
    '#ff5722', // orange
    '#7b1fa2', // purple
];

/**
 * Calcula el layout del grafo de commits.
 * 
 * @description
 * Asigna posiciones (x, y) y colores a cada commit basándose en
 * sus relaciones padre-hijo. Los commits se organizan en canales
 * (columnas) y se generan las conexiones entre ellos.
 * 
 * @param {Commit[]} commits - Array de commits a procesar
 * @returns {Object} Objeto con el layout calculado
 * @returns {Array} returns.nodes - Nodos procesados con coordenadas y colores
 * @returns {Array} returns.edges - Conexiones entre commits
 * @returns {number} returns.width - Ancho total del grafo en canales
 * 
 * @private
 */
const calculateGraph = (commits: Commit[]) => {
    // Current "active" parent hashes for each channel/column
    // null means the channel is empty/free
    const channels: (string | null)[] = [];

    // Assign colors to channels to ensure stability
    // We can just use the index % COLORS.length, but tracking it might be better

    // Store nodes with their coordinates
    const processedNodes: any[] = [];
    const edges: any[] = [];

    // Map to quickly check if a parent is already assigned to a future node?
    // Not strictly needed if we scan "channels".

    commits.forEach((commit, index) => {
        let channelIndex = -1;

        // 1. Check if the commit is required by any existing channel
        channelIndex = channels.indexOf(commit.hash);

        // 2. If not found, it's a new tip or a disjoint segment
        if (channelIndex === -1) {
            // Find first empty channel
            let free = channels.indexOf(null);
            if (free === -1) {
                free = channels.length;
                channels.push(null);
            }
            channelIndex = free;
        }

        // We "consume" this channel slot for the current commit
        // It will be re-filled by one of the parents below
        channels[channelIndex] = null;

        // 3. Process parents to reserve channels for the next row
        // We prioritize the FIRST parent to stay in the SAME channel (straight line)
        if (commit.parents.length > 0) {
            const firstParent = commit.parents[0];
            const otherParents = commit.parents.slice(1);

            // Assign first parent to current channel
            if (!channels.includes(firstParent)) {
                channels[channelIndex] = firstParent;
            } else {
                // First parent is already in another channel (merge base).
                // We don't need to reserve the current channel for it.
                // The current channel effectively "ends" here or splits?
                // Actually, if we merge INTO an existing branch, our line goes to it.
                // This channel becomes free/null (already set to null above).
            }

            // Assign other parents to new/free channels
            otherParents.forEach(parent => {
                if (channels.includes(parent)) return; // Already tracked

                let free = channels.indexOf(null);
                if (free === -1) {
                    free = channels.length;
                    channels.push(null);
                }
                channels[free] = parent;
            });
        }

        // Add node
        processedNodes.push({
            ...commit,
            x: channelIndex,
            y: index,
            color: COLORS[channelIndex % COLORS.length]
        });
    });

    // 4. Generate edges
    // We do this after all nodes are positioned so we know exact coordinates
    processedNodes.forEach(node => {
        node.parents.forEach((parentHash: string, pIndex: number) => {
            const parentNode = processedNodes.find((n: any) => n.hash === parentHash);

            if (parentNode) {
                // Determine curve control points based on relative positions
                const isFirstParent = pIndex === 0;

                // Color: 
                // - If first parent, it usually keeps the "branch color".
                // - If merge (secondary parent), using the parent's color often looks better (incoming branch).
                // - GitKraken/GitGraph usually color the edge same as the node it COMES FROM (the child) 
                //   unless it's a merge into another main branch?
                // Let's stick to: Primary parent edge = node color. Secondary = parent color (merging in).

                const edgeColor = isFirstParent ? node.color : parentNode.color;

                edges.push({
                    fromX: node.x,
                    fromY: node.y,
                    toX: parentNode.x,
                    toY: parentNode.y,
                    color: edgeColor,
                    isMerge: !isFirstParent
                });
            }
        });
    });

    return { nodes: processedNodes, edges, width: channels.length };
};


/**
 * Componente para visualizar el grafo de commits de Git.
 * 
 * @description
 * Renderiza un grafo visual interactivo de commits con:
 * - Visualización de ramas con colores distintivos
 * - Conexiones curvas entre commits padre e hijo
 * - Lista de commits con información detallada
 * - Soporte para selección y navegación
 * 
 * @param {CommitGraphProps} props - Propiedades del componente
 * @param {Commit[]} props.commits - Array de commits a visualizar
 * @param {Function} [props.onCommitClick] - Callback cuando se hace clic en un commit
 * @param {string} [props.selectedHash] - Hash del commit seleccionado
 * @returns {JSX.Element} Componente del grafo de commits
 * 
 * @example
 * ```tsx
 * <CommitGraph
 *   commits={commits}
 *   onCommitClick={(commit) => console.log(commit)}
 *   selectedHash="abc123"
 * />
 * ```
 */
export const CommitGraph: React.FC<CommitGraphProps> = ({ commits, onCommitClick, selectedHash }) => {
    const { nodes, edges, width } = useMemo(() => calculateGraph(commits), [commits]);

    const ROW_HEIGHT = 44;
    const COL_WIDTH = 18;
    const X_OFFSET = 24;
    const Y_OFFSET = 22; // Center of the row

    return (
        <div className="flex bg-white dark:bg-[#011627] text-slate-700 dark:text-gray-300 min-h-full font-sans tracking-wide">
            {/* Graph Area */}
            <div className="relative flex-shrink-0" style={{ width: Math.max(100, width * COL_WIDTH + 40) }}>
                <svg className="absolute top-0 left-0 w-full h-full pointer-events-none" style={{ height: nodes.length * ROW_HEIGHT }}>
                    {edges.map((edge, i) => {
                        const x1 = X_OFFSET + edge.fromX * COL_WIDTH;
                        const y1 = Y_OFFSET + edge.fromY * ROW_HEIGHT;
                        const x2 = X_OFFSET + edge.toX * COL_WIDTH;
                        const y2 = Y_OFFSET + edge.toY * ROW_HEIGHT;

                        let path = '';

                        if (x1 === x2) {
                            // Straight vertical line
                            path = `M ${x1} ${y1} L ${x2} ${y2}`;
                        } else {
                            // Orthogonal line with curved corners
                            // Standard graph flow is top to bottom (y2 > y1)
                            // We construct a path that goes down, turns horizontal, then turns down again

                            const radius = 8;
                            // The horizontal segment will be halfway between the rows, 
                            // but usually it looks better just above the target node or just below the source node.
                            // Let's settle on a midpoint for symmetry.
                            const midY = y2 - ROW_HEIGHT / 2;

                            // Determine direction for proper curve sweep
                            const xDir = x2 > x1 ? 1 : -1;

                            // Check if columns are close enough that we need to adjust radius?
                            // COL_WIDTH is 24, radius 10. 2*10 = 20 < 24. So even adjacent columns are fine.

                            path = `
                                M ${x1} ${y1}
                                L ${x1} ${midY - radius}
                                Q ${x1} ${midY}, ${x1 + xDir * radius} ${midY}
                                L ${x2 - xDir * radius} ${midY}
                                Q ${x2} ${midY}, ${x2} ${midY + radius}
                                L ${x2} ${y2}
                            `;
                        }

                        return (
                            <path
                                key={`edge-${i}`}
                                d={path}
                                stroke={edge.color}
                                strokeWidth="1.5"
                                fill="none"
                                strokeOpacity="0.6"
                                className="drop-shadow-[0_0_2px_rgba(0,0,0,0.3)] dark:drop-shadow-[0_0_2px_rgba(255,255,255,0.3)] transition-all duration-300 ease-in-out"
                            />
                        );
                    })}
                    {nodes.map((node) => {
                        const cx = X_OFFSET + node.x * COL_WIDTH;
                        const cy = Y_OFFSET + node.y * ROW_HEIGHT;
                        const isSelected = node.hash === selectedHash;
                        return (
                            <g
                                key={`node-${node.hash}`}
                                style={{ transformOrigin: `${cx}px ${cy}px` }}
                                className={`transition-transform duration-200 cursor-pointer group ${isSelected ? 'scale-125' : 'hover:scale-125'}`}
                                onClick={() => onCommitClick?.(node)}
                            >
                                {/* Selection Highlight for Node */}
                                {isSelected && (
                                    <circle
                                        cx={cx}
                                        cy={cy}
                                        r="12"
                                        fill={node.color}
                                        className="opacity-20 animate-pulse"
                                    />
                                )}
                                {/* Outer Ring */}
                                <circle
                                    cx={cx}
                                    cy={cy}
                                    r="6"
                                    fill="none"
                                    stroke={node.color}
                                    strokeWidth={isSelected ? "2" : "1"}
                                    className={isSelected ? "opacity-100" : "opacity-50 group-hover:opacity-100 transition-opacity"}
                                />
                                {/* Inner Circle */}
                                <circle
                                    cx={cx}
                                    cy={cy}
                                    r="3.5"
                                    fill={node.color}
                                    strokeWidth="1.5"
                                    className="stroke-white dark:stroke-[#011627]"
                                />
                            </g>
                        );
                    })}
                </svg>
            </div>

            {/* Commit List */}
            <div className="flex-1 min-w-0">
                {nodes.map((node) => (
                    <div
                        key={node.hash}
                        className={`flex items-center hover:bg-slate-100 dark:hover:bg-[#1d3b53] transition-colors cursor-pointer border-b border-slate-200 dark:border-[#1d3b53]/30 ${node.hash === selectedHash
                            ? 'bg-cyan-50/50 dark:bg-cyan-950/30'
                            : ''
                            }`}
                        style={{ height: ROW_HEIGHT }}
                        onClick={() => onCommitClick?.(node)}
                    >
                        <div className="flex-1 min-w-0 px-4 flex flex-col justify-center">
                            <div className="flex items-center justify-between gap-4 mb-0.5">
                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                    <span className="text-xs font-medium text-slate-900 dark:text-white truncate">
                                        {node.message}
                                    </span>
                                    {node.refs && (
                                        <div className="flex gap-1 flex-nowrap flex-shrink-0">
                                            {node.refs.split(',').map((ref: string) => {
                                                const cleanRef = ref.trim().replace('origin/', '');
                                                const isTag = ref.includes('tag:');
                                                const displayRef = cleanRef.replace('tag: ', '');

                                                return (
                                                    <span
                                                        key={ref}
                                                        className={`text-[9px] px-1.5 py-0.5 rounded-sm font-bold border whitespace-nowrap ${isTag
                                                            ? 'border-slate-300 bg-slate-200 text-slate-600 dark:border-gray-500 dark:text-gray-400 dark:bg-gray-800/50'
                                                            : 'border-green-500/50 text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/20'
                                                            }`}
                                                    >
                                                        {displayRef}
                                                    </span>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                                <span className="font-mono text-[9px] opacity-40 flex-shrink-0 mr-4">{node.hash.substring(0, 7)}</span>
                            </div>
                            <div className="flex items-center gap-3 text-[10px] text-slate-500">
                                <span className="truncate max-w-[150px]">{node.author.name}</span>
                                <span>{formatCommitDate(node.date)}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
