import { useState, useEffect } from "react";
import type { FolderItem } from "@/renderer/types";

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
        console.error('Error al inicializar configuración:', error);
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

