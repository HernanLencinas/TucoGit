/**
 * @fileoverview Utilidades para formatear fechas de commits.
 */

/**
 * Formatea una fecha de commit en formato legible.
 * 
 * @description
 * Convierte una cadena de fecha ISO a un formato legible en español.
 * El formato resultante es: DD/MM/YYYY HH:MM:SS
 * Si la fecha no es válida, retorna la cadena original sin modificar.
 * 
 * @param {string} dateString - Cadena de fecha en formato ISO o compatible
 * @returns {string} Fecha formateada como "DD/MM/YYYY HH:MM:SS" o la cadena original si es inválida
 * 
 * @example
 * ```tsx
 * const formatted = formatCommitDate('2024-01-15T10:30:00Z');
 * // Retorna: '15/01/2024 10:30:00'
 * ```
 */
export const formatCommitDate = (dateString: string) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    // Usamos el formato local para la hora ya que el usuario indicó que "la hora está bien"
    const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    return `${day}/${month}/${year} ${time}`;
};
