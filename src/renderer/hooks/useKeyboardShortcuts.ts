import { useEffect } from "react";
import type { TabType, ConfigTabType } from "@/renderer/types";

interface UseKeyboardShortcutsProps {
  setActiveTab: (tab: TabType) => void;
  setConfigTabActiva?: (tab: ConfigTabType) => void;
}

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

