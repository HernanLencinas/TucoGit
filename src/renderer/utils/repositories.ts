import type { FolderItem } from "@/renderer/types";

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

