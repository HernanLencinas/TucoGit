import { useState, useEffect } from "react";
import type { FolderItem } from "@/renderer/types";

/**
 * Hook personalizado para gestionar la configuración de la aplicación.
 * 
 * @description
 * Este hook maneja la ruta de configuración y la última actualización.
 * Inicializa automáticamente la configuración al montar el componente,
 * obteniendo la ruta por defecto de documentos y creando la estructura
 * necesaria si no existe.
 * 
 * @returns {Object} Objeto con el estado y funciones de configuración
 * @returns {string} returns.rutaConfiguracion - Ruta actual de configuración
 * @returns {Function} returns.setRutaConfiguracion - Función para actualizar la ruta de configuración
 * @returns {string} returns.ultimaActualizacion - Fecha y hora de la última actualización en formato local
 * @returns {Function} returns.setUltimaActualizacion - Función para actualizar la fecha de última actualización
 * 
 * @example
 * ```tsx
 * const { rutaConfiguracion, setRutaConfiguracion, ultimaActualizacion } = useConfig();
 * ```
 */
export const useConfig = () => {
  const [rutaConfiguracion, setRutaConfiguracion] = useState<string>("");
  const [ultimaActualizacion, setUltimaActualizacion] = useState<string>(
    new Date().toLocaleString('es-ES', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit',
      hour12: true 
    })
  );

  // Obtener ruta por defecto de documentos e inicializar configuración
  useEffect(() => {
    const inicializarConfiguracion = async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      try {
        if (window.electronAPI?.getDocumentsPath) {
          const documentsPath = await window.electronAPI.getDocumentsPath();
          const rutaPorDefecto = `${documentsPath}/Tuco`;
          
          if (window.electronAPI?.initializeConfig) {
            const resultado = await window.electronAPI.initializeConfig(documentsPath);
            
            if (resultado.success) {
              setRutaConfiguracion(resultado.ruta || rutaPorDefecto);
              
              if (resultado.ultimaActualizacion) {
                const fecha = new Date(resultado.ultimaActualizacion);
                setUltimaActualizacion(fecha.toLocaleString('es-ES', { 
                  day: '2-digit', 
                  month: '2-digit', 
                  year: 'numeric', 
                  hour: '2-digit', 
                  minute: '2-digit', 
                  second: '2-digit',
                  hour12: true 
                }));
              }
            }
          }
        }
      } catch (error) {
        // Error al inicializar configuración
      }
    };
    
    inicializarConfiguracion();
  }, []);

  return {
    rutaConfiguracion,
    setRutaConfiguracion,
    ultimaActualizacion,
    setUltimaActualizacion
  };
};

