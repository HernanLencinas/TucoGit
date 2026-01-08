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
 * Agrega una nueva carpeta a la estructura existente.
 * 
 * @description
 * Busca la carpeta padre por su ID y agrega la nueva carpeta
 * a su lista de hijos. Retorna una nueva estructura inmutada.
 * 
 * @param {FolderItem[]} items - Estructura actual de carpetas
 * @param {string} carpetaPadreId - ID de la carpeta padre donde se agregará la nueva carpeta
 * @param {FolderItem} nuevaCarpeta - Nueva carpeta a agregar
 * @returns {FolderItem[]} Nueva estructura con la carpeta agregada
 * 
 * @example
 * ```tsx
 * const nuevaEstructura = actualizarEstructuraAgregar(
 *   estructuraCarpetas,
 *   'carpeta-padre-id',
 *   { id: 'nueva-carpeta', nombre: 'Nueva Carpeta', tipo: 'coleccion' }
 * );
 * ```
 */
export const actualizarEstructuraAgregar = (
  items: FolderItem[],
  carpetaPadreId: string,
  nuevaCarpeta: FolderItem
): FolderItem[] => {
  return items.map((item) => {
    if (item.id === carpetaPadreId) {
      return {
        ...item,
        hijos: [...(item.hijos || []), nuevaCarpeta],
      };
    }
    if (item.hijos) {
      return {
        ...item,
        hijos: actualizarEstructuraAgregar(item.hijos, carpetaPadreId, nuevaCarpeta),
      };
    }
    return item;
  });
};

/**
 * Edita una carpeta existente en la estructura.
 * 
 * @description
 * Busca la carpeta por su ID y actualiza su nombre y descripción.
 * Retorna una nueva estructura inmutada con los cambios aplicados.
 * 
 * @param {FolderItem[]} items - Estructura actual de carpetas
 * @param {string} coleccionId - ID de la carpeta a editar
 * @param {string} nombre - Nuevo nombre para la carpeta
 * @param {string} [descripcion] - Nueva descripción opcional para la carpeta
 * @returns {FolderItem[]} Nueva estructura con la carpeta editada
 * 
 * @example
 * ```tsx
 * const nuevaEstructura = actualizarEstructuraEditar(
 *   estructuraCarpetas,
 *   'carpeta-id',
 *   'Nuevo Nombre',
 *   'Nueva descripción'
 * );
 * ```
 */
export const actualizarEstructuraEditar = (
  items: FolderItem[],
  coleccionId: string,
  nombre: string,
  descripcion?: string
): FolderItem[] => {
  return items.map((item) => {
    if (item.id === coleccionId) {
      return {
        ...item,
        nombre: nombre.trim(),
        descripcion: descripcion?.trim() || undefined,
      };
    }
    if (item.hijos) {
      return {
        ...item,
        hijos: actualizarEstructuraEditar(item.hijos, coleccionId, nombre, descripcion),
      };
    }
    return item;
  });
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

