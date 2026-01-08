import { useEffect } from "react";
import type { TabType, ConfigTabType } from "@/renderer/types";

/**
 * Propiedades para el hook useKeyboardShortcuts.
 * 
 * @interface UseKeyboardShortcutsProps
 * @property {Function} setActiveTab - Función para cambiar la pestaña activa
 * @property {Function} [setConfigTabActiva] - Función opcional para cambiar la pestaña de configuración activa
 */
interface UseKeyboardShortcutsProps {
  setActiveTab: (tab: TabType) => void;
  setConfigTabActiva?: (tab: ConfigTabType) => void;
}

/**
 * Hook personalizado para gestionar atajos de teclado de la aplicación.
 * 
 * @description
 * Configura listeners de eventos de teclado para navegar entre pestañas
 * usando combinaciones de teclas. Los atajos disponibles son:
 * - Cmd/Ctrl + 1: Ir a Inicio
 * - Cmd/Ctrl + 2: Ir a Repositorios
 * - Cmd/Ctrl + 3: Ir a Conexiones
 * - Cmd/Ctrl + 4: Ir a Configuración
 * - Cmd/Ctrl + N: Ir a Configuración > General
 * 
 * @param {UseKeyboardShortcutsProps} props - Propiedades del hook
 * @param {Function} props.setActiveTab - Función para cambiar la pestaña activa
 * @param {Function} [props.setConfigTabActiva] - Función opcional para cambiar la pestaña de configuración
 * 
 * @example
 * ```tsx
 * useKeyboardShortcuts({
 *   setActiveTab: (tab) => setActiveTab(tab),
 *   setConfigTabActiva: (tab) => setConfigTabActiva(tab)
 * });
 * ```
 */
export const useKeyboardShortcuts = ({ setActiveTab, setConfigTabActiva }: UseKeyboardShortcutsProps) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isModifierPressed = e.metaKey || e.ctrlKey;
      
      if (!isModifierPressed) return;
      e.preventDefault();

      switch (e.key) {
        case '1':
          setActiveTab('inicio');
          break;
        case '2':
          setActiveTab('repositorios');
          break;
        case '3':
          setActiveTab('conexiones');
          break;
        case '4':
          setActiveTab('configuracion');
          break;
        case 'n':
        case 'N':
          if (setConfigTabActiva) {
            setActiveTab('configuracion');
            setConfigTabActiva('general');
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [setActiveTab, setConfigTabActiva]);
};

