import { Button } from "@/components/ui/button";
import { Home, FolderGit2, Settings, Sun, Moon } from "lucide-react";
import type { TabType } from "@/renderer/types";

interface FooterProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  isDark: boolean;
  toggleTheme: () => void;
}

export const Footer = ({ activeTab, setActiveTab, isDark, toggleTheme }: FooterProps) => {
  return (
    <footer className="border-t bg-muted/50 py-3 px-6 flex-shrink-0">
      <div className="w-full">
        <div className="flex items-center justify-center gap-2">
          {/* Tabs */}
          <div className="flex gap-1.5">
            <Button
              variant={activeTab === "inicio" ? "default" : "ghost"}
              onClick={() => setActiveTab("inicio")}
              size="sm"
              className="h-8 px-3 text-xs"
            >
              <Home className="mr-1.5 h-3.5 w-3.5" />
              Inicio
            </Button>
            <Button
              variant={activeTab === "repositorios" ? "default" : "ghost"}
              onClick={() => setActiveTab("repositorios")}
              size="sm"
              className="h-8 px-3 text-xs"
            >
              <FolderGit2 className="mr-1.5 h-3.5 w-3.5" />
              Repositorios
            </Button>
            <Button
              variant={activeTab === "conexiones" ? "default" : "ghost"}
              onClick={() => setActiveTab("conexiones")}
              size="sm"
              className="h-8 px-3 text-xs"
            >
              <svg 
                className="mr-1.5 h-3.5 w-3.5" 
                viewBox="0 0 48 48" 
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M25.6,25.6,22.2,29,19,25.8l3.4-3.4a2,2,0,0,0-2.8-2.8L16.2,23l-1.3-1.3a1.9,1.9,0,0,0-2.8,0l-3,3a9.8,9.8,0,0,0-3,7,9.1,9.1,0,0,0,1.8,5.6L4.6,40.6a1.9,1.9,0,0,0,0,2.8,1.9,1.9,0,0,0,2.8,0l3.2-3.2a10.1,10.1,0,0,0,5.9,1.9,10.2,10.2,0,0,0,7.1-2.9l3-3a2,2,0,0,0,.6-1.4,1.7,1.7,0,0,0-.6-1.4L25,31.8l3.4-3.4a2,2,0,0,0-2.8-2.8ZM20.8,36.4a6.1,6.1,0,0,1-8.5,0l-.4-.4a6.4,6.4,0,0,1-1.8-4.3,6,6,0,0,1,1.8-4.2l1.6-1.6,8.8,8.9Z"/>
                <path d="M43.4,4.6a1.9,1.9,0,0,0-2.8,0L37.2,8a10,10,0,0,0-13,.9l-3,3a2,2,0,0,0-.6,1.4,1.7,1.7,0,0,0,.6,1.4L32.9,26.4a1.9,1.9,0,0,0,2.8,0l3-2.9a9.9,9.9,0,0,0,2.9-7.1A10.4,10.4,0,0,0,40,10.9l3.4-3.5A1.9,1.9,0,0,0,43.4,4.6Zm-7.5,16-1.6,1.6-8.9-8.9L27,11.8a5.9,5.9,0,0,1,8.5,0l.4.3a6.3,6.3,0,0,1,1.7,4.3A5.9,5.9,0,0,1,35.9,20.6Z"/>
              </svg>
              Conexiones
            </Button>
            <Button
              variant={activeTab === "configuracion" ? "default" : "ghost"}
              onClick={() => setActiveTab("configuracion")}
              size="icon"
              className="h-8 w-8"
            >
              <Settings className="h-3.5 w-3.5" />
            </Button>
          </div>

          {/* Botón de Tema */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="h-8 w-8 relative"
            aria-label={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
          >
            <Sun 
              className={`h-3.5 w-3.5 absolute transition-all duration-300 ${
                isDark ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"
              }`}
            />
            <Moon 
              className={`h-3.5 w-3.5 absolute transition-all duration-300 ${
                isDark ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0"
              }`}
            />
          </Button>
        </div>
      </div>
    </footer>
  );
};

