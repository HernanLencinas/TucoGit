import { useState, useEffect } from "react";

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

  const toggleTheme = async () => {
    const nuevoTema = !isDark;
    setIsDark(nuevoTema);
    
    // Guardar tema en el archivo de configuración
    try {
      if (window.electronAPI?.writeConfig) {
        await window.electronAPI.writeConfig({ tema: nuevoTema ? 'dark' : 'light' });
      }
    } catch (error) {
      console.error('Error al guardar tema:', error);
    }
  };

  return { isDark, setIsDark, toggleTheme };
};

