import { useState, useEffect } from "react";
import type { FolderItem } from "@/renderer/types";

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

