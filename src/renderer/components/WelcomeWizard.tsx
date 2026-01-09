/**
 * @fileoverview Wizard de bienvenida para la primera vez que se inicia la aplicación.
 * 
 * Este componente muestra un wizard interactivo que guía al usuario a través
 * de las características principales de la aplicación.
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronRight, ChevronLeft, Check, Sparkles, FolderGit2, Settings, Link2, User, Mail, GitBranch, Zap, Shield, Palette, Code, Layers } from "lucide-react";
import { useI18n } from "@/renderer/hooks/useI18n";

/**
 * Propiedades del componente WelcomeWizard.
 * 
 * @interface WelcomeWizardProps
 * @property {Function} onComplete - Función que se ejecuta cuando el wizard se completa
 * @property {Function} onComplete - Recibe nombre y email como parámetros
 */
interface WelcomeWizardProps {
  onComplete: (nombre?: string, email?: string) => void;
}

/**
 * Componente de wizard de bienvenida.
 * 
 * @description
 * Muestra un wizard de varios pasos que introduce al usuario a las características
 * principales de la aplicación. Solo se muestra la primera vez que se inicia.
 * 
 * @param {WelcomeWizardProps} props - Propiedades del componente
 * @param {Function} props.onComplete - Función que se ejecuta al completar el wizard
 * @returns {JSX.Element} Componente de wizard de bienvenida
 */
