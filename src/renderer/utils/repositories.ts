import type { FolderItem } from "@/renderer/types";

/**
 * @fileoverview Utilidades para gestionar la estructura de repositorios y carpetas.
 * 
 * Este módulo proporciona funciones para navegar, modificar y gestionar
 * la estructura jerárquica de carpetas y repositorios.
 */

/**
 * Obtiene la carpeta actual basándose en la ruta de navegación.
 * 
 * @description
 * Navega a través de la estructura de carpetas siguiendo la ruta
 * especificada y retorna la carpeta correspondiente. Si la ruta
 * no es válida o no se encuentra, retorna null.
 * 
 * @param {FolderItem[]} estructuraCarpetas - Estructura completa de carpetas
 * @param {string[]} rutaActual - Array de IDs que representa la ruta de navegación
 * @returns {FolderItem | null} Carpeta actual o null si no se encuentra
 * 
 * @example
 * ```tsx
 * const carpeta = obtenerCarpetaActual(estructuraCarpetas, ['root', 'carpeta1', 'subcarpeta']);
 * ```
 */
export const obtenerCarpetaActual = (
  estructuraCarpetas: FolderItem[],
  rutaActual: string[]
): FolderItem | null => {
  let actual: FolderItem | undefined = estructuraCarpetas[0];
  for (let i = 1; i < rutaActual.length; i++) {
    const idBuscado = rutaActual[i];
    actual = actual?.hijos?.find((hijo) => hijo.id === idBuscado);
    if (!actual) return null;
  }
  return actual || null;
};

/**
 * Obtiene la ruta completa de navegación con nombres y IDs.
 * 
 * @description
 * Construye un array con los nombres e IDs de todas las carpetas
 * en la ruta de navegación actual, útil para mostrar breadcrumbs
 * o la ruta completa en la interfaz.
 * 
 * @param {FolderItem[]} estructuraCarpetas - Estructura completa de carpetas
 * @param {string[]} rutaActual - Array de IDs que representa la ruta de navegación
 * @returns {Array<{nombre: string, id: string}>} Array de objetos con nombre e ID de cada nivel
 * 
 * @example
 * ```tsx
 * const ruta = obtenerRutaCompleta(estructuraCarpetas, ['root', 'carpeta1']);
 * // Retorna: [{ nombre: 'Mis repositorios', id: 'root' }, { nombre: 'Carpeta 1', id: 'carpeta1' }]
 * ```
 */
export const obtenerRutaCompleta = (
  estructuraCarpetas: FolderItem[],
  rutaActual: string[]
): Array<{ nombre: string; id: string }> => {
  const ruta: Array<{ nombre: string; id: string }> = [];
  let actual: FolderItem | undefined = estructuraCarpetas[0];
  ruta.push({ nombre: actual?.nombre || "Mis repositorios", id: "root" });
  
  for (let i = 1; i < rutaActual.length; i++) {
    const idBuscado = rutaActual[i];
    actual = actual?.hijos?.find((hijo) => hijo.id === idBuscado);
    if (actual) {
      ruta.push({ nombre: actual.nombre, id: actual.id });
    }
  }
  return ruta;
};

/**
 * Elimina una carpeta de la estructura.
 * 
 * @description
 * Busca y elimina la carpeta con el ID especificado, incluyendo
 * todas sus ocurrencias en la estructura jerárquica. También
 * elimina recursivamente la carpeta de los hijos de otras carpetas.
 * 
 * @param {FolderItem[]} items - Estructura actual de carpetas
 * @param {string} coleccionId - ID de la carpeta a eliminar
 * @returns {FolderItem[]} Nueva estructura sin la carpeta eliminada
 * 
 * @example
 * ```tsx
 * const nuevaEstructura = eliminarDeEstructura(estructuraCarpetas, 'carpeta-id');
 * ```
 */
export const eliminarDeEstructura = (
  items: FolderItem[],
  coleccionId: string
): FolderItem[] => {
  return items
    .filter((item) => item.id !== coleccionId)
    .map((item) => {
      if (item.hijos && item.hijos.length > 0) {
        return {
          ...item,
          hijos: eliminarDeEstructura(item.hijos, coleccionId),
        };
      }
      return item;
    });
};

