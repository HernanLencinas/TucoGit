import { useState, useEffect } from "react";
import type { FolderItem } from "@/renderer/types";

/**
 * Hook personalizado para gestionar la estructura de repositorios.
 * 
 * @description
 * Este hook maneja la estructura jerárquica de carpetas y repositorios,
 * incluyendo la carga inicial desde la configuración y la persistencia
 * de cambios. Mantiene el estado de la ruta actual de navegación y
 * proporciona funciones para actualizar la estructura.
 * 
 * @returns {Object} Objeto con el estado y funciones de repositorios
 * @returns {FolderItem[]} returns.estructuraCarpetas - Estructura jerárquica de carpetas y repositorios
 * @returns {Function} returns.setEstructuraCarpetas - Función para actualizar la estructura de carpetas
 * @returns {string[]} returns.rutaActual - Array de IDs que representa la ruta de navegación actual
 * @returns {Function} returns.setRutaActual - Función para actualizar la ruta de navegación
 * @returns {Function} returns.guardarRepositorios - Función asíncrona para guardar la estructura en la configuración
 * 
 * @example
 * ```tsx
 * const {
 *   estructuraCarpetas,
 *   setEstructuraCarpetas,
 *   rutaActual,
 *   setRutaActual,
 *   guardarRepositorios
 * } = useRepositories();
 * ```
 */
export const useRepositories = () => {
  const [estructuraCarpetas, setEstructuraCarpetas] = useState<FolderItem[]>([
    {
      id: "root",
      nombre: "Mis repositorios",
      tipo: "coleccion",
      hijos: [],
    },
  ]);
  const [rutaActual, setRutaActual] = useState<string[]>(["root"]);

  // Cargar estructura de repositorios desde configuración
  useEffect(() => {
    const cargarRepositorios = async () => {
      try {
        if (window.electronAPI?.getDocumentsPath && window.electronAPI?.initializeConfig) {
          const documentsPath = await window.electronAPI.getDocumentsPath();
          const resultado = await window.electronAPI.initializeConfig(documentsPath);
          
          if (resultado.success && resultado.repositorios && resultado.repositorios.length > 0) {
            setEstructuraCarpetas(resultado.repositorios);
          }
        }
      } catch (error) {
        console.error('Error al cargar repositorios:', error);
      }
    };
    
    cargarRepositorios();
  }, []);

  /**
   * Guarda la estructura de repositorios en el archivo de configuración.
   * 
   * @param {FolderItem[]} nuevaEstructura - Nueva estructura de carpetas y repositorios a guardar
   * @returns {Promise<void>} Promesa que se resuelve cuando se completa el guardado
   */
  const guardarRepositorios = async (nuevaEstructura: FolderItem[]) => {
    try {
      if (window.electronAPI?.writeConfig) {
        await window.electronAPI.writeConfig({ repositorios: nuevaEstructura });
      }
    } catch (error) {
      console.error('Error al guardar repositorios:', error);
    }
  };

  return {
    estructuraCarpetas,
    setEstructuraCarpetas,
    rutaActual,
    setRutaActual,
    guardarRepositorios
  };
};