export const WelcomeWizard = ({ onComplete }: WelcomeWizardProps) => {
  const { t } = useI18n();
  const [pasoActual, setPasoActual] = useState(1);
  const [nombreUsuario, setNombreUsuario] = useState("");
  const [emailUsuario, setEmailUsuario] = useState("");
  const [errorEmail, setErrorEmail] = useState("");
  const totalPasos = 5;

  // Validar email
  const validarEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  };

  const pasos = [
    {
      titulo: t('wizard.welcome.title'),
      descripcion: t('wizard.welcome.description'),
      contenido: (
        <div className="space-y-8 py-4">
          <div className="flex justify-center">
            <div className="w-40 h-40 rounded-2xl flex items-center justify-center bg-gradient-to-br from-blue-500 via-purple-500 to-purple-600 shadow-lg">
              <svg width="100" height="100" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
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
                </g>
              </svg>
            </div>
          </div>
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-foreground">{t('wizard.welcome.mainTitle')}</h3>
            <p className="text-base text-muted-foreground leading-relaxed">
              {t('wizard.welcome.mainDescription')}
            </p>
            <div className="grid grid-cols-3 gap-4 pt-4">
              <div className="flex flex-col items-center space-y-2 p-4 rounded-lg bg-secondary/30">
                <GitBranch className="h-8 w-8 text-primary" />
                <span className="text-xs font-medium text-center">{t('wizard.welcome.features.versionControl')}</span>
              </div>
              <div className="flex flex-col items-center space-y-2 p-4 rounded-lg bg-secondary/30">
                <Layers className="h-8 w-8 text-primary" />
                <span className="text-xs font-medium text-center">{t('wizard.welcome.features.organization')}</span>
              </div>
              <div className="flex flex-col items-center space-y-2 p-4 rounded-lg bg-secondary/30">
                <Zap className="h-8 w-8 text-primary" />
                <span className="text-xs font-medium text-center">{t('wizard.welcome.features.productivity')}</span>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      titulo: t('wizard.gitIdentity.title'),
      descripcion: t('wizard.gitIdentity.description'),
      contenido: (
        <div className="space-y-8 py-4">
          <div className="space-y-6 max-w-xl mx-auto">
            <div className="bg-muted/50 rounded-lg p-6 space-y-4">
              <div className="space-y-3">
                <label htmlFor="nombre-usuario" className="text-sm font-semibold flex items-center gap-2 text-foreground">
                  <User className="h-4 w-4 text-primary" />
                  {t('wizard.gitIdentity.fullName')}
                </label>
                <input
                  id="nombre-usuario"
                  type="text"
                  value={nombreUsuario}
                  onChange={(e) => setNombreUsuario(e.target.value)}
                  placeholder={t('wizard.gitIdentity.fullNamePlaceholder')}
                  className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all"
                />
                <p className="text-xs text-muted-foreground">
                  {t('wizard.gitIdentity.fullNameDescription')}
                </p>
              </div>
              <div className="space-y-3">
                <label htmlFor="email-usuario" className="text-sm font-semibold flex items-center gap-2 text-foreground">
                  <Mail className="h-4 w-4 text-primary" />
                  {t('wizard.gitIdentity.email')}
                </label>
                <input
                  id="email-usuario"
                  type="email"
                  value={emailUsuario}
                  onChange={(e) => {
                    setEmailUsuario(e.target.value);
                    if (e.target.value.trim() && !validarEmail(e.target.value)) {
                      setErrorEmail(t('wizard.gitIdentity.emailInvalid'));
                    } else {
                      setErrorEmail("");
                    }
                  }}
                  onBlur={(e) => {
                    if (e.target.value.trim() && !validarEmail(e.target.value)) {
                      setErrorEmail(t('wizard.gitIdentity.emailInvalid'));
                    } else {
                      setErrorEmail("");
                    }
                  }}
                  placeholder={t('wizard.gitIdentity.emailPlaceholder')}
                  className={`w-full px-4 py-3 rounded-lg border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all ${
                    errorEmail ? "border-destructive focus:ring-destructive" : "border-input"
                  }`}
                />
                {errorEmail && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <Shield className="h-3 w-3" />
                    {errorEmail}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  {t('wizard.gitIdentity.emailDescription')}
                </p>
              </div>
            </div>
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
              <p className="text-sm text-foreground flex items-start gap-2">
                <Shield className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span>
                  {t('wizard.gitIdentity.info')}
                </span>
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      titulo: t('wizard.repositoryManagement.title'),
      descripcion: t('wizard.repositoryManagement.description'),
      contenido: (
        <div className="space-y-8 py-4">
          <div className="space-y-6 max-w-2xl mx-auto">
            <div className="grid grid-cols-1 gap-4">
              <div className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <Layers className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground mb-1">{t('wizard.repositoryManagement.customCollections.title')}</h4>
                    <p className="text-sm text-muted-foreground">
                      {t('wizard.repositoryManagement.customCollections.description')}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <Code className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground mb-1">{t('wizard.repositoryManagement.directClone.title')}</h4>
                    <p className="text-sm text-muted-foreground">
                      {t('wizard.repositoryManagement.directClone.description')}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <Zap className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground mb-1">{t('wizard.repositoryManagement.realTimeStatus.title')}</h4>
                    <p className="text-sm text-muted-foreground">
                      {t('wizard.repositoryManagement.realTimeStatus.description')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-muted/30 rounded-lg p-4 text-center">
              <p className="text-sm text-foreground">
                {t('wizard.repositoryManagement.allInOne')}
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      titulo: t('wizard.gitIntegration.title'),
      descripcion: t('wizard.gitIntegration.description'),
      contenido: (
        <div className="space-y-8 py-4">
          <div className="space-y-6 max-w-2xl mx-auto">
            <div className="grid grid-cols-1 gap-4">
              <div className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <Link2 className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground mb-1">{t('wizard.gitIntegration.multipleProviders.title')}</h4>
                    <p className="text-sm text-muted-foreground">
                      {t('wizard.gitIntegration.multipleProviders.description')}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <Zap className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground mb-1">{t('wizard.gitIntegration.autoSync.title')}</h4>
                    <p className="text-sm text-muted-foreground">
                      {t('wizard.gitIntegration.autoSync.description')}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <Shield className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground mb-1">{t('wizard.gitIntegration.multipleAccounts.title')}</h4>
                    <p className="text-sm text-muted-foreground">
                      {t('wizard.gitIntegration.multipleAccounts.description')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-muted/30 rounded-lg p-4 text-center">
              <p className="text-sm text-foreground">
                {t('wizard.gitIntegration.centralizedAccess')}
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      titulo: t('wizard.customization.title'),
      descripcion: t('wizard.customization.description'),
      contenido: (
        <div className="space-y-8 py-4">
          <div className="space-y-6 max-w-2xl mx-auto">
            <div className="grid grid-cols-1 gap-4">
              <div className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <Palette className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground mb-1">{t('wizard.customization.themes.title')}</h4>
                    <p className="text-sm text-muted-foreground">
                      {t('wizard.customization.themes.description')}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <Code className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground mb-1">{t('wizard.customization.ideIntegration.title')}</h4>
                    <p className="text-sm text-muted-foreground">
                      {t('wizard.customization.ideIntegration.description')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-6 text-center">
              <p className="text-sm text-foreground mb-2">
                <span className="font-semibold">{t('wizard.customization.readyToStart')}</span>
              </p>
              <p className="text-xs text-muted-foreground">
                {t('wizard.customization.readyDescription')}
              </p>
            </div>
          </div>
        </div>
      )
    }
  ];

  const pasoAnterior = () => {
    if (pasoActual > 1) {
      setPasoActual(pasoActual - 1);
    }
  };

  const siguientePaso = () => {
    // Validar campos en el paso de configuración de identidad (paso 2)
    if (pasoActual === 2) {
      if (!nombreUsuario.trim()) {
        return; // No avanzar si falta el nombre
      }
      if (!emailUsuario.trim()) {
        setErrorEmail(t('wizard.gitIdentity.emailRequired'));
        return; // No avanzar si falta el email
      }
      if (!validarEmail(emailUsuario.trim())) {
        setErrorEmail(t('wizard.gitIdentity.emailInvalid'));
        return; // No avanzar si el email no es válido
      }
      setErrorEmail(""); // Limpiar error si todo está bien
    }

    if (pasoActual < totalPasos) {
      setPasoActual(pasoActual + 1);
    } else {
      // Al completar, pasar los valores de nombre y email
      onComplete(nombreUsuario.trim(), emailUsuario.trim());
    }
  };

  const paso = pasos[pasoActual - 1];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <Card className="w-full max-w-4xl mx-4 max-h-[90vh] border-2 shadow-xl flex flex-col">
        <CardHeader>
          <div className="space-y-2">
            <CardTitle className="text-2xl">{paso.titulo}</CardTitle>
            <CardDescription className="text-base">{paso.descripcion}</CardDescription>
          </div>
          {/* Indicador de progreso */}
          <div className="mt-4 flex gap-2">
            {Array.from({ length: totalPasos }).map((_, index) => (
              <div
                key={index}
                className={`h-2 flex-1 rounded-full transition-all ${
                  index + 1 <= pasoActual
                    ? "bg-primary"
                    : "bg-secondary"
                }`}
              />
            ))}
          </div>
        </CardHeader>
        <CardContent className="space-y-6 pb-6 flex-1 overflow-y-auto">
          {paso.contenido}
          
          {/* Botones de navegación */}
          <div className="flex justify-between items-center pt-4 border-t mt-auto">
            <Button
              variant="outline"
              onClick={pasoAnterior}
              disabled={pasoActual === 1}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              {t('wizard.navigation.previous')}
            </Button>
            
            <div className="text-sm text-muted-foreground">
              {t('wizard.navigation.step', { current: pasoActual, total: totalPasos })}
            </div>
            
            <Button
              onClick={siguientePaso}
              className="flex items-center gap-2"
              disabled={pasoActual === 2 && (!nombreUsuario.trim() || !emailUsuario.trim() || !validarEmail(emailUsuario.trim()))}
            >
              {pasoActual === totalPasos ? (
                <>
                  <Sparkles className="h-4 w-4" />
                  {t('wizard.navigation.start')}
                </>
              ) : (
                <>
                  {t('wizard.navigation.next')}
                  <ChevronRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
