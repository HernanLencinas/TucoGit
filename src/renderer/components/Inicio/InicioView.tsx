/**
 * @fileoverview Vista de inicio de la aplicación.
 * 
 * Este módulo proporciona la pantalla de bienvenida con accesos rápidos
 * y sección de favoritos.
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Star } from "lucide-react";
import type { TabType, ConfigTabType } from "@/renderer/types";
import { useI18n } from "@/renderer/hooks/useI18n";

/**
 * Propiedades del componente InicioView.
 * 
 * @interface InicioViewProps
 * @property {Function} setActiveTab - Función para cambiar la pestaña activa
 * @property {Function} setConfigTabActiva - Función para cambiar la pestaña de configuración activa
 */
interface InicioViewProps {
  setActiveTab: (tab: TabType) => void;
  setConfigTabActiva: (tab: ConfigTabType) => void;
}

/**
 * Componente de vista de inicio.
 * 
 * @description
 * Muestra la pantalla de bienvenida con:
 * - Mensaje de bienvenida y logo
 * - Accesos rápidos a diferentes secciones con atajos de teclado
 * - Sección de favoritos (actualmente vacía)
 * 
 * @param {InicioViewProps} props - Propiedades del componente
 * @param {Function} props.setActiveTab - Función para cambiar la pestaña activa
 * @param {Function} props.setConfigTabActiva - Función para cambiar la pestaña de configuración
 * @returns {JSX.Element} Componente de vista de inicio
 * 
 * @example
 * ```tsx
 * <InicioView
 *   setActiveTab={(tab) => setActiveTab(tab)}
 *   setConfigTabActiva={(tab) => setConfigTabActiva(tab)}
 * />
 * ```
 */
