import { useState, useEffect } from "react";

/**
 * Hook personalizado para gestionar el tema de la aplicación (claro/oscuro).
 * 
 * @description
 * Este hook maneja el estado del tema y aplica los cambios al documento HTML.
 * También persiste la preferencia del tema en el archivo de configuración
 * para mantenerla entre sesiones.
 * 
 * @returns {Object} Objeto con el estado y funciones del tema
 * @returns {boolean} returns.isDark - Indica si el tema oscuro está activo
 * @returns {Function} returns.setIsDark - Función para establecer el estado del tema
 * @returns {Function} returns.toggleTheme - Función para alternar entre tema claro y oscuro
 * 
 * @example
 * ```tsx
 * const { isDark, toggleTheme } = useTheme();
 * 
 * return (
 *   <button onClick={toggleTheme}>
 *     {isDark ? 'Modo Claro' : 'Modo Oscuro'}
 *   </button>
 * );
 * ```
 */
export const useTheme = () => {
  const [isDark, setIsDark] = useState(false);

  // Aplicar tema al documento
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [isDark]);

  /**
   * Alterna entre el tema claro y oscuro.
   * 
   * @description
   * Cambia el estado del tema y guarda la preferencia en la configuración.
   * 
   * @returns {Promise<void>} Promesa que se resuelve cuando se completa el cambio
   */
  const toggleTheme = async () => {
    const nuevoTema = !isDark;
    setIsDark(nuevoTema);
    
    // Guardar tema en el archivo de configuración
    try {
      if (window.electronAPI?.writeConfig) {
        await window.electronAPI.writeConfig({ tema: nuevoTema ? 'dark' : 'light' });
      }
    } catch (error) {
      // Error al guardar tema
    }
  };

  return { isDark, setIsDark, toggleTheme };
};

