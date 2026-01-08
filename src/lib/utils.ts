/**
 * @fileoverview Utilidades para combinar clases CSS.
 * 
 * Este módulo proporciona funciones para combinar y fusionar
 * clases de Tailwind CSS de manera segura.
 */

import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combina y fusiona clases CSS de manera segura.
 * 
 * @description
 * Utiliza clsx para combinar clases y twMerge para resolver
 * conflictos de clases de Tailwind CSS, manteniendo solo
 * la última clase cuando hay conflictos.
 * 
 * @param {...ClassValue} inputs - Clases CSS a combinar (pueden ser strings, arrays, objetos)
 * @returns {string} Cadena de clases combinadas y fusionadas
 * 
 * @example
 * ```tsx
 * const className = cn('px-2 py-1', 'px-4', { 'bg-blue-500': isActive });
 * // Retorna: 'py-1 px-4 bg-blue-500' (px-2 es sobrescrito por px-4)
 * ```
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