export const InicioView = ({ setActiveTab, setConfigTabActiva }: InicioViewProps) => {
  const { t } = useI18n();
  
  return (
    <div className="flex gap-4 h-full">
      {/* Panel izquierdo - Bienvenida y Accesos Rápidos */}
      <div className="flex-1 space-y-4">
        <Card className="bg-background border-0 shadow-none">
          <CardContent className="p-6">
            <div className="flex items-start gap-4 mb-4">
              {/* Logo de bowl de ramen */}
              <div className="flex-shrink-0 w-20 h-20 rounded-lg flex items-center justify-center">
                <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="bowlGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#60A5FA" />
                      <stop offset="100%" stopColor="#7C3AED" />
                    </linearGradient>
                    <linearGradient id="noodleGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#FCD34D" />
                      <stop offset="100%" stopColor="#F59E0B" />
                    </linearGradient>
                  </defs>
                  <ellipse cx="40" cy="65" rx="32" ry="8" fill="url(#bowlGradient)" opacity="0.9"/>
                  <path d="M12 45 Q12 35 20 30 Q28 25 40 25 Q52 25 60 30 Q68 35 68 45 L68 60 Q68 65 60 68 Q52 71 40 71 Q28 71 20 68 Q12 65 12 60 Z" fill="url(#bowlGradient)"/>
                  <ellipse cx="35" cy="40" rx="18" ry="20" fill="white" opacity="0.2"/>
                  <g stroke="url(#noodleGradient)" strokeWidth="1.5" fill="none" strokeLinecap="round">
                    <path d="M18 45 Q22 35 28 30 Q34 25 40 25 Q46 25 52 30 Q58 35 62 45" opacity="0.8"/>
                    <path d="M20 48 Q24 38 30 33 Q36 28 40 28 Q44 28 50 33 Q56 38 60 48" opacity="0.8"/>
                    <path d="M22 51 Q26 41 32 36 Q38 31 40 31 Q42 31 48 36 Q54 41 58 51" opacity="0.8"/>
                    <path d="M16 42 Q20 32 26 27 Q32 22 40 22 Q48 22 54 27 Q60 32 64 42" opacity="0.8"/>
                    <path d="M24 54 Q28 44 34 39 Q40 34 40 34 Q40 34 46 39 Q52 44 56 54" opacity="0.8"/>
                    <path d="M20 50 Q25 45 30 48 Q35 51 40 50 Q45 49 50 48 Q55 47 60 50" opacity="0.6"/>
                    <path d="M18 53 Q23 48 28 51 Q33 54 40 53 Q47 52 52 51 Q57 50 62 53" opacity="0.6"/>
                    <path d="M22 47 Q27 42 32 45 Q37 48 40 47 Q43 46 48 45 Q53 44 58 47" opacity="0.6"/>
                  </g>
                  <path d="M30 35 Q32 30 35 32 Q38 34 36 38 Q34 42 30 40 Q26 38 28 35 Z" fill="#EF4444" opacity="0.9"/>
                  <path d="M50 38 Q52 33 55 35 Q58 37 56 41 Q54 45 50 43 Q46 41 48 38 Z" fill="#EF4444" opacity="0.9"/>
                  <path d="M35 42 Q37 37 40 39 Q43 41 41 45 Q39 49 35 47 Q31 45 33 42 Z" fill="#EF4444" opacity="0.85"/>
                  <ellipse cx="28" cy="40" rx="3" ry="5" fill="#22C55E" opacity="0.9" transform="rotate(-20 28 40)"/>
                  <ellipse cx="52" cy="43" rx="3" ry="5" fill="#22C55E" opacity="0.9" transform="rotate(25 52 43)"/>
                  <ellipse cx="38" cy="36" rx="2.5" ry="4" fill="#22C55E" opacity="0.9" transform="rotate(-15 38 36)"/>
                  <ellipse cx="45" cy="45" rx="2.5" ry="4" fill="#22C55E" opacity="0.9" transform="rotate(30 45 45)"/>
                  <ellipse cx="32" cy="48" rx="2" ry="3.5" fill="#22C55E" opacity="0.85" transform="rotate(-10 32 48)"/>
                </svg>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-2">{t('home.welcome.title')}</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t('home.welcome.description')}
                </p>
              </div>
            </div>
            
            <div className="border-t pt-4 mt-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">{t('home.quickNavigation.title').toUpperCase()}</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <button
                    onClick={() => setActiveTab("inicio")}
                    className="w-full flex items-center gap-3 p-2 rounded-md hover:bg-secondary/50 transition-colors text-left"
                  >
                    <div className="flex gap-1 flex-shrink-0">
                      <kbd className="px-2 py-1 text-[10px] font-semibold text-muted-foreground bg-muted rounded border border-border">⌘</kbd>
                      <kbd className="px-2 py-1 text-[10px] font-semibold text-muted-foreground bg-muted rounded border border-border">1</kbd>
                    </div>
                    <span className="text-sm text-foreground">{t('home.quickNavigation.home.title')}</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("conexiones")}
                    className="w-full flex items-center gap-3 p-2 rounded-md hover:bg-secondary/50 transition-colors text-left"
                  >
                    <div className="flex gap-1 flex-shrink-0">
                      <kbd className="px-2 py-1 text-[10px] font-semibold text-muted-foreground bg-muted rounded border border-border">⌘</kbd>
                      <kbd className="px-2 py-1 text-[10px] font-semibold text-muted-foreground bg-muted rounded border border-border">3</kbd>
                    </div>
                    <span className="text-sm text-foreground">{t('home.quickNavigation.connections.title')}</span>
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab("configuracion");
                      setConfigTabActiva("general");
                    }}
                    className="w-full flex items-center gap-3 p-2 rounded-md hover:bg-secondary/50 transition-colors text-left"
                  >
                    <div className="flex gap-1 flex-shrink-0">
                      <kbd className="px-2 py-1 text-[10px] font-semibold text-muted-foreground bg-muted rounded border border-border">⌘</kbd>
                      <kbd className="px-2 py-1 text-[10px] font-semibold text-muted-foreground bg-muted rounded border border-border">N</kbd>
                    </div>
                    <span className="text-sm text-foreground">{t('home.quickNavigation.configureGit')}</span>
                  </button>
                </div>
                <div className="space-y-2">
                  <button
                    onClick={() => setActiveTab("repositorios")}
                    className="w-full flex items-center gap-3 p-2 rounded-md hover:bg-secondary/50 transition-colors text-left"
                  >
                    <div className="flex gap-1 flex-shrink-0">
                      <kbd className="px-2 py-1 text-[10px] font-semibold text-muted-foreground bg-muted rounded border border-border">⌘</kbd>
                      <kbd className="px-2 py-1 text-[10px] font-semibold text-muted-foreground bg-muted rounded border border-border">2</kbd>
                    </div>
                    <span className="text-sm text-foreground">{t('home.quickNavigation.repositories.title')}</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("configuracion")}
                    className="w-full flex items-center gap-3 p-2 rounded-md hover:bg-secondary/50 transition-colors text-left"
                  >
                    <div className="flex gap-1 flex-shrink-0">
                      <kbd className="px-2 py-1 text-[10px] font-semibold text-muted-foreground bg-muted rounded border border-border">⌘</kbd>
                      <kbd className="px-2 py-1 text-[10px] font-semibold text-muted-foreground bg-muted rounded border border-border">4</kbd>
                    </div>
                    <span className="text-sm text-foreground">{t('home.quickNavigation.settings.title')}</span>
                  </button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Panel derecho - Favoritos */}
      <div className="w-full lg:w-1/2 space-y-4 flex-shrink-0">
        <Card className="bg-background border-0 shadow-none">
          <CardHeader className="p-4">
            <CardTitle className="text-xl font-bold">{t('home.favorites.title')}</CardTitle>
            <CardDescription className="text-sm">
              {t('home.favorites.description')}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="bg-secondary/30 rounded-lg border-0 p-8 flex flex-col items-center justify-center min-h-[300px]">
              <Star className="h-12 w-12 text-muted-foreground/50 mb-4" strokeWidth="1.5" />
              <p className="text-sm font-medium text-foreground mb-1">{t('home.favorites.noFavorites')}</p>
              <p className="text-xs text-muted-foreground text-center">
                {t('home.favorites.noFavoritesDescription')}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

