import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/lib/use-toast";
import { cn } from "@/lib/utils";
import { Home, Bell, FolderGit2, Settings, Sun, Moon, Calendar, Server, Database, Cloud, Link2, CheckCircle2, AlertCircle, Folder, FolderOpen, File, Plus, ChevronRight, Search, X, ArrowUpDown, ArrowUp, ArrowDown, ExternalLink, Sliders, Info, FolderUp, Clock, Trash2, Pencil, Star, GitBranch, Download, Upload, Palette, Check, Eye, EyeOff, Plug, RefreshCw, Users, User, XCircle, CircleDot, Mail, Shield, Code, FileText, Heart, Sparkles, Lock, MoreVertical, Globe, ChevronDown } from "lucide-react";
import { themes, applyTheme, type ThemeName, type ThemeMode } from "@/renderer/utils/themes";
import type { Connection, FolderItem, TabType, ConfigTabType } from "@/renderer/types";
import { RepositoryDetails } from "@/renderer/components/RepositoryDetails";
import { WelcomeWizard } from "@/renderer/components/WelcomeWizard";
import { LoadingScreen } from "@/renderer/components/LoadingScreen";
import { useI18n } from "@/renderer/hooks/useI18n";
import tucoLogo from "@/renderer/assets/logo-tuco.jpg";

// Constantes para identidades de Git
type GitIdentity = {
  id: string;
  nombre: string;
  email: string;
};
const IDENTIDAD_DEFAULT_ID = "default-tucogit";
const IDENTIDAD_DEFAULT: GitIdentity = {
  id: IDENTIDAD_DEFAULT_ID,
  nombre: "TucoGit",
  email: "git@tuco.com"
};

const COLLECTION_COLORS = [
  { name: 'repositories.colors.default', value: '' },
  { name: 'repositories.colors.red', value: '#ef4444' },
  { name: 'repositories.colors.orange', value: '#f97316' },
  { name: 'repositories.colors.amber', value: '#f59e0b' },
  { name: 'repositories.colors.yellow', value: '#eab308' },
  { name: 'repositories.colors.lime', value: '#84cc16' },
  { name: 'repositories.colors.green', value: '#22c55e' },
  { name: 'repositories.colors.emerald', value: '#10b981' },
  { name: 'repositories.colors.teal', value: '#14b8a6' },
  { name: 'repositories.colors.cyan', value: '#06b6d4' },
  { name: 'repositories.colors.sky', value: '#0ea5e9' },
  { name: 'repositories.colors.blue', value: '#3b82f6' },
  { name: 'repositories.colors.indigo', value: '#6366f1' },
  { name: 'repositories.colors.violet', value: '#8b5cf6' },
  { name: 'repositories.colors.purple', value: '#a855f7' },
  { name: 'repositories.colors.fuchsia', value: '#d946ef' },
  { name: 'repositories.colors.pink', value: '#ec4899' },
  { name: 'repositories.colors.rose', value: '#f43f5e' },
  { name: 'repositories.colors.slate', value: '#64748b' },
];

function App() {
  const { t, changeLanguage, initializeLanguage, currentLanguage } = useI18n();
  const [activeTab, setActiveTab] = useState<TabType>("inicio");
  const [isDark, setIsDark] = useState(true);
  const [selectedTheme, setSelectedTheme] = useState<{ name: string; mode: "light" | "dark" }>({ name: "default", mode: "dark" });
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [tempZoomLevel, setTempZoomLevel] = useState<number>(100);

  // Sincronizar tempZoomLevel cuando zoomLevel cambia externamente
  useEffect(() => {
    setTempZoomLevel(zoomLevel);
  }, [zoomLevel]);
  const [estructuraCarpetas, setEstructuraCarpetas] = useState<FolderItem[]>([
    {
      id: "root",
      nombre: "Mis repositorios",
      tipo: "coleccion",
      hijos: [],
    },
  ]);
  const [rutaActual, setRutaActual] = useState<string[]>(["root"]);
  const [terminoBusqueda, setTerminoBusqueda] = useState<string>("");
  const [terminoBusquedaDebounced, setTerminoBusquedaDebounced] = useState<string>("");
  const [buscarEnTodasLasColecciones, setBuscarEnTodasLasColecciones] = useState<boolean>(true);
  const [terminoBusquedaConexiones, setTerminoBusquedaConexiones] = useState<string>("");
  const [terminoBusquedaConexionesDebounced, setTerminoBusquedaConexionesDebounced] = useState<string>("");
  const [mostrarMenuNuevaCarpeta, setMostrarMenuNuevaCarpeta] = useState(false);
  const [mostrarModalNuevaCarpeta, setMostrarModalNuevaCarpeta] = useState(false);
  const [nombreNuevaCarpeta, setNombreNuevaCarpeta] = useState("");
  const [descripcionNuevaCarpeta, setDescripcionNuevaCarpeta] = useState("");
  const [colorNuevaCarpeta, setColorNuevaCarpeta] = useState("");
  const [mostrarColorPickerNuevaCarpeta, setMostrarColorPickerNuevaCarpeta] = useState(false);
  const [creandoColeccion, setCreandoColeccion] = useState(false);
  const [errorNombre, setErrorNombre] = useState<string | null>(null);
  const [errorDescripcion, setErrorDescripcion] = useState<string | null>(null);
  const [mostrarModalEliminarColeccion, setMostrarModalEliminarColeccion] = useState(false);
  const [coleccionAEliminar, setColeccionAEliminar] = useState<string | null>(null);
  const [mostrarModalEliminarRepositorio, setMostrarModalEliminarRepositorio] = useState(false);
  const [repositorioAEliminar, setRepositorioAEliminar] = useState<FolderItem | null>(null);
  const [editandoRepositorio, setEditandoRepositorio] = useState(false);
  const [repositorioAEditar, setRepositorioAEditar] = useState<FolderItem | null>(null);
  const [mostrarModalEditarColeccion, setMostrarModalEditarColeccion] = useState(false);
  const [coleccionAEditar, setColeccionAEditar] = useState<FolderItem | null>(null);
  const [nombreEditarColeccion, setNombreEditarColeccion] = useState("");
  const [descripcionEditarColeccion, setDescripcionEditarColeccion] = useState("");
  const [colorEditarColeccion, setColorEditarColeccion] = useState("");
  const [mostrarColorPicker, setMostrarColorPicker] = useState(false);
  const [editandoColeccion, setEditandoColeccion] = useState(false);
  const [errorNombreEditar, setErrorNombreEditar] = useState<string | null>(null);
  const [errorDescripcionEditar, setErrorDescripcionEditar] = useState<string | null>(null);
  const [mostrarMenuNuevaConexion, setMostrarMenuNuevaConexion] = useState(false);
  const [mostrarWizardNuevaConexion, setMostrarWizardNuevaConexion] = useState(false);
  const [pasoWizard, setPasoWizard] = useState<1 | 2 | 3>(1);
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState<string | null>(null);
  const [nombreConexion, setNombreConexion] = useState("");
  const [tokenAcceso, setTokenAcceso] = useState("");
  const [urlServidor, setUrlServidor] = useState("");
  const [mostrarToken, setMostrarToken] = useState(false);
  const [validandoToken, setValidandoToken] = useState(false);
  const [errorValidacionToken, setErrorValidacionToken] = useState<string | null>(null);
  const [tokenValidado, setTokenValidado] = useState(false);
  const [identidadSeleccionada, setIdentidadSeleccionada] = useState<string>(IDENTIDAD_DEFAULT_ID);
  const [mostrarMenuIdentidad, setMostrarMenuIdentidad] = useState(false);
  const [mostrarMenuOrdenar, setMostrarMenuOrdenar] = useState(false);
  const [ordenConexiones, setOrdenConexiones] = useState<"asc" | "desc" | null>(null);
  const [refrescandoConexiones, setRefrescandoConexiones] = useState(false);
  const [mostrarMenuOrdenarRepos, setMostrarMenuOrdenarRepos] = useState(false);
  const [ordenRepositorios, setOrdenRepositorios] = useState<"asc" | "desc" | null>(null);
  const [refrescandoRepositorios, setRefrescandoRepositorios] = useState(false);
  const [mostrarMenuAccionesRepos, setMostrarMenuAccionesRepos] = useState(false);
  const [mostrarModalClonarTodos, setMostrarModalClonarTodos] = useState(false);
  const [forzarReclonado, setForzarReclonado] = useState(false);
  const [clonandoRepositorios, setClonandoRepositorios] = useState<Record<string, { progress: number, message: string }>>({});
  const [gitInfoRepositorios, setGitInfoRepositorios] = useState<Record<string, { branch: string, ahead: number, behind: number, uncommitted: number, author: string, date: string, hash: string }>>({});
  const [configTabActiva, setConfigTabActiva] = useState<ConfigTabType>("general");
  const [rutaConfiguracion, setRutaConfiguracion] = useState<string>("");
  const [ultimaActualizacion, setUltimaActualizacion] = useState<string>(new Date().toLocaleString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  }));
  const [conexionesGuardadas, setConexionesGuardadas] = useState<Connection[]>([]);
  const [conexionesDetalles, setConexionesDetalles] = useState<Record<number, Connection['details']>>({});
  const [cargandoDetalles, setCargandoDetalles] = useState<Record<number, boolean>>({});
  const [estadosConexion, setEstadosConexion] = useState<Record<number, 'connected' | 'expired' | 'disconnected' | 'checking'>>({});
  const [mostrarModalEliminarConexion, setMostrarModalEliminarConexion] = useState(false);
  const [conexionAEliminar, setConexionAEliminar] = useState<Connection | null>(null);
  const [conexionAEditar, setConexionAEditar] = useState<Connection | null>(null);
  const [editandoConexion, setEditandoConexion] = useState(false);
  const [mostrarWizardNuevoRepositorio, setMostrarWizardNuevoRepositorio] = useState(false);
  const [pasoWizardRepositorio, setPasoWizardRepositorio] = useState<1 | 2 | 3>(1);
  const [conexionSeleccionada, setConexionSeleccionada] = useState<Connection | null>(null);
  const [repositorioSeleccionado, setRepositorioSeleccionado] = useState<string>("");
  const [repositoriosDisponibles, setRepositoriosDisponibles] = useState<Array<{ id: string; name: string; full_name: string; description?: string; private?: boolean; clone_url?: string }>>([]);
  const [cargandoRepositorios, setCargandoRepositorios] = useState(false);
  const [nombreRepositorio, setNombreRepositorio] = useState("");
  const [descripcionRepositorio, setDescripcionRepositorio] = useState("");
  const [colorRepositorio, setColorRepositorio] = useState("");
  const [mostrarColorPickerRepositorio, setMostrarColorPickerRepositorio] = useState(false);
  const [mostrarMenuConexion, setMostrarMenuConexion] = useState(false);
  const [mostrarMenuRepositorio, setMostrarMenuRepositorio] = useState(false);
  const [busquedaRepositorio, setBusquedaRepositorio] = useState("");
  const repositorioButtonRef = useRef<HTMLButtonElement>(null);
  const [repositorioDropdownPosition, setRepositorioDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const [editorIDESeleccionado, setEditorIDESeleccionado] = useState<string | null>(null);
  const [mostrarMenuEditorIDE, setMostrarMenuEditorIDE] = useState(false);
  const [editoresInstalados, setEditoresInstalados] = useState<string[]>([]);
  const [editorIDECargado, setEditorIDECargado] = useState(false);
  const [gitSslVerify, setGitSslVerify] = useState<boolean>(true);
  const [setGitUserName] = useState<string>("");
  const [setGitUserEmail] = useState<string>("");
  const [commitButtonBehavior, setCommitButtonBehavior] = useState<"commit" | "commit-push" | "commit-sync">("commit");
  const [mostrarMenuCommitBehavior, setMostrarMenuCommitBehavior] = useState(false);
  const [uiLanguage, setUiLanguage] = useState<"en" | "es-AR" | "de" | "fr" | "pt" | "ja" | "zh-CN">("es-AR");
  const [mostrarMenuIdioma, setMostrarMenuIdioma] = useState(false);
  const [mostrarModalRestablecerConfig, setMostrarModalRestablecerConfig] = useState(false);
  const [mostrarModalConfirmarReclon, setMostrarModalConfirmarReclon] = useState(false);
  const [repoAClonar, setRepoAClonar] = useState<FolderItem | null>(null);
  const [rutaDestinoAClonar, setRutaDestinoAClonar] = useState<string>("");
  const [mostrarModalPurgarTodo, setMostrarModalPurgarTodo] = useState(false);
  const [mostrarModalPurgarRepo, setMostrarModalPurgarRepo] = useState(false);
  const [repoAPurgar, setRepoAPurgar] = useState<FolderItem | null>(null);

  // Estado para identidades de Git
  const [gitIdentities, setGitIdentities] = useState<GitIdentity[]>([]);
  const [mostrarModalNuevaIdentidad, setMostrarModalNuevaIdentidad] = useState(false);
  const [mostrarModalEditarIdentidad, setMostrarModalEditarIdentidad] = useState(false);
  const [identidadAEditar, setIdentidadAEditar] = useState<GitIdentity | null>(null);
  const [nombreNuevaIdentidad, setNombreNuevaIdentidad] = useState("");
  const [emailNuevaIdentidad, setEmailNuevaIdentidad] = useState("");
  const [mostrarModalEliminarIdentidad, setMostrarModalEliminarIdentidad] = useState(false);
  const [identidadAEliminar, setIdentidadAEliminar] = useState<GitIdentity | null>(null);
  const [mostrarWizardBienvenida, setMostrarWizardBienvenida] = useState(false);
  const [wizardCargado, setWizardCargado] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [mostrarMenuNotificaciones, setMostrarMenuNotificaciones] = useState(false);
  const menuNotificacionesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuNotificacionesRef.current && !menuNotificacionesRef.current.contains(event.target as Node)) {
        setMostrarMenuNotificaciones(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Estado para la vista de detalles de repositorio
  const [activeRepository, setActiveRepository] = useState<FolderItem | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "details">("list");
  const [repositoriesMinimizados, setRepositoriesMinimizados] = useState<FolderItem[]>([]);

  // Toast hook de shadcn/ui
  const { toast } = useToast();

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    if (type === 'success') {
      toast({
        title: "Éxito",
        description: message,
        variant: "success",
      });
    } else if (type === 'error') {
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Información",
        description: message,
        variant: "info",
      });
    }
  };

  const cargarGitInfo = async (item: FolderItem) => {
    if (item.tipo !== 'archivo' || !item.clonado || !window.electronAPI?.getGitLocalInfo) return;

    const orgPath = item.organizacion ? `${item.organizacion}/` : "";
    const repoName = item.nombreGit || item.nombre;
    const repoPath = `${rutaConfiguracion}/repositories/${item.idConexion || 'unknown'}/${orgPath}${repoName}`;

    try {
      const resultado = await window.electronAPI.getGitLocalInfo(repoPath);
      if (resultado.success && resultado.info) {
        setGitInfoRepositorios(prev => ({
          ...prev,
          [item.id]: resultado.info!
        }));
      }
    } catch (error) {
      // Error al cargar info git
    }
  };

  // Cargar info de git para todos los repos clonados al inicio o cuando cambie la estructura
  useEffect(() => {
    const cargarTodoGitInfo = async (items: FolderItem[]) => {
      for (const item of items) {
        if (item.tipo === 'archivo' && item.clonado) {
          await cargarGitInfo(item);
        }
        if (item.hijos) {
          await cargarTodoGitInfo(item.hijos);
        }
      }
    };

    if (estructuraCarpetas.length > 0 && rutaConfiguracion) {
      cargarTodoGitInfo(estructuraCarpetas);
    }
  }, [estructuraCarpetas, rutaConfiguracion]);

  const [appVersion, setAppVersion] = useState<string>("0.0.0");

  // Fetch app version on mount
  useEffect(() => {
    const fetchVersion = async () => {
      if (window.electronAPI?.getAppVersion) {
        try {
          const version = await window.electronAPI.getAppVersion();
          console.log("App version fetched:", version);
          setAppVersion(version);
        } catch (error) {
          console.error("Failed to fetch app version:", error);
        }
      } else {
        console.warn("electronAPI.getAppVersion is not available");
      }
    };
    fetchVersion();
  }, []);

  // Función para restablecer la configuración
  const confirmarRestablecerConfig = async () => {
    try {
      // Restablecer a valores por defecto
      const configPorDefecto = {
        tema: "dark",
        temaNombre: "default",
        zoomLevel: 100,
        editorIDE: null,
        repositorios: [
          {
            id: "root",
            nombre: "Mis repositorios",
            tipo: "coleccion",
            hijos: []
          }
        ],
        conexiones: []
      };

      if (window.electronAPI?.writeConfig) {
        const resultado = await window.electronAPI.writeConfig(configPorDefecto);

        if (resultado.success) {
          setMostrarModalRestablecerConfig(false);
          showToast('Configuración restablecida exitosamente. Recargando aplicación...', 'success');

          // Aplicar valores por defecto en la UI antes de recargar
          setIsDark(false);
          setSelectedTheme({ name: "default", mode: "light" });
          applyTheme("default", "light");
          setZoomLevel(100);
          setTempZoomLevel(100);
          document.documentElement.style.setProperty('--zoom-level', '100%');
          setEstructuraCarpetas([
            {
              id: "root",
              nombre: "Mis repositorios",
              tipo: "coleccion",
              hijos: []
            }
          ]);
          setConexionesGuardadas([]);
          setEditorIDESeleccionado(null);

          // Recargar la página después de un breve delay
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        } else {
          showToast('Error al restablecer configuración: ' + (resultado.error || 'Error desconocido'), 'error');
        }
      }
    } catch (error) {
      // Error al restablecer configuración
      showToast('Error al restablecer configuración: ' + (error as Error).message, 'error');
    }
  };

  useEffect(() => {
    if (window.electronAPI?.onCloneProgress) {
      const unsubscribe = window.electronAPI.onCloneProgress((data: { repoId: string, progress?: number, message?: string }) => {
        setClonandoRepositorios(prev => {
          const current = prev[data.repoId] || { progress: 0, message: "Iniciando..." };
          return {
            ...prev,
            [data.repoId]: {
              progress: data.progress !== undefined ? data.progress : current.progress,
              message: data.message || current.message
            }
          };
        });
      });
      return () => unsubscribe();
    }
  }, []);

  // Escuchar eventos de navegación desde el menú principal
  useEffect(() => {
    if (window.electronAPI?.onNavigateTo) {
      const unsubscribe = window.electronAPI.onNavigateTo((data: { tab: string, section?: string }) => {
        if (data.tab === 'configuracion') {
          setActiveTab('configuracion');
          if (data.section) {
            setConfigTabActiva(data.section as ConfigTabType);
          }
        }
      });
      return () => unsubscribe();
    }
  }, []);

  const clonarRepositorio = async (item: FolderItem, saltarConfirmacion: boolean = false, suppressToasts: boolean = false): Promise<{ success: boolean; error?: string }> => {
    if (!item.urlClon) {
      if (!suppressToasts) showToast("No se encontró la URL de clonación para este repositorio", 'error');
      return { success: false, error: "No se encontró URL de clonación" };
    }

    const orgPath = item.organizacion ? `${item.organizacion}/` : "";
    const repoName = item.nombreGit || item.nombre;
    const destPath = `${rutaConfiguracion}/repositories/${item.idConexion || 'unknown'}/${orgPath}${repoName}`;

    // Verificar si la carpeta ya existe antes de clonar
    if (!saltarConfirmacion && window.electronAPI?.checkPathExists) {
      const existe = await window.electronAPI.checkPathExists(destPath);
      if (existe) {
        setRepoAClonar(item);
        setRutaDestinoAClonar(destPath);
        setMostrarModalConfirmarReclon(true);
        return { success: false, error: "Esperando confirmación de usuario" };
      }
    }

    // Si llegamos aquí y saltarConfirmacion es true, eliminar la carpeta primero
    if (saltarConfirmacion && window.electronAPI?.deletePath) {
      const resultadoEliminar = await window.electronAPI.deletePath(destPath);
      if (!resultadoEliminar.success) {
        if (!suppressToasts) showToast(`No se pudo eliminar la carpeta existente: ${resultadoEliminar.error}`, 'error');
        return { success: false, error: `Error limpiando carpeta: ${resultadoEliminar.error}` };
      }
    }

    // Iniciar progreso en 0 con mensaje inicial
    setClonandoRepositorios(prev => ({ ...prev, [item.id]: { progress: 0, message: t('repositories.preparing') } }));

    try {
      if (window.electronAPI?.cloneRepository) {
        // Obtener el token de la conexión si existe
        let token = undefined;
        if (item.idConexion) {
          const conexion = conexionesGuardadas.find(c => c.id === item.idConexion);
          if (conexion && conexion.tokenEncriptado && window.electronAPI.decryptToken) {
            const resultadoDesencriptacion = await window.electronAPI.decryptToken(conexion.tokenEncriptado);
            if (resultadoDesencriptacion.success) {
              token = resultadoDesencriptacion.token;
            }
          }
        }

        const resultado = await window.electronAPI.cloneRepository(item.urlClon, destPath, item.id, gitSslVerify, token);

        if (resultado.success) {
          // Actualizar estado de clonado en la estructura usando función funcional para asegurar estado actualizado
          setEstructuraCarpetas(prevEstructura => {
            const actualizarEstructura = (items: FolderItem[]): FolderItem[] => {
              return items.map(i => {
                if (i.id === item.id) {
                  return { ...i, clonado: true };
                }
                if (i.hijos) {
                  return { ...i, hijos: actualizarEstructura(i.hijos) };
                }
                return i;
              });
            };

            const nuevaEstructura = actualizarEstructura(prevEstructura);

            // Guardar configuración de forma asíncrona
            if (window.electronAPI?.writeConfig) {
              window.electronAPI.writeConfig({ repositorios: nuevaEstructura }).catch(() => {
                // Error al guardar, pero continuamos
              });
            }

            return nuevaEstructura;
          });

          // Esperar un momento para que el estado se actualice
          await new Promise(resolve => setTimeout(resolve, 100));

          // Cargar info de git inmediatamente después de clonar
          await cargarGitInfo(item);
          return { success: true };
        } else {
          if (!suppressToasts) showToast(`Error al clonar: ${resultado.error}`, 'error');
          return { success: false, error: resultado.error };
        }
      }
      return { success: false, error: "API no disponible" };
    } catch (error) {
      // Error al clonar repositorio
      const errorMessage = (error as Error).message;
      if (!suppressToasts) showToast(`Error al clonar: ${errorMessage}`, 'error');
      return { success: false, error: errorMessage };
    } finally {
      // Quitar de la lista de clonando
      setClonandoRepositorios(prev => {
        const next = { ...prev };
        delete next[item.id];
        return next;
      });
    }
  };


  const clonarTodosLosRepositorios = async (forzarReclonado: boolean) => {
    const carpetaActual = obtenerCarpetaActual();
    if (!carpetaActual) {
      showToast("No se pudo obtener la carpeta actual", 'error');
      return;
    }

    const itemsActuales = carpetaActual.hijos || [];
    const repositorios = itemsActuales.filter(item => item.tipo === "archivo");

    if (repositorios.length === 0) {
      showToast("No hay repositorios para clonar en la carpeta actual", 'info');
      return;
    }

    // Cerrar el modal
    setMostrarModalClonarTodos(false);
    setForzarReclonado(false);

    let exitosos = 0;
    let fallidos = 0;
    let omitidos = 0;
    const errores: string[] = [];

    // Clonar cada repositorio secuencialmente
    for (let i = 0; i < repositorios.length; i++) {
      const repo = repositorios[i];

      try {
        // Verificar si tiene URL de clonación
        if (!repo.urlClon) {
          fallidos++;
          errores.push(`${repo.nombre}: No tiene URL de clonación`);
          continue;
        }

        // Si no se fuerza el re-clonado, verificar si ya existe
        if (!forzarReclonado && window.electronAPI?.checkPathExists) {
          const orgPath = repo.organizacion ? `${repo.organizacion}/` : "";
          const repoName = repo.nombreGit || repo.nombre;
          const destPath = `${rutaConfiguracion}/repositories/${repo.idConexion || 'unknown'}/${orgPath}${repoName}`;

          const existe = await window.electronAPI.checkPathExists(destPath);
          if (existe) {
            omitidos++;
            // Si ya existe, asegurarse de que esté marcado como clonado en la estructura
            const actualizarEstructura = (items: FolderItem[]): FolderItem[] => {
              return items.map(i => {
                if (i.id === repo.id) {
                  return { ...i, clonado: true };
                }
                if (i.hijos) {
                  return { ...i, hijos: actualizarEstructura(i.hijos) };
                }
                return i;
              });
            };
            const nuevaEstructura = actualizarEstructura(estructuraCarpetas);
            setEstructuraCarpetas(nuevaEstructura);
            if (window.electronAPI?.writeConfig) {
              await window.electronAPI.writeConfig({ repositorios: nuevaEstructura });
            }
            // Cargar info de git para repositorios que ya existen
            await cargarGitInfo(repo);
            continue;
          }
        }

        // Clonar el repositorio (si forzarReclonado es true, saltará la confirmación y eliminará la carpeta)
        // Esperar a que la clonación termine completamente. Pasamos suppressToasts = true
        const resultado = await clonarRepositorio(repo, forzarReclonado, true);

        if (resultado.success) {
          exitosos++;
        } else {
          fallidos++;
          if (resultado.error && resultado.error !== "Esperando confirmación de usuario") {
            errores.push(`${repo.nombre}: ${resultado.error}`);
          }
        }

        // Esperar un momento adicional para asegurar que el estado se haya actualizado
        await new Promise(resolve => setTimeout(resolve, 200));

      } catch (error) {
        fallidos++;
        errores.push(`${repo.nombre}: ${(error as Error).message}`);
      }
    }

    // Mostrar resumen
    let mensaje = "";
    if (fallidos === 0 && omitidos === 0) {
      mensaje = `Se clonaron exitosamente ${exitosos} ${exitosos === 1 ? 'repositorio' : 'repositorios'}`;
      showToast(mensaje, 'success');
    } else if (exitosos === 0 && omitidos === 0) {
      mensaje = `Error al clonar todos los repositorios. ${errores.length > 0 ? errores[0] : ''}`;
      showToast(mensaje, 'error');
    } else {
      const partes: string[] = [];
      if (exitosos > 0) {
        partes.push(`${exitosos} ${exitosos === 1 ? 'clonado' : 'clonados'}`);
      }
      if (omitidos > 0) {
        partes.push(`${omitidos} ${omitidos === 1 ? 'omitido' : 'omitidos'}`);
      }
      if (fallidos > 0) {
        partes.push(`${fallidos} ${fallidos === 1 ? 'falló' : 'fallaron'}`);
      }
      mensaje = `Resultado: ${partes.join(', ')}`;
      showToast(mensaje, omitidos > 0 || fallidos > 0 ? 'info' : 'success');
    }
  };

  const abrirEnIDE = async (item: FolderItem) => {
    if (!item.clonado || !editorIDESeleccionado || !window.electronAPI?.openInIDE) {
      return;
    }

    const orgPath = item.organizacion ? `${item.organizacion}/` : "";
    const repoName = item.nombreGit || item.nombre;
    const repoPath = `${rutaConfiguracion}/repositories/${item.idConexion || 'unknown'}/${orgPath}${repoName}`;

    try {
      const resultado = await window.electronAPI.openInIDE(repoPath, editorIDESeleccionado);
      if (!resultado.success) {
        showToast(`Error al abrir en ${editorIDESeleccionado}: ${resultado.error}`, 'error');
      }
    } catch (error) {
      // Error al abrir en IDE
      showToast(`Error al abrir en ${editorIDESeleccionado}`, 'error');
    }
  };

  // Obtener todos los repositorios favoritos recursivamente
  const obtenerFavoritos = (items: FolderItem[]): FolderItem[] => {
    let favoritos: FolderItem[] = [];
    items.forEach((item) => {
      if (item.tipo === "archivo" && item.favorito) {
        favoritos.push(item);
      }
      if (item.hijos && item.hijos.length > 0) {
        favoritos = [...favoritos, ...obtenerFavoritos(item.hijos)];
      }
    });
    return favoritos;
  };

  // Helper para obtener todos los repositorios clonados
  const obtenerRepositoriosClonados = (items: FolderItem[]): FolderItem[] => {
    let clonados: FolderItem[] = [];
    items.forEach((item) => {
      if (item.tipo === 'archivo' && item.clonado) {
        clonados.push(item);
      }
      if (item.hijos && item.hijos.length > 0) {
        clonados = [...clonados, ...obtenerRepositoriosClonados(item.hijos)];
      }
    });
    return clonados;
  };

  const purgarRepositorio = (item: FolderItem) => {
    setRepoAPurgar(item);
    setMostrarModalPurgarRepo(true);
  };

  const ejecutarPurgarRepositorio = async () => {
    const item = repoAPurgar;
    if (!item || !item.clonado) return;

    setMostrarModalPurgarRepo(false);

    // reset repoAPurgar after animation delay or immediately? 
    // Usually wait for modal close, but here let's keep it simple.
    // We'll setRepoAPurgar(null) in the modal close handler usually.

    const orgPath = item.organizacion ? `${item.organizacion}/` : "";
    const repoName = item.nombreGit || item.nombre;
    const repoPath = `${rutaConfiguracion}/repositories/${item.idConexion || 'unknown'}/${orgPath}${repoName}`;

    try {
      if (window.electronAPI?.deletePath) {
        const resultado = await window.electronAPI.deletePath(repoPath);
        if (resultado.success) {
          showToast(`Repositorio ${item.nombre} purgado exitosamente`, 'success');

          // Actualizar estado
          setEstructuraCarpetas(prev => {
            const actualizar = (items: FolderItem[]): FolderItem[] => {
              return items.map(i => {
                if (i.id === item.id) {
                  return { ...i, clonado: false };
                }
                if (i.hijos) {
                  return { ...i, hijos: actualizar(i.hijos) };
                }
                return i;
              });
            };
            const nueva = actualizar(prev);
            // Guardar config
            if (window.electronAPI?.writeConfig) {
              window.electronAPI.writeConfig({ repositorios: nueva });
            }
            return nueva;
          });
        } else {
          showToast(`Error al purgar ${item.nombre}: ${resultado.error}`, 'error');
        }
      }
    } catch (error) {
      showToast(`Error al purgar repositorio: ${(error as Error).message}`, 'error');
    }
  };

  const purgarTodoCache = () => {
    setMostrarModalPurgarTodo(true);
  };

  const ejecutarPurgarTodoCache = async () => {
    setMostrarModalPurgarTodo(false);

    const reposClonados = obtenerRepositoriosClonados(estructuraCarpetas);
    let exitosos = 0;
    let fallidos = 0;

    for (const repo of reposClonados) {
      const orgPath = repo.organizacion ? `${repo.organizacion}/` : "";
      const repoName = repo.nombreGit || repo.nombre;
      const repoPath = `${rutaConfiguracion}/repositories/${repo.idConexion || 'unknown'}/${orgPath}${repoName}`;

      try {
        if (window.electronAPI?.deletePath) {
          const resultado = await window.electronAPI.deletePath(repoPath);
          if (resultado.success) {
            exitosos++;
          } else {
            fallidos++;
          }
        }
      } catch (e) {
        fallidos++;
      }
    }

    // Actualizar estado masivamente
    setEstructuraCarpetas(prev => {
      const actualizar = (items: FolderItem[]): FolderItem[] => {
        return items.map(i => {
          if (i.tipo === 'archivo' && i.clonado) {
            return { ...i, clonado: false };
          }
          if (i.hijos) {
            return { ...i, hijos: actualizar(i.hijos) };
          }
          return i;
        });
      };
      const nueva = actualizar(prev);
      if (window.electronAPI?.writeConfig) {
        window.electronAPI.writeConfig({ repositorios: nueva });
      }
      return nueva;
    });

    if (fallidos === 0) {
      showToast(`Se purgaron ${exitosos} repositorios exitosamente`, 'success');
    } else {
      showToast(`Purgado completado. Exitosos: ${exitosos}, Fallidos: ${fallidos}`, 'warning');
    }
  };

  // Obtener ruta por defecto de documentos e inicializar configuración
  useEffect(() => {
    const inicializarConfiguracion = async () => {
      // Mantener el loading activo mientras se inicializa
      setIsLoading(true);

      // Esperar un poco para asegurar que Electron esté listo
      await new Promise(resolve => setTimeout(resolve, 500));

      try {
        // Intentar obtener la ruta de documentos desde Electron
        if (window.electronAPI?.getDocumentsPath) {
          const documentsPath = await window.electronAPI.getDocumentsPath();
          const rutaPorDefecto = `${documentsPath}/Tuco`;

          // Inicializar configuración (verificar si existe el archivo)
          if (window.electronAPI?.initializeConfig) {
            const resultado = await window.electronAPI.initializeConfig(documentsPath);

            if (resultado.success) {
              setRutaConfiguracion(resultado.ruta || rutaPorDefecto);

              // Si es la primera vez (archivo no existe), mostrar wizard y no cargar configuración
              if (resultado.isFirstTime) {
                setMostrarWizardBienvenida(true);
                setWizardCargado(true);
                setIsLoading(false);
                return; // Salir temprano, el wizard creará el archivo al completarse
              }

              // Aplicar tema guardado
              const temaMode = resultado.tema === 'dark' ? 'dark' : 'light';
              const temaNombre = resultado.temaNombre || 'default';
              setIsDark(temaMode === 'dark');
              setSelectedTheme({ name: temaNombre, mode: temaMode });
              applyTheme(temaNombre as ThemeName, temaMode);

              // Aplicar zoom guardado
              if (resultado.zoomLevel) {
                setZoomLevel(resultado.zoomLevel);
                setTempZoomLevel(resultado.zoomLevel);
                document.documentElement.style.setProperty('--zoom-level', `${resultado.zoomLevel}%`);
              } else {
                // Si no hay zoom guardado, usar el por defecto
                setZoomLevel(100);
                setTempZoomLevel(100);
                document.documentElement.style.setProperty('--zoom-level', '100%');
              }

              // Cargar estructura de repositorios guardada
              if (resultado.repositorios && resultado.repositorios.length > 0) {
                const reposConEstado = await Promise.all(resultado.repositorios.map(async (item: FolderItem) => {
                  const verificarEstado = async (node: FolderItem): Promise<FolderItem> => {
                    if (node.tipo === "archivo") {
                      const orgPath = node.organizacion ? `${node.organizacion}/` : "";
                      const repoName = node.nombreGit || node.nombre;
                      const destPath = `${resultado.ruta}/repositories/${node.idConexion || 'unknown'}/${orgPath}${repoName}`;
                      const existe = window.electronAPI?.checkPathExists ? await window.electronAPI.checkPathExists(destPath) : false;
                      return { ...node, clonado: existe };
                    }
                    if (node.hijos) {
                      const hijosActualizados = await Promise.all(node.hijos.map(h => verificarEstado(h)));
                      return { ...node, hijos: hijosActualizados };
                    }
                    return node;
                  };
                  return verificarEstado(item);
                }));
                setEstructuraCarpetas(reposConEstado);
              }

              // Cargar conexiones guardadas
              if (window.electronAPI?.readConfig) {
                const configResult = await window.electronAPI.readConfig();
                if (configResult.success && configResult.config?.conexiones) {
                  setConexionesGuardadas(configResult.config.conexiones);
                }
              }

              // Cargar editor IDE guardado (se validará cuando se detecten los editores instalados)
              if (resultado.editorIDE) {
                setEditorIDESeleccionado(resultado.editorIDE);
                setEditorIDECargado(true);
              } else {
                setEditorIDECargado(true);
              }

              // Cargar verificación SSL de Git
              if (resultado.gitSslVerify !== undefined) {
                setGitSslVerify(resultado.gitSslVerify);
              }

              // Cargar comportamiento del botón de commit
              if (resultado.commitButtonBehavior !== undefined) {
                setCommitButtonBehavior(resultado.commitButtonBehavior);
              }

              // Cargar idioma de UI
              if (resultado.uiLanguage !== undefined) {
                setUiLanguage(resultado.uiLanguage);
                initializeLanguage(resultado.uiLanguage);
              } else {
                // Si no hay idioma guardado, usar el idioma actual de i18next
                setUiLanguage(currentLanguage);
              }

              // Cargar identidades de Git
              if (resultado.gitIdentities && Array.isArray(resultado.gitIdentities)) {
                // Asegurar que la identidad por defecto existe y esté primero
                const identidades = [...resultado.gitIdentities];
                const defaultIndex = identidades.findIndex(id => id.id === IDENTIDAD_DEFAULT_ID);

                if (defaultIndex === -1) {
                  // Si no existe, agregarla al inicio
                  identidades.unshift(IDENTIDAD_DEFAULT);
                } else {
                  // Si existe, moverla al inicio
                  const defaultIdentity = identidades[defaultIndex];
                  identidades.splice(defaultIndex, 1);
                  identidades.unshift(defaultIdentity);
                }

                setGitIdentities(identidades);
              } else {
                // Si no hay identidades guardadas, crear solo la por defecto
                setGitIdentities([IDENTIDAD_DEFAULT]);
              }

              // Si llegamos aquí, el archivo ya existe, no mostrar wizard
              setWizardCargado(true);

              // Cargar configuración de usuario de Git
              if (resultado.gitUserName !== undefined && resultado.gitUserName) {
                setGitUserName(resultado.gitUserName);
                // Aplicar a Git si hay valor guardado
                if (window.electronAPI?.setGitConfig) {
                  window.electronAPI.setGitConfig('user.name', resultado.gitUserName).catch(err => {
                    // Error al aplicar nombre de Git
                  });
                }
              } else {
                // Si no hay valor guardado, intentar leer de Git
                if (window.electronAPI?.getGitConfig) {
                  window.electronAPI.getGitConfig('user.name').then(result => {
                    if (result.success && result.value) {
                      setGitUserName(result.value);
                    }
                  }).catch(err => {
                    // Error al leer nombre de Git
                  });
                }
              }

              if (resultado.gitUserEmail !== undefined && resultado.gitUserEmail) {
                setGitUserEmail(resultado.gitUserEmail);
                // Aplicar a Git si hay valor guardado
                if (window.electronAPI?.setGitConfig) {
                  window.electronAPI.setGitConfig('user.email', resultado.gitUserEmail).catch(err => {
                    // Error al aplicar correo de Git
                  });
                }
              } else {
                // Si no hay valor guardado, intentar leer de Git
                if (window.electronAPI?.getGitConfig) {
                  window.electronAPI.getGitConfig('user.email').then(result => {
                    if (result.success && result.value) {
                      setGitUserEmail(result.value);
                    }
                  }).catch(err => {
                    // Error al leer correo de Git
                  });
                }
              }

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
            } else {
              // Error al inicializar configuración
              setRutaConfiguracion(rutaPorDefecto);
            }
          } else {
            setRutaConfiguracion(rutaPorDefecto);
          }
        } else {
        }
      } catch (error) {
        // Error al inicializar configuración
      } finally {
        // Desactivar el loading una vez que todo esté cargado
        setIsLoading(false);
      }
    };

    // Ejecutar después de que el componente esté montado
    inicializarConfiguracion();
  }, []);

  // Verificar y crear configuración cuando se accede a la tab de datos
  // Efecto para cerrar modales y wizards con la tecla Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        // Solo cerrar si no hay un input o textarea enfocado (opcional, pero ayuda a no cerrar accidentalmente)
        const activeElement = document.activeElement;
        const esInput = activeElement && (activeElement.tagName === "INPUT" || activeElement.tagName === "TEXTAREA");

        // Modales de eliminación (siempre cerrar con Escape para mejor UX)
        if (mostrarModalEliminarConexion) {
          setMostrarModalEliminarConexion(false);
          setConexionAEliminar(null);
          return;
        }
        if (mostrarModalEliminarColeccion) {
          setMostrarModalEliminarColeccion(false);
          setColeccionAEliminar(null);
          return;
        }
        if (mostrarModalEliminarRepositorio) {
          setMostrarModalEliminarRepositorio(false);
          setRepositorioAEliminar(null);
          return;
        }
        if (mostrarModalConfirmarReclon) {
          setMostrarModalConfirmarReclon(false);
          setRepoAClonar(null);
          setRutaDestinoAClonar("");
          return;
        }
        if (mostrarModalPurgarTodo) {
          setMostrarModalPurgarTodo(false);
          return;
        }
        if (mostrarModalPurgarRepo) {
          setMostrarModalPurgarRepo(false);
          setRepoAPurgar(null);
          return;
        }

        // Si estamos en un input, no cerramos otros modales para evitar cierres accidentales
        if (esInput) return;

        // Otros modales y wizards
        if (mostrarWizardNuevoRepositorio) {
          setMostrarWizardNuevoRepositorio(false);
          setPasoWizardRepositorio(1);
          setConexionSeleccionada(null);
          setRepositorioSeleccionado("");
          setRepositoriosDisponibles([]);
          setNombreRepositorio("");
          setDescripcionRepositorio("");
          setBusquedaRepositorio("");
          setEditandoRepositorio(false);
          setRepositorioAEditar(null);
        }

        if (mostrarWizardNuevaConexion) setMostrarWizardNuevaConexion(false);

        if (mostrarModalNuevaCarpeta) {
          setMostrarModalNuevaCarpeta(false);
          setNombreNuevaCarpeta("");
          setDescripcionNuevaCarpeta("");
        }

        if (mostrarModalEditarColeccion) {
          setMostrarModalEditarColeccion(false);
          setColeccionAEditar(null);
          setNombreEditarColeccion("");
          setDescripcionEditarColeccion("");
        }

        if (mostrarModalRestablecerConfig) setMostrarModalRestablecerConfig(false);
        if (mostrarModalNuevaIdentidad) {
          setMostrarModalNuevaIdentidad(false);
          setNombreNuevaIdentidad("");
          setEmailNuevaIdentidad("");
        }
        if (mostrarModalEditarIdentidad) {
          setMostrarModalEditarIdentidad(false);
          setIdentidadAEditar(null);
          setNombreNuevaIdentidad("");
          setEmailNuevaIdentidad("");
        }
        if (mostrarModalEliminarIdentidad) {
          setMostrarModalEliminarIdentidad(false);
          setIdentidadAEliminar(null);
        }

        // Menús desplegables
        if (mostrarMenuNuevaCarpeta) setMostrarMenuNuevaCarpeta(false);
        if (mostrarMenuNuevaConexion) setMostrarMenuNuevaConexion(false);
        if (mostrarMenuOrdenar) setMostrarMenuOrdenar(false);
        if (mostrarMenuOrdenarRepos) setMostrarMenuOrdenarRepos(false);
        if (mostrarMenuConexion) setMostrarMenuConexion(false);
        if (mostrarMenuIdentidad) setMostrarMenuIdentidad(false);
        if (mostrarMenuAccionesRepos) setMostrarMenuAccionesRepos(false);
        if (mostrarModalClonarTodos) setMostrarModalClonarTodos(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [
    mostrarWizardNuevoRepositorio, mostrarWizardNuevaConexion,
    mostrarModalEliminarConexion, mostrarModalEliminarColeccion, mostrarModalEliminarRepositorio,
    mostrarModalNuevaCarpeta, mostrarModalEditarColeccion, mostrarModalRestablecerConfig,
    mostrarModalConfirmarReclon,
    mostrarMenuNuevaCarpeta, mostrarMenuNuevaConexion, mostrarMenuOrdenar,
    mostrarMenuOrdenarRepos, mostrarMenuConexion, mostrarMenuIdentidad, mostrarMenuAccionesRepos,
    mostrarModalClonarTodos, mostrarModalNuevaIdentidad, mostrarModalEditarIdentidad, mostrarModalEliminarIdentidad,
    mostrarModalPurgarTodo, mostrarModalPurgarRepo
  ]);

  useEffect(() => {
    const verificarYCrearConfig = async () => {
      if (activeTab === "configuracion" && configTabActiva === "datos") {
        if (window.electronAPI?.getDocumentsPath && window.electronAPI?.initializeConfig) {
          try {
            const documentsPath = await window.electronAPI.getDocumentsPath();
            const resultado = await window.electronAPI.initializeConfig(documentsPath);
            if (resultado.success) {
              if (!rutaConfiguracion) {
                setRutaConfiguracion(resultado.ruta || `${documentsPath}/Tuco`);
              }
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
          } catch (error) {
            // Error al verificar configuración
          }
        }
      }
    };
    verificarYCrearConfig();
  }, [activeTab, configTabActiva]);

  // Aplicar tema al documento
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [isDark]);

  // Debounce para búsqueda de repositorios
  useEffect(() => {
    const timer = setTimeout(() => {
      setTerminoBusquedaDebounced(terminoBusqueda);
    }, 300);

    return () => clearTimeout(timer);
  }, [terminoBusqueda]);

  // Debounce para búsqueda de conexiones
  useEffect(() => {
    const timer = setTimeout(() => {
      setTerminoBusquedaConexionesDebounced(terminoBusquedaConexiones);
    }, 300);

    return () => clearTimeout(timer);
  }, [terminoBusquedaConexiones]);

  // Atajos de teclado para cambiar de tab
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // No interceptar atajos si el usuario está escribiendo en un input, textarea o contenteditable
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        // Permitir Ctrl+V/Cmd+V, Ctrl+C/Cmd+C, Ctrl+A/Cmd+A, etc.
        if ((e.metaKey || e.ctrlKey) && (e.key === 'v' || e.key === 'V' || e.key === 'c' || e.key === 'C' || e.key === 'a' || e.key === 'A' || e.key === 'x' || e.key === 'X')) {
          return; // Permitir que el navegador maneje estos atajos normalmente
        }
        return; // No interceptar otros atajos cuando se está en un input
      }

      // Verificar si se presionó Cmd (Mac) o Ctrl (Windows/Linux)
      const isModifierPressed = e.metaKey || e.ctrlKey;

      if (!isModifierPressed) return;

      // Prevenir el comportamiento por defecto del navegador
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
          setActiveTab('configuracion');
          setConfigTabActiva('general');
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Función para completar el wizard de bienvenida
  const completarWizardBienvenida = async (nombre?: string, email?: string) => {
    setMostrarWizardBienvenida(false);

    try {
      // Crear el archivo de configuración con los datos del wizard
      if (window.electronAPI?.getDocumentsPath && window.electronAPI?.writeConfig) {
        const documentsPath = await window.electronAPI.getDocumentsPath();

        if (nombre && email) {
          // Crear identidad predeterminada con los datos del wizard
          const identidadActualizada = {
            id: IDENTIDAD_DEFAULT_ID,
            nombre: nombre,
            email: email
          };

          // Guardar configuración inicial con los datos del wizard
          // writeConfig ahora crea el archivo si no existe
          await window.electronAPI.writeConfig({
            wizardCompleted: true,
            gitUserName: nombre,
            gitUserEmail: email,
            gitIdentities: [identidadActualizada]
          });

          // Aplicar a Git globalmente
          if (window.electronAPI?.setGitConfig) {
            await window.electronAPI.setGitConfig('user.name', nombre);
            await window.electronAPI.setGitConfig('user.email', email);
          }

          // Actualizar el estado local
          setGitUserName(nombre);
          setGitUserEmail(email);
          setGitIdentities([identidadActualizada]);
        } else {
          // Si no se proporcionaron valores, crear archivo con valores por defecto
          await window.electronAPI.writeConfig({
            wizardCompleted: true,
            gitIdentities: [IDENTIDAD_DEFAULT]
          });
          setGitIdentities([IDENTIDAD_DEFAULT]);
        }

        // Recargar la configuración para aplicar todos los valores
        if (window.electronAPI?.initializeConfig) {
          const configRecargada = await window.electronAPI.initializeConfig(documentsPath);
          if (configRecargada.success) {
            setRutaConfiguracion(configRecargada.ruta || `${documentsPath}/Tuco`);

            // Aplicar tema y otros valores por defecto
            const temaMode = configRecargada.tema === 'dark' ? 'dark' : 'light';
            const temaNombre = configRecargada.temaNombre || 'default';
            setIsDark(temaMode === 'dark');
            setSelectedTheme({ name: temaNombre, mode: temaMode });
            applyTheme(temaNombre as ThemeName, temaMode);

            if (configRecargada.zoomLevel) {
              setZoomLevel(configRecargada.zoomLevel);
              setTempZoomLevel(configRecargada.zoomLevel);
              document.documentElement.style.setProperty('--zoom-level', `${configRecargada.zoomLevel}%`);
            }

            // Cargar repositorios si existen
            if (configRecargada.repositorios && configRecargada.repositorios.length > 0) {
              setEstructuraCarpetas(configRecargada.repositorios);
            }
          }
        }
      }
    } catch (error) {
      // Error al guardar la configuración
    }
  };

  // Manejador para cerrar el wizard con Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mostrarWizardNuevaConexion) {
        setMostrarWizardNuevaConexion(false);
        setPasoWizard(1);
        setProveedorSeleccionado(null);
        setNombreConexion("");
        setTokenAcceso("");
        setUrlServidor("");
        setMostrarToken(false);
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => {
      window.removeEventListener('keydown', handleEscape);
    };
  }, [mostrarWizardNuevaConexion]);

  // Función para obtener la URL por defecto según el proveedor
  const getUrlPorDefecto = (proveedor: string | null): string => {
    switch (proveedor) {
      case "github":
        return "https://github.com";
      case "gitlab":
        return "https://gitlab.com";
      case "gitea":
        return "";
      case "codeberg":
        return "https://codeberg.org";
      case "gogs":
        return "";
      default:
        return "";
    }
  };

  // Función para obtener el nombre del proveedor en español
  const getNombreProveedor = (proveedor: string | null): string => {
    switch (proveedor) {
      case "github":
        return "GitHub";
      case "gitlab":
        return "GitLab";
      case "gitea":
        return "Gitea";
      case "codeberg":
        return "Codeberg";
      case "gogs":
        return "Gogs";
      default:
        return "";
    }
  };

  // Función para ocultar el token mostrando puntos
  const ocultarToken = (token: string): string => {
    if (!token) return "";
    return "•".repeat(Math.min(token.length, 20));
  };

  // Función para validar el token antes de avanzar al paso 3
  const validarTokenYAvanzar = async () => {
    if (!proveedorSeleccionado || !tokenAcceso.trim()) {
      return;
    }

    setValidandoToken(true);
    setErrorValidacionToken(null);
    setTokenValidado(false);

    try {
      const urlServidorFinal = urlServidor || getUrlPorDefecto(proveedorSeleccionado);

      if (!urlServidorFinal) {
        setErrorValidacionToken(t('connectionWizard.step2.token.errorServerUrl'));
        setValidandoToken(false);
        return;
      }

      if (window.electronAPI?.validateGitToken) {
        const resultado = await window.electronAPI.validateGitToken(
          proveedorSeleccionado,
          tokenAcceso,
          urlServidorFinal,
          gitSslVerify
        );

        if (resultado.success) {
          setTokenValidado(true);
          setErrorValidacionToken(null);
          // Avanzar al paso 3
          setPasoWizard(3);
        } else {
          // Traducir el mensaje de error si viene del backend
          let errorMessage = resultado.error || t('connectionWizard.step2.token.errorValidation');
          if (errorMessage === 'Token inválido o sin permisos suficientes') {
            errorMessage = t('connectionWizard.step2.token.errorInvalidOrInsufficient');
          }
          setErrorValidacionToken(errorMessage);
          setTokenValidado(false);
        }
      } else {
        setErrorValidacionToken(t('connectionWizard.step2.token.errorCannotValidate'));
      }
    } catch (error) {
      // Error al validar token
      setErrorValidacionToken(t('connectionWizard.step2.token.errorUnexpected', { message: (error as Error).message }));
      setTokenValidado(false);
    } finally {
      setValidandoToken(false);
    }
  };

  // Función para limpiar estados del wizard
  const limpiarWizardConexion = () => {
    setPasoWizard(1);
    setProveedorSeleccionado(null);
    setNombreConexion("");
    setTokenAcceso("");
    setUrlServidor("");
    setMostrarToken(false);
    setValidandoToken(false);
    setErrorValidacionToken(null);
    setTokenValidado(false);
    setIdentidadSeleccionada(IDENTIDAD_DEFAULT_ID);
    setMostrarMenuIdentidad(false);
    setEditandoConexion(false);
    setConexionAEditar(null);
  };

  // Función para guardar la conexión
  const guardarConexion = async () => {
    try {
      // Encriptar el token antes de guardar
      let tokenEncriptado = "";
      if (window.electronAPI?.encryptToken && tokenAcceso.trim()) {
        const resultadoEncriptacion = await window.electronAPI.encryptToken(tokenAcceso);
        if (resultadoEncriptacion.success && resultadoEncriptacion.encryptedToken) {
          tokenEncriptado = resultadoEncriptacion.encryptedToken;
        } else {
          // Error al encriptar token
          alert("Error al encriptar el token: " + (resultadoEncriptacion.error || "Error desconocido"));
          return;
        }
      }

      let conexionesActualizadas: Connection[];

      if (editandoConexion && conexionAEditar) {
        // Modo edición: actualizar conexión existente
        const conexionActualizada: Connection = {
          ...conexionAEditar,
          nombre: nombreConexion,
          tipo: getNombreProveedor(proveedorSeleccionado),
          host: urlServidor || getUrlPorDefecto(proveedorSeleccionado) || "",
          tokenEncriptado: tokenEncriptado,
          identidadId: identidadSeleccionada,
        };

        conexionesActualizadas = conexionesGuardadas.map(c =>
          c.id === conexionAEditar.id ? conexionActualizada : c
        );
      } else {
        // Modo creación: crear nueva conexión
        const nuevaConexion: Connection = {
          id: conexionesGuardadas.length > 0
            ? Math.max(...conexionesGuardadas.map(c => c.id)) + 1
            : 1,
          nombre: nombreConexion,
          tipo: getNombreProveedor(proveedorSeleccionado),
          host: urlServidor || getUrlPorDefecto(proveedorSeleccionado) || "",
          tokenEncriptado: tokenEncriptado,
          fechaCreacion: new Date().toISOString(),
          identidadId: identidadSeleccionada,
        };

        conexionesActualizadas = [...conexionesGuardadas, nuevaConexion];
      }

      // Guardar en el archivo de configuración
      if (window.electronAPI?.writeConfig) {
        const resultado = await window.electronAPI.writeConfig({
          conexiones: conexionesActualizadas
        } as any);

        if (resultado.success) {
          // Actualizar el estado local
          setConexionesGuardadas(conexionesActualizadas);

          // Cerrar el wizard y limpiar estados
          setMostrarWizardNuevaConexion(false);
          limpiarWizardConexion();
        } else {
          // Error al guardar conexión
          alert("Error al guardar la conexión: " + resultado.error);
        }
      }
    } catch (error) {
      // Error al guardar conexión
      alert("Error al guardar la conexión: " + (error as Error).message);
    }
  };

  // Función para abrir el modal de confirmación de eliminación
  // Función para obtener repositorios asociados a una conexión
  const obtenerRepositoriosAsociados = (conexionId: number, items: FolderItem[]): FolderItem[] => {
    let repositorios: FolderItem[] = [];
    items.forEach((item) => {
      if (item.tipo === "archivo" && item.idConexion === conexionId) {
        repositorios.push(item);
      }
      if (item.hijos && item.hijos.length > 0) {
        repositorios = [...repositorios, ...obtenerRepositoriosAsociados(conexionId, item.hijos)];
      }
    });
    return repositorios;
  };

  const abrirModalEliminarConexion = (conexion: Connection) => {
    setConexionAEliminar(conexion);
    setMostrarModalEliminarConexion(true);
  };

  // Función para formatear fecha en formato relativo
  const formatearFechaRelativa = (fechaISO: string): string => {
    if (!fechaISO) return "Fecha no disponible";

    const fecha = new Date(fechaISO);
    const ahora = new Date();
    const diffMs = ahora.getTime() - fecha.getTime();
    const diffSegundos = Math.floor(diffMs / 1000);
    const diffMinutos = Math.floor(diffSegundos / 60);
    const diffHoras = Math.floor(diffMinutos / 60);
    const diffDias = Math.floor(diffHoras / 24);
    const diffMeses = Math.floor(diffDias / 30);
    const diffAnos = Math.floor(diffDias / 365);

    // Menos de un minuto
    if (diffSegundos < 60) {
      return "Creado hace un momento";
    }

    // Menos de una hora
    if (diffMinutos < 60) {
      return `Creado hace ${diffMinutos} ${diffMinutos === 1 ? 'minuto' : 'minutos'}`;
    }

    // Menos de un día
    if (diffHoras < 24) {
      return `Creado hace ${diffHoras} ${diffHoras === 1 ? 'hora' : 'horas'}`;
    }

    // Menos de un mes
    if (diffDias < 30) {
      return `Creado hace ${diffDias} ${diffDias === 1 ? 'día' : 'días'}`;
    }

    // Menos de un año
    if (diffMeses < 12) {
      return `Creado hace ${diffMeses} ${diffMeses === 1 ? 'mes' : 'meses'}`;
    }

    // Más de un año
    return `Creado hace ${diffAnos} ${diffAnos === 1 ? 'año' : 'años'}`;
  };

  // Función para abrir el wizard de edición de conexión
  const abrirWizardEditarConexion = async (conexion: Connection) => {
    setConexionAEditar(conexion);
    setEditandoConexion(true);

    // Cargar los datos de la conexión en el wizard
    // Mapear el tipo de conexión al formato del wizard
    const tipoProveedor = conexion.tipo.toLowerCase();
    setProveedorSeleccionado(tipoProveedor as "github" | "gitlab" | "gitea" | "gogs" | "codeberg" | null);
    setNombreConexion(conexion.nombre);
    setUrlServidor(conexion.host);
    setIdentidadSeleccionada(conexion.identidadId || IDENTIDAD_DEFAULT_ID);

    // Desencriptar el token para mostrarlo (solo para edición)
    if (window.electronAPI?.decryptToken) {
      try {
        const resultado = await window.electronAPI.decryptToken(conexion.tokenEncriptado);
        if (resultado.success && resultado.token) {
          setTokenAcceso(resultado.token);
          setTokenValidado(true);
        }
      } catch (error) {
        // Error al desencriptar token
      }
    }

    setPasoWizard(2); // Ir directamente al paso 2 (autenticación)
    setMostrarWizardNuevaConexion(true);
  };

  // Función para verificar el estado de conexión
  const verificarEstadoConexion = async (conexion: Connection) => {
    if (estadosConexion[conexion.id] === 'checking') {
      return; // Ya está verificando
    }

    setEstadosConexion(prev => ({ ...prev, [conexion.id]: 'checking' }));

    try {
      if (!window.electronAPI?.decryptToken || !window.electronAPI?.validateGitToken) {
        setEstadosConexion(prev => ({ ...prev, [conexion.id]: 'disconnected' }));
        return;
      }

      const resultadoDesencriptacion = await window.electronAPI.decryptToken(conexion.tokenEncriptado);
      if (!resultadoDesencriptacion.success || !resultadoDesencriptacion.token) {
        setEstadosConexion(prev => ({ ...prev, [conexion.id]: 'disconnected' }));
        return;
      }

      const proveedorNormalizado = conexion.tipo.toLowerCase();
      const resultado = await window.electronAPI.validateGitToken(
        proveedorNormalizado,
        resultadoDesencriptacion.token,
        conexion.host,
        gitSslVerify
      );

      if (resultado.success) {
        setEstadosConexion(prev => ({ ...prev, [conexion.id]: 'connected' }));
      } else {
        // Verificar si es token expirado o error de conexión
        const errorMsg = resultado.error?.toLowerCase() || '';
        if (errorMsg.includes('expirado') || errorMsg.includes('invalid') || errorMsg.includes('401') || errorMsg.includes('403')) {
          setEstadosConexion(prev => ({ ...prev, [conexion.id]: 'expired' }));
        } else {
          setEstadosConexion(prev => ({ ...prev, [conexion.id]: 'disconnected' }));
        }
      }
    } catch (error) {
      // Error al verificar estado de conexión
      setEstadosConexion(prev => ({ ...prev, [conexion.id]: 'disconnected' }));
    }
  };

  // Función para obtener detalles de una conexión
  const obtenerDetallesConexion = async (conexion: Connection) => {
    if (cargandoDetalles[conexion.id] || conexionesDetalles[conexion.id]) {
      return; // Ya está cargando o ya tiene detalles
    }

    // Verificar estado de conexión primero
    const estado = estadosConexion[conexion.id];
    if (estado === 'disconnected' || estado === 'expired') {
      // No intentar obtener detalles si no hay conexión
      return;
    }

    // Si no hay estado verificado aún, esperar a que se verifique
    if (!estado) {
      return;
    }

    setCargandoDetalles(prev => ({ ...prev, [conexion.id]: true }));

    try {
      if (!window.electronAPI?.decryptToken || !window.electronAPI?.getConnectionDetails) {
        return;
      }

      const resultadoDesencriptacion = await window.electronAPI.decryptToken(conexion.tokenEncriptado);
      if (!resultadoDesencriptacion.success || !resultadoDesencriptacion.token) {
        return;
      }

      const proveedorNormalizado = conexion.tipo.toLowerCase();
      const resultado = await window.electronAPI.getConnectionDetails(
        proveedorNormalizado,
        resultadoDesencriptacion.token,
        conexion.host,
        gitSslVerify
      );

      if (resultado.success && resultado.data) {
        setConexionesDetalles(prev => ({
          ...prev,
          [conexion.id]: resultado.data!
        }));
      }
    } catch (error) {
      // Error al obtener detalles de conexión
    } finally {
      setCargandoDetalles(prev => ({ ...prev, [conexion.id]: false }));
    }
  };

  // Función para contar repositorios configurados y clonados localmente
  const contarRepositoriosLocales = (conexionId: number) => {
    let configurados = 0;
    let clonados = 0;

    const contarEnNodo = (nodo: FolderItem) => {
      if (nodo.tipo === "archivo" && nodo.idConexion === conexionId) {
        configurados++;
        if (nodo.clonado) {
          clonados++;
        }
      }
      if (nodo.hijos) {
        nodo.hijos.forEach(contarEnNodo);
      }
    };

    estructuraCarpetas.forEach(contarEnNodo);
    return { configurados, clonados };
  };

  // Función para refrescar las conexiones
  const refrescarConexiones = async () => {
    setRefrescandoConexiones(true);
    try {
      if (window.electronAPI?.readConfig) {
        const configResult = await window.electronAPI.readConfig();
        if (configResult.success && configResult.config?.conexiones) {
          setConexionesGuardadas(configResult.config.conexiones);
          // Limpiar detalles y estados al refrescar
          setConexionesDetalles({});
          setEstadosConexion({});
        } else {
          setConexionesGuardadas([]);
          setConexionesDetalles({});
          setEstadosConexion({});
        }
      }
    } catch (error) {
      // Error al refrescar conexiones
    } finally {
      setRefrescandoConexiones(false);
    }
  };

  // Función para refrescar los repositorios
  const refrescarRepositorios = async () => {
    setRefrescandoRepositorios(true);
    try {
      if (window.electronAPI?.getDocumentsPath && window.electronAPI?.initializeConfig) {
        const documentsPath = await window.electronAPI.getDocumentsPath();
        const resultado = await window.electronAPI.initializeConfig(documentsPath);

        if (resultado.success && resultado.repositorios && resultado.repositorios.length > 0) {
          // Verificar el estado real de clonado de cada repositorio
          const reposConEstado = await Promise.all(resultado.repositorios.map(async (item: FolderItem) => {
            const verificarEstado = async (node: FolderItem): Promise<FolderItem> => {
              if (node.tipo === "archivo") {
                const orgPath = node.organizacion ? `${node.organizacion}/` : "";
                const repoName = node.nombreGit || node.nombre;
                const destPath = `${resultado.ruta}/repositories/${node.idConexion || 'unknown'}/${orgPath}${repoName}`;
                const existe = window.electronAPI?.checkPathExists ? await window.electronAPI.checkPathExists(destPath) : false;
                return { ...node, clonado: existe };
              }
              if (node.hijos) {
                const hijosActualizados = await Promise.all(node.hijos.map(h => verificarEstado(h)));
                return { ...node, hijos: hijosActualizados };
              }
              return node;
            };
            return verificarEstado(item);
          }));

          setEstructuraCarpetas(reposConEstado);

          // Forzar actualización de info de Git para todos los repositorios clonados
          const cargarTodoGitInfo = async (items: FolderItem[]) => {
            for (const item of items) {
              if (item.tipo === 'archivo' && item.clonado) {
                await cargarGitInfo(item);
              }
              if (item.hijos) {
                await cargarTodoGitInfo(item.hijos);
              }
            }
          };
          await cargarTodoGitInfo(reposConEstado);
        } else {
          // Si no hay repositorios, usar la estructura por defecto
          setEstructuraCarpetas([{
            id: "root",
            nombre: "Mis repositorios",
            tipo: "coleccion",
            hijos: [],
          }]);
        }
      }
    } catch (error) {
      // Error al refrescar repositorios
    } finally {
      setRefrescandoRepositorios(false);
    }
  };

  // Función para confirmar y eliminar una conexión
  const confirmarEliminarConexion = async () => {
    if (!conexionAEliminar) return;

    try {
      // Filtrar la conexión a eliminar
      const conexionesActualizadas = conexionesGuardadas.filter(c => c.id !== conexionAEliminar.id);

      // Función recursiva para eliminar repositorios asociados a la conexión
      const eliminarRepositoriosDeConexion = (items: FolderItem[]): FolderItem[] => {
        return items.filter(item => {
          // Si es un repositorio (archivo) y está asociado a esta conexión, eliminarlo
          if (item.tipo === "archivo" && item.idConexion === conexionAEliminar.id) {
            return false; // Eliminar este repositorio
          }
          // Si tiene hijos, procesarlos recursivamente
          if (item.hijos && item.hijos.length > 0) {
            item.hijos = eliminarRepositoriosDeConexion(item.hijos);
          }
          return true; // Mantener este item
        });
      };

      // Eliminar repositorios asociados de la estructura
      const nuevaEstructura = eliminarRepositoriosDeConexion(estructuraCarpetas);
      setEstructuraCarpetas(nuevaEstructura);

      // Guardar en el archivo de configuración
      if (window.electronAPI?.writeConfig) {
        const resultado = await window.electronAPI.writeConfig({
          conexiones: conexionesActualizadas,
          repositorios: nuevaEstructura
        } as any);

        if (resultado.success) {
          // Actualizar el estado local
          setConexionesGuardadas(conexionesActualizadas);
          // Cerrar el modal
          setMostrarModalEliminarConexion(false);
          setConexionAEliminar(null);
          showToast('Conexión y repositorios asociados eliminados exitosamente', 'success');
        } else {
          // Error al eliminar conexión
          showToast(`Error al eliminar la conexión: ${resultado.error}`, 'error');
        }
      }
    } catch (error) {
      // Error al eliminar conexión
      showToast(`Error al eliminar la conexión: ${(error as Error).message}`, 'error');
    }
  };

  // Prellenar URL cuando se selecciona un proveedor y se avanza al paso 2
  useEffect(() => {
    if (proveedorSeleccionado && pasoWizard === 2) {
      const urlPorDefecto = getUrlPorDefecto(proveedorSeleccionado);
      if (urlPorDefecto) {
        setUrlServidor(urlPorDefecto);
      }
    }
  }, [proveedorSeleccionado, pasoWizard]);

  // Resetear validación cuando cambia el token o el proveedor
  useEffect(() => {
    if (pasoWizard === 2) {
      setTokenValidado(false);
      setErrorValidacionToken(null);
    }
  }, [tokenAcceso, proveedorSeleccionado, urlServidor, pasoWizard]);

  const toggleTheme = async () => {
    const nuevoTema = !isDark;
    setIsDark(nuevoTema);
    const nuevoMode = nuevoTema ? 'dark' : 'light';

    // Aplicar el tema seleccionado con el nuevo modo
    applyTheme(selectedTheme.name as ThemeName, nuevoMode);
    setSelectedTheme({ ...selectedTheme, mode: nuevoMode });

    // Guardar tema en el archivo de configuración
    try {
      if (window.electronAPI?.writeConfig) {
        await window.electronAPI.writeConfig({
          tema: nuevoMode,
          temaNombre: selectedTheme.name
        });
      }
    } catch (error) {
      // Error al guardar tema
    }
  };

  const handleThemeSelect = async (themeName: ThemeName) => {
    const currentMode = isDark ? 'dark' : 'light';
    setSelectedTheme({ name: themeName, mode: currentMode });
    applyTheme(themeName, currentMode);

    // Guardar tema en el archivo de configuración
    try {
      if (window.electronAPI?.writeConfig) {
        await window.electronAPI.writeConfig({
          tema: currentMode,
          temaNombre: themeName
        });
      }
    } catch (error) {
      // Error al guardar tema
    }
  };

  // Funciones para manejar la estructura de carpetas
  const obtenerCarpetaActual = (): FolderItem | null => {
    let actual: FolderItem | undefined = estructuraCarpetas[0];
    for (let i = 1; i < rutaActual.length; i++) {
      const idBuscado = rutaActual[i];
      actual = actual?.hijos?.find((hijo) => hijo.id === idBuscado);
      if (!actual) return null;
    }
    return actual || null;
  };

  // Función para obtener todos los items recursivamente de la estructura
  const obtenerTodosLosItems = (items: FolderItem[]): FolderItem[] => {
    const todosLosItems: FolderItem[] = [];
    const recorrer = (items: FolderItem[]) => {
      items.forEach((item) => {
        todosLosItems.push(item);
        if (item.hijos && item.hijos.length > 0) {
          recorrer(item.hijos);
        }
      });
    };
    recorrer(items);
    return todosLosItems;
  };

  const navegarACarpeta = (carpetaId: string) => {
    setRutaActual([...rutaActual, carpetaId]);
  };

  const crearNuevaCarpeta = async () => {
    const carpetaActual = obtenerCarpetaActual();
    if (!carpetaActual) return;

    // Limpiar errores previos
    setErrorNombre(null);
    setErrorDescripcion(null);

    // Validar que el nombre no esté vacío
    const nombreTrimmed = nombreNuevaCarpeta.trim();
    if (!nombreTrimmed) {
      setErrorNombre("El nombre es requerido");
      return;
    }

    // Validar límites de caracteres
    if (nombreTrimmed.length > 32) {
      setErrorNombre("El nombre no puede exceder 32 caracteres");
      return;
    }

    const descripcionTrimmed = descripcionNuevaCarpeta.trim();
    if (descripcionTrimmed.length > 150) {
      setErrorDescripcion("La descripción no puede exceder 150 caracteres");
      return;
    }

    // Validar que el nombre no se repita en la misma ruta
    const nombresExistentes = carpetaActual.hijos?.map((h) => h.nombre.toLowerCase()) || [];
    if (nombresExistentes.includes(nombreTrimmed.toLowerCase())) {
      setErrorNombre("Ya existe una colección con ese nombre en esta ubicación");
      return;
    }

    setCreandoColeccion(true);

    try {
      const nuevoId = `coleccion-${Date.now()}`;
      const nuevaCarpeta: FolderItem = {
        id: nuevoId,
        nombre: nombreTrimmed,
        tipo: "coleccion",
        descripcion: descripcionTrimmed || undefined,
        backgroundColor: colorNuevaCarpeta || undefined,
        hijos: [],
      };

      const actualizarEstructura = (items: FolderItem[]): FolderItem[] => {
        return items.map((item) => {
          if (item.id === carpetaActual.id) {
            return {
              ...item,
              hijos: [...(item.hijos || []), nuevaCarpeta],
            };
          }
          if (item.hijos) {
            return {
              ...item,
              hijos: actualizarEstructura(item.hijos),
            };
          }
          return item;
        });
      };

      const nuevaEstructura = actualizarEstructura(estructuraCarpetas);
      setEstructuraCarpetas(nuevaEstructura);

      // Guardar estructura actualizada en el archivo de configuración
      if (window.electronAPI?.writeConfig) {
        await window.electronAPI.writeConfig({ repositorios: nuevaEstructura });
      }

      // Pequeño delay para mejor UX
      await new Promise(resolve => setTimeout(resolve, 300));

      setNombreNuevaCarpeta("");
      setDescripcionNuevaCarpeta("");
      setColorNuevaCarpeta("");
      setMostrarModalNuevaCarpeta(false);
      setErrorNombre(null);
      setErrorDescripcion(null);
    } catch (error) {
      setErrorNombre(t('repositories.newCollectionModal.name.errors.createError'));
    } finally {
      setCreandoColeccion(false);
    }
  };

  const abrirModalNuevaCarpeta = () => {
    setMostrarMenuNuevaCarpeta(false);
    setNombreNuevaCarpeta("");
    setDescripcionNuevaCarpeta("");
    setErrorNombre(null);
    setErrorDescripcion(null);
    setCreandoColeccion(false);
    setMostrarModalNuevaCarpeta(true);
  };

  const abrirWizardNuevoRepositorio = () => {
    setMostrarMenuNuevaCarpeta(false);
    setMostrarWizardNuevoRepositorio(true);
    setPasoWizardRepositorio(1);
    setConexionSeleccionada(null);
    setRepositorioSeleccionado("");
    setRepositoriosDisponibles([]);
    setNombreRepositorio("");
    setDescripcionRepositorio("");
    setColorRepositorio("");
    setBusquedaRepositorio("");
  };

  const cargarRepositorios = async (conexion: Connection, mostrarError: boolean = true) => {
    setCargandoRepositorios(true);
    setRepositoriosDisponibles([]);
    setRepositorioSeleccionado("");

    try {
      // Desencriptar token
      if (!window.electronAPI?.decryptToken) {
        throw new Error("API de desencriptación no disponible");
      }

      const resultadoDesencriptacion = await window.electronAPI.decryptToken(conexion.tokenEncriptado);
      if (!resultadoDesencriptacion.success || !resultadoDesencriptacion.token) {
        throw new Error("Error al desencriptar token");
      }

      const token = resultadoDesencriptacion.token;

      // Obtener repositorios usando el handler IPC (desde el proceso principal)
      if (!window.electronAPI?.getGitRepositories) {
        throw new Error("API para obtener repositorios no disponible");
      }

      // Normalizar el nombre del proveedor (de "GitHub" a "github", etc.)
      const proveedorNormalizado = conexion.tipo.toLowerCase();

      const resultado = await window.electronAPI.getGitRepositories(
        proveedorNormalizado,
        token,
        conexion.host,
        gitSslVerify
      );

      if (!resultado.success) {
        throw new Error(resultado.error || "Error desconocido al obtener repositorios");
      }

      if (!resultado.repositories || resultado.repositories.length === 0) {
        setRepositoriosDisponibles([]);
      } else {
        setRepositoriosDisponibles(resultado.repositories);
      }
    } catch (error) {
      // Error al cargar repositorios
      setRepositoriosDisponibles([]);
      // Solo mostrar alert si se solicita explícitamente (cuando se está creando un nuevo repositorio)
      if (mostrarError) {
        alert(t('repositories.newRepositoryWizard.errors.loadError', { message: (error as Error).message }));
      }
      // Re-lanzar el error para que pueda ser manejado por el llamador si es necesario
      throw error;
    } finally {
      setCargandoRepositorios(false);
    }
  };

  // Función para obtener el icono del proveedor de Git
  const getIconoProveedor = (tipo: string) => {
    if (tipo === "GitHub") {
      return (
        <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <g transform="translate(-84, -7399)" fill="currentColor">
            <path d="M94,7399 C99.523,7399 104,7403.59 104,7409.253 C104,7413.782 101.138,7417.624 97.167,7418.981 C96.66,7419.082 96.48,7418.762 96.48,7418.489 C96.48,7418.151 96.492,7417.047 96.492,7415.675 C96.492,7414.719 96.172,7414.095 95.813,7413.777 C98.04,7413.523 100.38,7412.656 100.38,7408.718 C100.38,7407.598 99.992,7406.684 99.35,7405.966 C99.454,7405.707 99.797,7404.664 99.252,7403.252 C99.252,7403.252 98.414,7402.977 96.505,7404.303 C95.706,7404.076 94.85,7403.962 94,7403.958 C93.15,7403.962 92.295,7404.076 91.497,7404.303 C89.586,7402.977 88.746,7403.252 88.746,7403.252 C88.203,7404.664 88.546,7405.707 88.649,7405.966 C88.01,7406.684 87.619,7407.598 87.619,7408.718 C87.619,7412.646 89.954,7413.526 92.175,7413.785 C91.889,7414.041 91.63,7414.493 91.54,7415.156 C90.97,7415.418 89.522,7415.871 88.63,7414.304 C88.63,7414.304 88.101,7413.319 87.097,7413.247 C87.097,7413.247 86.122,7413.234 87.029,7413.87 C87.029,7413.87 87.684,7414.185 88.139,7415.37 C88.139,7415.37 88.726,7417.2 91.508,7416.58 C91.513,7417.437 91.522,7418.245 91.522,7418.489 C91.522,7418.76 91.338,7419.077 90.839,7418.982 C86.865,7417.627 84,7413.783 84,7409.253 C84,7403.59 88.478,7399 94,7399" />
          </g>
        </svg>
      );
    } else if (tipo === "GitLab") {
      return (
        <svg className="h-4 w-4" viewBox="0 0 256 256" fill="currentColor">
          <path d="M231.92773,169.78029l-94.82031,65.64454a16.07612,16.07612,0,0,1-18.21484,0L24.07227,169.78029a16.03981,16.03981,0,0,1-6.35254-17.27783L45.04883,50.0176a12.00012,12.00012,0,0,1,22.831-1.12109L88.544,104h78.9121l20.66407-55.10449a12.00021,12.00021,0,0,1,22.83056,1.12109l27.32959,102.48584A16.03981,16.03981,0,0,1,231.92773,169.78029Z" />
        </svg>
      );
    } else if (tipo === "Gitea") {
      return (
        <svg className="h-4 w-4" viewBox="0 0 32 32" fill="currentColor">
          <path d="M5.583 7.229c-2.464-0.005-5.755 1.557-5.573 5.479 0.281 6.125 6.557 6.693 9.068 6.745 0.271 1.146 3.224 5.109 5.411 5.318h9.573c5.74-0.38 10.036-17.365 6.854-17.427-5.271 0.25-8.396 0.375-11.073 0.396v5.297l-0.839-0.365-0.005-4.932c-3.073 0-5.781-0.141-10.917-0.396-0.646-0.005-1.542-0.115-2.5-0.115zM5.927 9.396h0.297c0.349 3.141 0.917 4.974 2.068 7.781-2.938-0.349-5.432-1.198-5.891-4.38-0.24-1.646 0.563-3.365 3.526-3.401zM17.339 12.479c0.198 0.005 0.406 0.042 0.594 0.13l1 0.432-0.714 1.302c-0.109 0-0.219 0.016-0.323 0.052-0.464 0.151-0.708 0.604-0.542 1.021 0.036 0.083 0.089 0.161 0.151 0.229l-1.234 2.25c-0.099 0-0.203 0.016-0.297 0.052-0.464 0.146-0.708 0.604-0.542 1.016 0.172 0.417 0.682 0.63 1.151 0.479 0.464-0.146 0.703-0.604 0.536-1.021-0.047-0.109-0.115-0.208-0.208-0.292l1.203-2.188c0.13 0.010 0.26 0 0.391-0.042 0.104-0.031 0.198-0.083 0.281-0.151 0.464 0.198 0.844 0.354 1.12 0.49 0.406 0.203 0.552 0.339 0.599 0.49 0.042 0.146-0.005 0.427-0.24 0.922-0.172 0.37-0.458 0.896-0.797 1.51-0.115 0-0.229 0.016-0.333 0.052-0.469 0.151-0.708 0.604-0.542 1.021 0.167 0.411 0.682 0.625 1.146 0.479 0.469-0.151 0.708-0.604 0.542-1.021-0.042-0.099-0.104-0.193-0.182-0.271 0.333-0.609 0.62-1.135 0.807-1.526 0.25-0.536 0.38-0.938 0.266-1.323s-0.469-0.635-0.932-0.865c-0.307-0.151-0.693-0.313-1.146-0.505 0.005-0.109-0.010-0.214-0.052-0.318s-0.109-0.198-0.193-0.281l0.703-1.281 3.901 1.682c0.703 0.307 0.995 1.057 0.651 1.682l-2.682 4.906c-0.339 0.625-1.182 0.885-1.885 0.578l-5.516-2.38c-0.703-0.307-0.995-1.057-0.656-1.682l2.682-4.906c0.234-0.432 0.708-0.688 1.208-0.708h0.083z" />
        </svg>
      );
    } else if (tipo === "Gogs") {
      return (
        <svg className="h-4 w-4" viewBox="90 45 200 210" fill="currentColor">
          <path d="M208.389148,50 C209.909305,50 211.24456,51.0089929 211.658889,52.4707979 L215.953018,67.6210199 C227.631425,71.3613512 238.209691,77.5582615 247.079072,85.6033302 L262.379671,81.7384823 C263.853487,81.3662037 265.395405,82.0174412 266.155483,83.3332172 L284.544632,115.166783 C285.30471,116.482559 285.098047,118.142789 284.03856,119.232316 L273.053677,130.528656 C274.302561,136.32145 274.960136,142.333975 274.960136,148.5 C274.960136,154.666025 274.302561,160.67855 273.053677,166.471344 L284.03856,177.767684 C285.098047,178.857211 285.30471,180.517441 284.544632,181.833217 L266.155483,213.666783 C265.395405,214.982559 263.853487,215.633796 262.379671,215.261518 L247.079079,211.396663 C238.209691,219.441738 227.631425,225.638649 215.953034,229.378975 L211.658889,244.529202 C211.24456,245.991007 209.909305,247 208.389148,247 L171.610852,247 C170.090695,247 168.75544,245.991007 168.341111,244.529202 L164.046982,229.37898 C152.368575,225.638649 141.790309,219.441738 132.920928,211.39667 L117.620329,215.261518 C116.146513,215.633796 114.604595,214.982559 113.844517,213.666783 L95.4553685,181.833217 C94.6952903,180.517441 94.9019532,178.857211 95.9614398,177.767684 L106.946323,166.471344 C105.697439,160.67855 105.039864,154.666025 105.039864,148.5 C105.039864,142.333975 105.697439,136.32145 106.946323,130.528656 L95.9614398,119.232316 C94.9019532,118.142789 94.6952903,116.482559 95.4553685,115.166783 L113.844517,83.3332172 C114.604595,82.0174412 116.146513,81.3662037 117.620329,81.7384823 L132.920921,85.6033365 C141.790309,77.5582615 152.368575,71.3613512 164.046966,67.6210251 L168.341111,52.4707979 C168.75544,51.0089929 170.090695,50 171.610852,50 L208.389148,50 Z M223.106971,96.1142102 C194.378503,79.4103856 157.643553,89.3231773 141.057164,118.25505 C124.470775,147.186923 134.313875,184.181965 163.042343,200.88579 C191.770812,217.589614 228.505762,207.676823 245.092151,178.74495 C246.961039,175.485021 245.851958,171.316565 242.614947,169.434444 L242.614947,169.434444 L211.47789,151.330174 C212.599522,143.920614 209.214466,136.241344 202.380444,132.267783 C193.478666,127.09195 182.096005,130.16352 176.95656,139.128325 C171.817116,148.093131 174.867091,159.556384 183.76887,164.732217 C190.602891,168.705777 198.899107,167.818442 204.710045,163.135423 L204.710045,163.135423 L229.562796,177.585758 C215.479857,195.550019 190.073911,200.862641 169.810189,189.080541 C147.555741,176.140959 139.930804,147.482828 152.779416,125.070814 C165.628027,102.658799 194.084678,94.9798762 216.339126,107.919459 C219.576136,109.80158 223.715285,108.684645 225.584174,105.424716 C227.453063,102.164787 226.343981,97.9963313 223.106971,96.1142102 Z" />
        </svg>
      );
    } else if (tipo === "Codeberg") {
      return (
        <svg className="h-4 w-4" viewBox="0 0 512 512" fill="currentColor">
          <path fill="currentColor" d="M259.804 161.4c-.44 0-1.1 0-1.32.44l-.44 1.1L332.04 440.21a192.039 192.039 0 0 0 86.77-74.437L261.125 162.06a1.762 1.762 0 0 0-1.321-.661z" opacity=".5" />
          <path fill="currentColor" d="M255.3 71.8a192 192 0 0 0-162 294l160.1-207c.5-.6 1.5-1 2.6-1s2 .4 2.6 1l160 207a192 192 0 0 0 29.4-102c0-106-86-192-192-192a192 192 0 0 0-.7 0z" />
        </svg>
      );
    }
    // Icono por defecto
    return <Server className="h-4 w-4" />;
  };

  // Función para obtener el icono del editor IDE
  const getIconoIDE = (nombre: string) => {
    if (nombre === "Visual Studio Code" || nombre === "VS Code") {
      return (
        <svg className="h-4 w-4" viewBox="0 0 32 32" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path d="M28,25.6l-5.9,2.4l-9.7-9.6l-6.1,4.8L4,21.9V10.1l2.3-1.2l6.1,4.8L22.1,4L28,6.4V25.6z M15.7,16l6.3,5l0,0V11L15.7,16 L15.7,16z M6.3,19.7L6.3,19.7L10,16l-3.6-3.7l0,0L6.3,19.7L6.3,19.7z" fill="currentColor" />
        </svg>
      );
    } else if (nombre === "Atom") {
      return (
        <svg className="h-4 w-4" viewBox="0 -1 26 26" fill="currentColor">
          <path d="m7.819 12.629q-.132.263-.237.487t-.211.461q-.527 1.133-.948 2.304c-.251.668-.478 1.476-.642 2.308l-.017.101q-.105.685-.145 1.37c-.004.071-.006.155-.006.239 0 .411.055.81.159 1.188l-.007-.032c.065.348.234.649.473.877l.001.001c.233.2.536.324.868.329h.001c.051.006.109.009.169.009.118 0 .232-.013.342-.037l-.01.002.474-.105c.447-.13.835-.301 1.196-.514l-.024.013q.54-.316 1.067-.685c.076-.047.163-.087.255-.116l.008-.002c.037-.011.08-.017.124-.017.059 0 .116.011.168.031l-.003-.001c.178.06.312.208.351.392l.001.003c.01.034.015.074.015.115 0 .148-.073.279-.185.358l-.001.001c-.512.389-1.089.756-1.697 1.074l-.068.032c-.59.306-1.286.49-2.025.5h-.003c-.042.003-.09.004-.139.004-.521 0-1.002-.166-1.395-.448l.007.005c-.429-.324-.751-.77-.917-1.285l-.005-.018c-.147-.389-.242-.839-.263-1.307v-.009c-.004-.098-.007-.213-.007-.329 0-.348.022-.691.063-1.028l-.004.04c.169-1.402.498-2.678.972-3.881l-.037.106c.553-1.422 1.098-2.586 1.706-3.711l-.086.174c.046-.084.075-.183.079-.289v-.001c-.002-.104-.021-.204-.055-.296l.002.006q-.237-.658-.448-1.317l-.421-1.317c-.004-.071-.037-.133-.087-.175-.034-.016-.074-.025-.116-.025-.029 0-.057.004-.083.012l.002-.001q-.895.211-1.765.487c-.637.205-1.186.45-1.702.747l.042-.022c-.225.132-.419.267-.601.415l.009-.007c-.196.16-.372.319-.54.487-.236.231-.391.542-.421.89v.005.038c0 .345.119.663.319.913l-.002-.003c.188.293.415.541.678.746l.007.005q.395.303.816.566.158.079.29.158l.263.158c.126.074.222.189.271.325l.001.004c.016.044.025.096.025.149 0 .086-.024.166-.066.235l.001-.002c-.06.13-.174.227-.313.263l-.003.001c-.043.011-.091.017-.142.017-.102 0-.199-.026-.283-.071l.003.002c-.441-.214-.818-.44-1.172-.696l.023.016c-.375-.269-.703-.564-.996-.89l-.005-.006c-.176-.205-.333-.435-.464-.682l-.01-.02c-.118-.225-.209-.485-.261-.76l-.003-.017c-.018-.107-.028-.23-.028-.355 0-.228.034-.449.097-.656l-.004.016c.108-.343.265-.64.466-.902l-.005.007c.215-.285.458-.532.729-.744l.009-.007c.261-.206.554-.394.865-.552l.03-.014c.485-.266 1.055-.515 1.648-.716l.077-.023q.878-.29 1.804-.5c.039-.014.087-.027.137-.038l.008-.001c.058-.012.106-.026.153-.042l-.009.003q-.053-.237-.088-.474t-.066-.474c-.096-.569-.167-1.249-.196-1.94l-.001-.035c-.003-.074-.005-.162-.005-.249 0-.605.083-1.19.24-1.745l-.011.045c.057-.285.139-.536.246-.773l-.009.022c.116-.257.257-.478.425-.676l-.003.004c.304-.367.711-.639 1.177-.77l.017-.004c.208-.052.446-.082.691-.082.264 0 .521.035.764.1l-.021-.005c.532.129 1.001.329 1.426.591l-.021-.012c.481.296.889.583 1.279.891l-.028-.021c.1.093.165.223.175.367v.002c.001.01.001.021.001.032 0 .133-.056.252-.146.337-.08.099-.195.167-.327.184h-.003c-.018.002-.04.004-.061.004-.121 0-.233-.041-.322-.11l.001.001q-.316-.211-.606-.421c-.17-.126-.368-.256-.572-.377l-.033-.018c-.208-.13-.447-.246-.699-.335l-.026-.008c-.24-.084-.517-.132-.806-.132-.008 0-.017 0-.025 0h.001c-.004 0-.009 0-.014 0-.219 0-.426.054-.608.148l.007-.003c-.191.104-.347.251-.458.429l-.003.005c-.166.212-.293.463-.365.736l-.003.014c-.062.228-.118.51-.155.797l-.003.033c-.036.289-.056.623-.056.962 0 .297.016.589.046.878l-.003-.036c.07.688.168 1.294.297 1.889l-.02-.111v.009c0 .044.021.083.053.109.034.025.077.04.124.04h.008q.737-.079 1.449-.145t1.422-.119c.098-.015.187-.042.269-.081l-.006.002c.084-.047.154-.109.209-.183l.001-.002c.646-.827 1.284-1.561 1.957-2.26l-.008.009c.679-.704 1.41-1.348 2.191-1.929l.047-.034c.394-.303.841-.607 1.305-.886l.065-.036c.439-.264.946-.489 1.481-.647l.047-.012c.299-.099.645-.165 1.004-.184h.01c.036-.002.079-.003.121-.003.33 0 .646.059.938.167l-.019-.006c.404.127.744.361.998.668l.003.004c.244.309.434.674.548 1.071l.005.022c.134.401.211.863.211 1.342v.001.011c0 .469-.029.932-.084 1.386l.005-.054q-.026.184-.053.351c-.022.138-.05.256-.084.372l.005-.021c-.014.138-.089.255-.196.328l-.002.001c-.084.059-.189.094-.302.094-.028 0-.056-.002-.083-.006h.003c-.139-.015-.259-.083-.342-.183l-.001-.001c-.069-.086-.112-.196-.112-.316 0-.028.002-.055.007-.082v.003q.026-.316.079-.645c.033-.194.052-.417.053-.645.008-.116.013-.252.013-.388s-.005-.272-.014-.407l.001.018c-.021-.291-.058-.557-.112-.816l.007.04c-.062-.451-.318-.832-.679-1.063l-.006-.004c-.234-.122-.512-.194-.806-.194-.182 0-.358.028-.524.079l.013-.003c-.428.093-.807.229-1.16.408l.027-.013q-.527.263-1.053.579c-.719.482-1.347.985-1.93 1.534l.007-.007q-.895.843-1.712 1.765-.158.158-.316.342t-.29.342v.004c0 .014-.005.026-.013.035-.009.015-.014.033-.014.052 0 .005 0 .009.001.014v-.001h.29c1.496.019 2.947.124 4.373.31l-.186-.02c1.568.203 2.967.507 4.32.918l-.186-.049c.762.213 1.387.433 1.996.687l-.112-.042c.702.289 1.296.594 1.86.941l-.056-.032c.324.211.603.419.869.643l-.013-.011c.276.232.521.483.743.754l.008.01c.394.469.633 1.079.633 1.745 0 .03 0 .06-.001.089v-.004c-.056.686-.369 1.29-.841 1.723l-.002.002c-.336.336-.717.627-1.133.864l-.026.014c-.376.215-.819.421-1.278.593l-.065.021c-.044.013-.096.021-.148.021-.08 0-.156-.017-.224-.049l.003.001c-.125-.056-.219-.159-.262-.286l-.001-.003c-.025-.056-.04-.122-.04-.191s.015-.135.041-.194l-.001.003c.056-.135.158-.241.286-.301l.003-.001q.316-.158.645-.303c.239-.106.441-.216.633-.34l-.018.011c.185-.111.344-.224.494-.348l-.007.005q.224-.184.439-.395c.249-.24.414-.566.447-.929v-.006c0-.002 0-.005 0-.008 0-.364-.128-.699-.342-.961l.002.003c-.179-.25-.381-.466-.609-.654l-.006-.005c-.22-.181-.465-.355-.722-.511l-.028-.016c-.57-.371-1.225-.708-1.915-.976l-.074-.025c-.538-.216-1.244-.45-1.965-.648l-.155-.036q-1.133-.29-2.277-.5c-.647-.127-1.437-.23-2.239-.286l-.065-.004q-.922-.053-1.857-.088t-1.857-.066c-.003 0-.007 0-.01 0-.081 0-.159.015-.232.041l.005-.002c-.07.026-.126.078-.157.143l-.001.002-1.121 1.678q-.553.843-1.08 1.686c-.036.038-.06.088-.066.144v.001c-.003.017-.005.038-.005.058 0 .04.006.079.018.116l-.001-.003q.474 1.08.988 2.133t1.119 2.067 1.277 1.975 1.435 1.856c.448.519.9.991 1.374 1.44l.009.008c.465.441.977.84 1.526 1.187l.041.024c.238.161.511.311.797.435l.033.013c.267.117.577.192.902.21h.007c.037.003.079.005.123.005.24 0 .465-.061.662-.167l-.007.004c.228-.133.412-.321.536-.546l.004-.007c.131-.208.235-.45.299-.707l.004-.017c.055-.217.106-.49.141-.767l.004-.036c.023-.255.035-.551.035-.85 0-.597-.051-1.183-.149-1.752l.009.061q-.211-1.251-.527-2.488-.369-1.264-.843-2.475t-1.027-2.398c-.035-.057-.065-.122-.086-.192l-.002-.006c-.015-.035-.023-.076-.023-.119 0-.028.004-.055.011-.081v.002c0-.002 0-.004 0-.006 0-.122.05-.232.132-.31.082-.084.191-.141.313-.158h.003c.024-.004.051-.006.079-.006.087 0 .168.022.24.06l-.003-.001c.108.057.191.148.236.26l.001.003q.184.421.395.856t.395.878q.553 1.343 1.001 2.738c.265.788.503 1.745.669 2.728l.016.116c.095.575.17 1.277.208 1.99l.002.052c.006.109.009.238.009.367 0 .594-.071 1.172-.204 1.725l.01-.05q-.053.211-.132.439c-.061.176-.124.321-.194.461l.01-.022c-.233.545-.638.98-1.145 1.244l-.014.007c-.319.157-.694.25-1.09.25-.221 0-.435-.029-.639-.082l.017.004c-.53-.11-1-.297-1.425-.551l.021.012c-.479-.286-.887-.568-1.276-.875l.025.019c-.748-.59-1.411-1.22-2.013-1.906l-.015-.017q-.922-1.053-1.738-2.185c-.544-.755-1.105-1.63-1.619-2.536l-.076-.145q-.777-1.383-1.435-2.857l-.053-.105zm-.526-4.636.658 2.16q.395-.632.777-1.212t.803-1.185zm5.977 5.531c-.005 0-.011 0-.018 0-.42 0-.801-.171-1.075-.448-.269-.25-.437-.606-.437-1.001 0-.028.001-.055.002-.083v.004c0-.007 0-.015 0-.023 0-.415.172-.789.448-1.057.268-.276.642-.448 1.057-.448h.024-.001.018c.42 0 .801.171 1.075.448.284.265.461.642.461 1.061v.02-.001.019c0 .418-.177.795-.46 1.06l-.001.001c-.275.277-.655.448-1.075.448-.005 0-.01 0-.015 0h.001z" fill="currentColor" />
        </svg>
      );
    } else if (nombre === "Sublime Text") {
      return (
        <svg className="h-4 w-4" viewBox="-3 0 24 24" fill="currentColor">
          <path d="m.003 23.617v-5.687c.007-.298.194-.551.457-.654l.005-.002 7.453-2.361-7.454-2.366c-.181-.069-.323-.205-.398-.377l-.002-.005c-.038-.064-.061-.14-.061-.222 0-.005 0-.01 0-.014v.001-5.727c0-.003 0-.007 0-.01 0-.083.023-.161.064-.227l-.001.002c.077-.177.219-.313.395-.379l.005-.002 17.548-5.564c.036-.014.078-.022.121-.022.19 0 .343.154.343.343 0 .015-.001.029-.003.044v-.002 5.686c-.008.298-.195.55-.457.654l-.005.002-7.375 2.338 7.378 2.339c.268.105.455.358.462.656v.001 5.687.003c0 .036-.004.072-.011.106l.001-.003c-.043.258-.217.467-.45.558l-.005.002-17.549 5.564c-.038.013-.082.021-.128.022-.186-.005-.335-.158-.335-.345 0-.014.001-.028.003-.042v.002z" fill="currentColor" />
        </svg>
      );
    } else if (nombre === "Cursor") {
      return (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path d="M22.106 5.68L12.5.135a.998.998 0 00-.998 0L1.893 5.68a.84.84 0 00-.419.726v11.186c0 .3.16.577.42.727l9.607 5.547a.999.999 0 00.998 0l9.608-5.547a.84.84 0 00.42-.727V6.407a.84.84 0 00-.42-.726zm-.603 1.176L12.228 22.92c-.063.108-.228.064-.228-.061V12.34a.59.59 0 00-.295-.51l-9.11-5.26c-.107-.062-.063-.228.062-.228h18.55c.264 0 .428.286.296.514z" fill="currentColor" />
        </svg>
      );
    } else if (nombre === "WebStorm") {
      return (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 0v24h24V0H0zm17.889 2.889c1.444 0 2.667.444 3.667 1.278l-1.111 1.667c-.889-.611-1.722-1-2.556-1s-1.278.389-1.278.889v.056c0 .667.444.889 2.111 1.333 2 .556 3.111 1.278 3.111 3v.056c0 2-1.5 3.111-3.611 3.111-1.5-.056-3-.611-4.167-1.667l1.278-1.556c.889.722 1.833 1.222 2.944 1.222.889 0 1.389-.333 1.389-.944v-.056c0-.556-.333-.833-2-1.278-2-.5-3.222-1.056-3.222-3.056v-.056c0-1.833 1.444-3 3.444-3zm-16.111.222h2.278l1.5 5.778 1.722-5.778h1.667l1.667 5.778 1.5-5.778h2.333l-2.833 9.944H9.723L8.112 7.277l-1.667 5.778H4.612L1.779 3.111zm.5 16.389h9V21h-9v-1.5z" fill="currentColor" />
        </svg>
      );
    } else if (nombre === "PyCharm") {
      return (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path d="M7.833 6.666v-.055c0-1-.667-1.5-1.778-1.5H4.389v3.055h1.723c1.111 0 1.721-.666 1.721-1.5zM0 0v24h24V0H0zm2.223 3.167h4c2.389 0 3.833 1.389 3.833 3.445v.055c0 2.278-1.778 3.5-4.001 3.5H4.389v2.945H2.223V3.167zM11.277 21h-9v-1.5h9V21zm4.779-7.777c-2.944.055-5.111-2.223-5.111-5.057C10.944 5.333 13.056 3 16.111 3c1.889 0 3 .611 3.944 1.556l-1.389 1.61c-.778-.722-1.556-1.111-2.556-1.111-1.658 0-2.873 1.375-2.887 3.084.014 1.709 1.174 3.083 2.887 3.083 1.111 0 1.833-.445 2.61-1.167l1.39 1.389c-.999 1.112-2.166 1.779-4.054 1.779z" fill="currentColor" />
        </svg>
      );
    } else if (nombre === "Android Studio") {
      return (
        <svg className="h-4 w-4" viewBox="0 0 32 32" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path d="M13.8,4h4.5v2.2h1.2c0.6,0,1,0.4,1,1v4.6l-0.6,0.8l6.2,10.8l0.9,3.9c0.1,0.5-0.5,0.9-0.9,0.5l-2.9-2.7l-2-3.5  C19.6,22.5,17.9,23,16,23s-3.6-0.5-5.1-1.4l-2,3.5L6,27.8c-0.4,0.4-1.1,0-0.9-0.5l0.9-3.9l2.3-4.1c-1.5-1.7-2.3-4-2.3-6.4  c0-0.4,0-0.8,0.1-1.1h3c-0.1,0.4-0.1,0.7-0.1,1.1c0,1.3,0.4,2.5,1,3.6l2.3-3.9l-0.6-0.8V7.2c0-0.6,0.4-1,1-1h1.2V4z M14.4,15.4  L12.4,19c1.1,0.6,2.3,1,3.6,1s2.6-0.4,3.6-1l-2.1-3.6l-0.8,1c-0.4,0.5-1.2,0.5-1.6,0L14.4,15.4z M14.1,11.8L14.1,11.8  c0.4,0.7,1.1,1.1,1.9,1.1c0.8,0,1.6-0.4,1.9-1.1c0.2-0.3,0.3-0.7,0.3-1.1c0-1.2-1-2.2-2.2-2.2s-2.2,1-2.2,2.2  C13.8,11.1,13.9,11.5,14.1,11.8z" fill="currentColor" />
        </svg>
      );
    } else if (nombre === "IntelliJ IDEA") {
      return (
        <svg className="h-4 w-4" viewBox="0 0 32 32" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 0v32h32v-32zM4.964 4.145h6.667v2.448h-1.855v8.371h1.855v2.443h-6.667v-2.443h1.927v-8.371h-1.927zM19.703 4.145h2.964v8.667c0 0.819-0.073 1.485-0.297 2.079-0.224 0.588-0.52 1.036-0.963 1.479-0.371 0.371-0.885 0.745-1.48 0.891-0.615 0.245-1.265 0.371-1.927 0.371-1.036 0-1.927-0.224-2.593-0.595-0.647-0.364-1.219-0.843-1.704-1.405l1.855-2.073c0.369 0.443 0.74 0.74 1.109 0.964 0.369 0.219 0.812 0.369 1.26 0.369 0.521 0 0.959-0.151 1.333-0.521 0.292-0.369 0.443-0.891 0.443-1.703zM2.964 26h12v2h-12z" fill="currentColor" />
        </svg>
      );
    } else if (nombre === "Brackets") {
      return (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path d="M6 2C4.895 2 4 2.895 4 4v16c0 1.105.895 2 2 2h2v-2H6V4h2V2H6zm12 0h-2v2h2v16h-2v2h2c1.105 0 2-.895 2-2V4c0-1.105-.895-2-2-2z" fill="currentColor" />
        </svg>
      );
    } else if (nombre === "Google Antigravity") {
      return (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path d="m19.94,20.59c1.09.82,2.73.27,1.23-1.23-4.5-4.36-3.55-16.36-9.14-16.36S7.39,15,2.89,19.36c-1.64,1.64.14,2.05,1.23,1.23,4.23-2.86,3.95-7.91,7.91-7.91s3.68,5.05,7.91,7.91Z" fill="currentColor" />
        </svg>
      );
    } else if (nombre === "Xcode") {
      return (
        <svg className="h-4 w-4" viewBox="0 0 32 32" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path d="M6.759 23.232c0-0.081 0.968-1.774 0.968-1.774 0.207-0.073 0.446-0.115 0.694-0.115 0.657 0 1.246 0.294 1.642 0.757l0.002 0.003c-0.467 0.847-0.921 1.559-1.414 2.24l0.043-0.063c-0.217 0.219-0.518 0.355-0.851 0.355-0.099 0-0.194-0.012-0.286-0.034l0.008 0.002c-0.494-0.092-0.862-0.52-0.862-1.033 0-0.121 0.020-0.237 0.058-0.345l-0.002 0.007zM3.291 9.765v13.548c0.022 2.441 1.995 4.413 4.433 4.435h0.728c0-0.081 0.968-1.774 3.064-5.322 0.242-0.484 0.564-0.968 0.887-1.532h-5.887c-0.020 0.001-0.044 0.002-0.068 0.002-0.548 0-1.008-0.374-1.14-0.881l-0.002-0.008c-0.026-0.091-0.041-0.195-0.041-0.303 0-0.635 0.514-1.149 1.149-1.149 0.007 0 0.014 0 0.022 0l-0.001-0h2.984l3.79-6.613s-0.887-1.613-1.129-2.016c-0.111-0.177-0.177-0.392-0.177-0.623 0-0.323 0.129-0.615 0.339-0.829l-0 0c0.484-0.484 1.29-0.726 2.097 0.564l0.323 0.484 0.323-0.484c0.726-1.048 1.21-0.968 1.613-0.887 0.645 0.161 1.048 0.887 0.484 2.016l-5 8.387h1.694c0.564-0.968 1.129-1.935 1.694-2.984-0.068-0.258-0.107-0.554-0.107-0.859 0-0.152 0.010-0.302 0.029-0.449l-0.002 0.017c0.107-0.658 0.395-1.236 0.809-1.697l-0.003 0.003 0.484 0.806c0.984-1.606 1.982-3.512 2.856-5.484l0.127-0.322c0.159-0.418 0.252-0.902 0.252-1.407 0-0.301-0.033-0.595-0.095-0.878l0.005 0.027h-12.096c-0.004 0-0.008-0-0.013-0-2.443 0-4.423 1.98-4.423 4.423 0 0.005 0 0.009 0 0.014v-0.001zM26.516 9.684v13.628c0 0.003 0 0.007 0 0.010 0 2.889-2.342 5.231-5.231 5.231-0.004 0-0.007 0-0.011 0h-5.403s-0.484 1.29 1.048 1.29h4.838c0.004 0 0.009 0 0.013 0 3.288 0 5.954-2.666 5.954-5.954 0-0.005 0-0.009-0-0.014v0.001-11.854c0.081-1.129-0.887-1.855-1.209-2.339zM8.049 28.554h-0.403c-0.003 0-0.007 0-0.010 0-2.889 0-5.231-2.342-5.231-5.231 0-0.004 0-0.007 0-0.011v0.001-13.548c0-0.003 0-0.007 0-0.010 0-2.889 2.342-5.231 5.231-5.231 0.004 0 0.007 0 0.011 0h11.692c-0.528-0.361-1.181-0.577-1.884-0.577-0.103 0-0.205 0.005-0.306 0.014l0.013-0.001c-0.169 0.032-0.363 0.051-0.561 0.051-0.407 0-0.796-0.078-1.153-0.22l0.021 0.007c-0.484-0.403-0.403-0.645-1.129-0.645h-7.177c-0.004 0-0.009 0-0.014 0-3.288 0-5.954 2.666-5.954 5.954 0 0.005 0 0.009 0 0.014v-0.001 14.677c-0.001 0.040-0.002 0.087-0.002 0.135 0 3.112 2.47 5.647 5.556 5.752l0.010 0c0.806 0 1.048-0.645 1.29-1.129zM20.307 18.555h1.935c1.29 0 1.532 0.645 1.532 0.887 0.081 0.645-0.242 1.452-1.532 1.452h-1.21l0.968 1.613c0.564 0.968 0.323 1.452 0 1.774-0.228 0.189-0.524 0.303-0.847 0.303-0.569 0-1.055-0.357-1.247-0.859l-0.003-0.009-1.129-1.935c-0.806 1.774-1.613 3.709-2.581 5.967h5c2.441-0.022 4.413-1.995 4.435-4.433v-14.114c-0.081-0.161-0.242-0.081-0.323 0-1.887 2.697-3.566 5.777-4.887 9.040l-0.112 0.314zM24.823 7.668c0.307-0.166 0.671-0.264 1.059-0.264 0.11 0 0.218 0.008 0.324 0.023l-0.012-0.001c0.497 0.171 0.91 0.48 1.205 0.88l0.005 0.007c0.372 0.505 0.9 0.876 1.513 1.044l0.020 0.005c0.323 0.081 0.887-0.806 1.29-1.613 0.337-0.553 0.544-1.218 0.564-1.93l0-0.006c-0.396-0.354-0.888-0.61-1.432-0.722l-0.020-0.003c-0.227 0.060-0.487 0.095-0.756 0.095-0.103 0-0.205-0.005-0.305-0.015l0.013 0.001c-0.625-0.218-1.131-0.646-1.445-1.197l-0.007-0.013c-0.557-0.711-1.258-1.283-2.062-1.678l-0.035-0.015c-0.747-0.365-1.614-0.646-2.524-0.799l-0.056-0.008c-0.902-0.278-1.939-0.438-3.013-0.438-0.302 0-0.601 0.013-0.897 0.037l0.039-0.003c-0.825 0.054-1.595 0.198-2.33 0.422l0.072-0.019c-0.081 0-0.242 0.242-0.081 0.242s0.726 0.081 0.726 0.081-0.726 0.161-0.726 0.323 0.081 0.161 0.161 0.161 1.855-0.081 2.581 0c0.965 0.16 1.772 0.728 2.25 1.518l0.008 0.014c0.388 0.682 0.616 1.499 0.616 2.369 0 0.597-0.108 1.169-0.304 1.697l0.011-0.034c-1.21 2.661-10.806 19.031-11.29 20.16s-0.645 1.855 0.726 2.581 2.097 0.403 2.5-0.081c0.484-0.645 8.79-21.451 11.612-22.821z" fill="currentColor" />
        </svg>
      );
    }
    // Icono por defecto
    return <File className="h-4 w-4" />;
  };

  // Lista completa de IDEs populares
  const todosLosIDEs = [
    "Android Studio",
    "Atom",
    "Cursor",
    "Google Antigravity",
    "IntelliJ IDEA",
    "PyCharm",
    "Sublime Text",
    "Visual Studio Code",
    "WebStorm",
    "Xcode"
  ];

  // Filtrar lista de IDEs para mostrar solo los instalados
  const idesPopulares = todosLosIDEs.filter(ide => editoresInstalados.includes(ide));

  // Detectar editores instalados después de cargar la configuración
  useEffect(() => {
    if (!editorIDECargado) {
      return;
    }

    const detectarEditores = async () => {
      if (window.electronAPI?.detectInstalledEditors) {
        try {
          const resultado = await window.electronAPI.detectInstalledEditors();
          if (resultado.success && resultado.editors) {
            setEditoresInstalados(resultado.editors);

            // Después de detectar editores, validar el editor guardado
            // Si hay un editor guardado, verificar que esté instalado
            if (resultado.editors && resultado.editors.length > 0) {
              if (editorIDESeleccionado) {
                if (!resultado.editors.includes(editorIDESeleccionado)) {
                  // El editor guardado no está instalado, seleccionar el primero disponible
                  const idesDisponibles = todosLosIDEs.filter(ide => resultado.editors!.includes(ide));
                  if (idesDisponibles.length > 0) {
                    const primerEditor = idesDisponibles[0];
                    setEditorIDESeleccionado(primerEditor);

                    // Guardar el nuevo editor seleccionado
                    if (window.electronAPI?.writeConfig) {
                      try {
                        await window.electronAPI.writeConfig({ editorIDE: primerEditor });
                      } catch (error) {
                        // Error al guardar editor IDE
                      }
                    }
                  }
                }
                // Si el editor guardado está instalado, no hacer nada (ya está seleccionado)
              } else {
                // No hay editor guardado, seleccionar el primero disponible
                const idesDisponibles = todosLosIDEs.filter(ide => resultado.editors!.includes(ide));
                if (idesDisponibles.length > 0) {
                  const primerEditor = idesDisponibles[0];
                  setEditorIDESeleccionado(primerEditor);

                  // Guardar el editor seleccionado automáticamente
                  if (window.electronAPI?.writeConfig) {
                    try {
                      await window.electronAPI.writeConfig({ editorIDE: primerEditor });
                    } catch (error) {
                      // Error al guardar editor IDE
                    }
                  }
                }
              }
            }
          }
        } catch (error) {
          // Error al detectar editores instalados
        }
      }
    };

    detectarEditores();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editorIDECargado]);


  const guardarRepositorio = async () => {
    try {
      // Si estamos editando, validar solo nombre
      if (editandoRepositorio && repositorioAEditar) {
        if (!nombreRepositorio.trim()) {
          alert(t('repositories.newRepositoryWizard.errors.enterName'));
          return;
        }

        // Obtener la carpeta padre del repositorio a editar
        const encontrarPadre = (items: FolderItem[], targetId: string, parent: FolderItem | null = null): FolderItem | null => {
          for (const item of items) {
            if (item.id === targetId) {
              return parent;
            }
            if (item.hijos) {
              const found = encontrarPadre(item.hijos, targetId, item);
              if (found !== null) return found;
            }
          }
          return null;
        };

        const carpetaPadre = encontrarPadre(estructuraCarpetas, repositorioAEditar.id);

        // Validar que el nombre no se repita en la misma ruta (excepto el repositorio actual)
        if (carpetaPadre) {
          const nombresExistentes = carpetaPadre.hijos
            ?.filter((h) => h.id !== repositorioAEditar.id)
            .map((h) => h.nombre.toLowerCase()) || [];
          if (nombresExistentes.includes(nombreRepositorio.trim().toLowerCase())) {
            alert(t('repositories.newRepositoryWizard.errors.duplicateName'));
            return;
          }
        }

        // Función recursiva para actualizar el repositorio en la estructura
        const actualizarEstructura = (items: FolderItem[]): FolderItem[] => {
          return items.map((item) => {
            if (item.id === repositorioAEditar.id) {
              return {
                ...item,
                nombre: nombreRepositorio.trim(),
                descripcion: descripcionRepositorio.trim() || undefined,
                backgroundColor: colorRepositorio || undefined,
              };
            }
            if (item.hijos) {
              return {
                ...item,
                hijos: actualizarEstructura(item.hijos),
              };
            }
            return item;
          });
        };

        const nuevaEstructura = actualizarEstructura(estructuraCarpetas);
        setEstructuraCarpetas(nuevaEstructura);

        // Guardar en el archivo de configuración
        if (window.electronAPI?.writeConfig) {
          const resultado = await window.electronAPI.writeConfig({
            repositorios: nuevaEstructura
          } as any);

          if (resultado.success) {
            // Cerrar el wizard y limpiar estados
            setMostrarWizardNuevoRepositorio(false);
            setPasoWizardRepositorio(1);
            setConexionSeleccionada(null);
            setRepositorioSeleccionado("");
            setRepositoriosDisponibles([]);
            setNombreRepositorio("");
            setDescripcionRepositorio("");
            setColorRepositorio("");
            setEditandoRepositorio(false);
            setRepositorioAEditar(null);
            setBusquedaRepositorio("");
          } else {
            // Error al guardar repositorio
            alert(t('repositories.newRepositoryWizard.errors.saveError', { message: resultado.error }));
          }
        }
        return;
      }

      // Modo creación (código original)
      if (!conexionSeleccionada || !repositorioSeleccionado) {
        alert("Por favor completa todos los campos requeridos");
        return;
      }

      const repoSeleccionado = repositoriosDisponibles.find(r => r.id === repositorioSeleccionado);
      if (!repoSeleccionado) {
        alert(t('repositories.newRepositoryWizard.errors.repositoryNotFound'));
        return;
      }

      // Obtener información del repositorio seleccionado
      const repoInfo = repositoriosDisponibles.find(r => r.id === repositorioSeleccionado);

      // Extraer nombre de organización/grupo según el proveedor
      let organizacion = "";
      if (repoSeleccionado.full_name) {
        const parts = repoSeleccionado.full_name.split('/');
        if (parts.length > 1) {
          // Para GitHub/Gitea/Gogs suele ser 'org/repo'
          // Para GitLab puede ser 'namespace/subnamespace/repo'
          // Tomamos todo excepto el último elemento como la organización/grupo
          organizacion = parts.slice(0, -1).join('/');
        }
      }

      // Crear nuevo repositorio
      const nuevoRepositorio: FolderItem = {
        id: `repo-${Date.now()}`,
        nombre: nombreRepositorio.trim() || repoSeleccionado.name,
        tipo: "archivo",
        descripcion: descripcionRepositorio.trim() || undefined,
        backgroundColor: colorRepositorio || undefined,
        privado: repoInfo?.private || false,
        proveedor: conexionSeleccionada?.tipo || "GitHub",
        ahead: 0,
        behind: 0,
        urlClon: repoSeleccionado.clone_url,
        clonado: false,
        idConexion: conexionSeleccionada?.id,
        organizacion: organizacion,
        nombreGit: repoSeleccionado.name,
      };

      // Encontrar la colección actual o usar root
      const nuevaEstructura = [...estructuraCarpetas];
      const encontrarYAgregar = (items: FolderItem[], ruta: string[]): boolean => {
        if (ruta.length === 0) return false;

        const idActual = ruta[0];
        const item = items.find(i => i.id === idActual);

        if (item) {
          if (ruta.length === 1) {
            // Estamos en el destino
            if (!item.hijos) {
              item.hijos = [];
            }
            item.hijos.push(nuevoRepositorio);
            return true;
          } else {
            // Continuar navegando
            if (item.hijos) {
              return encontrarYAgregar(item.hijos, ruta.slice(1));
            }
          }
        }
        return false;
      };

      if (!encontrarYAgregar(nuevaEstructura, rutaActual)) {
        // Si no se encontró, agregar a root
        const root = nuevaEstructura.find(i => i.id === "root");
        if (root) {
          if (!root.hijos) {
            root.hijos = [];
          }
          root.hijos.push(nuevoRepositorio);
        }
      }

      // Guardar en el archivo de configuración
      if (window.electronAPI?.writeConfig) {
        const resultado = await window.electronAPI.writeConfig({
          repositorios: nuevaEstructura
        } as any);

        if (resultado.success) {
          setEstructuraCarpetas(nuevaEstructura);

          // Cerrar el wizard y limpiar estados
          setMostrarWizardNuevoRepositorio(false);
          setPasoWizardRepositorio(1);
          setConexionSeleccionada(null);
          setRepositorioSeleccionado("");
          setRepositoriosDisponibles([]);
          setNombreRepositorio("");
          setDescripcionRepositorio("");
          setBusquedaRepositorio("");
        } else {
          // Error al guardar repositorio
          alert(t('repositories.newRepositoryWizard.errors.saveError', { message: resultado.error }));
        }
      }
    } catch (error) {
      // Error al guardar repositorio
      alert(t('repositories.newRepositoryWizard.errors.saveError', { message: (error as Error).message }));
    }
  };

  const abrirModalEditarColeccion = (coleccion: FolderItem) => {
    setColeccionAEditar(coleccion);
    setNombreEditarColeccion(coleccion.nombre);
    setDescripcionEditarColeccion(coleccion.descripcion || "");
    setColorEditarColeccion(coleccion.backgroundColor || "");
    setMostrarModalEditarColeccion(true);
  };

  const guardarEdicionColeccion = async () => {
    if (!coleccionAEditar) return;

    // Limpiar errores previos
    setErrorNombreEditar(null);
    setErrorDescripcionEditar(null);

    // Validar que el nombre no esté vacío
    const nombreTrimmed = nombreEditarColeccion.trim();
    if (!nombreTrimmed) {
      setErrorNombreEditar(t('repositories.editCollectionModal.name.errors.required'));
      return;
    }

    // Validar límites de caracteres
    if (nombreTrimmed.length > 32) {
      setErrorNombreEditar(t('repositories.editCollectionModal.name.errors.maxLength'));
      return;
    }

    const descripcionTrimmed = descripcionEditarColeccion.trim();
    if (descripcionTrimmed.length > 150) {
      setErrorDescripcionEditar(t('repositories.editCollectionModal.descriptionField.errors.maxLength'));
      return;
    }

    // Obtener la carpeta padre de la colección a editar
    const encontrarPadre = (items: FolderItem[], targetId: string, parent: FolderItem | null = null): FolderItem | null => {
      for (const item of items) {
        if (item.id === targetId) {
          return parent;
        }
        if (item.hijos) {
          const found = encontrarPadre(item.hijos, targetId, item);
          if (found !== null) return found;
        }
      }
      return null;
    };

    const carpetaPadre = encontrarPadre(estructuraCarpetas, coleccionAEditar.id);

    // Validar que el nombre no se repita en la misma ruta (excepto la colección actual)
    if (carpetaPadre) {
      const nombresExistentes = carpetaPadre.hijos
        ?.filter((h) => h.id !== coleccionAEditar.id)
        .map((h) => h.nombre.toLowerCase()) || [];
      if (nombresExistentes.includes(nombreTrimmed.toLowerCase())) {
        setErrorNombreEditar(t('repositories.editCollectionModal.name.errors.duplicateLocation'));
        return;
      }
    }

    setEditandoColeccion(true);

    try {
      // Función recursiva para actualizar la colección en la estructura
      const actualizarEstructura = (items: FolderItem[]): FolderItem[] => {
        return items.map((item) => {
          if (item.id === coleccionAEditar.id) {
            return {
              ...item,
              nombre: nombreTrimmed,
              descripcion: descripcionTrimmed || undefined,
              backgroundColor: colorEditarColeccion || undefined,
            };
          }
          if (item.hijos) {
            return {
              ...item,
              hijos: actualizarEstructura(item.hijos),
            };
          }
          return item;
        });
      };

      const nuevaEstructura = actualizarEstructura(estructuraCarpetas);
      setEstructuraCarpetas(nuevaEstructura);

      // Guardar estructura actualizada en el archivo de configuración
      if (window.electronAPI?.writeConfig) {
        await window.electronAPI.writeConfig({ repositorios: nuevaEstructura });
      }

      // Pequeño delay para mejor UX
      await new Promise(resolve => setTimeout(resolve, 300));

      // Cerrar modal y limpiar estado
      setMostrarModalEditarColeccion(false);
      setColeccionAEditar(null);
      setNombreEditarColeccion("");
      setDescripcionEditarColeccion("");
      setErrorNombreEditar(null);
      setErrorDescripcionEditar(null);
    } catch (error) {
      setErrorNombreEditar(t('repositories.editCollectionModal.name.errors.saveError'));
    } finally {
      setEditandoColeccion(false);
    }
  };

  const obtenerRutaCompleta = (): Array<{ nombre: string; id: string }> => {
    const ruta: Array<{ nombre: string; id: string }> = [];
    let actual: FolderItem | undefined = estructuraCarpetas[0];
    ruta.push({ nombre: actual?.nombre || "Mis repositorios", id: "root" });

    for (let i = 1; i < rutaActual.length; i++) {
      const idBuscado = rutaActual[i];
      actual = actual?.hijos?.find((hijo) => hijo.id === idBuscado);
      if (actual) {
        ruta.push({ nombre: actual.nombre, id: actual.id });
      }
    }
    return ruta;
  };

  const abrirModalEliminarColeccion = (coleccionId: string) => {
    setColeccionAEliminar(coleccionId);
    setMostrarModalEliminarColeccion(true);
  };

  const confirmarEliminarColeccion = async () => {
    if (!coleccionAEliminar) return;

    const coleccionId = coleccionAEliminar;

    // Verificar si estamos dentro de la colección que se va a eliminar
    const estaDentroDeColeccion = rutaActual.includes(coleccionId);

    // Si estamos dentro, navegar hacia atrás
    if (estaDentroDeColeccion) {
      const indice = rutaActual.indexOf(coleccionId);
      setRutaActual(rutaActual.slice(0, indice));
    }

    // Función recursiva para eliminar la colección de la estructura
    const eliminarDeEstructura = (items: FolderItem[]): FolderItem[] => {
      return items
        .filter((item) => item.id !== coleccionId)
        .map((item) => {
          if (item.hijos && item.hijos.length > 0) {
            return {
              ...item,
              hijos: eliminarDeEstructura(item.hijos),
            };
          }
          return item;
        });
    };

    const nuevaEstructura = eliminarDeEstructura(estructuraCarpetas);
    setEstructuraCarpetas(nuevaEstructura);

    // Guardar estructura actualizada en el archivo de configuración
    try {
      if (window.electronAPI?.writeConfig) {
        const resultado = await window.electronAPI.writeConfig({ repositorios: nuevaEstructura });
        if (!resultado.success) {
          // Error al guardar después de eliminar
          alert('Error al guardar los cambios. La colección se eliminó de la vista pero puede no haberse guardado en el archivo.');
        }
      }
    } catch (error) {
      // Error al guardar estructura después de eliminar
      alert('Error al guardar los cambios. La colección se eliminó de la vista pero puede no haberse guardado en el archivo.');
    }

    // Cerrar modal y limpiar estado
    setMostrarModalEliminarColeccion(false);
    setColeccionAEliminar(null);
  };

  // Función para abrir el modal de confirmación de eliminación de repositorio
  const abrirModalEliminarRepositorio = (repositorio: FolderItem) => {
    setRepositorioAEliminar(repositorio);
    setMostrarModalEliminarRepositorio(true);
  };

  // Función para confirmar y eliminar repositorio
  const confirmarEliminarRepositorio = async () => {
    if (!repositorioAEliminar) return;

    const repositorioId = repositorioAEliminar.id;

    // Función recursiva para eliminar el repositorio de la estructura
    const eliminarDeEstructura = (items: FolderItem[]): FolderItem[] => {
      return items
        .filter((item) => item.id !== repositorioId)
        .map((item) => {
          if (item.hijos && item.hijos.length > 0) {
            return {
              ...item,
              hijos: eliminarDeEstructura(item.hijos),
            };
          }
          return item;
        });
    };

    const nuevaEstructura = eliminarDeEstructura(estructuraCarpetas);
    setEstructuraCarpetas(nuevaEstructura);

    // Guardar estructura actualizada en el archivo de configuración
    try {
      if (window.electronAPI?.writeConfig) {
        const resultado = await window.electronAPI.writeConfig({ repositorios: nuevaEstructura });
        if (!resultado.success) {
          // Error al guardar después de eliminar
          alert(t('repositories.newRepositoryWizard.errors.saveChangesError'));
        }
      }
    } catch (error) {
      // Error al guardar estructura después de eliminar
      alert(t('repositories.newRepositoryWizard.errors.saveChangesError'));
    }

    // Cerrar modal y limpiar estado
    setMostrarModalEliminarRepositorio(false);
    setRepositorioAEliminar(null);
  };

  // Función para abrir el wizard de edición de repositorio
  const abrirModalEditarRepositorio = (repositorio: FolderItem) => {
    setRepositorioAEditar(repositorio);
    setNombreRepositorio(repositorio.nombre);
    setDescripcionRepositorio(repositorio.descripcion || "");
    setColorRepositorio(repositorio.backgroundColor || "");

    // Buscar la conexión que coincida con el proveedor del repositorio
    const conexionEncontrada = conexionesGuardadas.find(c => c.tipo === repositorio.proveedor);
    if (conexionEncontrada) {
      setConexionSeleccionada(conexionEncontrada);
      // Intentar cargar repositorios para esa conexión, pero no es crítico si falla
      // ya que solo estamos editando el nombre y descripción del repositorio local
      cargarRepositorios(conexionEncontrada, false).catch((error) => {
        // Silenciar el error cuando se está editando, ya que no es necesario para la edición
      });
      // Establecer el repositorio seleccionado (necesitamos encontrar el ID correcto)
      // Por ahora, usaremos el nombre del repositorio como referencia
      setRepositorioSeleccionado(repositorio.nombre);
    }

    setEditandoRepositorio(true);
    setMostrarWizardNuevoRepositorio(true);
    setPasoWizardRepositorio(2); // Empezar en el paso 2 (Detalles), luego ir al paso 3
  };

  // Función para alternar el estado de favorito de un repositorio
  const toggleFavorito = async (itemId: string) => {
    // Función recursiva para alternar el estado de favorito
    const actualizarEstructura = (items: FolderItem[]): FolderItem[] => {
      return items.map((item) => {
        if (item.id === itemId) {
          return {
            ...item,
            favorito: !item.favorito,
          };
        }
        if (item.hijos && item.hijos.length > 0) {
          return {
            ...item,
            hijos: actualizarEstructura(item.hijos),
          };
        }
        return item;
      });
    };

    const nuevaEstructura = actualizarEstructura(estructuraCarpetas);
    setEstructuraCarpetas(nuevaEstructura);

    // Guardar estructura actualizada en el archivo de configuración
    try {
      if (window.electronAPI?.writeConfig) {
        const resultado = await window.electronAPI.writeConfig({ repositorios: nuevaEstructura });
        if (!resultado.success) {
          // Error al guardar favorito
        }
      }
    } catch (error) {
      // Error al guardar favorito
    }
  };

  const navegarABreadcrumb = (index: number) => {
    setRutaActual(rutaActual.slice(0, index + 1));
  };

  const renderInicioTab = () => {
    // Calcular estadísticas para la pantalla de inicio
    const totalConexiones = conexionesGuardadas.length;
    const todosLosRepos = (items: FolderItem[]): FolderItem[] => {
      let repos: FolderItem[] = [];
      items.forEach(item => {
        if (item.tipo === "archivo") repos.push(item);
        if (item.hijos) repos = [...repos, ...todosLosRepos(item.hijos)];
      });
      return repos;
    };
    const totalRepositorios = todosLosRepos(estructuraCarpetas).length;

    return (
      <div className="flex flex-col lg:flex-row gap-4 h-full">
        {/* Panel izquierdo - Bienvenida y Accesos Rápidos */}
        <div className="flex-1 space-y-4 min-w-0">
          <Card className="bg-background border-0 shadow-none overflow-hidden">
            <CardContent className="p-0">
              <div className="relative p-8 mx-8 mt-8 mb-6 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 rounded-xl border border-border/50 overflow-hidden">
                {/* Decoración de fondo */}
                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-24 h-24 bg-secondary/10 rounded-full blur-2xl pointer-events-none" />

                <div className="relative flex flex-col md:flex-row items-start gap-8">
                  {/* Logo de bowl de ramen con sombra suave */}
                  <div className="flex-shrink-0 w-24 h-24 mt-10 rounded-2xl bg-background shadow-xl border border-border/50 flex items-center justify-center group/logo transition-transform duration-500 hover:scale-105 overflow-hidden">
                    <img src={tucoLogo} alt="TucoGit Logo" className="w-full h-full object-cover rounded-2xl" />
                  </div>

                  <div className="flex-1 text-center md:text-left">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold tracking-wider uppercase mb-3 border border-primary/20">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                      </span>
                      {t('home.welcome.subtitle')}
                    </div>
                    <h2 className="text-3xl font-extrabold mb-3 tracking-tight text-foreground">{t('home.welcome.title')} <span className="text-primary text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">TucoGit</span></h2>
                    <p className="text-sm text-muted-foreground leading-relaxed max-w-xl">
                      {t('home.welcome.description')}
                    </p>

                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 mt-6 pt-6 border-t border-border/50">
                      <div className="flex flex-col">
                        <span className="text-2xl font-bold text-foreground">{totalConexiones}</span>
                        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{t('home.welcome.connections')}</span>
                      </div>
                      <div className="w-px h-8 bg-border/50 hidden sm:block" />
                      <div className="flex flex-col">
                        <span className="text-2xl font-bold text-foreground">{totalRepositorios}</span>
                        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{t('home.welcome.repositories')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-8 pb-8">
                <div className="pt-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4 px-1">{t('home.quickNavigation.title').toUpperCase()}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    <button
                      onClick={() => setActiveTab("inicio")}
                      className="group relative flex flex-col items-start gap-3 p-4 rounded-xl bg-secondary/20 border border-border/50 hover:bg-secondary/40 hover:border-primary/30 transition-all duration-300 hover:scale-[1.02] hover:shadow-md text-left"
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="p-2 rounded-lg bg-background shadow-sm group-hover:text-primary transition-colors">
                          <Home className="h-4 w-4" />
                        </div>
                        <div className="flex gap-1">
                          <kbd className="px-1.5 py-0.5 text-[9px] font-bold text-muted-foreground bg-background rounded border border-border">⌘</kbd>
                          <kbd className="px-1.5 py-0.5 text-[9px] font-bold text-muted-foreground bg-background rounded border border-border">1</kbd>
                        </div>
                      </div>
                      <div>
                        <span className="text-sm font-bold text-foreground block">{t('home.quickNavigation.home.title')}</span>
                        <span className="text-[10px] text-muted-foreground">{t('home.quickNavigation.home.description')}</span>
                      </div>
                    </button>

                    <button
                      onClick={() => setActiveTab("repositorios")}
                      className="group relative flex flex-col items-start gap-3 p-4 rounded-xl bg-secondary/20 border border-border/50 hover:bg-secondary/40 hover:border-primary/30 transition-all duration-300 hover:scale-[1.02] hover:shadow-md text-left"
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="p-2 rounded-lg bg-background shadow-sm group-hover:text-primary transition-colors">
                          <FolderGit2 className="h-4 w-4" />
                        </div>
                        <div className="flex gap-1">
                          <kbd className="px-1.5 py-0.5 text-[9px] font-bold text-muted-foreground bg-background rounded border border-border">⌘</kbd>
                          <kbd className="px-1.5 py-0.5 text-[9px] font-bold text-muted-foreground bg-background rounded border border-border">2</kbd>
                        </div>
                      </div>
                      <div>
                        <span className="text-sm font-bold text-foreground block">{t('home.quickNavigation.repositories.title')}</span>
                        <span className="text-[10px] text-muted-foreground">{t('home.quickNavigation.repositories.description')}</span>
                      </div>
                    </button>

                    <button
                      onClick={() => setActiveTab("conexiones")}
                      className="group relative flex flex-col items-start gap-3 p-4 rounded-xl bg-secondary/20 border border-border/50 hover:bg-secondary/40 hover:border-primary/30 transition-all duration-300 hover:scale-[1.02] hover:shadow-md text-left"
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="p-2 rounded-lg bg-background shadow-sm group-hover:text-primary transition-colors">
                          <Plug className="h-4 w-4" />
                        </div>
                        <div className="flex gap-1">
                          <kbd className="px-1.5 py-0.5 text-[9px] font-bold text-muted-foreground bg-background rounded border border-border">⌘</kbd>
                          <kbd className="px-1.5 py-0.5 text-[9px] font-bold text-muted-foreground bg-background rounded border border-border">3</kbd>
                        </div>
                      </div>
                      <div>
                        <span className="text-sm font-bold text-foreground block">{t('home.quickNavigation.connections.title')}</span>
                        <span className="text-[10px] text-muted-foreground">{t('home.quickNavigation.connections.description')}</span>
                      </div>
                    </button>

                    <button
                      onClick={() => setActiveTab("configuracion")}
                      className="group relative flex flex-col items-start gap-3 p-4 rounded-xl bg-secondary/20 border border-border/50 hover:bg-secondary/40 hover:border-primary/30 transition-all duration-300 hover:scale-[1.02] hover:shadow-md text-left"
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="p-2 rounded-lg bg-background shadow-sm group-hover:text-primary transition-colors">
                          <Settings className="h-4 w-4" />
                        </div>
                        <div className="flex gap-1">
                          <kbd className="px-1.5 py-0.5 text-[9px] font-bold text-muted-foreground bg-background rounded border border-border">⌘</kbd>
                          <kbd className="px-1.5 py-0.5 text-[9px] font-bold text-muted-foreground bg-background rounded border border-border">4</kbd>
                        </div>
                      </div>
                      <div>
                        <span className="text-sm font-bold text-foreground block">{t('home.quickNavigation.settings.title')}</span>
                        <span className="text-[10px] text-muted-foreground">{t('home.quickNavigation.settings.description')}</span>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setIdentidadSeleccionada(IDENTIDAD_DEFAULT_ID);
                        setMostrarWizardNuevaConexion(true);
                      }}
                      className="group relative flex flex-col items-start gap-3 p-4 rounded-xl bg-secondary/20 border border-border/50 hover:bg-secondary/40 hover:border-primary/30 transition-all duration-300 hover:scale-[1.02] hover:shadow-md text-left"
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="p-2 rounded-lg bg-background shadow-sm group-hover:text-primary transition-colors">
                          <GitBranch className="h-4 w-4" />
                        </div>
                        <div className="flex gap-1">
                          <kbd className="px-1.5 py-0.5 text-[9px] font-bold text-muted-foreground bg-background rounded border border-border">⌘</kbd>
                          <kbd className="px-1.5 py-0.5 text-[9px] font-bold text-muted-foreground bg-background rounded border border-border">N</kbd>
                        </div>
                      </div>
                      <div>
                        <span className="text-sm font-bold text-foreground block">{t('home.quickNavigation.configureConnection.title')}</span>
                        <span className="text-[10px] text-muted-foreground">{t('home.quickNavigation.configureConnection.description')}</span>
                      </div>
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
              {obtenerFavoritos(estructuraCarpetas).length > 0 ? (
                <div className="space-y-2">
                  {obtenerFavoritos(estructuraCarpetas).map((favorito) => (
                    <div
                      key={favorito.id}
                      className="flex items-center justify-between p-2 rounded-md bg-secondary/20 border border-border/50 hover:bg-secondary/40 transition-colors group cursor-pointer"
                      onClick={() => {
                        if (favorito.clonado) {
                          // Siempre agregamos al listado al acceder
                          setRepositoriesMinimizados(prev => {
                            if (prev.find(r => r.id === favorito.id)) return prev;
                            return [...prev, favorito];
                          });
                          setActiveRepository(favorito);
                          setViewMode("details");
                          setActiveTab("repositorios");
                        }
                      }}
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        {getIconoProveedor(favorito.proveedor || "GitHub")}
                        <span className="text-sm font-medium truncate">{favorito.nombre}</span>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {favorito.clonado && editorIDESeleccionado && (
                          <div className="relative group/tooltip mr-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-[10px] font-medium text-primary-foreground bg-primary rounded opacity-0 group-hover/tooltip:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-lg z-20">
                              {t('home.favorites.openIn', { ide: editorIDESeleccionado })}
                              <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-primary" />
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 px-2 flex items-center gap-1.5 hover:bg-accent flex-shrink-0 text-[10px] font-medium border border-border"
                              onClick={(e) => {
                                e.stopPropagation();
                                abrirEnIDE(favorito);
                              }}
                            >
                              <div className="flex-shrink-0 scale-90">
                                {getIconoIDE(editorIDESeleccionado)}
                              </div>
                              <span className="truncate max-w-[100px]">{editorIDESeleccionado}</span>
                            </Button>
                          </div>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorito(favorito.id);
                          }}
                          className="h-6 w-6 flex items-center justify-center rounded-md hover:bg-background/50 transition-colors"
                          title={t('home.favorites.removeFromFavorites')}
                        >
                          <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-secondary/30 rounded-lg border-0 p-8 flex flex-col items-center justify-center min-h-[300px]">
                  <Star className="h-12 w-12 text-muted-foreground/50 mb-4" strokeWidth="1.5" />
                  <p className="text-sm font-medium text-foreground mb-1">{t('home.favorites.noFavorites')}</p>
                  <p className="text-xs text-muted-foreground text-center">
                    {t('home.favorites.noFavoritesDescription')}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

    );
  };

  const renderRepositoriosTab = () => {
    const carpetaActual = obtenerCarpetaActual();
    const itemsActuales = carpetaActual?.hijos || [];
    const rutaCompleta = obtenerRutaCompleta();

    // Determinar qué items usar para la búsqueda
    const itemsParaBuscar = buscarEnTodasLasColecciones && terminoBusquedaDebounced.trim() !== ""
      ? obtenerTodosLosItems(estructuraCarpetas).filter(item => item.id !== "root")
      : itemsActuales;

    // Filtrar items basado en la búsqueda (con debounce)
    let itemsFiltrados = terminoBusquedaDebounced.trim() === ""
      ? itemsActuales
      : itemsParaBuscar.filter((item) =>
        item.nombre.toLowerCase().includes(terminoBusquedaDebounced.toLowerCase())
      );

    // Ordenar items: primero por tipo (colecciones primero), luego por nombre
    itemsFiltrados = [...itemsFiltrados].sort((a, b) => {
      // Primero ordenar por tipo: colecciones primero
      const tipoA = a.tipo === "coleccion" ? 0 : 1;
      const tipoB = b.tipo === "coleccion" ? 0 : 1;

      if (tipoA !== tipoB) {
        return tipoA - tipoB; // Colecciones primero (0 < 1)
      }

      // Si son del mismo tipo, ordenar por nombre
      if (ordenRepositorios) {
        const comparacion = a.nombre.localeCompare(b.nombre);
        return ordenRepositorios === "asc" ? comparacion : -comparacion;
      }

      // Si no hay orden específico, ordenar alfabéticamente por defecto
      return a.nombre.localeCompare(b.nombre);
    });

    return (
      <div className="h-full w-full relative flex flex-col">
        {/* Listado de Colecciones y Repositorios (Ocultable) */}
        <div className={`flex-1 flex flex-col min-h-0 ${viewMode === 'details' ? 'hidden' : 'space-y-3'}`}>
          {/* Header con Breadcrumb */}
          <div className="flex items-center flex-shrink-0 px-2">
            {/* Breadcrumb funcional */}
            <div className="flex items-center gap-1 text-sm flex-wrap">
              {rutaCompleta.map((item, index) => {
                const esUltimo = index === rutaCompleta.length - 1;
                const cantidadRepos = esUltimo ? itemsActuales.filter(item => item.tipo === "archivo").length : 0;

                return (
                  <div key={item.id} className="flex items-center gap-1">
                    {index > 0 && <ChevronRight className="h-3 w-3 text-muted-foreground" />}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => navegarABreadcrumb(index)}
                        className={`px-2 py-1 rounded-md transition-colors flex items-center gap-1.5 text-sm ${esUltimo
                          ? "text-foreground font-medium cursor-default"
                          : "text-muted-foreground hover:text-foreground hover:bg-secondary/50 cursor-pointer"
                          }`}
                        disabled={esUltimo}
                      >
                        {index === 0 && <FolderGit2 className="h-4 w-4" />}
                        {item.nombre === "Mis repositorios" ? t('repositories.myRepositories') : item.nombre}
                      </button>
                      {esUltimo && cantidadRepos > 0 && (
                        <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-muted text-muted-foreground border border-border">
                          {cantidadRepos}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Barra de búsqueda con botón */}
          <div className="flex-shrink-0 px-2">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder={t('repositories.search.placeholder')}
                  value={terminoBusqueda}
                  onChange={(e) => setTerminoBusqueda(e.target.value)}
                  className={`w-full pl-9 ${terminoBusqueda ? 'pr-52' : 'pr-36'} py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:border-input`}
                />
                {terminoBusqueda && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setTerminoBusqueda("")}
                    className="absolute right-[165px] top-1/2 transform -translate-y-1/2 h-7 text-xs whitespace-nowrap"
                  >
                    {t('repositories.search.clear')}
                  </Button>
                )}
                {/* Checkbox para buscar en todas las colecciones - dentro del input */}
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1.5">
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={buscarEnTodasLasColecciones}
                    onClick={(e) => {
                      e.stopPropagation();
                      setBuscarEnTodasLasColecciones(!buscarEnTodasLasColecciones);
                    }}
                    className={`h-4 w-4 rounded border border-input cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 flex items-center justify-center ${buscarEnTodasLasColecciones
                      ? 'bg-transparent'
                      : 'bg-background hover:border-primary/50'
                      }`}
                  >
                    {buscarEnTodasLasColecciones && (
                      <Check className="h-3 w-3 text-primary" />
                    )}
                  </button>
                  <label
                    htmlFor="buscar-todas-colecciones"
                    className="text-xs text-muted-foreground cursor-pointer select-none whitespace-nowrap hover:text-foreground transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      setBuscarEnTodasLasColecciones(!buscarEnTodasLasColecciones);
                    }}
                  >
                    {t('repositories.search.allCollections')}
                  </label>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => setMostrarMenuOrdenarRepos(!mostrarMenuOrdenarRepos)}
                    className="h-9 w-9"
                    title={t('repositories.sort.title')}
                  >
                    <ArrowUpDown className="h-4 w-4" />
                  </Button>
                  {mostrarMenuOrdenarRepos && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setMostrarMenuOrdenarRepos(false)}
                      />
                      <div className="absolute right-0 top-full mt-1 w-48 rounded-md border bg-popover p-1 text-popover-foreground shadow-md z-20">
                        <button
                          onClick={() => {
                            setOrdenRepositorios("asc");
                            setMostrarMenuOrdenarRepos(false);
                          }}
                          className="w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                        >
                          <ArrowUp className="h-4 w-4" />
                          {t('repositories.sort.ascending')}
                        </button>
                        <button
                          onClick={() => {
                            setOrdenRepositorios("desc");
                            setMostrarMenuOrdenarRepos(false);
                          }}
                          className="w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                        >
                          <ArrowDown className="h-4 w-4" />
                          {t('repositories.sort.descending')}
                        </button>
                        {ordenRepositorios && (
                          <button
                            onClick={() => {
                              setOrdenRepositorios(null);
                              setMostrarMenuOrdenarRepos(false);
                            }}
                            className="w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-sm hover:bg-accent hover:text-accent-foreground transition-colors text-muted-foreground"
                          >
                            <X className="h-4 w-4" />
                            {t('repositories.sort.none')}
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={refrescarRepositorios}
                  disabled={refrescandoRepositorios}
                  className="h-9 w-9 hover:bg-accent transition-colors"
                  title={t('repositories.actions.refresh')}
                >
                  <RefreshCw className={`h-4 w-4 transition-transform duration-500 ${refrescandoRepositorios ? 'animate-spin' : 'active:rotate-180'}`} />
                </Button>
                <div className="relative">
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => setMostrarMenuAccionesRepos(!mostrarMenuAccionesRepos)}
                    className="h-9 w-9 hover:bg-accent transition-colors"
                    title={t('repositories.actions.moreActions')}
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                  {mostrarMenuAccionesRepos && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setMostrarMenuAccionesRepos(false)}
                      />
                      <div className="absolute right-0 top-full mt-1 w-48 rounded-md border bg-popover p-1 text-popover-foreground shadow-md z-20">
                        <button
                          onClick={() => {
                            setMostrarMenuAccionesRepos(false);
                            setMostrarModalClonarTodos(true);
                          }}
                          className="w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                        >
                          <Download className="h-4 w-4" />
                          {t('repositories.actions.cloneAll')}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
              <div className="relative">
                <Button
                  size="icon"
                  onClick={() => setMostrarMenuNuevaCarpeta(!mostrarMenuNuevaCarpeta)}
                  className="h-9 w-9"
                >
                  <Plus className="h-4 w-4" />
                </Button>
                {mostrarMenuNuevaCarpeta && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setMostrarMenuNuevaCarpeta(false)}
                    />
                    <div className="absolute right-0 top-full mt-1 w-48 rounded-md border bg-popover p-1 text-popover-foreground shadow-md z-20">
                      <button
                        onClick={abrirModalNuevaCarpeta}
                        className="w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                      >
                        <Folder className="h-4 w-4" />
                        {t('repositories.actions.newCollection')}
                      </button>
                      <button
                        onClick={abrirWizardNuevoRepositorio}
                        className="w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                      >
                        <GitBranch className="h-4 w-4" />
                        {t('repositories.actions.newRepository')}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Contenido scrolleable */}
          <div className="flex-1 overflow-y-auto pr-2 hide-scrollbar">
            {itemsFiltrados.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-8">
                {terminoBusquedaDebounced.trim() === "" ? (
                  <>
                    {/* Icono de carpeta con Git branch superpuesto */}
                    <div className="relative mb-6">
                      <Folder className="h-20 w-20 text-muted-foreground" strokeWidth="1.5" />
                      <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-1">
                        <GitBranch className="h-6 w-6 text-muted-foreground" strokeWidth="1.5" />
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-3">{t('repositories.empty.title')}</h3>
                    <p className="text-sm text-muted-foreground mb-4 max-w-md">
                      {t('repositories.empty.description')}
                    </p>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" onClick={abrirModalNuevaCarpeta}>
                        <Plus className="h-3.5 w-3.5 mr-1.5" />
                        {t('repositories.empty.newCollection')}
                      </Button>
                      <Button size="sm" variant="outline" onClick={abrirWizardNuevoRepositorio}>
                        <GitBranch className="h-3.5 w-3.5 mr-1.5" />
                        {t('repositories.empty.newRepository')}
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <Search className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-2">
                      {t('repositories.search.noResults', { query: terminoBusquedaDebounced })}
                    </p>
                    <Button size="sm" variant="outline" onClick={() => setTerminoBusqueda("")}>
                      <X className="h-3.5 w-3.5 mr-1" />
                      {t('repositories.search.clearSearch')}
                    </Button>
                  </>
                )}
              </div>
            ) : (
              <div className="flex flex-wrap gap-3 pb-2 px-2 items-start">
                {itemsFiltrados.map((item) => (
                  <Card
                    key={item.id}
                    className={`relative ${
                      // Base styles and conditional width logic
                      item.tipo === "coleccion"
                        ? "lg:w-[calc(33.333%_-_8px)] xl:w-[calc(25%_-_9px)] 2xl:w-[calc(20%_-_9.6px)]"
                        : "lg:w-[calc(50%_-_6px)] xl:w-[calc(33.333%_-_8px)] 2xl:w-[calc(25%_-_9px)]"
                      } w-full sm:w-[calc(50%_-_6px)] md:w-[calc(50%_-_6px)] ${item.tipo === "coleccion"
                        ? "hover:shadow-md transition-all duration-300"
                        : (!item.backgroundColor ? "bg-secondary/40 hover:bg-secondary/60 border-border/80" : "")
                      } ${!item.backgroundColor && item.tipo === "coleccion" ? "bg-blue-500/5 hover:bg-blue-500/10 border-blue-500/20" : ""} hover:shadow-lg transition-all duration-300 hover:border-primary/50 group backdrop-blur-sm flex flex-col overflow-hidden h-[180px] hover:h-[228px]`}
                    style={item.backgroundColor ? {
                      backgroundColor: `${item.backgroundColor}25`, // 15 = ~8% opacity
                      borderColor: `${item.backgroundColor}60`, // 40 = 25% opacity
                    } : undefined}
                  >
                    <div
                      className="flex-1 flex flex-col min-h-0 cursor-pointer"
                      onClick={() => {
                        if (item.tipo === "coleccion") {
                          navegarACarpeta(item.id);
                        } else if (item.tipo === "archivo" && item.clonado) {
                          // Siempre agregamos al listado de minimizados (chips) al acceder
                          setRepositoriesMinimizados(prev => {
                            if (prev.find(r => r.id === item.id)) return prev;
                            return [...prev, item];
                          });
                          setActiveRepository(item);
                          setViewMode("details");
                        }
                      }}
                    >
                      {item.tipo === "coleccion" ? (
                        <>
                          <CardHeader className="p-4 pb-3 flex-shrink-0">
                            <div className="flex items-center gap-2 mb-1">
                              <FolderOpen className="h-4 w-4 text-primary flex-shrink-0" />
                              <CardTitle className="text-sm font-semibold truncate group-hover:text-primary transition-colors">
                                {item.nombre}
                              </CardTitle>
                            </div>
                            <CardDescription className="text-xs line-clamp-2">
                              {item.descripcion || `${item.hijos?.length || 0} ${item.hijos?.length === 1 ? t('repositories.collection.element') : t('repositories.collection.elements')}`}
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="p-4 pt-0 flex flex-col flex-1 min-h-0">
                            <div className="flex-1"></div>
                            <div className="mt-auto pt-2 border-t space-y-1">
                              <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <span>
                                  {(() => {
                                    const count = item.hijos?.filter((h) => h.tipo === "coleccion").length || 0;
                                    return `${count} ${count === 1 ? t('repositories.collection.collection') : t('repositories.collection.collections')}`;
                                  })()}
                                </span>
                                <Folder className="h-3 w-3" />
                              </div>
                              <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <span>
                                  {(() => {
                                    const count = item.hijos?.filter((h) => h.tipo === "archivo").length || 0;
                                    return `${count} ${count === 1 ? t('repositories.collection.repository') : t('repositories.collection.repositories')}`;
                                  })()}
                                </span>
                                <GitBranch className="h-3 w-3" />
                              </div>
                            </div>
                          </CardContent>
                        </>
                      ) : (
                        <>
                          <CardHeader className="pt-2.5 px-4 pb-3 flex-shrink-0 relative">
                            {/* Botón de favoritos en la esquina superior derecha */}
                            <div className="absolute top-2.5 right-3 z-10">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleFavorito(item.id);
                                }}
                                className="h-7 w-7 flex items-center justify-center hover:bg-accent rounded-md transition-colors group/star"
                              >
                                <Star className={`h-3.5 w-3.5 transition-colors ${item.favorito ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground group-hover/star:text-yellow-500"}`} />
                              </button>
                            </div>

                            {/* Nombre del repositorio con icono del proveedor */}
                            <div className="flex items-center justify-between gap-2 mb-2 pr-8 -mt-0.5">
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <div className="flex-shrink-0">
                                  {getIconoProveedor(item.proveedor || "GitHub")}
                                </div>
                                <CardTitle className="text-sm font-semibold truncate group-hover:text-primary transition-colors leading-tight">
                                  {item.nombre}
                                </CardTitle>
                                {item.privado && (
                                  <span title={t('repositories.actions.private')} className="flex-shrink-0">
                                    <Lock className="h-2.5 w-2.5 text-muted-foreground" />
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Descripción */}
                            {item.descripcion && (
                              <CardDescription className="text-xs text-muted-foreground line-clamp-2 pt-1.5 mt-0.5">
                                {item.descripcion}
                              </CardDescription>
                            )}
                          </CardHeader>
                          <CardContent className="p-4 pt-3 flex flex-col flex-1 overflow-hidden">
                            <div className="flex-1"></div>
                            <div className="mt-auto pt-3 border-t min-h-[60px] flex flex-col justify-center">
                              {clonandoRepositorios[item.id] !== undefined ? (
                                <div className="space-y-1.5">
                                  <div className="flex items-center justify-between text-[10px] text-muted-foreground/70">
                                    <span className="truncate flex-1 mr-2">{clonandoRepositorios[item.id].message === "Preparando..." ? t('repositories.preparing') : clonandoRepositorios[item.id].message}</span>
                                    <span>{clonandoRepositorios[item.id].progress}%</span>
                                  </div>
                                  <div className="h-1 w-full bg-secondary rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-primary transition-all duration-300"
                                      style={{ width: `${clonandoRepositorios[item.id].progress}%` }}
                                    />
                                  </div>
                                </div>
                              ) : item.clonado ? (
                                <div className="space-y-2">
                                  {gitInfoRepositorios[item.id] ? (
                                    <>
                                      {/* Info de Branch y Commits Pendientes */}
                                      <div className="flex items-center gap-1.5 flex-wrap">
                                        <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-primary/10 border border-primary/20 text-[10px] font-medium text-primary" title={t('repositories.repository.currentBranch')}>
                                          <GitBranch className="h-3 w-3" />
                                          <span className="max-w-[120px] truncate">{gitInfoRepositorios[item.id].branch}</span>
                                        </div>

                                        {gitInfoRepositorios[item.id].uncommitted > 0 && (
                                          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-[10px] font-semibold text-amber-600 dark:text-amber-400" title={t('repositories.repository.uncommittedChanges')}>
                                            <div className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                                            <span>{gitInfoRepositorios[item.id].uncommitted}</span>
                                          </div>
                                        )}

                                        <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md border text-[10px] font-medium ${gitInfoRepositorios[item.id].ahead > 0 ? 'bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400' : 'bg-secondary/50 border-border/50 text-muted-foreground'}`} title={t('repositories.repository.pendingPush')}>
                                          <ArrowUp className="h-2.5 w-2.5" />
                                          <span>{gitInfoRepositorios[item.id].ahead}</span>
                                        </div>

                                        <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md border text-[10px] font-medium ${gitInfoRepositorios[item.id].behind > 0 ? 'bg-green-500/10 border-green-500/20 text-green-600 dark:text-green-400' : 'bg-secondary/50 border-border/50 text-muted-foreground'}`} title={t('repositories.repository.pendingPull')}>
                                          <ArrowDown className="h-2.5 w-2.5" />
                                          <span>{gitInfoRepositorios[item.id].behind}</span>
                                        </div>
                                      </div>

                                      {/* Info del Último Commit */}
                                      <div className="space-y-1 mt-1">
                                        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/80">
                                          <Users className="h-3 w-3 flex-shrink-0" />
                                          <span className="truncate max-w-[100px]">{gitInfoRepositorios[item.id].author}</span>
                                          <span className="flex-shrink-0 opacity-50">•</span>
                                          <span className="truncate">{gitInfoRepositorios[item.id].date}</span>
                                        </div>
                                      </div>
                                    </>
                                  ) : (
                                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground/70 animate-pulse">
                                      <div className="relative flex items-center justify-center">
                                        <RefreshCw className="h-3 w-3 text-cyan-500 animate-spin" />
                                        <div className="absolute inset-0 h-3 w-3 rounded-full border border-cyan-500/30 animate-ping" />
                                      </div>
                                      <span className="font-medium">{t('repositories.repository.gettingGitInfo')}</span>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div className="flex items-center gap-2 text-[10px] text-muted-foreground/70">
                                  <div className="h-1.5 w-1.5 rounded-full bg-amber-500/50" />
                                  <span>{t('repositories.repository.notCloned')}</span>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </>
                      )}
                    </div>

                    {/* Pie de la tarjeta con acciones - se expande en hover */}
                    <div className="overflow-hidden transition-all duration-300 max-h-0 group-hover:max-h-12 border-t border-transparent group-hover:border-border/50 bg-background/50 relative z-10">
                      <div className="px-3 py-1.5 flex justify-end gap-1.5">
                        {item.tipo === "coleccion" ? (
                          <>
                            <div className="relative group/tooltip">
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-[10px] font-medium text-primary-foreground bg-primary rounded opacity-0 group-hover/tooltip:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-lg z-20">
                                {t('repositories.actions.edit')}
                                <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-primary" />
                              </div>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7 hover:bg-accent flex-shrink-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  abrirModalEditarColeccion(item);
                                }}
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                            </div>

                            <div className="relative group/tooltip">
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-[10px] font-medium text-primary-foreground bg-primary rounded opacity-0 group-hover/tooltip:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-lg z-20">
                                {t('repositories.actions.delete')}
                                <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-primary" />
                              </div>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7 hover:bg-accent flex-shrink-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  abrirModalEliminarColeccion(item.id);
                                }}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </>
                        ) : (
                          <>
                            {item.clonado && gitInfoRepositorios[item.id] && editorIDESeleccionado && (
                              <div className="relative group/tooltip mr-1.5">
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-[10px] font-medium text-primary-foreground bg-primary rounded opacity-0 group-hover/tooltip:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-lg z-20">
                                  {t('repositories.actions.openIn', { ide: editorIDESeleccionado })}
                                  <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-primary" />
                                </div>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 px-2 flex items-center gap-1.5 hover:bg-accent flex-shrink-0 text-[10px] font-medium border border-border"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    abrirEnIDE(item);
                                  }}
                                >
                                  <div className="flex-shrink-0 scale-90">
                                    {getIconoIDE(editorIDESeleccionado)}
                                  </div>
                                  <span className="truncate max-w-[100px]">{editorIDESeleccionado}</span>
                                </Button>
                              </div>
                            )}

                            <div className="relative group/tooltip">
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-[10px] font-medium text-primary-foreground bg-primary rounded opacity-0 group-hover/tooltip:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-lg z-20">
                                {item.clonado ? t('repositories.actions.reclone') : t('repositories.actions.clone')}
                                <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-primary" />
                              </div>
                              <Button
                                size="icon"
                                variant="ghost"
                                className={`h-7 w-7 hover:bg-accent flex-shrink-0 ${clonandoRepositorios[item.id] !== undefined ? "animate-pulse opacity-50 pointer-events-none" : ""}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  clonarRepositorio(item);
                                }}
                                disabled={clonandoRepositorios[item.id] !== undefined}
                              >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4">
                                  <path d="M17 17H17.01M17.4 14H18C18.9319 14 19.3978 14 19.7654 14.1522C20.2554 14.3552 20.6448 14.7446 20.8478 15.2346C21 15.6022 21 16.0681 21 17C21 17.9319 21 18.3978 20.8478 18.7654C20.6448 19.2554 20.2554 19.6448 19.7654 19.8478C19.3978 20 18.9319 20 18 20H6C5.06812 20 4.60218 20 4.23463 19.8478C3.74458 19.6448 3.35523 19.2554 3.15224 18.7654C3 18.3978 3 17.9319 3 17C3 16.0681 3 15.6022 3.15224 15.2346C3.35523 14.7446 3.74458 14.3552 4.23463 14.1522C4.60218 14 5.06812 14 6 14H6.6M12 15V4M12 15L9 12M12 15L15 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              </Button>
                            </div>

                            <div className="relative group/tooltip">
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-[10px] font-medium text-primary-foreground bg-primary rounded opacity-0 group-hover/tooltip:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-lg z-20">
                                {t('repositories.actions.edit')}
                                <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-primary" />
                              </div>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7 hover:bg-accent flex-shrink-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  abrirModalEditarRepositorio(item);
                                }}
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                            </div>

                            <div className="relative group/tooltip">
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-[10px] font-medium text-primary-foreground bg-primary rounded opacity-0 group-hover/tooltip:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-lg z-20">
                                {t('repositories.actions.delete')}
                                <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-primary" />
                              </div>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7 hover:bg-accent flex-shrink-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  abrirModalEliminarRepositorio(item);
                                }}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Vistas de Detalle de Repositorios (Persistentes) */}
        {repositoriesMinimizados.map((repo) => (
          <div
            key={repo.id}
            className={`flex-1 h-full w-full ${viewMode === 'details' && activeRepository?.id === repo.id ? 'block' : 'hidden'}`}
          >
            <RepositoryDetails
              repository={repo}
              configPath={rutaConfiguracion}
              editorIDESeleccionado={editorIDESeleccionado}
              ideIcon={editorIDESeleccionado ? getIconoIDE(editorIDESeleccionado) : undefined}
              onOpenInIDE={abrirEnIDE}
              onMinimize={() => {
                setActiveRepository(null);
                setViewMode("list");
              }}
              onClose={() => {
                setRepositoriesMinimizados(prev => prev.filter(r => r.id !== repo.id));
                // Si estamos viendo este repositorio, volver a la lista
                if (activeRepository?.id === repo.id) {
                  setActiveRepository(null);
                  setViewMode("list");
                }
              }}
            />
          </div>
        ))}
      </div>
    );
  };

  const renderConexionesTab = () => {
    // Usar conexiones guardadas en lugar de generar de prueba
    const conexiones = conexionesGuardadas;

    const getTipoIconLocal = (tipo: string) => {
      // Iconos para proveedores de Git
      if (tipo === "GitHub") {
        return (
          <svg className="h-4 w-4 text-primary" viewBox="0 0 20 20" fill="currentColor">
            <g transform="translate(-84, -7399)" fill="currentColor">
              <path d="M94,7399 C99.523,7399 104,7403.59 104,7409.253 C104,7413.782 101.138,7417.624 97.167,7418.981 C96.66,7419.082 96.48,7418.762 96.48,7418.489 C96.48,7418.151 96.492,7417.047 96.492,7415.675 C96.492,7414.719 96.172,7414.095 95.813,7413.777 C98.04,7413.523 100.38,7412.656 100.38,7408.718 C100.38,7407.598 99.992,7406.684 99.35,7405.966 C99.454,7405.707 99.797,7404.664 99.252,7403.252 C99.252,7403.252 98.414,7402.977 96.505,7404.303 C95.706,7404.076 94.85,7403.962 94,7403.958 C93.15,7403.962 92.295,7404.076 91.497,7404.303 C89.586,7402.977 88.746,7403.252 88.746,7403.252 C88.203,7404.664 88.546,7405.707 88.649,7405.966 C88.01,7406.684 87.619,7407.598 87.619,7408.718 C87.619,7412.646 89.954,7413.526 92.175,7413.785 C91.889,7414.041 91.63,7414.493 91.54,7415.156 C90.97,7415.418 89.522,7415.871 88.63,7414.304 C88.63,7414.304 88.101,7413.319 87.097,7413.247 C87.097,7413.247 86.122,7413.234 87.029,7413.87 C87.029,7413.87 87.684,7414.185 88.139,7415.37 C88.139,7415.37 88.726,7417.2 91.508,7416.58 C91.513,7417.437 91.522,7418.245 91.522,7418.489 C91.522,7418.76 91.338,7419.077 90.839,7418.982 C86.865,7417.627 84,7413.783 84,7409.253 C84,7403.59 88.478,7399 94,7399" />
            </g>
          </svg>
        );
      } else if (tipo === "GitLab") {
        return (
          <svg className="h-4 w-4 text-primary" viewBox="0 0 256 256" fill="currentColor">
            <path d="M231.92773,169.78029l-94.82031,65.64454a16.07612,16.07612,0,0,1-18.21484,0L24.07227,169.78029a16.03981,16.03981,0,0,1-6.35254-17.27783L45.04883,50.0176a12.00012,12.00012,0,0,1,22.831-1.12109L88.544,104h78.9121l20.66407-55.10449a12.00021,12.00021,0,0,1,22.83056,1.12109l27.32959,102.48584A16.03981,16.03981,0,0,1,231.92773,169.78029Z" />
          </svg>
        );
      } else if (tipo === "Gitea") {
        return (
          <svg className="h-4 w-4 text-primary" viewBox="0 0 32 32" fill="currentColor">
            <path d="M5.583 7.229c-2.464-0.005-5.755 1.557-5.573 5.479 0.281 6.125 6.557 6.693 9.068 6.745 0.271 1.146 3.224 5.109 5.411 5.318h9.573c5.74-0.38 10.036-17.365 6.854-17.427-5.271 0.25-8.396 0.375-11.073 0.396v5.297l-0.839-0.365-0.005-4.932c-3.073 0-5.781-0.141-10.917-0.396-0.646-0.005-1.542-0.115-2.5-0.115zM5.927 9.396h0.297c0.349 3.141 0.917 4.974 2.068 7.781-2.938-0.349-5.432-1.198-5.891-4.38-0.24-1.646 0.563-3.365 3.526-3.401zM17.339 12.479c0.198 0.005 0.406 0.042 0.594 0.13l1 0.432-0.714 1.302c-0.109 0-0.219 0.016-0.323 0.052-0.464 0.151-0.708 0.604-0.542 1.021 0.036 0.083 0.089 0.161 0.151 0.229l-1.234 2.25c-0.099 0-0.203 0.016-0.297 0.052-0.464 0.146-0.708 0.604-0.542 1.016 0.172 0.417 0.682 0.63 1.151 0.479 0.464-0.146 0.703-0.604 0.536-1.021-0.047-0.109-0.115-0.208-0.208-0.292l1.203-2.188c0.13 0.010 0.26 0 0.391-0.042 0.104-0.031 0.198-0.083 0.281-0.151 0.464 0.198 0.844 0.354 1.12 0.49 0.406 0.203 0.552 0.339 0.599 0.49 0.042 0.146-0.005 0.427-0.24 0.922-0.172 0.37-0.458 0.896-0.797 1.51-0.115 0-0.229 0.016-0.333 0.052-0.469 0.151-0.708 0.604-0.542 1.021 0.167 0.411 0.682 0.625 1.146 0.479 0.469-0.151 0.708-0.604 0.542-1.021-0.042-0.099-0.104-0.193-0.182-0.271 0.333-0.609 0.62-1.135 0.807-1.526 0.25-0.536 0.38-0.938 0.266-1.323s-0.469-0.635-0.932-0.865c-0.307-0.151-0.693-0.313-1.146-0.505 0.005-0.109-0.010-0.214-0.052-0.318s-0.109-0.198-0.193-0.281l0.703-1.281 3.901 1.682c0.703 0.307 0.995 1.057 0.651 1.682l-2.682 4.906c-0.339 0.625-1.182 0.885-1.885 0.578l-5.516-2.38c-0.703-0.307-0.995-1.057-0.656-1.682l2.682-4.906c0.234-0.432 0.708-0.688 1.208-0.708h0.083z" />
          </svg>
        );
      } else if (tipo === "Codeberg") {
        return (
          <svg className="h-4 w-4" viewBox="0 0 512 512" fill="none">
            <defs>
              <linearGradient id="codeberg-icon-gradient" x1="259.804" x2="383.132" y1="161.4" y2="407.835" gradientUnits="userSpaceOnUse">
                <stop offset="0" stopColor="#ffffff" stopOpacity="0" />
                <stop offset=".5" stopColor="#71c2ff" />
                <stop offset="1" stopColor="#39aaff" />
              </linearGradient>
            </defs>
            <path fill="url(#codeberg-icon-gradient)" d="M259.804 161.4c-.44 0-1.1 0-1.32.44l-.44 1.1L332.04 440.21a192.039 192.039 0 0 0 86.77-74.437L261.125 162.06a1.762 1.762 0 0 0-1.321-.661z" opacity=".5" />
            <path fill="#2185d0" d="M255.3 71.8a192 192 0 0 0-162 294l160.1-207c.5-.6 1.5-1 2.6-1s2 .4 2.6 1l160 207a192 192 0 0 0 29.4-102c0-106-86-192-192-192a192 192 0 0 0-.7 0z" />
          </svg>
        );
      } else if (tipo === "Gogs") {
        return (
          <svg className="h-4 w-4 text-primary" viewBox="90 45 200 210" fill="currentColor">
            <path d="M208.389148,50 C209.909305,50 211.24456,51.0089929 211.658889,52.4707979 L215.953018,67.6210199 C227.631425,71.3613512 238.209691,77.5582615 247.079072,85.6033302 L262.379671,81.7384823 C263.853487,81.3662037 265.395405,82.0174412 266.155483,83.3332172 L284.544632,115.166783 C285.30471,116.482559 285.098047,118.142789 284.03856,119.232316 L273.053677,130.528656 C274.302561,136.32145 274.960136,142.333975 274.960136,148.5 C274.960136,154.666025 274.302561,160.67855 273.053677,166.471344 L284.03856,177.767684 C285.098047,178.857211 285.30471,180.517441 284.544632,181.833217 L266.155483,213.666783 C265.395405,214.982559 263.853487,215.633796 262.379671,215.261518 L247.079079,211.396663 C238.209691,219.441738 227.631425,225.638649 215.953034,229.378975 L211.658889,244.529202 C211.24456,245.991007 209.909305,247 208.389148,247 L171.610852,247 C170.090695,247 168.75544,245.991007 168.341111,244.529202 L164.046982,229.37898 C152.368575,225.638649 141.790309,219.441738 132.920928,211.39667 L117.620329,215.261518 C116.146513,215.633796 114.604595,214.982559 113.844517,213.666783 L95.4553685,181.833217 C94.6952903,180.517441 94.9019532,178.857211 95.9614398,177.767684 L106.946323,166.471344 C105.697439,160.67855 105.039864,154.666025 105.039864,148.5 C105.039864,142.333975 105.697439,136.32145 106.946323,130.528656 L95.9614398,119.232316 C94.9019532,118.142789 94.6952903,116.482559 95.4553685,115.166783 L113.844517,83.3332172 C114.604595,82.0174412 116.146513,81.3662037 117.620329,81.7384823 L132.920921,85.6033365 C141.790309,77.5582615 152.368575,71.3613512 164.046966,67.6210251 L168.341111,52.4707979 C168.75544,51.0089929 170.090695,50 171.610852,50 L208.389148,50 Z M223.106971,96.1142102 C194.378503,79.4103856 157.643553,89.3231773 141.057164,118.25505 C124.470775,147.186923 134.313875,184.181965 163.042343,200.88579 C191.770812,217.589614 228.505762,207.676823 245.092151,178.74495 C246.961039,175.485021 245.851958,171.316565 242.614947,169.434444 L242.614947,169.434444 L211.47789,151.330174 C212.599522,143.920614 209.214466,136.241344 202.380444,132.267783 C193.478666,127.09195 182.096005,130.16352 176.95656,139.128325 C171.817116,148.093131 174.867091,159.556384 183.76887,164.732217 C190.602891,168.705777 198.899107,167.818442 204.710045,163.135423 L204.710045,163.135423 L229.562796,177.585758 C215.479857,195.550019 190.073911,200.862641 169.810189,189.080541 C147.555741,176.140959 139.930804,147.482828 152.779416,125.070814 C165.628027,102.658799 194.084678,94.9798762 216.339126,107.919459 C219.576136,109.80158 223.715285,108.684645 225.584174,105.424716 C227.453063,102.164787 226.343981,97.9963313 223.106971,96.1142102 Z" />
          </svg>
        );
      }
      return <Link2 className="h-4 w-4 text-primary" />;
    };



    // Filtrar conexiones basado en la búsqueda (con debounce)
    let conexionesFiltradas = terminoBusquedaConexionesDebounced.trim() === ""
      ? conexiones
      : conexiones.filter((conexion) =>
        conexion.nombre.toLowerCase().includes(terminoBusquedaConexionesDebounced.toLowerCase()) ||
        conexion.tipo.toLowerCase().includes(terminoBusquedaConexionesDebounced.toLowerCase()) ||
        conexion.host.toLowerCase().includes(terminoBusquedaConexionesDebounced.toLowerCase())
      );

    // Ordenar conexiones si hay un orden seleccionado
    if (ordenConexiones) {
      conexionesFiltradas = [...conexionesFiltradas].sort((a, b) => {
        const comparacion = a.nombre.localeCompare(b.nombre);
        return ordenConexiones === "asc" ? comparacion : -comparacion;
      });
    }

    return (
      <div className="space-y-3 h-full flex flex-col w-full">
        {/* Header con Breadcrumb */}
        <div className="flex items-center flex-shrink-0 px-2">
          <div className="flex items-center gap-1 text-sm flex-wrap">
            <div className="flex items-center gap-2">
              <button
                className="px-2 py-1 rounded-md transition-colors flex items-center gap-1.5 text-sm text-foreground font-medium cursor-default"
                disabled
              >
                <Plug className="h-4 w-4" />
                {t('connections.title')}
              </button>
              <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-muted text-muted-foreground border border-border">
                {conexionesGuardadas.length}
              </span>
            </div>
          </div>
        </div>

        {/* Barra de búsqueda con botón */}
        <div className="flex-shrink-0 px-2">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder={t('connections.search.placeholder')}
                value={terminoBusquedaConexiones}
                onChange={(e) => setTerminoBusquedaConexiones(e.target.value)}
                className={`w-full pl-9 ${terminoBusquedaConexiones ? 'pr-20' : 'pr-3'} py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:border-input`}
              />
              {terminoBusquedaConexiones && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setTerminoBusquedaConexiones("")}
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 text-xs"
                >
                  {t('connections.search.clear')}
                </Button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => setMostrarMenuOrdenar(!mostrarMenuOrdenar)}
                  className="h-9 w-9"
                  title={t('connections.sort.title')}
                >
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
                {mostrarMenuOrdenar && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setMostrarMenuOrdenar(false)}
                    />
                    <div className="absolute right-0 top-full mt-1 w-48 rounded-md border bg-popover p-1 text-popover-foreground shadow-md z-20">
                      <button
                        onClick={() => {
                          setOrdenConexiones("asc");
                          setMostrarMenuOrdenar(false);
                        }}
                        className="w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                      >
                        <ArrowUp className="h-4 w-4" />
                        {t('connections.sort.ascending')}
                      </button>
                      <button
                        onClick={() => {
                          setOrdenConexiones("desc");
                          setMostrarMenuOrdenar(false);
                        }}
                        className="w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                      >
                        <ArrowDown className="h-4 w-4" />
                        {t('connections.sort.descending')}
                      </button>
                      {ordenConexiones && (
                        <button
                          onClick={() => {
                            setOrdenConexiones(null);
                            setMostrarMenuOrdenar(false);
                          }}
                          className="w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-sm hover:bg-accent hover:text-accent-foreground transition-colors text-muted-foreground"
                        >
                          <X className="h-4 w-4" />
                          {t('connections.sort.none')}
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
              <Button
                size="icon"
                variant="outline"
                onClick={refrescarConexiones}
                disabled={refrescandoConexiones}
                className="h-9 w-9 hover:bg-accent transition-colors"
                title={t('connections.actions.refresh')}
              >
                <RefreshCw className={`h-4 w-4 transition-transform duration-500 ${refrescandoConexiones ? 'animate-spin' : 'active:rotate-180'}`} />
              </Button>
            </div>
            <div className="relative">
              <Button
                size="icon"
                onClick={() => setMostrarMenuNuevaConexion(!mostrarMenuNuevaConexion)}
                className="h-9 w-9"
              >
                <Plus className="h-4 w-4" />
              </Button>
              {mostrarMenuNuevaConexion && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setMostrarMenuNuevaConexion(false)}
                  />
                  <div className="absolute right-0 top-full mt-1 w-48 rounded-md border bg-popover p-1 text-popover-foreground shadow-md z-20">
                    <button
                      onClick={() => {
                        setMostrarMenuNuevaConexion(false);
                        limpiarWizardConexion();
                        setIdentidadSeleccionada(IDENTIDAD_DEFAULT_ID);
                        setMostrarWizardNuevaConexion(true);
                      }}
                      className="w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                    >
                      <Link2 className="h-4 w-4" />
                      {t('connections.actions.newConnection')}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 hide-scrollbar">
          {conexionesFiltradas.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              {terminoBusquedaConexionesDebounced.trim() === "" ? (
                <>
                  <Plug className="h-16 w-16 text-muted-foreground mb-6 opacity-60" />
                  <h3 className="text-xl font-semibold text-foreground mb-3">{t('connections.empty.title')}</h3>
                  <p className="text-sm text-muted-foreground max-w-md">
                    {t('connections.empty.description')}
                  </p>
                </>
              ) : (
                <>
                  <Search className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-2">
                    {t('connections.search.noResults', { query: terminoBusquedaConexionesDebounced })}
                  </p>
                  <Button size="sm" variant="outline" onClick={() => setTerminoBusquedaConexiones("")}>
                    <X className="h-3.5 w-3.5 mr-1" />
                    {t('connections.search.clearSearch')}
                  </Button>
                </>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 pb-2 px-2 items-start">
              {conexionesFiltradas.map((conexion) => {
                const detalles = conexionesDetalles[conexion.id];
                const reposLocales = contarRepositoriosLocales(conexion.id);
                const estaCargando = cargandoDetalles[conexion.id];
                const estadoConexion = estadosConexion[conexion.id];

                // Verificar estado de conexión cuando se renderiza por primera vez
                if (!estadoConexion) {
                  verificarEstadoConexion(conexion);
                }

                // Cargar detalles cuando la tarjeta se renderiza por primera vez (solo si hay conexión)
                if (!detalles && !estaCargando && estadoConexion === 'connected') {
                  obtenerDetallesConexion(conexion);
                }

                // Formatear fecha de creación de conexión
                const formatearFechaConexion = (fechaISO: string | null): string => {
                  if (!fechaISO) return t('connections.date.notAvailable');
                  const fecha = new Date(fechaISO);
                  const ahora = new Date();
                  const diffMs = ahora.getTime() - fecha.getTime();
                  const diffSegundos = Math.floor(diffMs / 1000);
                  const diffMinutos = Math.floor(diffSegundos / 60);
                  const diffHoras = Math.floor(diffMinutos / 60);
                  const diffDias = Math.floor(diffHoras / 24);
                  const diffSemanas = Math.floor(diffDias / 7);
                  const diffMeses = Math.floor(diffDias / 30);
                  const diffAnos = Math.floor(diffDias / 365);

                  if (diffMinutos < 1) {
                    return t('connections.date.justNow');
                  } else if (diffMinutos < 60) {
                    return t('connections.date.minutesAgo', { count: diffMinutos });
                  } else if (diffHoras < 24) {
                    return t('connections.date.hoursAgo', { count: diffHoras });
                  } else if (diffDias < 7) {
                    return t('connections.date.daysAgo', { count: diffDias });
                  } else if (diffSemanas < 4) {
                    return t('connections.date.weeksAgo', { count: diffSemanas });
                  } else if (diffMeses < 12) {
                    return t('connections.date.monthsAgo', { count: diffMeses });
                  } else {
                    return t('connections.date.yearsAgo', { count: diffAnos });
                  }
                };

                // Extraer dominio del host
                const obtenerDominio = (host: string): string => {
                  try {
                    const url = host.startsWith('http') ? host : `https://${host}`;
                    const urlObj = new URL(url);
                    return urlObj.hostname.replace('www.', '');
                  } catch {
                    return host;
                  }
                };

                return (
                  <Card
                    key={conexion.id}
                    className="relative bg-secondary/40 hover:bg-secondary/60 hover:shadow-lg transition-all duration-300 hover:border-primary/50 cursor-pointer group border-border/80 backdrop-blur-sm flex flex-col min-h-[280px] overflow-visible"
                    onMouseEnter={() => {
                      if (!detalles && !estaCargando) {
                        obtenerDetallesConexion(conexion);
                      }
                    }}
                  >
                    <div className="flex flex-col h-[280px] overflow-hidden">
                      <CardHeader className="p-4 pb-3 flex-shrink-0">
                        <div className="flex items-start gap-2 flex-1 min-w-0">
                          <div className="flex-shrink-0 mt-0.5">
                            {getTipoIconLocal(conexion.tipo)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-sm font-semibold truncate group-hover:text-primary transition-colors">
                              {conexion.nombre}
                            </CardTitle>
                          </div>
                        </div>
                        {/* URL del proveedor en nueva fila */}
                        <div className="mt-2 w-full">
                          <p className="text-[10px] text-muted-foreground truncate text-left">
                            {obtenerDominio(conexion.host)}
                          </p>
                        </div>
                        {/* Chip del proveedor y estado */}
                        <div className="mt-2 flex items-center gap-2 flex-wrap">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-muted text-muted-foreground">
                            {conexion.tipo}
                          </span>
                          {(() => {
                            const estado = estadosConexion[conexion.id];
                            if (!estado) return null;

                            if (estado === 'checking') {
                              return (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-muted text-muted-foreground">
                                  <RefreshCw className="h-2.5 w-2.5 animate-spin" />
                                  {t('connections.status.checking')}
                                </span>
                              );
                            }

                            if (estado === 'connected') {
                              return (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-green-500/20 text-green-600 dark:text-green-400">
                                  <CheckCircle2 className="h-2.5 w-2.5" />
                                  {t('connections.status.connected')}
                                </span>
                              );
                            }

                            if (estado === 'expired') {
                              return (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-amber-500/20 text-amber-600 dark:text-amber-400">
                                  <AlertCircle className="h-2.5 w-2.5" />
                                  {t('connections.status.expired')}
                                </span>
                              );
                            }

                            if (estado === 'disconnected') {
                              return (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-red-500/20 text-red-600 dark:text-red-400">
                                  <XCircle className="h-2.5 w-2.5" />
                                  {t('connections.status.disconnected')}
                                </span>
                              );
                            }

                            return null;
                          })()}
                        </div>
                        {/* Divisor */}
                        <div className="mt-2 border-t border-border/50"></div>
                      </CardHeader>
                      <CardContent className="p-4 pt-0 space-y-2.5 flex-1 overflow-y-auto min-h-0">
                        {/* Estadísticas de repositorios */}
                        {(() => {
                          // Si no hay conexión, mostrar mensaje
                          if (estadoConexion === 'disconnected' || estadoConexion === 'expired') {
                            return (
                              <div className="flex flex-col items-center justify-center py-6 text-center">
                                <AlertCircle className="h-8 w-8 text-muted-foreground/50 mb-2" />
                                <p className="text-xs font-medium text-foreground mb-1">
                                  {estadoConexion === 'expired' ? t('connections.status.expired') : t('connections.status.noConnection')}
                                </p>
                                <p className="text-[10px] text-muted-foreground">
                                  {estadoConexion === 'expired'
                                    ? t('connections.status.expiredMessage')
                                    : t('connections.status.disconnectedMessage')}
                                </p>
                              </div>
                            );
                          }

                          // Si está cargando
                          if (estaCargando) {
                            return (
                              <div className="flex items-center justify-center py-4">
                                <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />
                              </div>
                            );
                          }

                          // Si hay detalles, mostrarlos
                          if (detalles) {
                            return (
                              <>
                                <div className="space-y-1.5">
                                  {/* Repositorios remotos */}
                                  <div className="flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-1.5">
                                      <Cloud className="h-3 w-3 text-muted-foreground" />
                                      <span className="text-muted-foreground">{t('connections.stats.remoteRepos')}</span>
                                    </div>
                                    <span className="font-medium text-foreground">{detalles.totalRepos}</span>
                                  </div>

                                  {/* Configurados localmente */}
                                  <div className="flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-1.5">
                                      <Link2 className="h-3 w-3 text-muted-foreground" />
                                      <span className="text-muted-foreground">{t('connections.stats.configuredLocally')}</span>
                                    </div>
                                    <span className="font-medium text-foreground">{reposLocales.configurados}</span>
                                  </div>

                                  {/* Clonados localmente */}
                                  <div className="flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-1.5">
                                      <CheckCircle2 className="h-3 w-3 text-green-500" />
                                      <span className="text-green-500">{t('connections.stats.clonedLocally')}</span>
                                    </div>
                                    <span className="font-medium text-green-500">{reposLocales.clonados}</span>
                                  </div>
                                </div>

                                {/* Organizaciones */}
                                <div className="pt-1 border-t border-border/50">
                                  <div className="flex items-center gap-1.5 mb-1.5">
                                    <Users className="h-3 w-3 text-muted-foreground" />
                                    <span className="text-xs text-muted-foreground">{t('connections.stats.organizations')}</span>
                                  </div>
                                  {detalles.organizations && detalles.organizations.length > 0 ? (
                                    <div className="flex flex-wrap gap-1">
                                      {detalles.organizations.slice(0, 3).map((org, idx) => (
                                        <span
                                          key={idx}
                                          className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-muted text-muted-foreground truncate max-w-[100px]"
                                          title={org}
                                        >
                                          {org}
                                        </span>
                                      ))}
                                      {detalles.organizations.length > 3 && (
                                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-muted text-muted-foreground">
                                          +{detalles.organizations.length - 3}
                                        </span>
                                      )}
                                    </div>
                                  ) : (
                                    <p className="text-[10px] text-muted-foreground/70 italic">
                                      {t('connections.stats.noOrganizations')}
                                    </p>
                                  )}
                                </div>
                              </>
                            );
                          }

                          // Si está verificando o no hay estado aún
                          if (estadoConexion === 'checking' || !estadoConexion) {
                            return (
                              <div className="flex items-center justify-center py-4">
                                <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />
                              </div>
                            );
                          }

                          // Por defecto, mostrar mensaje de espera
                          return (
                            <div className="text-xs text-muted-foreground text-center py-4">
                              {t('connections.status.waiting')}
                            </div>
                          );
                        })()}
                      </CardContent>

                      {/* Fecha de creación de conexión - siempre visible al pie de la tarjeta */}
                      {conexion.fechaCreacion && (
                        <div className="flex-shrink-0 px-4 pb-3 pt-2 border-t border-border/50 flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <span>{formatearFechaConexion(conexion.fechaCreacion)}</span>
                        </div>
                      )}
                    </div>

                    {/* Pie de la tarjeta con acciones - se expande en hover */}
                    <div className="flex-shrink-0 overflow-hidden transition-all duration-300 max-h-0 group-hover:max-h-12 border-t border-transparent group-hover:border-border/50 bg-background/50 shadow-lg group-hover:shadow-xl">
                      <div className="px-3 py-1.5 flex justify-end gap-1.5">
                        <div className="relative group/tooltip">
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-[10px] font-medium text-primary-foreground bg-primary rounded opacity-0 group-hover/tooltip:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-lg z-20">
                            {t('connections.actions.edit')}
                            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-primary" />
                          </div>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 hover:bg-accent flex-shrink-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              abrirWizardEditarConexion(conexion);
                            }}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                        </div>

                        <div className="relative group/tooltip">
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-[10px] font-medium text-primary-foreground bg-primary rounded opacity-0 group-hover/tooltip:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-lg z-20">
                            {t('connections.actions.delete')}
                            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-primary" />
                          </div>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 hover:bg-accent flex-shrink-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              abrirModalEliminarConexion(conexion);
                            }}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderConfiguracionTab = () => {
    const renderConfigContent = () => {
      switch (configTabActiva) {
        case "general":
          return (
            <div className="space-y-6 px-8 py-0 max-w-3xl">
              {/* Header */}
              <div className="space-y-1">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Settings className="h-5 w-5 text-primary" />
                  {t('settings.general.title')}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t('settings.general.description')}
                </p>
              </div>

              {/* Editor IDE */}
              <Card className="border-2">
                <CardHeader className="pb-3">
                  <div>
                    <CardTitle className="text-base">{t('settings.general.preferredIDE.title')}</CardTitle>
                    <CardDescription className="text-xs mt-1">
                      {t('settings.general.preferredIDE.description')}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setMostrarMenuEditorIDE(!mostrarMenuEditorIDE)}
                        className="w-full px-4 py-3 text-sm rounded-lg border-2 border-input bg-background hover:border-primary/50 transition-all text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 group"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          {editorIDESeleccionado ? (
                            <>
                              <div className="flex-shrink-0 p-2 rounded-md bg-primary/10 group-hover:bg-primary/20 transition-colors">
                                {getIconoIDE(editorIDESeleccionado)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-semibold text-foreground truncate">{editorIDESeleccionado}</div>
                                <div className="text-xs text-muted-foreground">{t('settings.general.preferredIDE.selected')}</div>
                              </div>
                            </>
                          ) : (
                            <div className="flex items-center gap-3 flex-1">
                              <div className="flex-shrink-0 p-2 rounded-md bg-muted">
                                <Plug className="h-4 w-4 text-muted-foreground" />
                              </div>
                              <div>
                                <div className="font-medium text-muted-foreground">{t('settings.general.preferredIDE.selectEditor')}</div>
                                <div className="text-xs text-muted-foreground/70">{t('settings.general.preferredIDE.noEditorSelected')}</div>
                              </div>
                            </div>
                          )}
                        </div>
                        <ChevronRight className={`h-5 w-5 text-muted-foreground transition-all flex-shrink-0 ${mostrarMenuEditorIDE ? "rotate-90 text-primary" : ""}`} />
                      </button>
                      {mostrarMenuEditorIDE && (
                        <>
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setMostrarMenuEditorIDE(false)}
                          />
                          <div className="absolute z-20 w-full mt-2 rounded-lg border-2 bg-popover shadow-lg max-h-72 overflow-auto">
                            {idesPopulares.length === 0 ? (
                              <div className="p-4 text-sm text-muted-foreground text-center">
                                <AlertCircle className="h-5 w-5 mx-auto mb-2 opacity-50" />
                                <p>{t('settings.general.preferredIDE.noEditorsAvailable')}</p>
                                <p className="text-xs mt-1">{t('settings.general.preferredIDE.installEditor')}</p>
                              </div>
                            ) : (
                              <div className="p-1">
                                {idesPopulares.map((ide) => (
                                  <button
                                    key={ide}
                                    onClick={async () => {
                                      setEditorIDESeleccionado(ide);
                                      setMostrarMenuEditorIDE(false);
                                      if (window.electronAPI?.writeConfig) {
                                        try {
                                          await window.electronAPI.writeConfig({ editorIDE: ide });
                                        } catch (error) {
                                          // Error al guardar editor IDE
                                          showToast(t('settings.general.preferredIDE.errorSaving'), 'error');
                                        }
                                      }
                                    }}
                                    className={`w-full px-4 py-3 text-sm text-left rounded-md hover:bg-accent hover:text-accent-foreground transition-colors flex items-center gap-3 ${editorIDESeleccionado === ide ? 'bg-primary/10 border border-primary/20' : ''
                                      }`}
                                  >
                                    <div className="flex-shrink-0 p-1.5 rounded-md bg-background">
                                      {getIconoIDE(ide)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="font-semibold">{ide}</div>
                                      {editorIDESeleccionado === ide && (
                                        <div className="text-xs text-primary mt-0.5 flex items-center gap-1">
                                          <Check className="h-3 w-3" />
                                          {t('settings.general.preferredIDE.selected')}
                                        </div>
                                      )}
                                    </div>
                                    {editorIDESeleccionado === ide && (
                                      <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                                    )}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>

                    {editorIDESeleccionado && (
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/5 border border-primary/10">
                        <Info className="h-4 w-4 text-primary flex-shrink-0" />
                        <p className="text-xs text-muted-foreground">
                          {t('settings.general.preferredIDE.info', { ide: editorIDESeleccionado })}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Idioma de UI */}
              <Card className="border-2">
                <CardHeader className="pb-3">
                  <div>
                    <CardTitle className="text-base">{t('settings.general.uiLanguage.title')}</CardTitle>
                    <CardDescription className="text-xs mt-1">
                      {t('settings.general.uiLanguage.description')}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setMostrarMenuIdioma(!mostrarMenuIdioma)}
                        className="w-full px-4 py-3 text-sm rounded-lg border-2 border-input bg-background hover:border-primary/50 transition-all text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 group"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="flex-shrink-0 p-2 rounded-md bg-primary/10 group-hover:bg-primary/20 transition-colors">
                            <Globe className="h-4 w-4 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-foreground truncate">
                              {uiLanguage === "en" ? t('settings.general.uiLanguage.english') : uiLanguage === "es-AR" ? t('settings.general.uiLanguage.spanish') : uiLanguage === "de" ? t('settings.general.uiLanguage.german') : uiLanguage === "fr" ? t('settings.general.uiLanguage.french') : uiLanguage === "pt" ? t('settings.general.uiLanguage.portuguese') : uiLanguage === "ja" ? t('settings.general.uiLanguage.japanese') : t('settings.general.uiLanguage.chinese')}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {uiLanguage === "en" ? t('settings.general.uiLanguage.english') : uiLanguage === "es-AR" ? t('settings.general.uiLanguage.spanish') : uiLanguage === "de" ? t('settings.general.uiLanguage.german') : uiLanguage === "fr" ? t('settings.general.uiLanguage.french') : uiLanguage === "pt" ? t('settings.general.uiLanguage.portuguese') : uiLanguage === "ja" ? t('settings.general.uiLanguage.japanese') : t('settings.general.uiLanguage.chinese')}
                            </div>
                          </div>
                        </div>
                        <ChevronRight className={`h-5 w-5 text-muted-foreground transition-all flex-shrink-0 ${mostrarMenuIdioma ? "rotate-90 text-primary" : ""}`} />
                      </button>
                      {mostrarMenuIdioma && (
                        <>
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setMostrarMenuIdioma(false)}
                          />
                          <div className="absolute z-20 w-full mt-2 rounded-lg border-2 bg-popover shadow-lg max-h-72 overflow-auto">
                            <div className="p-1">
                              {(["en", "es-AR", "de", "fr", "pt", "ja", "zh-CN"] as const).map((idioma) => (
                                <button
                                  key={idioma}
                                  onClick={async () => {
                                    setUiLanguage(idioma);
                                    setMostrarMenuIdioma(false);
                                    await changeLanguage(idioma);
                                  }}
                                  className={`w-full px-4 py-3 text-sm text-left rounded-md hover:bg-accent hover:text-accent-foreground transition-colors flex items-center gap-3 ${uiLanguage === idioma ? 'bg-primary/10 border border-primary/20' : ''
                                    }`}
                                >
                                  <div className="flex-shrink-0 p-1.5 rounded-md bg-background">
                                    <Globe className="h-4 w-4 text-muted-foreground" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="font-semibold">
                                      {idioma === "en" ? t('settings.general.uiLanguage.english') : idioma === "es-AR" ? t('settings.general.uiLanguage.spanish') : idioma === "de" ? t('settings.general.uiLanguage.german') : idioma === "fr" ? t('settings.general.uiLanguage.french') : idioma === "pt" ? t('settings.general.uiLanguage.portuguese') : idioma === "ja" ? t('settings.general.uiLanguage.japanese') : t('settings.general.uiLanguage.chinese')}
                                    </div>
                                    {uiLanguage === idioma && (
                                      <div className="text-xs text-primary mt-0.5 flex items-center gap-1">
                                        <Check className="h-3 w-3" />
                                        {t('settings.general.uiLanguage.selected')}
                                      </div>
                                    )}
                                  </div>
                                  {uiLanguage === idioma && (
                                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                                  )}
                                </button>
                              ))}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          );
        case "datos":
          const seleccionarCarpeta = async () => {
            try {
              if (window.electronAPI?.selectFolder) {
                const nuevaRuta = await window.electronAPI.selectFolder();
                if (nuevaRuta) {
                  if (window.electronAPI?.initializeConfig) {
                    const resultado = await window.electronAPI.initializeConfig(nuevaRuta);
                    if (resultado.success) {
                      const rutaCompleta = resultado.ruta || `${nuevaRuta}/Tuco`;
                      setRutaConfiguracion(rutaCompleta);
                      if (resultado.ultimaActualizacion) {
                        const fecha = new Date(resultado.ultimaActualizacion);
                        setUltimaActualizacion(fecha.toLocaleString('es-ES', {
                          day: '2-digit', month: '2-digit', year: 'numeric',
                          hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true
                        }));
                      }
                    }
                  }
                }
              }
            } catch (error) {
              // Error al seleccionar carpeta
            }
          };


          const exportarConfiguracion = async () => {
            try {
              if (window.electronAPI?.readConfig && window.electronAPI?.saveFile) {
                const resultado = await window.electronAPI.readConfig();
                if (resultado?.success && resultado.config) {
                  // Exportar solo el objeto de configuración, no la respuesta del API
                  const contenido = JSON.stringify(resultado.config, null, 2);
                  const saveResult = await window.electronAPI.saveFile(contenido, 'tuco-settings.json');
                  if (saveResult?.success) {
                    showToast(t('settings.data.management.exportSuccess'), 'success');
                  } else if (saveResult?.error && saveResult.error !== 'Operación cancelada') {
                    showToast(t('settings.data.management.exportError', { error: saveResult.error }), 'error');
                  }
                  // Si fue cancelado, no mostrar mensaje
                } else {
                  showToast(t('settings.data.management.noConfigToExport'), 'error');
                }
              } else {
                showToast(t('settings.data.management.functionalityNotAvailable'), 'error');
              }
            } catch (error) {
              // Error al exportar configuración
              showToast(t('settings.data.management.exportError', { error: (error as Error).message }), 'error');
            }
          };

          const recargarDatosConfiguracion = async () => {
            try {
              if (window.electronAPI?.getDocumentsPath && window.electronAPI?.initializeConfig) {
                const documentsPath = await window.electronAPI.getDocumentsPath();
                const resultado = await window.electronAPI.initializeConfig(documentsPath);

                if (resultado.success) {
                  // Actualizar ruta de configuración
                  setRutaConfiguracion(resultado.ruta || `${documentsPath}/Tuco`);

                  // Aplicar tema
                  const temaMode = resultado.tema === 'dark' ? 'dark' : 'light';
                  const temaNombre = resultado.temaNombre || 'default';
                  setIsDark(temaMode === 'dark');
                  setSelectedTheme({ name: temaNombre, mode: temaMode });
                  applyTheme(temaNombre as ThemeName, temaMode);

                  // Aplicar zoom
                  if (resultado.zoomLevel) {
                    setZoomLevel(resultado.zoomLevel);
                    setTempZoomLevel(resultado.zoomLevel);
                    document.documentElement.style.setProperty('--zoom-level', `${resultado.zoomLevel}%`);
                  }

                  // Recargar repositorios
                  if (resultado.repositorios && resultado.repositorios.length > 0) {
                    const reposConEstado = await Promise.all(resultado.repositorios.map(async (item: FolderItem) => {
                      const verificarEstado = async (node: FolderItem): Promise<FolderItem> => {
                        if (node.tipo === "archivo") {
                          const orgPath = node.organizacion ? `${node.organizacion}/` : "";
                          const repoName = node.nombreGit || node.nombre;
                          const destPath = `${resultado.ruta}/repositories/${node.idConexion || 'unknown'}/${orgPath}${repoName}`;
                          const existe = window.electronAPI?.checkPathExists ? await window.electronAPI.checkPathExists(destPath) : false;
                          return { ...node, clonado: existe };
                        }
                        if (node.hijos) {
                          const hijosActualizados = await Promise.all(node.hijos.map(h => verificarEstado(h)));
                          return { ...node, hijos: hijosActualizados };
                        }
                        return node;
                      };
                      return verificarEstado(item);
                    }));
                    setEstructuraCarpetas(reposConEstado);
                  } else {
                    // Si no hay repositorios, establecer estructura vacía
                    setEstructuraCarpetas([{
                      id: "root",
                      nombre: "Mis repositorios",
                      tipo: "coleccion",
                      hijos: []
                    }]);
                  }

                  // Recargar conexiones
                  if (window.electronAPI?.readConfig) {
                    const configResult = await window.electronAPI.readConfig();
                    if (configResult.success && configResult.config?.conexiones) {
                      setConexionesGuardadas(configResult.config.conexiones);
                    } else {
                      setConexionesGuardadas([]);
                    }
                  }

                  // Actualizar fecha de última actualización
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

                  // Actualizar editor IDE
                  if (resultado.editorIDE) {
                    setEditorIDESeleccionado(resultado.editorIDE);
                  }

                  // Actualizar configuración de Git
                  if (resultado.gitSslVerify !== undefined) {
                    setGitSslVerify(resultado.gitSslVerify);
                  }
                  if (resultado.gitUserName) {
                    setGitUserName(resultado.gitUserName);
                  }
                  if (resultado.gitUserEmail) {
                    setGitUserEmail(resultado.gitUserEmail);
                  }
                }
              }
            } catch (error) {
              // Error al recargar datos
            }
          };

          const importarConfiguracion = async () => {
            try {
              if (window.electronAPI?.openFile) {
                const contenido = await window.electronAPI.openFile();
                if (contenido) {
                  const config = JSON.parse(contenido);
                  if (window.electronAPI?.importConfig) {
                    const resultado = await window.electronAPI.importConfig(config);
                    if (resultado?.success) {
                      showToast(t('settings.data.management.importSuccess'), 'success');
                      // Recargar los datos sin recargar la página
                      await recargarDatosConfiguracion();
                      showToast(t('settings.data.management.dataReloaded'), 'success');
                    } else {
                      showToast(t('settings.data.management.importError', { error: resultado?.error || 'Error desconocido' }), 'error');
                    }
                  } else {
                    showToast(t('settings.data.management.importNotAvailable'), 'error');
                  }
                } else {
                  // Usuario canceló la operación, no mostrar error
                }
              }
            } catch (error) {
              // Error al importar configuración
              const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
              if (errorMessage.includes('JSON') || errorMessage.includes('parse')) {
                showToast(t('settings.data.management.invalidJson'), 'error');
              } else {
                showToast(t('settings.data.management.importConfigError', { error: errorMessage }), 'error');
              }
            }
          };

          return (
            <div className="space-y-6 px-8 py-0 max-w-3xl">
              {/* Header */}
              <div className="space-y-1">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Database className="h-5 w-5 text-primary" />
                  {t('settings.data.title')}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t('settings.data.description')}
                </p>
              </div>

              {/* Ubicación de configuración */}
              <Card className="border-2">
                <CardHeader className="pb-3">
                  <div>
                    <CardTitle className="text-base">{t('settings.data.configLocation.title')}</CardTitle>
                    <CardDescription className="text-xs mt-1">
                      {t('settings.data.configLocation.description')}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 flex items-center gap-3 px-4 py-3 rounded-lg border-2 bg-background">
                        <Folder className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                        <span className="text-sm truncate font-mono">{rutaConfiguracion || t('common.loadingText')}</span>
                      </div>
                      <Button onClick={seleccionarCarpeta} className="flex-shrink-0">
                        <FolderUp className="h-4 w-4 mr-2" />
                        {t('settings.data.configLocation.selectFolder')}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Información del archivo */}
              <Card className="border-2">
                <CardHeader className="pb-3">
                  <div>
                    <CardTitle className="text-base">{t('settings.data.fileInfo.title')}</CardTitle>
                    <CardDescription className="text-xs mt-1">
                      {t('settings.data.fileInfo.description')}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 rounded-lg border bg-background">
                      <div className="p-2 rounded-md bg-muted flex-shrink-0">
                        <File className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-foreground mb-1">{t('settings.data.fileInfo.configFile')}</div>
                        <div className="text-xs font-mono text-muted-foreground break-all">
                          {rutaConfiguracion ? `${rutaConfiguracion}/tuco-settings.json` : t('common.loadingText')}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-lg border bg-background">
                      <div className="p-2 rounded-md bg-muted flex-shrink-0">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-foreground mb-1">{t('settings.data.fileInfo.lastUpdate')}</div>
                        <div className="text-xs text-muted-foreground">
                          {ultimaActualizacion || t('common.noAvailable')}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Gestión de configuración */}
              <Card className="border-2">
                <CardHeader className="pb-3">
                  <div>
                    <CardTitle className="text-base">{t('settings.data.management.title')}</CardTitle>
                    <CardDescription className="text-xs mt-1">
                      {t('settings.data.management.description')}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Button
                      onClick={importarConfiguracion}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      {t('settings.data.management.import')}
                    </Button>
                    <Button
                      onClick={exportarConfiguracion}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {t('settings.data.management.export')}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Purgar Cache */}
              <Card className="border-2 border-orange-600/50">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-orange-600/10">
                      <Trash2 className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{t('settings.data.purgeCache.title')}</CardTitle>
                      <CardDescription className="text-xs mt-1">
                        {t('settings.data.purgeCache.description')}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="border rounded-md">
                      <div className="bg-muted/50 px-3 py-2 text-xs font-semibold border-b">
                        {t('settings.data.purgeCache.clonedRepos')} ({obtenerRepositoriosClonados(estructuraCarpetas).length})
                      </div>
                      <div className="max-h-48 overflow-y-auto p-2 space-y-1 scrollbar-hide">
                        {obtenerRepositoriosClonados(estructuraCarpetas).length === 0 ? (
                          <div className="text-center py-4 text-xs text-muted-foreground">
                            No hay repositorios en cache
                          </div>
                        ) : (
                          obtenerRepositoriosClonados(estructuraCarpetas).map(repo => (
                            <div key={repo.id} className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-md text-sm">
                              <div className="flex items-center gap-2 overflow-hidden">
                                <FolderGit2 className="h-4 w-4 text-orange-500 flex-shrink-0" />
                                <span className="truncate">{repo.nombre}</span>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/30"
                                onClick={() => purgarRepositorio(repo)}
                                title={t('settings.data.purgeCache.delete')}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={purgarTodoCache}
                        disabled={obtenerRepositoriosClonados(estructuraCarpetas).length === 0}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        {t('settings.data.purgeCache.purgeAll')}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Restablecer configuración */}
              <Card className="border-2 border-red-600">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-red-600/10">
                      <Sliders className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{t('settings.data.reset.title')}</CardTitle>
                      <CardDescription className="text-xs mt-1">
                        {t('settings.data.reset.description')}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-red-600/5 border border-red-600/20">
                    <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground mb-1">{t('settings.data.reset.warning')}</p>
                      <p className="text-xs text-muted-foreground">
                        {t('settings.data.reset.warningMessage')}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-end mt-4">
                    <Button
                      variant="destructive"
                      onClick={() => setMostrarModalRestablecerConfig(true)}
                    >
                      <Sliders className="h-4 w-4 mr-2" />
                      {t('settings.data.reset.restoreConfig')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          );
        case "git":
          return (
            <div className="space-y-6 px-8 py-0 max-w-3xl">
              {/* Header */}
              <div className="space-y-1">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <GitBranch className="h-5 w-5 text-primary" />
                  {t('settings.git.title')}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t('settings.git.description')}
                </p>
              </div>

              {/* Identidades */}
              <Card className="border-2">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base">{t('settings.git.identities.title')}</CardTitle>
                      <CardDescription className="text-xs mt-1">
                        {t('settings.git.identities.description')}
                      </CardDescription>
                    </div>
                    <Button
                      onClick={() => {
                        setNombreNuevaIdentidad("");
                        setEmailNuevaIdentidad("");
                        setMostrarModalNuevaIdentidad(true);
                      }}
                      className="h-8 px-3 text-xs"
                      size="sm"
                    >
                      <Plus className="h-3.5 w-3.5 mr-1.5" />
                      {t('settings.git.identities.newIdentity')}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {gitIdentities.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p className="text-sm">{t('settings.git.identities.noIdentities')}</p>
                      <p className="text-xs mt-1">{t('settings.git.identities.addIdentity')}</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="text-left py-3 px-4 text-sm font-semibold">{t('common.fullName')}</th>
                            <th className="text-left py-3 px-4 text-sm font-semibold">{t('common.email')}</th>
                            <th className="text-right py-3 px-4 text-sm font-semibold">{t('common.actions')}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {gitIdentities.map((identidad) => (
                            <tr key={identidad.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                              <td className="py-3 px-4 text-sm">
                                <div className="flex items-center gap-2">
                                  <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                  <span>{identidad.nombre}</span>
                                  {identidad.id === IDENTIDAD_DEFAULT_ID && (
                                    <span className="px-1 py-0.5 text-[8px] font-semibold rounded bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                                      {t('common.default')}
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="py-3 px-4 text-sm text-muted-foreground">{identidad.email}</td>
                              <td className="py-3 px-4 text-sm">
                                <div className="flex items-center justify-end gap-2">
                                  <Button
                                    onClick={() => {
                                      setIdentidadAEditar(identidad);
                                      setNombreNuevaIdentidad(identidad.nombre);
                                      setEmailNuevaIdentidad(identidad.email);
                                      setMostrarModalEditarIdentidad(true);
                                    }}
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 px-2"
                                  >
                                    <Pencil className="h-3.5 w-3.5" />
                                  </Button>
                                  {identidad.id !== IDENTIDAD_DEFAULT_ID && (
                                    <Button
                                      onClick={() => {
                                        setIdentidadAEliminar(identidad);
                                        setMostrarModalEliminarIdentidad(true);
                                      }}
                                      variant="ghost"
                                      size="sm"
                                      className="h-7 px-2 text-red-600 hover:text-white hover:bg-red-600"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Comportamiento del Botón de Commit */}
              <Card className="border-2">
                <CardHeader className="pb-3">
                  <div>
                    <CardTitle className="text-base">{t('settings.git.commitBehavior.title')}</CardTitle>
                    <CardDescription className="text-xs mt-1">
                      {t('settings.git.commitBehavior.description')}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold">
                        {t('settings.git.commitBehavior.buttonAction')}
                      </label>
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setMostrarMenuCommitBehavior(!mostrarMenuCommitBehavior)}
                          className="w-full px-4 py-3 text-sm rounded-lg border-2 border-input bg-background text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all hover:border-primary/50"
                        >
                          <span className={commitButtonBehavior ? "text-foreground" : "text-muted-foreground"}>
                            {commitButtonBehavior === "commit" && t('settings.git.commitBehavior.commit')}
                            {commitButtonBehavior === "commit-push" && t('settings.git.commitBehavior.commitPush')}
                            {commitButtonBehavior === "commit-sync" && t('settings.git.commitBehavior.commitSync')}
                          </span>
                          <ChevronRight className={`h-4 w-4 transition-transform flex-shrink-0 ${mostrarMenuCommitBehavior ? "rotate-90" : ""}`} />
                        </button>
                        {mostrarMenuCommitBehavior && (
                          <>
                            <div
                              className="fixed inset-0 z-10"
                              onClick={() => setMostrarMenuCommitBehavior(false)}
                            />
                            <div className="absolute z-20 w-full mt-1 rounded-md border bg-popover shadow-md overflow-auto">
                              <button
                                onClick={async () => {
                                  const nuevoValor = "commit" as const;
                                  setCommitButtonBehavior(nuevoValor);
                                  setMostrarMenuCommitBehavior(false);
                                  if (window.electronAPI?.writeConfig) {
                                    try {
                                      await window.electronAPI.writeConfig({ commitButtonBehavior: nuevoValor });
                                    } catch (error) {
                                      // Error al guardar comportamiento del botón
                                    }
                                  }
                                }}
                                className={`w-full px-3 py-2 text-sm text-left hover:bg-accent hover:text-accent-foreground transition-colors flex items-center gap-2 ${commitButtonBehavior === "commit" ? "bg-accent text-accent-foreground" : ""
                                  }`}
                              >
                                <Check className={`h-4 w-4 flex-shrink-0 ${commitButtonBehavior === "commit" ? "opacity-100" : "opacity-0"}`} />
                                <span>{t('settings.git.commitBehavior.commit')}</span>
                              </button>
                              <button
                                onClick={async () => {
                                  const nuevoValor = "commit-push" as const;
                                  setCommitButtonBehavior(nuevoValor);
                                  setMostrarMenuCommitBehavior(false);
                                  if (window.electronAPI?.writeConfig) {
                                    try {
                                      await window.electronAPI.writeConfig({ commitButtonBehavior: nuevoValor });
                                    } catch (error) {
                                      // Error al guardar comportamiento del botón
                                    }
                                  }
                                }}
                                className={`w-full px-3 py-2 text-sm text-left hover:bg-accent hover:text-accent-foreground transition-colors flex items-center gap-2 ${commitButtonBehavior === "commit-push" ? "bg-accent text-accent-foreground" : ""
                                  }`}
                              >
                                <Check className={`h-4 w-4 flex-shrink-0 ${commitButtonBehavior === "commit-push" ? "opacity-100" : "opacity-0"}`} />
                                <span>{t('settings.git.commitBehavior.commitPush')}</span>
                              </button>
                              <button
                                onClick={async () => {
                                  const nuevoValor = "commit-sync" as const;
                                  setCommitButtonBehavior(nuevoValor);
                                  setMostrarMenuCommitBehavior(false);
                                  if (window.electronAPI?.writeConfig) {
                                    try {
                                      await window.electronAPI.writeConfig({ commitButtonBehavior: nuevoValor });
                                    } catch (error) {
                                      // Error al guardar comportamiento del botón
                                    }
                                  }
                                }}
                                className={`w-full px-3 py-2 text-sm text-left hover:bg-accent hover:text-accent-foreground transition-colors flex items-center gap-2 ${commitButtonBehavior === "commit-sync" ? "bg-accent text-accent-foreground" : ""
                                  }`}
                              >
                                <Check className={`h-4 w-4 flex-shrink-0 ${commitButtonBehavior === "commit-sync" ? "opacity-100" : "opacity-0"}`} />
                                <span>{t('settings.git.commitBehavior.commitSync')}</span>
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="space-y-3 p-4 rounded-lg bg-muted/50 border">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <div className={`h-2 w-2 rounded-full ${commitButtonBehavior === "commit" ? "bg-primary" : "bg-muted-foreground/30"}`} />
                          <span className="text-sm font-semibold">{t('settings.git.commitBehavior.commit')}</span>
                        </div>
                        <p className="text-xs text-muted-foreground ml-4">
                          {t('settings.git.commitBehavior.commitDescription')}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <div className={`h-2 w-2 rounded-full ${commitButtonBehavior === "commit-push" ? "bg-primary" : "bg-muted-foreground/30"}`} />
                          <span className="text-sm font-semibold">{t('settings.git.commitBehavior.commitPush')}</span>
                        </div>
                        <p className="text-xs text-muted-foreground ml-4">
                          {t('settings.git.commitBehavior.commitPushDescription')}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <div className={`h-2 w-2 rounded-full ${commitButtonBehavior === "commit-sync" ? "bg-primary" : "bg-muted-foreground/30"}`} />
                          <span className="text-sm font-semibold">{t('settings.git.commitBehavior.commitSync')}</span>
                        </div>
                        <p className="text-xs text-muted-foreground ml-4">
                          {t('settings.git.commitBehavior.commitSyncDescription')}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Seguridad y Red */}
              <Card className="border-2">
                <CardHeader className="pb-3">
                  <div>
                    <CardTitle className="text-base">{t('settings.git.security.title')}</CardTitle>
                    <CardDescription className="text-xs mt-1">
                      {t('settings.git.security.description')}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-4 p-4 rounded-lg bg-muted/50 border">
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <label className="text-sm font-semibold">{t('settings.git.security.sslVerify')}</label>
                          <div className={`px-2 py-0.5 rounded-full text-xs font-semibold ${gitSslVerify
                            ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                            : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                            }`}>
                            {gitSslVerify ? t('settings.git.security.activated') : t('settings.git.security.deactivated')}
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {t('settings.git.security.sslDescription')}
                        </p>
                        {!gitSslVerify && (
                          <div className="flex items-start gap-2 mt-2 p-2 rounded-md bg-amber-500/10 border border-amber-500/20">
                            <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                            <p className="text-xs text-amber-700 dark:text-amber-300">
                              {t('settings.git.security.sslWarning')}
                            </p>
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={async () => {
                          const nuevoValor = !gitSslVerify;
                          setGitSslVerify(nuevoValor);
                          if (window.electronAPI?.writeConfig) {
                            try {
                              await window.electronAPI.writeConfig({ gitSslVerify: nuevoValor });
                              showToast(
                                nuevoValor ? t('settings.git.security.sslActivated') : t('settings.git.security.sslDeactivated'),
                                nuevoValor ? 'success' : 'warning'
                              );
                            } catch (error) {
                              // Error al guardar SSL verify
                              showToast(t('settings.git.security.sslError'), 'error');
                            }
                          }
                        }}
                        className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 flex-shrink-0 ${gitSslVerify ? 'bg-primary' : 'bg-muted'
                          }`}
                      >
                        <span
                          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform ${gitSslVerify ? 'translate-x-6' : 'translate-x-1'
                            }`}
                        />
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          );
        case "temas":
          return (
            <div className="space-y-6 px-8 py-0 max-w-4xl">
              {/* Header */}
              <div className="space-y-1">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Palette className="h-5 w-5 text-primary" />
                  {t('settings.appearance.title')}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t('settings.appearance.description')}
                </p>
              </div>

              {/* Selección de Temas */}
              <Card className="border-2">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base">{t('settings.appearance.themes.title')}</CardTitle>
                      <CardDescription className="text-xs mt-1">
                        {t('settings.appearance.themes.description')}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Sun className="h-4 w-4 text-muted-foreground" />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={toggleTheme}
                        className="h-8 px-3"
                      >
                        {isDark ? (
                          <>
                            <Moon className="h-3.5 w-3.5 mr-1.5" />
                            {t('settings.appearance.themes.dark')}
                          </>
                        ) : (
                          <>
                            <Sun className="h-3.5 w-3.5 mr-1.5" />
                            {t('settings.appearance.themes.light')}
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                    {themes.map((theme) => {
                      const currentColors = isDark ? theme.colors.dark : theme.colors.light;
                      return (
                        <Card
                          key={theme.name}
                          className={`p-3 cursor-pointer hover:border-primary/50 transition-all border-2 ${selectedTheme.name === theme.name
                            ? 'border-primary bg-primary/5 shadow-md'
                            : 'border-border'
                            }`}
                          onClick={() => handleThemeSelect(theme.name)}
                        >
                          <div className="space-y-2">
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <div className="text-xs font-semibold truncate">{theme.displayName}</div>
                              </div>
                              {selectedTheme.name === theme.name && (
                                <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 ml-1" />
                              )}
                            </div>
                            <div className="h-8 rounded-md shadow-sm" style={{ backgroundColor: `hsl(${currentColors.primary})` }} />
                            <div className="flex gap-1 justify-center">
                              <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: `hsl(${currentColors.secondary})` }} />
                              <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: `hsl(${currentColors.accent})` }} />
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Tamaño de Componentes */}
              <Card className="border-2">
                <CardHeader className="pb-3">
                  <div>
                    <CardTitle className="text-base">{t('settings.appearance.componentSize.title')}</CardTitle>
                    <CardDescription className="text-xs mt-1">
                      {t('settings.appearance.componentSize.description')}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50 border">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <label className="text-sm font-semibold">{t('settings.appearance.componentSize.zoomLevel')}</label>
                          <div className="px-2 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary">
                            {tempZoomLevel}%
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {t('settings.appearance.componentSize.zoomDescription')}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="px-1">
                        <input
                          type="range"
                          min="50"
                          max="150"
                          step="10"
                          value={Math.max(50, Math.min(150, tempZoomLevel))}
                          onChange={(e) => {
                            const newZoom = parseInt(e.target.value);
                            setTempZoomLevel(newZoom);
                          }}
                          onMouseUp={async (e) => {
                            const newZoom = parseInt((e.target as HTMLInputElement).value);
                            setZoomLevel(newZoom);
                            setTempZoomLevel(newZoom);
                            document.documentElement.style.setProperty('--zoom-level', `${newZoom}%`);
                            if (window.electronAPI?.writeConfig) {
                              try {
                                await window.electronAPI.writeConfig({ zoomLevel: newZoom });
                              } catch (error) {
                                // Error al guardar zoom
                              }
                            }
                          }}
                          className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
                          style={{
                            background: `linear-gradient(to right, hsl(var(--primary)) 0%, hsl(var(--primary)) ${((Math.max(50, Math.min(150, tempZoomLevel)) - 50) / 100) * 100}%, hsl(var(--muted)) ${((Math.max(50, Math.min(150, tempZoomLevel)) - 50) / 100) * 100}%, hsl(var(--muted)) 100%)`
                          }}
                        />
                        <style>{`
                          .slider::-webkit-slider-thumb {
                            appearance: none;
                            width: 18px;
                            height: 18px;
                            border-radius: 50%;
                            background: hsl(var(--primary));
                            cursor: pointer;
                            border: 2px solid hsl(var(--background));
                            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
                          }
                          .slider::-moz-range-thumb {
                            width: 18px;
                            height: 18px;
                            border-radius: 50%;
                            background: hsl(var(--primary));
                            cursor: pointer;
                            border: 2px solid hsl(var(--background));
                            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
                          }
                        `}</style>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground px-1">
                        <span>50%</span>
                        <span>100%</span>
                        <span>150%</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/5 border border-primary/10">
                      <Info className="h-4 w-4 text-primary flex-shrink-0" />
                      <p className="text-xs text-muted-foreground">
                        {t('settings.appearance.componentSize.zoomInfo')}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          );
        case "actualizacion":
          return (
            <div className="space-y-6 px-8 py-0 max-w-3xl">
              {/* Header */}
              <div className="space-y-1">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <RefreshCw className="h-5 w-5 text-primary" />
                  {t('settings.updates.title')}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t('settings.updates.description')}
                </p>
              </div>

              {/* Información de Versión */}
              <Card className="border-2">
                <CardHeader className="pb-3">
                  <div>
                    <CardTitle className="text-base">{t('settings.updates.currentVersion.title')}</CardTitle>
                    <CardDescription className="text-xs mt-1">
                      {t('settings.updates.currentVersion.description')}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-lg bg-primary/5 border border-primary/10">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/20">
                          <Star className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-foreground">TucoGit</div>
                          <div className="text-xs text-muted-foreground">{t('settings.updates.currentVersion.appVersion')}</div>
                        </div>
                      </div>
                      <div className="px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
                        <span className="text-sm font-bold text-primary">v{appVersion}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 border">
                      <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <p className="text-xs text-muted-foreground">
                        {t('settings.updates.currentVersion.latestVersion')}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Última Actualización */}
              <Card className="border-2">
                <CardHeader className="pb-3">
                  <div>
                    <CardTitle className="text-base">{t('settings.updates.lastUpdate.title')}</CardTitle>
                    <CardDescription className="text-xs mt-1">
                      {t('settings.updates.lastUpdate.description')}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50 border">
                      <div className="p-2 rounded-lg bg-blue-500/10">
                        <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-foreground mb-1">{t('settings.updates.lastUpdate.configModified')}</div>
                        <div className="text-xs font-mono text-muted-foreground">
                          {ultimaActualizacion || t('common.noAvailable')}
                        </div>
                      </div>
                    </div>
                    {ultimaActualizacion && (
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/5 border border-primary/10">
                        <Info className="h-4 w-4 text-primary flex-shrink-0" />
                        <p className="text-xs text-muted-foreground">
                          {t('settings.updates.lastUpdate.autoUpdateInfo')}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>



              {/* Nota sobre Actualizaciones */}
              <Card className="border-2 border-primary/20 bg-primary/5">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-foreground">{t('settings.updates.aboutUpdates.title')}</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {t('settings.updates.aboutUpdates.description')}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          );
        case "acerca":
          return (
            <div className="space-y-6 px-8 py-0 max-w-4xl">
              {/* Logo y Versión Principal */}
              <Card className="border-2 overflow-hidden">
                <div className="relative bg-gradient-to-br from-purple-500/10 via-blue-500/10 to-cyan-500/10">
                  <CardContent className="pt-8 pb-8">
                    <div className="text-center space-y-5">
                      {/* Logo */}
                      <div className="flex justify-center">
                        <div className="relative group">
                          <div className="absolute inset-0 bg-gradient-to-br from-purple-500 via-blue-500 to-cyan-500 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
                          <div className="relative w-24 h-24 rounded-2xl bg-gradient-to-br from-purple-500 via-blue-500 to-cyan-500 flex items-center justify-center shadow-2xl shadow-purple-500/40 transform group-hover:scale-105 transition-transform overflow-hidden">
                            <img src={tucoLogo} alt="TucoGit Logo" className="w-full h-full object-cover" />
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-green-500 border-4 border-background flex items-center justify-center shadow-lg">
                            <Check className="h-4 w-4 text-white" />
                          </div>
                        </div>
                      </div>

                      {/* Título y Versión */}
                      <div className="space-y-3">
                        <div>
                          <h2 className="text-3xl font-bold mb-1 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
                            TucoGit
                          </h2>
                          <div className="flex items-center justify-center gap-2 mt-2">
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
                              <span className="text-xs font-semibold text-primary">v{appVersion}</span>
                            </div>
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20">
                              <span className="text-xs font-medium text-blue-600 dark:text-blue-400">{t('settings.about.footer.beta')}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Descripción */}
                      <div className="max-w-2xl mx-auto px-4">
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {t('settings.about.appDescription')}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </div>
              </Card>

              {/* Información del Autor */}
              <Card className="border-2">
                <CardHeader className="pb-3">
                  <div>
                    <CardTitle className="text-base">{t('settings.about.developer.title')}</CardTitle>
                    <CardDescription className="text-xs mt-1">
                      {t('settings.about.developer.description')}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Perfil Principal */}
                    <div className="flex items-start gap-4 p-4 rounded-lg bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-primary/20">
                        <Users className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div>
                          <div className="text-base font-bold text-foreground mb-0.5">Hernan Lencinas</div>
                          <div className="text-xs text-muted-foreground">{t('settings.about.developer.fullStack')}</div>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {t('settings.about.developer.bio')}
                        </p>
                      </div>
                    </div>

                    {/* Información de Contacto */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <a
                        href="mailto:lencinas.hernan@gmail.com"
                        className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-primary/5 transition-all group"
                      >
                        <div className="p-2 rounded-lg bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors">
                          <Mail className="h-4 w-4 text-blue-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-semibold text-foreground mb-0.5">{t('settings.about.contact.email')}</div>
                          <div className="text-xs text-muted-foreground truncate font-mono">lencinas.hernan@gmail.com</div>
                        </div>
                        <ExternalLink className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                      </a>
                      <a
                        href="https://github.com/HernanLencinas"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-primary/5 transition-all group"
                      >
                        <div className="p-2 rounded-lg bg-gray-500/10 group-hover:bg-gray-500/20 transition-colors">
                          <GitBranch className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-semibold text-foreground mb-0.5">{t('settings.about.contact.github')}</div>
                          <div className="text-xs text-muted-foreground truncate">@HernanLencinas</div>
                        </div>
                        <ExternalLink className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Soporte y Comunidad */}
              <Card className="border-2">
                <CardHeader className="pb-3">
                  <div>
                    <CardTitle className="text-base">{t('settings.about.support.title')}</CardTitle>
                    <CardDescription className="text-xs mt-1">
                      {t('settings.about.support.description')}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <a
                      href="https://github.com/HernanLencinas/TucoGit/issues"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-4 rounded-lg border-2 border-border hover:border-primary/50 hover:bg-primary/5 transition-all group"
                    >
                      <div className="p-2 rounded-lg bg-red-500/10 group-hover:bg-red-500/20 transition-colors">
                        <AlertCircle className="h-5 w-5 text-red-500" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-foreground mb-1">{t('settings.about.support.reportIssue')}</div>
                        <div className="text-xs text-muted-foreground">{t('settings.about.support.reportIssueDescription')}</div>
                      </div>
                      <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </a>
                    <a
                      href="https://github.com/HernanLencinas/TucoGit/discussions"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-4 rounded-lg border-2 border-border hover:border-primary/50 hover:bg-primary/5 transition-all group"
                    >
                      <div className="p-2 rounded-lg bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors">
                        <Users className="h-5 w-5 text-blue-500" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-foreground mb-1">{t('settings.about.support.discussions')}</div>
                        <div className="text-xs text-muted-foreground">{t('settings.about.support.discussionsDescription')}</div>
                      </div>
                      <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </a>
                  </div>
                </CardContent>
              </Card>

              {/* Footer */}
              <Card className="border-2 border-t-primary/20">
                <CardContent className="pt-5 pb-5">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    {/* Lado izquierdo - Copyright y descripción */}
                    <div className="flex flex-col items-center md:items-start gap-1.5">
                      <p className="text-sm font-semibold text-foreground">
                        © 2026 Hernan Lencinas
                      </p>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Heart className="h-3 w-3 text-red-500 fill-red-500" />
                        <span>{t('settings.about.footer.madeWith')}</span>
                        <span className="font-medium text-primary">{t('settings.about.footer.openSource')}</span>
                      </div>
                    </div>

                    {/* Lado derecho - Badges */}
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-primary/5 border border-primary/10">
                        <Code className="h-3.5 w-3.5 text-primary" />
                        <span className="text-xs font-medium text-primary">MIT</span>
                      </div>
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-500/5 border border-blue-500/10">
                        <Star className="h-3.5 w-3.5 text-blue-500 fill-blue-500" />
                        <span className="text-xs font-medium text-blue-600 dark:text-blue-400">{t('settings.about.footer.openSourceBadge')}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          );
        default:
          return null;
      }
    };

    return (
      <div className="flex h-full w-full">
        {/* Sidebar de configuración */}
        <div className="w-48 flex-shrink-0 border-r pr-4 py-4 space-y-1">
          {[
            { id: "general", labelKey: "settings.tabs.general", icon: <Settings className="h-4 w-4" /> },
            { id: "datos", labelKey: "settings.tabs.data", icon: <Database className="h-4 w-4" /> },
            { id: "git", labelKey: "settings.tabs.git", icon: <GitBranch className="h-4 w-4" /> },
            { id: "temas", labelKey: "settings.tabs.appearance", icon: <Palette className="h-4 w-4" /> },
            { id: "actualizacion", labelKey: "settings.tabs.updates", icon: <RefreshCw className="h-4 w-4" /> },
            { id: "acerca", labelKey: "settings.tabs.about", icon: <Info className="h-4 w-4" /> },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setConfigTabActiva(item.id)}
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${configTabActiva === item.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"}`}
            >
              {item.icon}
              {t(item.labelKey)}
            </button>
          ))}
        </div>

        {/* Contenido scrolleable */}
        <div className="flex-1 overflow-y-auto py-4 hide-scrollbar">
          {renderConfigContent()}
        </div>
      </div>
    );
  };

  const renderContent = () => {
    return (
      <div className="h-full w-full relative">
        <div className={`h-full w-full ${activeTab === 'inicio' ? 'block' : 'hidden'}`}>
          {renderInicioTab()}
        </div>
        <div className={`h-full w-full ${activeTab === 'repositorios' ? 'block' : 'hidden'}`}>
          {renderRepositoriosTab()}
        </div>
        <div className={`h-full w-full ${activeTab === 'conexiones' ? 'block' : 'hidden'}`}>
          {renderConexionesTab()}
        </div>
        <div className={`h-full w-full ${activeTab === 'configuracion' ? 'block' : 'hidden'}`}>
          {renderConfiguracionTab()}
        </div>
      </div>
    );
  };

  const isMac = window.electronAPI?.platform === 'darwin';

  // Mostrar pantalla de carga mientras se inicializa
  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {/* Área de arrastre para macOS */}
      {isMac && (
        <div
          className="h-8 bg-transparent flex-shrink-0"
          style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
        />
      )}
      {/* Contenido Principal */}
      <div className={`flex-1 min-h-0 overflow-hidden ${activeTab === 'repositorios' && viewMode === 'details' ? 'p-0' : 'p-6'}`}>
        <div className={`h-full w-full ${activeTab === 'repositorios' && viewMode === 'details' ? 'overflow-hidden' : 'overflow-y-auto'} ${activeTab === 'inicio' || activeTab === 'configuracion' ? 'hide-scrollbar' : ''}`}>
          {renderContent()}
        </div>
      </div>

      {/* Tabs de Repositorios Abiertos - Mejoradas */}
      {activeTab === 'repositorios' && repositoriesMinimizados.length > 0 && (
        <div className={`relative flex-shrink-0 border-b border-border bg-muted/30 ${viewMode === 'details' ? 'pt-2' : ''}`}>
          {/* Scroll horizontal para muchas tabs */}
          <div className="overflow-x-auto overflow-y-hidden scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent hover:scrollbar-thumb-muted-foreground/30">
            <div className="flex items-end min-w-max px-1">
              {repositoriesMinimizados.map((repo, index) => {
                const esActivo = activeRepository?.id === repo.id;
                const gitInfo = gitInfoRepositorios[repo.id];
                const tieneCambios = gitInfo?.uncommitted && gitInfo.uncommitted > 0;

                return (
                  <div
                    key={repo.id}
                    className={cn(
                      "relative flex items-center gap-1.5 px-3 py-2 mx-0.5 transition-all duration-200 group min-w-[120px] max-w-[200px]",
                      esActivo
                        ? "bg-background text-foreground border-t border-l border-r border-border rounded-t-md shadow-sm z-10"
                        : "bg-transparent text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    )}
                    style={{
                      marginTop: esActivo ? '0' : '1px',
                      paddingBottom: esActivo ? '9px' : '8px',
                    }}
                  >
                    {/* Icono y nombre */}
                    <button
                      onClick={() => {
                        setActiveRepository(repo);
                        setViewMode("details");
                      }}
                      onMouseDown={(e) => {
                        // Cerrar con click medio (botón 1 del mouse)
                        if (e.button === 1) {
                          e.preventDefault();
                          const nuevosMinimizados = repositoriesMinimizados.filter(r => r.id !== repo.id);
                          setRepositoriesMinimizados(nuevosMinimizados);
                          if (esActivo) {
                            setActiveRepository(null);
                            setViewMode("list");
                          }
                        }
                      }}
                      className={cn(
                        "flex items-center gap-1.5 flex-1 min-w-0 text-xs transition-colors",
                        esActivo ? "text-foreground font-medium" : "text-muted-foreground group-hover:text-foreground"
                      )}
                      title={`${repo.nombre}${gitInfo?.branch ? ` - ${gitInfo.branch}` : ''}${tieneCambios ? ` (${t('repositories.tooltips.uncommittedChanges')})` : ''}\n${t('repositories.tooltips.middleClickToClose')}`}
                    >
                      <GitBranch className={cn(
                        "h-3.5 w-3.5 flex-shrink-0",
                        esActivo ? "text-foreground" : "text-muted-foreground/60 group-hover:text-foreground/80"
                      )} />
                      <span className="truncate flex-1 text-left">
                        {repo.nombre}
                      </span>
                    </button>

                    {/* Botón cerrar - solo visible en hover o si está activo */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const nuevosMinimizados = repositoriesMinimizados.filter(r => r.id !== repo.id);
                        setRepositoriesMinimizados(nuevosMinimizados);
                        if (esActivo) {
                          setActiveRepository(null);
                          setViewMode("list");
                        }
                      }}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        // Prevenir que el click se propague al botón principal
                        if (e.button === 0) {
                          e.preventDefault();
                        }
                      }}
                      className={cn(
                        "flex-shrink-0 p-0.5 rounded transition-all opacity-0 group-hover:opacity-100",
                        esActivo && "opacity-100",
                        esActivo
                          ? "hover:bg-muted/80 text-foreground/70 hover:text-foreground"
                          : "hover:bg-muted/60 text-muted-foreground/50 group-hover:text-foreground/70"
                      )}
                      title={t('repositories.tooltips.close')}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                      }}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Footer con Tabs - Siempre visible */}
      <footer className="border-t bg-muted/50 py-3 px-6 flex-shrink-0">
        <div className="w-full relative flex items-center justify-center">
          <div className="flex items-center gap-2">
            {/* Tabs */}
            <div className="flex gap-1.5">
              <Button
                variant={activeTab === "inicio" ? "default" : "ghost"}
                onClick={() => setActiveTab("inicio")}
                size="sm"
                className="h-8 px-3 text-xs"
              >
                <Home className="mr-1.5 h-3.5 w-3.5" />
                {t('common.tabs.home')}
              </Button>
              <Button
                variant={activeTab === "repositorios" ? "default" : "ghost"}
                onClick={() => {
                  if (activeTab === "repositorios" && viewMode === "details") {
                    setActiveRepository(null);
                    setViewMode("list");
                  } else {
                    setActiveTab("repositorios");
                  }
                }}
                size="sm"
                className="h-8 px-3 text-xs"
              >
                <FolderGit2 className="mr-1.5 h-3.5 w-3.5" />
                {t('common.tabs.repositories')}
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
                  <path d="M25.6,25.6,22.2,29,19,25.8l3.4-3.4a2,2,0,0,0-2.8-2.8L16.2,23l-1.3-1.3a1.9,1.9,0,0,0-2.8,0l-3,3a9.8,9.8,0,0,0-3,7,9.1,9.1,0,0,0,1.8,5.6L4.6,40.6a1.9,1.9,0,0,0,0,2.8,1.9,1.9,0,0,0,2.8,0l3.2-3.2a10.1,10.1,0,0,0,5.9,1.9,10.2,10.2,0,0,0,7.1-2.9l3-3a2,2,0,0,0,.6-1.4,1.7,1.7,0,0,0-.6-1.4L25,31.8l3.4-3.4a2,2,0,0,0-2.8-2.8ZM20.8,36.4a6.1,6.1,0,0,1-8.5,0l-.4-.4a6.4,6.4,0,0,1-1.8-4.3,6,6,0,0,1,1.8-4.2l1.6-1.6,8.8,8.9Z" />
                  <path d="M43.4,4.6a1.9,1.9,0,0,0-2.8,0L37.2,8a10,10,0,0,0-13,.9l-3,3a2,2,0,0,0-.6,1.4,1.7,1.7,0,0,0,.6,1.4L32.9,26.4a1.9,1.9,0,0,0,2.8,0l3-2.9a9.9,9.9,0,0,0,2.9-7.1A10.4,10.4,0,0,0,40,10.9l3.4-3.5A1.9,1.9,0,0,0,43.4,4.6Zm-7.5,16-1.6,1.6-8.9-8.9L27,11.8a5.9,5.9,0,0,1,8.5,0l.4.3a6.3,6.3,0,0,1,1.7,4.3A5.9,5.9,0,0,1,35.9,20.6Z" />
                </svg>
                {t('common.tabs.connections')}
              </Button>
              <Button
                variant={activeTab === "configuracion" ? "default" : "ghost"}
                onClick={() => setActiveTab("configuracion")}
                size="icon"
                className="h-8 w-8"
                aria-label={t('common.tabs.settings')}
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
              aria-label={isDark ? t('common.theme.switchToLight') : t('common.theme.switchToDark')}
            >
              <Sun
                className={`h-3.5 w-3.5 absolute transition-all duration-300 ${isDark ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"
                  }`}
              />
              <Moon
                className={`h-3.5 w-3.5 absolute transition-all duration-300 ${isDark ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0"
                  }`}
              />
            </Button>
          </div>

          <div className="absolute right-0">
            <div className="relative" ref={menuNotificacionesRef}>
              {mostrarMenuNotificaciones && (
                <div className="absolute bottom-full right-0 mb-2 w-64 bg-popover border border-border rounded-md shadow-md p-4 z-50 animate-in fade-in zoom-in-95 duration-200">
                  <div className="flex flex-col items-center justify-center py-4 text-muted-foreground">
                    <Bell className="h-8 w-8 mb-2 opacity-20" />
                    <p className="text-sm">{t('common.notifications.empty')}</p>
                  </div>
                </div>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setMostrarMenuNotificaciones(!mostrarMenuNotificaciones)}
              >
                <Bell className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </footer>

      {/* Wizard Nueva Conexión */}
      {
        mostrarWizardNuevaConexion && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setMostrarWizardNuevaConexion(false);
                limpiarWizardConexion();
              }
            }}
            tabIndex={-1}
          >
            <Card
              className="w-full max-w-2xl mx-4 bg-background border border-slate-200/80 dark:border-slate-700/80 shadow-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 slide-in-from-bottom-2 duration-300"
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  e.stopPropagation();
                  setMostrarWizardNuevaConexion(false);
                  limpiarWizardConexion();
                }
              }}
            >
              <CardHeader className="pb-5 border-b border-slate-200/60 dark:border-slate-700/60 bg-gradient-to-r from-slate-50/50 to-transparent dark:from-slate-800/30">
                <div className="mb-6">
                  <div className="flex-1">
                    <CardTitle className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
                      {editandoConexion ? t('connectionWizard.title.edit') : t('connectionWizard.title.new')}
                    </CardTitle>
                    <CardDescription className="text-sm mt-1.5 text-slate-600 dark:text-slate-400">
                      {editandoConexion
                        ? t('connectionWizard.description.edit')
                        : t('connectionWizard.description.new')}
                    </CardDescription>
                  </div>
                </div>

                {/* Indicador de progreso */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-200 ${pasoWizard >= 1 ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25" : "bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
                      }`}>
                      {pasoWizard > 1 ? <Check className="w-4 h-4" /> : "1"}
                    </div>
                    <span className={`text-sm font-medium transition-colors ${pasoWizard >= 1 ? "text-foreground" : "text-muted-foreground"}`}>
                      {t('connectionWizard.steps.provider')}
                    </span>
                  </div>
                  <div className={`flex-1 h-1 mx-3 rounded-full transition-all duration-300 ${pasoWizard >= 2 ? "bg-primary" : "bg-slate-200 dark:bg-slate-700"}`} />
                  <div className="flex items-center gap-2">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-200 ${pasoWizard >= 2 ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25" : "bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
                      }`}>
                      {pasoWizard > 2 ? <Check className="w-4 h-4" /> : "2"}
                    </div>
                    <span className={`text-sm font-medium transition-colors ${pasoWizard >= 2 ? "text-foreground" : "text-muted-foreground"}`}>
                      {t('connectionWizard.steps.authentication')}
                    </span>
                  </div>
                  <div className={`flex-1 h-1 mx-3 rounded-full transition-all duration-300 ${pasoWizard >= 3 ? "bg-primary" : "bg-slate-200 dark:bg-slate-700"}`} />
                  <div className="flex items-center gap-2">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-200 ${pasoWizard >= 3 ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25" : "bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
                      }`}>
                      3
                    </div>
                    <span className={`text-sm font-medium transition-colors ${pasoWizard >= 3 ? "text-foreground" : "text-muted-foreground"}`}>
                      {t('connectionWizard.steps.confirmation')}
                    </span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-6">

                {/* Contenido del paso actual */}
                {pasoWizard === 1 && !editandoConexion && (
                  <div className="space-y-6 min-h-[300px]">
                    <div>
                      <label className="text-sm font-semibold mb-2 block">
                        {t('connectionWizard.step1.title')} <span className="text-destructive">{t('connectionWizard.step1.required')}</span>
                      </label>
                      <p className="text-sm text-muted-foreground mb-4">
                        {t('connectionWizard.step1.description')}
                      </p>
                      <div className="grid grid-cols-3 gap-3 auto-rows-fr">
                        {/* GitHub */}
                        <button
                          onClick={() => setProveedorSeleccionado("github")}
                          className={`p-3 rounded-lg border transition-all hover:shadow-md ${proveedorSeleccionado === "github"
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                            }`}
                        >
                          <div className="flex flex-col items-center gap-2">
                            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                              <svg className="w-6 h-6 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                                <g transform="translate(-84, -7399)" fill="currentColor">
                                  <path d="M94,7399 C99.523,7399 104,7403.59 104,7409.253 C104,7413.782 101.138,7417.624 97.167,7418.981 C96.66,7419.082 96.48,7418.762 96.48,7418.489 C96.48,7418.151 96.492,7417.047 96.492,7415.675 C96.492,7414.719 96.172,7414.095 95.813,7413.777 C98.04,7413.523 100.38,7412.656 100.38,7408.718 C100.38,7407.598 99.992,7406.684 99.35,7405.966 C99.454,7405.707 99.797,7404.664 99.252,7403.252 C99.252,7403.252 98.414,7402.977 96.505,7404.303 C95.706,7404.076 94.85,7403.962 94,7403.958 C93.15,7403.962 92.295,7404.076 91.497,7404.303 C89.586,7402.977 88.746,7403.252 88.746,7403.252 C88.203,7404.664 88.546,7405.707 88.649,7405.966 C88.01,7406.684 87.619,7407.598 87.619,7408.718 C87.619,7412.646 89.954,7413.526 92.175,7413.785 C91.889,7414.041 91.63,7414.493 91.54,7415.156 C90.97,7415.418 89.522,7415.871 88.63,7414.304 C88.63,7414.304 88.101,7413.319 87.097,7413.247 C87.097,7413.247 86.122,7413.234 87.029,7413.87 C87.029,7413.87 87.684,7414.185 88.139,7415.37 C88.139,7415.37 88.726,7417.2 91.508,7416.58 C91.513,7417.437 91.522,7418.245 91.522,7418.489 C91.522,7418.76 91.338,7419.077 90.839,7418.982 C86.865,7417.627 84,7413.783 84,7409.253 C84,7403.59 88.478,7399 94,7399" />
                                </g>
                              </svg>
                            </div>
                            <div className="text-center">
                              <div className="font-semibold text-sm">{t('connectionWizard.step1.providers.github.name')}</div>
                              <div className="text-xs text-muted-foreground mt-0.5">
                                {t('connectionWizard.step1.providers.github.description')}
                              </div>
                            </div>
                          </div>
                        </button>

                        {/* GitLab */}
                        <button
                          onClick={() => setProveedorSeleccionado("gitlab")}
                          className={`p-3 rounded-lg border transition-all hover:shadow-md ${proveedorSeleccionado === "gitlab"
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                            }`}
                        >
                          <div className="flex flex-col items-center gap-2">
                            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                              <svg className="w-6 h-6 text-blue-500" viewBox="0 0 256 256" fill="currentColor">
                                <path d="M231.92773,169.78029l-94.82031,65.64454a16.07612,16.07612,0,0,1-18.21484,0L24.07227,169.78029a16.03981,16.03981,0,0,1-6.35254-17.27783L45.04883,50.0176a12.00012,12.00012,0,0,1,22.831-1.12109L88.544,104h78.9121l20.66407-55.10449a12.00021,12.00021,0,0,1,22.83056,1.12109l27.32959,102.48584A16.03981,16.03981,0,0,1,231.92773,169.78029Z" />
                              </svg>
                            </div>
                            <div className="text-center">
                              <div className="font-semibold text-sm">{t('connectionWizard.step1.providers.gitlab.name')}</div>
                              <div className="text-xs text-muted-foreground mt-0.5">
                                {t('connectionWizard.step1.providers.gitlab.description')}
                              </div>
                            </div>
                          </div>
                        </button>

                        {/* Gitea */}
                        <button
                          onClick={() => setProveedorSeleccionado("gitea")}
                          className={`p-3 rounded-lg border transition-all hover:shadow-md ${proveedorSeleccionado === "gitea"
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                            }`}
                        >
                          <div className="flex flex-col items-center gap-2">
                            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                              <svg className="w-6 h-6 text-blue-500" viewBox="0 0 32 32" fill="currentColor">
                                <path d="M5.583 7.229c-2.464-0.005-5.755 1.557-5.573 5.479 0.281 6.125 6.557 6.693 9.068 6.745 0.271 1.146 3.224 5.109 5.411 5.318h9.573c5.74-0.38 10.036-17.365 6.854-17.427-5.271 0.25-8.396 0.375-11.073 0.396v5.297l-0.839-0.365-0.005-4.932c-3.073 0-5.781-0.141-10.917-0.396-0.646-0.005-1.542-0.115-2.5-0.115zM5.927 9.396h0.297c0.349 3.141 0.917 4.974 2.068 7.781-2.938-0.349-5.432-1.198-5.891-4.38-0.24-1.646 0.563-3.365 3.526-3.401zM17.339 12.479c0.198 0.005 0.406 0.042 0.594 0.13l1 0.432-0.714 1.302c-0.109 0-0.219 0.016-0.323 0.052-0.464 0.151-0.708 0.604-0.542 1.021 0.036 0.083 0.089 0.161 0.151 0.229l-1.234 2.25c-0.099 0-0.203 0.016-0.297 0.052-0.464 0.146-0.708 0.604-0.542 1.016 0.172 0.417 0.682 0.63 1.151 0.479 0.464-0.146 0.703-0.604 0.536-1.021-0.047-0.109-0.115-0.208-0.208-0.292l1.203-2.188c0.13 0.010 0.26 0 0.391-0.042 0.104-0.031 0.198-0.083 0.281-0.151 0.464 0.198 0.844 0.354 1.12 0.49 0.406 0.203 0.552 0.339 0.599 0.49 0.042 0.146-0.005 0.427-0.24 0.922-0.172 0.37-0.458 0.896-0.797 1.51-0.115 0-0.229 0.016-0.333 0.052-0.469 0.151-0.708 0.604-0.542 1.021 0.167 0.411 0.682 0.625 1.146 0.479 0.469-0.151 0.708-0.604 0.542-1.021-0.042-0.099-0.104-0.193-0.182-0.271 0.333-0.609 0.62-1.135 0.807-1.526 0.25-0.536 0.38-0.938 0.266-1.323s-0.469-0.635-0.932-0.865c-0.307-0.151-0.693-0.313-1.146-0.505 0.005-0.109-0.010-0.214-0.052-0.318s-0.109-0.198-0.193-0.281l0.703-1.281 3.901 1.682c0.703 0.307 0.995 1.057 0.651 1.682l-2.682 4.906c-0.339 0.625-1.182 0.885-1.885 0.578l-5.516-2.38c-0.703-0.307-0.995-1.057-0.656-1.682l2.682-4.906c0.234-0.432 0.708-0.688 1.208-0.708h0.083z" />
                              </svg>
                            </div>
                            <div className="text-center">
                              <div className="font-semibold text-sm">{t('connectionWizard.step1.providers.gitea.name')}</div>
                              <div className="text-xs text-muted-foreground mt-0.5">
                                {t('connectionWizard.step1.providers.gitea.description')}
                              </div>
                            </div>
                          </div>
                        </button>

                        {/* Codeberg */}
                        <button
                          onClick={() => setProveedorSeleccionado("codeberg")}
                          className={`p-3 rounded-lg border transition-all hover:shadow-md ${proveedorSeleccionado === "codeberg"
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                            }`}
                        >
                          <div className="flex flex-col items-center gap-2">
                            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                              <svg className="w-6 h-6" viewBox="0 0 512 512" fill="none">
                                <defs>
                                  <linearGradient id="codeberg-gradient" x1="259.804" x2="383.132" y1="161.4" y2="407.835" gradientUnits="userSpaceOnUse">
                                    <stop offset="0" stopColor="#ffffff" stopOpacity="0" />
                                    <stop offset=".5" stopColor="#71c2ff" />
                                    <stop offset="1" stopColor="#39aaff" />
                                  </linearGradient>
                                </defs>
                                <path fill="url(#codeberg-gradient)" d="M259.804 161.4c-.44 0-1.1 0-1.32.44l-.44 1.1L332.04 440.21a192.039 192.039 0 0 0 86.77-74.437L261.125 162.06a1.762 1.762 0 0 0-1.321-.661z" opacity=".5" />
                                <path fill="#2185d0" d="M255.3 71.8a192 192 0 0 0-162 294l160.1-207c.5-.6 1.5-1 2.6-1s2 .4 2.6 1l160 207a192 192 0 0 0 29.4-102c0-106-86-192-192-192a192 192 0 0 0-.7 0z" />
                              </svg>
                            </div>
                            <div className="text-center">
                              <div className="font-semibold text-sm">{t('connectionWizard.step1.providers.codeberg.name')}</div>
                              <div className="text-xs text-muted-foreground mt-0.5">
                                {t('connectionWizard.step1.providers.codeberg.description')}
                              </div>
                            </div>
                          </div>
                        </button>

                        {/* Gogs */}
                        <button
                          onClick={() => setProveedorSeleccionado("gogs")}
                          className={`p-3 rounded-lg border transition-all hover:shadow-md ${proveedorSeleccionado === "gogs"
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                            }`}
                        >
                          <div className="flex flex-col items-center gap-2">
                            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                              <svg className="w-6 h-6 text-blue-500" viewBox="90 45 200 210" fill="currentColor">
                                <path d="M208.389148,50 C209.909305,50 211.24456,51.0089929 211.658889,52.4707979 L215.953018,67.6210199 C227.631425,71.3613512 238.209691,77.5582615 247.079072,85.6033302 L262.379671,81.7384823 C263.853487,81.3662037 265.395405,82.0174412 266.155483,83.3332172 L284.544632,115.166783 C285.30471,116.482559 285.098047,118.142789 284.03856,119.232316 L273.053677,130.528656 C274.302561,136.32145 274.960136,142.333975 274.960136,148.5 C274.960136,154.666025 274.302561,160.67855 273.053677,166.471344 L284.03856,177.767684 C285.098047,178.857211 285.30471,180.517441 284.544632,181.833217 L266.155483,213.666783 C265.395405,214.982559 263.853487,215.633796 262.379671,215.261518 L247.079079,211.396663 C238.209691,219.441738 227.631425,225.638649 215.953034,229.378975 L211.658889,244.529202 C211.24456,245.991007 209.909305,247 208.389148,247 L171.610852,247 C170.090695,247 168.75544,245.991007 168.341111,244.529202 L164.046982,229.37898 C152.368575,225.638649 141.790309,219.441738 132.920928,211.39667 L117.620329,215.261518 C116.146513,215.633796 114.604595,214.982559 113.844517,213.666783 L95.4553685,181.833217 C94.6952903,180.517441 94.9019532,178.857211 95.9614398,177.767684 L106.946323,166.471344 C105.697439,160.67855 105.039864,154.666025 105.039864,148.5 C105.039864,142.333975 105.697439,136.32145 106.946323,130.528656 L95.9614398,119.232316 C94.9019532,118.142789 94.6952903,116.482559 95.4553685,115.166783 L113.844517,83.3332172 C114.604595,82.0174412 116.146513,81.3662037 117.620329,81.7384823 L132.920921,85.6033365 C141.790309,77.5582615 152.368575,71.3613512 164.046966,67.6210251 L168.341111,52.4707979 C168.75544,51.0089929 170.090695,50 171.610852,50 L208.389148,50 Z M223.106971,96.1142102 C194.378503,79.4103856 157.643553,89.3231773 141.057164,118.25505 C124.470775,147.186923 134.313875,184.181965 163.042343,200.88579 C191.770812,217.589614 228.505762,207.676823 245.092151,178.74495 C246.961039,175.485021 245.851958,171.316565 242.614947,169.434444 L242.614947,169.434444 L211.47789,151.330174 C212.599522,143.920614 209.214466,136.241344 202.380444,132.267783 C193.478666,127.09195 182.096005,130.16352 176.95656,139.128325 C171.817116,148.093131 174.867091,159.556384 183.76887,164.732217 C190.602891,168.705777 198.899107,167.818442 204.710045,163.135423 L204.710045,163.135423 L229.562796,177.585758 C215.479857,195.550019 190.073911,200.862641 169.810189,189.080541 C147.555741,176.140959 139.930804,147.482828 152.779416,125.070814 C165.628027,102.658799 194.084678,94.9798762 216.339126,107.919459 C219.576136,109.80158 223.715285,108.684645 225.584174,105.424716 C227.453063,102.164787 226.343981,97.9963313 223.106971,96.1142102 Z" />
                              </svg>
                            </div>
                            <div className="text-center">
                              <div className="font-semibold text-sm">{t('connectionWizard.step1.providers.gogs.name')}</div>
                              <div className="text-xs text-muted-foreground mt-0.5">
                                {t('connectionWizard.step1.providers.gogs.description')}
                              </div>
                            </div>
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Paso 2: Autenticación */}
                {pasoWizard === 2 && (
                  <div className="space-y-6 min-h-[300px]">
                    {/* Nombre de la Conexión */}
                    <div className="space-y-3">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                        <span>{t('connectionWizard.step2.connectionName.label')}</span>
                        <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
                          {t('connectionWizard.step2.connectionName.required')}
                        </span>
                      </label>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        {t('connectionWizard.step2.connectionName.description')}
                      </p>
                      <div className="relative">
                        <input
                          type="text"
                          value={nombreConexion}
                          onChange={(e) => setNombreConexion(e.target.value)}
                          placeholder={t('connectionWizard.step2.connectionName.placeholder')}
                          maxLength={32}
                          className={cn(
                            "w-full px-4 py-3 pr-16 text-sm rounded-xl border transition-all duration-200",
                            "bg-slate-50 dark:bg-slate-800/50",
                            "focus:outline-none focus:ring-2 focus:ring-offset-2",
                            "border-slate-200 dark:border-slate-700 focus:ring-primary focus:border-primary"
                          )}
                        />
                        <span className={cn(
                          "absolute top-2.5 right-3 text-xs font-medium transition-colors pointer-events-none",
                          nombreConexion.length > 28
                            ? "text-amber-600 dark:text-amber-500"
                            : "text-slate-500 dark:text-slate-400"
                        )}>
                          {nombreConexion.length}/32
                        </span>
                      </div>
                    </div>

                    {/* Identidad Asociada */}
                    <div className="space-y-3">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        {t('connectionWizard.step2.identity.label')}
                      </label>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        {t('connectionWizard.step2.identity.description')}
                      </p>
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setMostrarMenuIdentidad(!mostrarMenuIdentidad)}
                          className={cn(
                            "w-full px-4 py-3 text-sm rounded-xl border transition-all duration-200 text-left flex items-center justify-between",
                            "bg-slate-50 dark:bg-slate-800/50",
                            "focus:outline-none focus:ring-2 focus:ring-offset-2",
                            "border-slate-200 dark:border-slate-700 focus:ring-primary focus:border-primary",
                            "hover:bg-slate-100 dark:hover:bg-slate-800"
                          )}
                        >
                          <span className={identidadSeleccionada ? "text-foreground" : "text-muted-foreground"}>
                            {identidadSeleccionada
                              ? gitIdentities.find(id => id.id === identidadSeleccionada)?.nombre || t('connectionWizard.step2.identity.select')
                              : t('connectionWizard.step2.identity.select')}
                          </span>
                          <ChevronRight className={`h-4 w-4 transition-transform flex-shrink-0 ${mostrarMenuIdentidad ? "rotate-90" : ""}`} />
                        </button>
                        {mostrarMenuIdentidad && (
                          <>
                            <div
                              className="fixed inset-0 z-10"
                              onClick={() => setMostrarMenuIdentidad(false)}
                            />
                            <div className="absolute z-20 w-full mt-1 rounded-md border bg-popover shadow-md overflow-auto max-h-60">
                              {gitIdentities.map((identidad) => (
                                <button
                                  key={identidad.id}
                                  onClick={() => {
                                    setIdentidadSeleccionada(identidad.id);
                                    setMostrarMenuIdentidad(false);
                                  }}
                                  className={`w-full px-3 py-2 text-sm text-left hover:bg-accent hover:text-accent-foreground transition-colors flex items-center gap-2 ${identidadSeleccionada === identidad.id ? "bg-accent text-accent-foreground" : ""
                                    }`}
                                >
                                  <Check className={`h-4 w-4 flex-shrink-0 ${identidadSeleccionada === identidad.id ? "opacity-100" : "opacity-0"}`} />
                                  <div className="flex-1 min-w-0">
                                    <div className="font-medium truncate flex items-center gap-2">
                                      {identidad.nombre}
                                      {identidad.id === IDENTIDAD_DEFAULT_ID && (
                                        <span className="px-0.5 py-0 text-[6px] font-semibold leading-none rounded bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                                          {t('connectionWizard.step2.identity.default')}
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-xs text-muted-foreground truncate">{identidad.email}</div>
                                  </div>
                                </button>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Token de Acceso */}
                    <div className="space-y-3">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                        <span>{t('connectionWizard.step2.token.label')}</span>
                        <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
                          {t('connectionWizard.step2.token.required')}
                        </span>
                      </label>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        {t('connectionWizard.step2.token.description')}
                      </p>
                      <div className="relative">
                        <input
                          type={mostrarToken ? "text" : "password"}
                          value={tokenAcceso}
                          onChange={(e) => setTokenAcceso(e.target.value)}
                          placeholder={t('connectionWizard.step2.token.placeholder')}
                          className={cn(
                            "w-full px-4 py-3 pr-10 text-sm rounded-xl border transition-all duration-200",
                            "bg-slate-50 dark:bg-slate-800/50",
                            "focus:outline-none focus:ring-2 focus:ring-offset-2",
                            "border-slate-200 dark:border-slate-700 focus:ring-primary focus:border-primary"
                          )}
                          autoComplete="off"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            setMostrarToken(!mostrarToken);
                          }}
                          onMouseDown={(e) => {
                            e.preventDefault();
                          }}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors pointer-events-auto"
                          tabIndex={-1}
                        >
                          {mostrarToken ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                      {validandoToken && (
                        <div className="flex items-center gap-2 p-3 rounded-md bg-blue-500/10 border border-blue-500/20 mt-2">
                          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                          <p className="text-xs text-blue-600 dark:text-blue-400">
                            {t('connectionWizard.step2.token.validating')}
                          </p>
                        </div>
                      )}
                      {errorValidacionToken && !validandoToken && (
                        <div className="flex items-start gap-2 p-3 rounded-md bg-amber-500/10 border border-amber-500/20 mt-2">
                          <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                          <p className="text-xs text-amber-700 dark:text-amber-300">
                            {errorValidacionToken}
                          </p>
                        </div>
                      )}
                      {tokenValidado && !validandoToken && (
                        <div className="flex items-center gap-2 p-3 rounded-md bg-green-500/10 border border-green-500/20 mt-2">
                          <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                          <p className="text-xs text-green-600 dark:text-green-400">
                            {t('connectionWizard.step2.token.valid')}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* URL del Servidor */}
                    <div className="space-y-3">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                        <span>{t('connectionWizard.step2.serverUrl.label')}</span>
                        <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
                          {t('connectionWizard.step2.serverUrl.optional')}
                        </span>
                      </label>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        {t('connectionWizard.step2.serverUrl.description')}
                      </p>
                      <input
                        type="text"
                        value={urlServidor}
                        onChange={(e) => setUrlServidor(e.target.value)}
                        placeholder={getUrlPorDefecto(proveedorSeleccionado) || "https://ejemplo.com"}
                        className={cn(
                          "w-full px-4 py-3 text-sm rounded-xl border transition-all duration-200",
                          "bg-slate-50 dark:bg-slate-800/50",
                          "focus:outline-none focus:ring-2 focus:ring-offset-2",
                          "border-slate-200 dark:border-slate-700 focus:ring-primary focus:border-primary"
                        )}
                      />
                    </div>
                  </div>
                )}

                {/* Paso 3: Confirmación */}
                {pasoWizard === 3 && (
                  <div className="space-y-6 min-h-[300px]">
                    <div>
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 block">
                        {t('connectionWizard.step3.title')}
                      </label>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                        {t('connectionWizard.step3.description')}
                      </p>
                      <Card className="bg-slate-50/50 dark:bg-slate-800/30 border border-slate-200/60 dark:border-slate-700/60 shadow-sm">
                        <CardContent className="p-4 space-y-2">
                          <div className="flex items-center justify-between py-2 border-b border-slate-200/60 dark:border-slate-700/60">
                            <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{t('connectionWizard.step3.fields.provider')}</span>
                            <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">{getNombreProveedor(proveedorSeleccionado)}</span>
                          </div>
                          <div className="flex items-center justify-between py-2 border-b border-slate-200/60 dark:border-slate-700/60">
                            <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{t('connectionWizard.step3.fields.name')}</span>
                            <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">{nombreConexion || "-"}</span>
                          </div>
                          <div className="flex items-center justify-between py-2 border-b border-slate-200/60 dark:border-slate-700/60">
                            <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{t('connectionWizard.step3.fields.url')}</span>
                            <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 break-all text-right max-w-[60%]">{urlServidor || "-"}</span>
                          </div>
                          <div className="flex items-center justify-between py-2 border-b border-slate-200/60 dark:border-slate-700/60">
                            <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{t('connectionWizard.step3.fields.authType')}</span>
                            <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">{t('connectionWizard.step3.fields.authTypeValue')}</span>
                          </div>
                          <div className="flex items-center justify-between py-2">
                            <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{t('connectionWizard.step3.fields.token')}</span>
                            <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 font-mono">
                              {ocultarToken(tokenAcceso)}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                )}

                {/* Botones de navegación */}
                <div className="flex items-center justify-between mt-8 pt-6 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setMostrarWizardNuevaConexion(false);
                      limpiarWizardConexion();
                    }}
                  >
                    {t('connectionWizard.actions.cancel')}
                  </Button>
                  <div className="flex gap-2">
                    {pasoWizard > 1 && (
                      <Button
                        variant="outline"
                        size="default"
                        className="min-w-[100px]"
                        onClick={() => {
                          setPasoWizard((prev) => (prev - 1) as 1 | 2 | 3);
                        }}
                      >
                        {t('connectionWizard.actions.previous')}
                      </Button>
                    )}
                    {pasoWizard === 3 ? (
                      <Button
                        size="default"
                        className="min-w-[120px] bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 flex items-center gap-2"
                        onClick={guardarConexion}
                      >
                        <Check className="w-4 h-4" />
                        {t('connectionWizard.actions.save')}
                      </Button>
                    ) : (
                      <Button
                        size="default"
                        className="min-w-[120px] bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 flex items-center gap-2"
                        disabled={
                          (pasoWizard === 1 && !editandoConexion && !proveedorSeleccionado) ||
                          (pasoWizard === 2 && (!nombreConexion.trim() || nombreConexion.length > 32 || !tokenAcceso.trim() || validandoToken))
                        }
                        onClick={async () => {
                          if (pasoWizard === 2) {
                            // Validar token antes de avanzar
                            await validarTokenYAvanzar();
                          } else if (pasoWizard < 3) {
                            setPasoWizard((prev) => (prev + 1) as 1 | 2 | 3);
                          }
                        }}
                      >
                        {validandoToken ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            {t('connectionWizard.actions.validating')}
                          </>
                        ) : (
                          <>
                            {t('connectionWizard.actions.next')}
                            <ChevronRight className="w-4 h-4" />
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )
      }

      {/* Wizard de Nuevo Repositorio */}
      {
        mostrarWizardNuevoRepositorio && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setMostrarWizardNuevoRepositorio(false);
                setPasoWizardRepositorio(1);
                setConexionSeleccionada(null);
                setRepositorioSeleccionado("");
                setRepositoriosDisponibles([]);
                setNombreRepositorio("");
                setDescripcionRepositorio("");
                setEditandoRepositorio(false);
                setRepositorioAEditar(null);
                setBusquedaRepositorio("");
              }
            }}
            tabIndex={-1}
          >
            <Card
              className="w-full max-w-2xl mx-4 bg-background border border-slate-200/80 dark:border-slate-700/80 shadow-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 slide-in-from-bottom-2 duration-300"
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  e.stopPropagation();
                  setMostrarWizardNuevoRepositorio(false);
                  setPasoWizardRepositorio(1);
                  setConexionSeleccionada(null);
                  setRepositorioSeleccionado("");
                  setRepositoriosDisponibles([]);
                  setNombreRepositorio("");
                  setDescripcionRepositorio("");
                  setEditandoRepositorio(false);
                  setRepositorioAEditar(null);
                  setBusquedaRepositorio("");
                }
              }}
            >
              <CardHeader className="pb-5 border-b border-slate-200/60 dark:border-slate-700/60 bg-gradient-to-r from-slate-50/50 to-transparent dark:from-slate-800/30">
                <div className="mb-6">
                  <div className="flex-1">
                    <CardTitle className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
                      {editandoRepositorio ? t('repositories.newRepositoryWizard.title.edit') : t('repositories.newRepositoryWizard.title.new')}
                    </CardTitle>
                    <CardDescription className="text-sm mt-1.5 text-slate-600 dark:text-slate-400">
                      {editandoRepositorio
                        ? t('repositories.newRepositoryWizard.description.edit')
                        : t('repositories.newRepositoryWizard.description.new')}
                    </CardDescription>
                  </div>
                </div>

                {/* Barra de progreso */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-200 ${pasoWizardRepositorio >= 1 ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25" : "bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
                      }`}>
                      {pasoWizardRepositorio > 1 ? <Check className="w-4 h-4" /> : "1"}
                    </div>
                    <span className={`text-sm font-medium transition-colors ${pasoWizardRepositorio >= 1 ? "text-foreground" : "text-muted-foreground"}`}>
                      {t('repositories.newRepositoryWizard.steps.connection')}
                    </span>
                  </div>
                  <div className={`flex-1 h-1 mx-3 rounded-full transition-all duration-300 ${pasoWizardRepositorio >= 2 ? "bg-primary" : "bg-slate-200 dark:bg-slate-700"}`} />
                  <div className="flex items-center gap-2">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-200 ${pasoWizardRepositorio >= 2 ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25" : "bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
                      }`}>
                      {pasoWizardRepositorio > 2 ? <Check className="w-4 h-4" /> : "2"}
                    </div>
                    <span className={`text-sm font-medium transition-colors ${pasoWizardRepositorio >= 2 ? "text-foreground" : "text-muted-foreground"}`}>
                      {t('repositories.newRepositoryWizard.steps.details')}
                    </span>
                  </div>
                  <div className={`flex-1 h-1 mx-3 rounded-full transition-all duration-300 ${pasoWizardRepositorio >= 3 ? "bg-primary" : "bg-slate-200 dark:bg-slate-700"}`} />
                  <div className="flex items-center gap-2">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-200 ${pasoWizardRepositorio >= 3 ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25" : "bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
                      }`}>
                      3
                    </div>
                    <span className={`text-sm font-medium transition-colors ${pasoWizardRepositorio >= 3 ? "text-foreground" : "text-muted-foreground"}`}>
                      {t('repositories.newRepositoryWizard.steps.confirmation')}
                    </span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-6">
                {/* Paso 1: Conexión */}
                {pasoWizardRepositorio === 1 && !editandoRepositorio && (
                  <div className="space-y-6 min-h-[300px]">
                    {/* Seleccionar Conexión */}
                    <div className="space-y-3">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                        <span>{t('repositories.newRepositoryWizard.step1.connection.label')}</span>
                        <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
                          {t('repositories.newRepositoryWizard.step1.connection.required')}
                        </span>
                      </label>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        {t('repositories.newRepositoryWizard.step1.connection.description')}
                      </p>
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setMostrarMenuConexion(!mostrarMenuConexion)}
                          className={cn(
                            "w-full px-4 py-3 text-sm rounded-xl border transition-all duration-200 text-left flex items-center justify-between",
                            "bg-slate-50 dark:bg-slate-800/50",
                            "focus:outline-none focus:ring-2 focus:ring-offset-2",
                            "border-slate-200 dark:border-slate-700 focus:ring-primary focus:border-primary",
                            "hover:bg-slate-100 dark:hover:bg-slate-800"
                          )}
                        >
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            {conexionSeleccionada && (
                              <div className="flex-shrink-0">
                                {getIconoProveedor(conexionSeleccionada.tipo)}
                              </div>
                            )}
                            <span className={conexionSeleccionada ? "text-foreground truncate" : "text-muted-foreground"}>
                              {conexionSeleccionada ? conexionSeleccionada.nombre : t('repositories.newRepositoryWizard.step1.connection.placeholder')}
                            </span>
                          </div>
                          <ChevronRight className={`h-4 w-4 transition-transform flex-shrink-0 ${mostrarMenuConexion ? "rotate-90" : ""}`} />
                        </button>
                        {mostrarMenuConexion && (
                          <>
                            <div
                              className="fixed inset-0 z-10"
                              onClick={() => setMostrarMenuConexion(false)}
                            />
                            <div className="absolute z-20 w-full mt-1 rounded-md border bg-popover shadow-md max-h-60 overflow-auto">
                              {conexionesGuardadas.length === 0 ? (
                                <div className="p-3 text-sm text-muted-foreground text-center">
                                  {t('repositories.newRepositoryWizard.step1.connection.noConnections')}
                                </div>
                              ) : (
                                [...conexionesGuardadas]
                                  .sort((a, b) => a.nombre.localeCompare(b.nombre))
                                  .map((conexion) => (
                                    <button
                                      key={conexion.id}
                                      onClick={() => {
                                        setConexionSeleccionada(conexion);
                                        setMostrarMenuConexion(false);
                                        cargarRepositorios(conexion);
                                      }}
                                      className="w-full px-3 py-2 text-sm text-left hover:bg-accent hover:text-accent-foreground transition-colors flex items-center gap-2"
                                    >
                                      <div className="flex-shrink-0">
                                        {getIconoProveedor(conexion.tipo)}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div className="font-medium">{conexion.nombre}</div>
                                        <div className="text-[10px] text-muted-foreground">{conexion.tipo}</div>
                                      </div>
                                    </button>
                                  ))
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Seleccionar Repositorio */}
                    <div className="space-y-3">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                        <span>{t('repositories.newRepositoryWizard.step1.repository.label')}</span>
                        <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
                          {t('repositories.newRepositoryWizard.step1.repository.required')}
                        </span>
                      </label>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        {t('repositories.newRepositoryWizard.step1.repository.description')}
                      </p>
                      <div className="relative">
                        <button
                          ref={repositorioButtonRef}
                          type="button"
                          onClick={() => {
                            if (conexionSeleccionada) {
                              if (repositorioButtonRef.current) {
                                const rect = repositorioButtonRef.current.getBoundingClientRect();
                                setRepositorioDropdownPosition({
                                  top: rect.bottom,
                                  left: rect.left,
                                  width: rect.width
                                });
                              }
                              setMostrarMenuRepositorio(!mostrarMenuRepositorio);
                            }
                          }}
                          disabled={!conexionSeleccionada || cargandoRepositorios}
                          className={cn(
                            "w-full px-4 py-3 text-sm rounded-xl border transition-all duration-200 text-left flex items-center justify-between",
                            "bg-slate-50 dark:bg-slate-800/50",
                            "focus:outline-none focus:ring-2 focus:ring-offset-2",
                            "border-slate-200 dark:border-slate-700 focus:ring-primary focus:border-primary",
                            "hover:bg-slate-100 dark:hover:bg-slate-800",
                            "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-slate-50 dark:disabled:hover:bg-slate-800/50"
                          )}
                        >
                          <span className={`flex items-center gap-2 ${repositorioSeleccionado ? "text-foreground" : "text-muted-foreground"}`}>
                            {cargandoRepositorios ? (
                              <>
                                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                                <span>{t('repositories.newRepositoryWizard.step1.repository.loading')}</span>
                              </>
                            ) : !conexionSeleccionada
                              ? t('repositories.newRepositoryWizard.step1.repository.selectConnectionFirst')
                              : repositorioSeleccionado
                                ? repositoriosDisponibles.find(r => r.id === repositorioSeleccionado)?.full_name || repositorioSeleccionado
                                : t('repositories.newRepositoryWizard.step1.repository.placeholder')}
                          </span>
                          <ChevronRight className={`h-4 w-4 transition-transform ${mostrarMenuRepositorio ? "rotate-90" : ""}`} />
                        </button>
                        {mostrarMenuRepositorio && conexionSeleccionada && (
                          <>
                            <div
                              className="fixed inset-0 z-[60]"
                              onClick={() => {
                                setMostrarMenuRepositorio(false);
                                setBusquedaRepositorio("");
                              }}
                            />
                            <div
                              className="fixed z-[70] rounded-md border bg-popover shadow-lg max-h-[50vh] flex flex-col"
                              style={{
                                top: `${repositorioDropdownPosition.top}px`,
                                left: `${repositorioDropdownPosition.left}px`,
                                width: `${repositorioDropdownPosition.width}px`,
                                maxWidth: 'calc(100vw - 2rem)'
                              }}
                            >
                              {/* Input de búsqueda */}
                              <div className="p-2 border-b">
                                <div className="relative">
                                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                                  <input
                                    type="text"
                                    value={busquedaRepositorio}
                                    onChange={(e) => setBusquedaRepositorio(e.target.value)}
                                    placeholder={t('repositories.newRepositoryWizard.step1.repository.searchPlaceholder')}
                                    className="w-full pl-7 pr-2 py-1.5 text-xs rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
                                    onClick={(e) => e.stopPropagation()}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Escape') {
                                        setMostrarMenuRepositorio(false);
                                        setBusquedaRepositorio("");
                                      }
                                    }}
                                  />
                                  {busquedaRepositorio && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setBusquedaRepositorio("");
                                      }}
                                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    >
                                      <X className="h-3.5 w-3.5" />
                                    </button>
                                  )}
                                </div>
                              </div>

                              {/* Lista de repositorios */}
                              <div className="overflow-auto max-h-[240px]">
                                {cargandoRepositorios ? (
                                  <div className="p-6 flex flex-col items-center justify-center gap-2">
                                    <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                                    <p className="text-xs text-muted-foreground">{t('repositories.newRepositoryWizard.step1.repository.loading')}</p>
                                  </div>
                                ) : (() => {
                                  // Filtrar repositorios basado en la búsqueda
                                  const repositoriosFiltrados = repositoriosDisponibles.filter((repo) => {
                                    const busqueda = busquedaRepositorio.toLowerCase();
                                    return (
                                      repo.name.toLowerCase().includes(busqueda) ||
                                      repo.full_name.toLowerCase().includes(busqueda) ||
                                      (repo.description && repo.description.toLowerCase().includes(busqueda))
                                    );
                                  });

                                  if (repositoriosFiltrados.length === 0) {
                                    return (
                                      <div className="p-3 text-sm text-muted-foreground text-center">
                                        {busquedaRepositorio ? t('repositories.newRepositoryWizard.step1.repository.noResults') : t('repositories.newRepositoryWizard.step1.repository.noRepositories')}
                                      </div>
                                    );
                                  }

                                  return [...repositoriosFiltrados]
                                    .sort((a, b) => a.name.localeCompare(b.name))
                                    .map((repo) => (
                                      <button
                                        key={repo.id}
                                        onClick={() => {
                                          setRepositorioSeleccionado(repo.id);
                                          setMostrarMenuRepositorio(false);
                                          setNombreRepositorio(repo.name);
                                          setBusquedaRepositorio("");
                                        }}
                                        className="w-full px-3 py-2 text-sm text-left hover:bg-accent hover:text-accent-foreground transition-colors"
                                      >
                                        <div className="flex items-start gap-2">
                                          <div className="flex-shrink-0 mt-0.5">
                                            <GitBranch className="h-4 w-4 text-primary" />
                                          </div>
                                          <div className="flex-1 min-w-0">
                                            <div className="font-medium truncate">{repo.name}</div>
                                            <div className="text-[10px] text-muted-foreground truncate">{repo.full_name}</div>
                                          </div>
                                          {repo.private && (
                                            <div className="flex-shrink-0">
                                              <svg className="h-3 w-3 text-muted-foreground" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                              </svg>
                                            </div>
                                          )}
                                        </div>
                                      </button>
                                    ));
                                })()}
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Paso 2: Detalles */}
                {pasoWizardRepositorio === 2 && (
                  <div className="space-y-6 min-h-[300px]">
                    {/* Nombre del Repositorio */}
                    <div className="space-y-3">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                        <span>{t('repositories.newRepositoryWizard.step2.name.label')}</span>
                        <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
                          {t('repositories.newRepositoryWizard.step2.name.required')}
                        </span>
                      </label>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        {t('repositories.newRepositoryWizard.step2.name.description')}
                      </p>
                      <div className="relative">
                        <input
                          type="text"
                          value={nombreRepositorio}
                          onChange={(e) => setNombreRepositorio(e.target.value)}
                          placeholder={t('repositories.newRepositoryWizard.step2.name.placeholder')}
                          maxLength={32}
                          className={cn(
                            "w-full px-4 py-3 pr-16 text-sm rounded-xl border transition-all duration-200",
                            "bg-slate-50 dark:bg-slate-800/50",
                            "focus:outline-none focus:ring-2 focus:ring-offset-2",
                            "border-slate-200 dark:border-slate-700 focus:ring-primary focus:border-primary"
                          )}
                        />
                        <span className={cn(
                          "absolute top-2.5 right-3 text-xs font-medium transition-colors pointer-events-none",
                          nombreRepositorio.length > 28
                            ? "text-amber-600 dark:text-amber-500"
                            : "text-slate-500 dark:text-slate-400"
                        )}>
                          {nombreRepositorio.length}/32
                        </span>
                      </div>
                    </div>

                    {/* Descripción */}
                    <div className="space-y-3">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                        <span>{t('repositories.newRepositoryWizard.step2.description.label')}</span>
                        <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
                          {t('repositories.newRepositoryWizard.step2.description.optional')}
                        </span>
                      </label>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        {t('repositories.newRepositoryWizard.step2.description.description')}
                      </p>
                      <div className="relative">
                        <textarea
                          value={descripcionRepositorio}
                          onChange={(e) => setDescripcionRepositorio(e.target.value)}
                          placeholder={t('repositories.newRepositoryWizard.step2.description.placeholder')}
                          rows={2}
                          maxLength={150}
                          className={cn(
                            "w-full px-4 py-3 pb-8 text-sm rounded-xl border transition-all duration-200",
                            "bg-slate-50 dark:bg-slate-800/50",
                            "focus:outline-none focus:ring-2 focus:ring-offset-2",
                            "border-slate-200 dark:border-slate-700 focus:ring-primary focus:border-primary",
                            "resize-none"
                          )}
                        />
                        <span className={cn(
                          "absolute bottom-4 right-3 text-xs font-medium transition-colors pointer-events-none",
                          descripcionRepositorio.length > 130
                            ? "text-amber-600 dark:text-amber-500"
                            : "text-slate-500 dark:text-slate-400"
                        )}>
                          {descripcionRepositorio.length}/150
                        </span>
                      </div>
                    </div>

                    {/* Color de la tarjeta */}
                    <div className="space-y-3">

                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setMostrarColorPickerRepositorio(!mostrarColorPickerRepositorio)}
                          className={cn(
                            "w-full px-4 py-3 text-sm rounded-xl border transition-all duration-200 flex items-center justify-between",
                            "bg-slate-50 dark:bg-slate-800/50",
                            "focus:outline-none focus:ring-2 focus:ring-offset-2 border-slate-200 dark:border-slate-700 focus:ring-primary focus:border-primary"
                          )}
                        >
                          <div className="flex items-center gap-2">
                            {colorRepositorio ? (
                              <div
                                className="w-5 h-5 rounded-full border border-slate-200 dark:border-slate-700"
                                style={{ backgroundColor: colorRepositorio }}
                              />
                            ) : (
                              <div className="w-5 h-5 rounded-full border border-dashed border-slate-400 bg-transparent" />
                            )}
                            <span>
                              {t(COLLECTION_COLORS.find(c => c.value === colorRepositorio)?.name || 'repositories.colors.default')}
                            </span>
                          </div>
                          <ChevronDown className="w-4 h-4 text-slate-500" />
                        </button>

                        {mostrarColorPickerRepositorio && (
                          <div className="absolute bottom-full left-0 right-0 mb-2 p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xl z-50 max-h-60 overflow-y-auto">
                            <div className="grid grid-cols-1 gap-1">
                              {COLLECTION_COLORS.map((color) => (
                                <button
                                  key={color.name}
                                  onClick={() => {
                                    setColorRepositorio(color.value);
                                    setMostrarColorPickerRepositorio(false);
                                  }}
                                  className={cn(
                                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors w-full text-left",
                                    colorRepositorio === color.value
                                      ? "bg-primary/10 text-primary"
                                      : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                                  )}
                                >
                                  {color.value ? (
                                    <div
                                      className="w-4 h-4 rounded-full border border-slate-200 dark:border-slate-700"
                                      style={{ backgroundColor: color.value }}
                                    />
                                  ) : (
                                    <div className="w-4 h-4 rounded-full border border-dashed border-slate-400 bg-transparent" />
                                  )}
                                  {t(color.name)}
                                  {colorRepositorio === color.value && (
                                    <Check className="w-4 h-4 ml-auto" />
                                  )}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Paso 3: Confirmación */}
                {pasoWizardRepositorio === 3 && (
                  <div className="space-y-6 min-h-[300px]">
                    <div>
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 block">
                        {editandoRepositorio ? t('repositories.newRepositoryWizard.step3.title.edit') : t('repositories.newRepositoryWizard.step3.title.new')}
                      </label>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                        {editandoRepositorio ? t('repositories.newRepositoryWizard.step3.description.edit') : t('repositories.newRepositoryWizard.step3.description.new')}
                      </p>
                      <Card className="bg-slate-50/50 dark:bg-slate-800/30 border border-slate-200/60 dark:border-slate-700/60 shadow-sm">
                        <CardContent className="p-4 space-y-2">
                          <div className="flex items-center justify-between py-2 border-b border-slate-200/60 dark:border-slate-700/60">
                            <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{t('repositories.newRepositoryWizard.step3.fields.connection')}</span>
                            <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">{conexionSeleccionada?.nombre || "-"}</span>
                          </div>
                          {conexionSeleccionada && (
                            <>
                              <div className="flex items-center justify-between py-2 border-b border-slate-200/60 dark:border-slate-700/60">
                                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{t('repositories.newRepositoryWizard.step3.fields.provider')}</span>
                                <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">{conexionSeleccionada.tipo || "-"}</span>
                              </div>
                              <div className="flex items-center justify-between py-2 border-b border-slate-200/60 dark:border-slate-700/60">
                                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{t('repositories.newRepositoryWizard.step3.fields.url')}</span>
                                <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 break-all text-right max-w-[60%]">{conexionSeleccionada.host || "-"}</span>
                              </div>
                            </>
                          )}
                          <div className="flex items-center justify-between py-2 border-b border-slate-200/60 dark:border-slate-700/60">
                            <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{t('repositories.newRepositoryWizard.step3.fields.repository')}</span>
                            <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 break-all text-right max-w-[60%]">
                              {repositoriosDisponibles.find(r => r.id === repositorioSeleccionado)?.full_name || repositorioAEditar?.nombre || "-"}
                            </span>
                          </div>
                          <div className="flex items-center justify-between py-2 border-b border-slate-200/60 dark:border-slate-700/60">
                            <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{t('repositories.newRepositoryWizard.step3.fields.name')}</span>
                            <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">{nombreRepositorio || "-"}</span>
                          </div>
                          {descripcionRepositorio && (
                            <div className="flex items-start justify-between py-2">
                              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{t('repositories.newRepositoryWizard.step3.fields.description')}</span>
                              <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 text-right max-w-[60%] break-words">
                                {descripcionRepositorio}
                              </span>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                )}

                {/* Botones de navegación */}
                <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-200/60 dark:border-slate-700/60">
                  <Button
                    variant="outline"
                    size="default"
                    className="min-w-[100px]"
                    onClick={() => {
                      if (pasoWizardRepositorio === 1 || (pasoWizardRepositorio === 2 && editandoRepositorio)) {
                        setMostrarWizardNuevoRepositorio(false);
                        setPasoWizardRepositorio(1);
                        setConexionSeleccionada(null);
                        setRepositorioSeleccionado("");
                        setRepositoriosDisponibles([]);
                        setNombreRepositorio("");
                        setDescripcionRepositorio("");
                        setBusquedaRepositorio("");
                        setEditandoRepositorio(false);
                        setRepositorioAEditar(null);
                      } else {
                        setPasoWizardRepositorio((prev) => (prev - 1) as 1 | 2 | 3);
                      }
                    }}
                  >
                    {(pasoWizardRepositorio === 1 || (pasoWizardRepositorio === 2 && editandoRepositorio)) ? t('repositories.newRepositoryWizard.buttons.cancel') : t('repositories.newRepositoryWizard.buttons.previous')}
                  </Button>
                  {pasoWizardRepositorio === 3 ? (
                    <Button
                      size="default"
                      className="min-w-[120px] bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 flex items-center gap-2"
                      onClick={guardarRepositorio}
                      disabled={!nombreRepositorio.trim()}
                    >
                      <Check className="w-4 h-4" />
                      {t('repositories.newRepositoryWizard.buttons.save')}
                    </Button>
                  ) : (
                    <Button
                      size="default"
                      className="min-w-[120px] bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 flex items-center gap-2"
                      onClick={() => {
                        if (pasoWizardRepositorio === 1) {
                          if (!conexionSeleccionada) {
                            alert(t('repositories.newRepositoryWizard.errors.selectConnection'));
                            return;
                          }
                          if (!repositorioSeleccionado) {
                            alert(t('repositories.newRepositoryWizard.errors.selectRepository'));
                            return;
                          }
                        } else if (pasoWizardRepositorio === 2) {
                          if (!nombreRepositorio.trim()) {
                            alert(t('repositories.newRepositoryWizard.errors.enterName'));
                            return;
                          }
                          // Si estamos editando, ir al paso 3 (Confirmación)
                          // Si no, también ir al paso 3
                          setPasoWizardRepositorio(3);
                          return;
                        }
                        setPasoWizardRepositorio((prev) => (prev + 1) as 1 | 2 | 3);
                      }}
                      disabled={
                        (pasoWizardRepositorio === 1 && (!conexionSeleccionada || !repositorioSeleccionado)) ||
                        (pasoWizardRepositorio === 2 && !nombreRepositorio.trim())
                      }
                    >
                      {t('repositories.newRepositoryWizard.buttons.next')}
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )
      }

      {/* Modal Restablecer Configuración */}
      {
        mostrarModalRestablecerConfig && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"

            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setMostrarModalRestablecerConfig(false);
              }
            }}
            tabIndex={-1}
          >
            <Card
              className="w-full max-w-2xl mx-4 bg-background border border-slate-200/80 dark:border-slate-700/80 shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-2 duration-300"
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  e.stopPropagation();
                  setMostrarModalRestablecerConfig(false);
                }
              }}
            >
              <CardHeader className="pb-5 border-b border-slate-200/60 dark:border-slate-700/60 bg-gradient-to-r from-slate-50/50 to-transparent dark:from-slate-800/30">
                <div className="flex-1">
                  <CardTitle className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
                    {t('settings.data.reset.modal.title')}
                  </CardTitle>
                  <CardDescription className="text-sm mt-1.5 text-slate-600 dark:text-slate-400">
                    {t('settings.data.reset.modal.description')}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="bg-amber-50/80 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/40 rounded-xl p-4">
                  <p className="text-sm text-amber-800 dark:text-amber-300 font-medium flex items-start gap-2.5">
                    <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                    <span>
                      {t('settings.data.reset.modal.warningMessage')}
                    </span>
                  </p>
                </div>
                <div className="flex gap-3 pt-2 justify-end border-t border-slate-200/60 dark:border-slate-700/60">
                  <Button
                    variant="outline"
                    size="default"
                    className="min-w-[100px]"
                    onClick={() => {
                      setMostrarModalRestablecerConfig(false);
                    }}
                  >
                    {t('common.cancel')}
                  </Button>
                  <Button
                    size="default"
                    variant="destructive"
                    className="min-w-[180px] bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/25"
                    onClick={confirmarRestablecerConfig}
                  >
                    {t('settings.data.reset.modal.confirm')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )
      }

      {/* Modal para crear nueva colección */}
      {mostrarModalNuevaCarpeta && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"

          onKeyDown={(e) => {
            if (e.key === 'Escape' && !creandoColeccion) {
              setMostrarModalNuevaCarpeta(false);
              setNombreNuevaCarpeta("");
              setDescripcionNuevaCarpeta("");
              setErrorNombre(null);
              setErrorDescripcion(null);
            }
          }}
          tabIndex={-1}
        >
          <Card
            className="w-full max-w-2xl mx-4 bg-background border border-slate-200/80 dark:border-slate-700/80 shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-2 duration-300"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              if (e.key === 'Escape' && !creandoColeccion) {
                e.stopPropagation();
                setMostrarModalNuevaCarpeta(false);
                setNombreNuevaCarpeta("");
                setDescripcionNuevaCarpeta("");
                setColorNuevaCarpeta("");
                setErrorNombre(null);
                setErrorDescripcion(null);
              }
            }}
          >
            <CardHeader className="pb-5 border-b border-slate-200/60 dark:border-slate-700/60 bg-gradient-to-r from-slate-50/50 to-transparent dark:from-slate-800/30">
              <div className="flex-1">
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
                  {t('repositories.newCollectionModal.title')}
                </CardTitle>
                <CardDescription className="text-sm mt-1.5 text-slate-600 dark:text-slate-400">
                  {t('repositories.newCollectionModal.description')}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-3">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <span>{t('repositories.newCollectionModal.name.label')}</span>
                  <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
                    {t('repositories.newCollectionModal.name.required')}
                  </span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={nombreNuevaCarpeta}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value.length <= 32) {
                        setNombreNuevaCarpeta(value);
                        setErrorNombre(null);
                      }
                    }}
                    onBlur={() => {
                      const nombreTrimmed = nombreNuevaCarpeta.trim();
                      if (!nombreTrimmed) {
                        setErrorNombre(t('repositories.newCollectionModal.name.errors.required'));
                      } else if (nombreTrimmed.length > 32) {
                        setErrorNombre(t('repositories.newCollectionModal.name.errors.maxLength'));
                      } else {
                        const carpetaActual = obtenerCarpetaActual();
                        if (carpetaActual) {
                          const nombresExistentes = carpetaActual.hijos?.map((h) => h.nombre.toLowerCase()) || [];
                          if (nombresExistentes.includes(nombreTrimmed.toLowerCase())) {
                            setErrorNombre(t('repositories.newCollectionModal.name.errors.duplicate'));
                          } else {
                            setErrorNombre(null);
                          }
                        }
                      }
                    }}
                    className={cn(
                      "w-full px-4 py-3 pr-16 text-sm rounded-xl border transition-all duration-200",
                      "bg-slate-50 dark:bg-slate-800/50",
                      "focus:outline-none focus:ring-2 focus:ring-offset-2",
                      errorNombre
                        ? "border-red-300 dark:border-red-700/50 focus:ring-red-500 focus:border-red-500"
                        : "border-slate-200 dark:border-slate-700 focus:ring-primary focus:border-primary",
                      creandoColeccion && "opacity-60 cursor-not-allowed"
                    )}
                    placeholder={t('repositories.newCollectionModal.name.placeholder')}
                    autoFocus
                    maxLength={32}
                    disabled={creandoColeccion}
                  />
                  <span className={cn(
                    "absolute top-2.5 right-3 text-xs font-medium transition-colors pointer-events-none",
                    nombreNuevaCarpeta.length > 28
                      ? "text-amber-600 dark:text-amber-500"
                      : "text-slate-500 dark:text-slate-400"
                  )}>
                    {nombreNuevaCarpeta.length}/32
                  </span>
                  {errorNombre && (
                    <div className="flex items-center gap-1.5 mt-2 text-sm text-red-600 dark:text-red-400 animate-in slide-in-from-top-1">
                      <AlertCircle className="w-4 h-4" />
                      <span>{errorNombre}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <span>{t('repositories.newCollectionModal.descriptionField.label')}</span>
                  <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
                    {t('repositories.newCollectionModal.descriptionField.optional')}
                  </span>
                </label>
                <div className="relative">
                  <textarea
                    value={descripcionNuevaCarpeta}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value.length <= 150) {
                        setDescripcionNuevaCarpeta(value);
                        setErrorDescripcion(null);
                      }
                    }}
                    onBlur={() => {
                      if (descripcionNuevaCarpeta.trim().length > 150) {
                        setErrorDescripcion(t('repositories.newCollectionModal.descriptionField.errors.maxLength'));
                      } else {
                        setErrorDescripcion(null);
                      }
                    }}
                    className={cn(
                      "w-full px-4 py-3 pb-8 text-sm rounded-xl border transition-all duration-200",
                      "bg-slate-50 dark:bg-slate-800/50",
                      "focus:outline-none focus:ring-2 focus:ring-offset-2",
                      errorDescripcion
                        ? "border-red-300 dark:border-red-700/50 focus:ring-red-500 focus:border-red-500"
                        : "border-slate-200 dark:border-slate-700 focus:ring-primary focus:border-primary",
                      "min-h-[110px] resize-none",
                      creandoColeccion && "opacity-60 cursor-not-allowed"
                    )}
                    placeholder={t('repositories.newCollectionModal.descriptionField.placeholder')}
                    maxLength={150}
                    disabled={creandoColeccion}
                  />
                  <span className={cn(
                    "absolute bottom-4 right-3 text-xs font-medium transition-colors pointer-events-none",
                    descripcionNuevaCarpeta.length > 130
                      ? "text-amber-600 dark:text-amber-500"
                      : "text-slate-500 dark:text-slate-400"
                  )}>
                    {descripcionNuevaCarpeta.length}/150
                  </span>
                  {errorDescripcion && (
                    <div className="flex items-center gap-1.5 mt-2 text-sm text-red-600 dark:text-red-400 animate-in slide-in-from-top-1">
                      <AlertCircle className="w-4 h-4" />
                      <span>{errorDescripcion}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3">

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setMostrarColorPickerNuevaCarpeta(!mostrarColorPickerNuevaCarpeta)}
                    className={cn(
                      "w-full px-4 py-3 text-sm rounded-xl border transition-all duration-200 flex items-center justify-between",
                      "bg-slate-50 dark:bg-slate-800/50",
                      "focus:outline-none focus:ring-2 focus:ring-offset-2 border-slate-200 dark:border-slate-700 focus:ring-primary focus:border-primary"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      {colorNuevaCarpeta ? (
                        <div
                          className="w-5 h-5 rounded-full border border-slate-200 dark:border-slate-700"
                          style={{ backgroundColor: colorNuevaCarpeta }}
                        />
                      ) : (
                        <div className="w-5 h-5 rounded-full border border-dashed border-slate-400 bg-transparent" />
                      )}
                      <span>
                        {t(COLLECTION_COLORS.find(c => c.value === colorNuevaCarpeta)?.name || 'repositories.colors.default')}
                      </span>
                    </div>
                    <ChevronDown className="w-4 h-4 text-slate-500" />
                  </button>

                  {mostrarColorPickerNuevaCarpeta && (
                    <div className="absolute top-full left-0 right-0 mt-2 p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xl z-50 max-h-60 overflow-y-auto">
                      <div className="grid grid-cols-1 gap-1">
                        {COLLECTION_COLORS.map((color) => (
                          <button
                            key={color.name}
                            onClick={() => {
                              setColorNuevaCarpeta(color.value);
                              setMostrarColorPickerNuevaCarpeta(false);
                            }}
                            className={cn(
                              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors w-full text-left",
                              colorNuevaCarpeta === color.value
                                ? "bg-primary/10 text-primary"
                                : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                            )}
                          >
                            {color.value ? (
                              <div
                                className="w-4 h-4 rounded-full border border-slate-200 dark:border-slate-700"
                                style={{ backgroundColor: color.value }}
                              />
                            ) : (
                              <div className="w-4 h-4 rounded-full border border-dashed border-slate-400 bg-transparent" />
                            )}
                            {t(color.name)}
                            {colorNuevaCarpeta === color.value && (
                              <Check className="w-4 h-4 ml-auto" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-3 pt-2 justify-end border-t border-slate-200/60 dark:border-slate-700/60">
                <Button
                  variant="outline"
                  size="default"
                  className="min-w-[100px]"
                  onClick={() => {
                    if (!creandoColeccion) {
                      setMostrarModalNuevaCarpeta(false);
                      setNombreNuevaCarpeta("");
                      setDescripcionNuevaCarpeta("");
                      setColorNuevaCarpeta("");
                      setErrorNombre(null);
                      setErrorDescripcion(null);
                    }
                  }}
                  disabled={creandoColeccion}
                >
                  {t('repositories.newCollectionModal.buttons.cancel')}
                </Button>
                <Button
                  size="default"
                  className="min-w-[120px] bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={crearNuevaCarpeta}
                  disabled={creandoColeccion || !nombreNuevaCarpeta.trim() || !!errorNombre}
                >
                  {creandoColeccion ? (
                    <span className="flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      {t('repositories.newCollectionModal.buttons.creating')}
                    </span>
                  ) : (
                    t('repositories.newCollectionModal.buttons.create')
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal para editar colección */}
      {mostrarModalEditarColeccion && coleccionAEditar && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"

          onKeyDown={(e) => {
            if (e.key === 'Escape' && !editandoColeccion) {
              setMostrarModalEditarColeccion(false);
              setColeccionAEditar(null);
              setNombreEditarColeccion("");
              setDescripcionEditarColeccion("");
              setErrorNombreEditar(null);
              setErrorDescripcionEditar(null);
            }
          }}
          tabIndex={-1}
        >
          <Card
            className="w-full max-w-2xl mx-4 bg-background border border-slate-200/80 dark:border-slate-700/80 shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-2 duration-300"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              if (e.key === 'Escape' && !editandoColeccion) {
                e.stopPropagation();
                setMostrarModalEditarColeccion(false);
                setColeccionAEditar(null);
                setNombreEditarColeccion("");
                setDescripcionEditarColeccion("");
                setErrorNombreEditar(null);
                setErrorDescripcionEditar(null);
              }
            }}
          >
            <CardHeader className="pb-5 border-b border-slate-200/60 dark:border-slate-700/60 bg-gradient-to-r from-slate-50/50 to-transparent dark:from-slate-800/30">
              <div className="flex-1">
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
                  {t('repositories.editCollectionModal.title')}
                </CardTitle>
                <CardDescription className="text-sm mt-1.5 text-slate-600 dark:text-slate-400">
                  {t('repositories.editCollectionModal.description')}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-3">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <span>{t('repositories.editCollectionModal.name.label')}</span>
                  <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
                    {t('repositories.editCollectionModal.name.required')}
                  </span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={nombreEditarColeccion}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value.length <= 32) {
                        setNombreEditarColeccion(value);
                        setErrorNombreEditar(null);
                      }
                    }}
                    onBlur={() => {
                      const nombreTrimmed = nombreEditarColeccion.trim();
                      if (!nombreTrimmed) {
                        setErrorNombreEditar(t('repositories.editCollectionModal.name.errors.required'));
                      } else if (nombreTrimmed.length > 32) {
                        setErrorNombreEditar(t('repositories.editCollectionModal.name.errors.maxLength'));
                      } else {
                        // Validar que el nombre no se repita
                        const encontrarPadre = (items: FolderItem[], targetId: string, parent: FolderItem | null = null): FolderItem | null => {
                          for (const item of items) {
                            if (item.id === targetId) {
                              return parent;
                            }
                            if (item.hijos) {
                              const found = encontrarPadre(item.hijos, targetId, item);
                              if (found !== null) return found;
                            }
                          }
                          return null;
                        };
                        const carpetaPadre = encontrarPadre(estructuraCarpetas, coleccionAEditar.id);
                        if (carpetaPadre) {
                          const nombresExistentes = carpetaPadre.hijos
                            ?.filter((h) => h.id !== coleccionAEditar.id)
                            .map((h) => h.nombre.toLowerCase()) || [];
                          if (nombresExistentes.includes(nombreTrimmed.toLowerCase())) {
                            setErrorNombreEditar(t('repositories.editCollectionModal.name.errors.duplicate'));
                          } else {
                            setErrorNombreEditar(null);
                          }
                        }
                      }
                    }}
                    className={cn(
                      "w-full px-4 py-3 pr-16 text-sm rounded-xl border transition-all duration-200",
                      "bg-slate-50 dark:bg-slate-800/50",
                      "focus:outline-none focus:ring-2 focus:ring-offset-2",
                      errorNombreEditar
                        ? "border-red-300 dark:border-red-700/50 focus:ring-red-500 focus:border-red-500"
                        : "border-slate-200 dark:border-slate-700 focus:ring-primary focus:border-primary",
                      editandoColeccion && "opacity-60 cursor-not-allowed"
                    )}
                    placeholder={t('repositories.editCollectionModal.name.placeholder')}
                    autoFocus
                    maxLength={32}
                    disabled={editandoColeccion}
                  />
                  <span className={cn(
                    "absolute top-2.5 right-3 text-xs font-medium transition-colors pointer-events-none",
                    nombreEditarColeccion.length > 28
                      ? "text-amber-600 dark:text-amber-500"
                      : "text-slate-500 dark:text-slate-400"
                  )}>
                    {nombreEditarColeccion.length}/32
                  </span>
                  {errorNombreEditar && (
                    <div className="flex items-center gap-1.5 mt-2 text-sm text-red-600 dark:text-red-400 animate-in slide-in-from-top-1">
                      <AlertCircle className="w-4 h-4" />
                      <span>{errorNombreEditar}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <span>{t('repositories.editCollectionModal.descriptionField.label')}</span>
                  <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
                    {t('repositories.editCollectionModal.descriptionField.optional')}
                  </span>
                </label>
                <div className="relative">
                  <textarea
                    value={descripcionEditarColeccion}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value.length <= 150) {
                        setDescripcionEditarColeccion(value);
                        setErrorDescripcionEditar(null);
                      }
                    }}
                    onBlur={() => {
                      if (descripcionEditarColeccion.trim().length > 150) {
                        setErrorDescripcionEditar(t('repositories.editCollectionModal.descriptionField.errors.maxLength'));
                      } else {
                        setErrorDescripcionEditar(null);
                      }
                    }}
                    className={cn(
                      "w-full px-4 py-3 pb-8 text-sm rounded-xl border transition-all duration-200",
                      "bg-slate-50 dark:bg-slate-800/50",
                      "focus:outline-none focus:ring-2 focus:ring-offset-2",
                      errorDescripcionEditar
                        ? "border-red-300 dark:border-red-700/50 focus:ring-red-500 focus:border-red-500"
                        : "border-slate-200 dark:border-slate-700 focus:ring-primary focus:border-primary",
                      "min-h-[110px] resize-none",
                      editandoColeccion && "opacity-60 cursor-not-allowed"
                    )}
                    placeholder={t('repositories.editCollectionModal.descriptionField.placeholder')}
                    maxLength={150}
                    disabled={editandoColeccion}
                  />
                  <span className={cn(
                    "absolute bottom-4 right-3 text-xs font-medium transition-colors pointer-events-none",
                    descripcionEditarColeccion.length > 130
                      ? "text-amber-600 dark:text-amber-500"
                      : "text-slate-500 dark:text-slate-400"
                  )}>
                    {descripcionEditarColeccion.length}/150
                  </span>
                  {errorDescripcionEditar && (
                    <div className="flex items-center gap-1.5 mt-2 text-sm text-red-600 dark:text-red-400 animate-in slide-in-from-top-1">
                      <AlertCircle className="w-4 h-4" />
                      <span>{errorDescripcionEditar}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3">

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setMostrarColorPicker(!mostrarColorPicker)}
                    className={cn(
                      "w-full px-4 py-3 text-sm rounded-xl border transition-all duration-200 flex items-center justify-between",
                      "bg-slate-50 dark:bg-slate-800/50",
                      "focus:outline-none focus:ring-2 focus:ring-offset-2 border-slate-200 dark:border-slate-700 focus:ring-primary focus:border-primary"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      {colorEditarColeccion ? (
                        <div
                          className="w-5 h-5 rounded-full border border-slate-200 dark:border-slate-700"
                          style={{ backgroundColor: colorEditarColeccion }}
                        />
                      ) : (
                        <div className="w-5 h-5 rounded-full border border-dashed border-slate-400 bg-transparent" />
                      )}
                      <span>
                        {t(COLLECTION_COLORS.find(c => c.value === colorEditarColeccion)?.name || 'repositories.colors.default')}
                      </span>
                    </div>
                    <ChevronDown className="w-4 h-4 text-slate-500" />
                  </button>

                  {mostrarColorPicker && (
                    <div className="absolute top-full left-0 right-0 mt-2 p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xl z-50 max-h-60 overflow-y-auto">
                      <div className="grid grid-cols-1 gap-1">
                        {COLLECTION_COLORS.map((color) => (
                          <button
                            key={color.name}
                            onClick={() => {
                              setColorEditarColeccion(color.value);
                              setMostrarColorPicker(false);
                            }}
                            className={cn(
                              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors w-full text-left",
                              colorEditarColeccion === color.value
                                ? "bg-primary/10 text-primary"
                                : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                            )}
                          >
                            {color.value ? (
                              <div
                                className="w-4 h-4 rounded-full border border-slate-200 dark:border-slate-700"
                                style={{ backgroundColor: color.value }}
                              />
                            ) : (
                              <div className="w-4 h-4 rounded-full border border-dashed border-slate-400 bg-transparent" />
                            )}
                            {t(color.name)}
                            {colorEditarColeccion === color.value && (
                              <Check className="w-4 h-4 ml-auto" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-2 justify-end border-t border-slate-200/60 dark:border-slate-700/60">
                <Button
                  variant="outline"
                  size="default"
                  className="min-w-[100px]"
                  onClick={() => {
                    if (!editandoColeccion) {
                      setMostrarModalEditarColeccion(false);
                      setColeccionAEditar(null);
                      setNombreEditarColeccion("");
                      setDescripcionEditarColeccion("");
                      setErrorNombreEditar(null);
                      setErrorDescripcionEditar(null);
                    }
                  }}
                  disabled={editandoColeccion}
                >
                  {t('repositories.editCollectionModal.buttons.cancel')}
                </Button>
                <Button
                  size="default"
                  className="min-w-[120px] bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={guardarEdicionColeccion}
                  disabled={editandoColeccion || !nombreEditarColeccion.trim() || !!errorNombreEditar}
                >
                  {editandoColeccion ? (
                    <span className="flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      {t('repositories.editCollectionModal.buttons.saving')}
                    </span>
                  ) : (
                    t('repositories.editCollectionModal.buttons.save')
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )
      }

      {/* Modal Confirmar Re-clonación */}
      {
        mostrarModalConfirmarReclon && repoAClonar && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200"

            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setMostrarModalConfirmarReclon(false);
                setRepoAClonar(null);
                setRutaDestinoAClonar("");
              }
            }}
            tabIndex={-1}
          >
            <Card
              className="w-full max-w-2xl mx-4 bg-background border border-slate-200/80 dark:border-slate-700/80 shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-2 duration-300"
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  e.stopPropagation();
                  setMostrarModalConfirmarReclon(false);
                  setRepoAClonar(null);
                  setRutaDestinoAClonar("");
                }
              }}
            >
              <CardHeader className="pb-5 border-b border-slate-200/60 dark:border-slate-700/60 bg-gradient-to-r from-slate-50/50 to-transparent dark:from-slate-800/30">
                <div className="flex-1">
                  <CardTitle className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
                    {t('repositories.cloneRepositoryModal.title')}
                  </CardTitle>
                  <CardDescription className="text-sm mt-1.5 text-slate-600 dark:text-slate-400">
                    {t('repositories.cloneRepositoryModal.description')}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="bg-amber-50/80 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/40 rounded-xl p-4">
                  <p className="text-sm text-amber-800 dark:text-amber-300 font-medium flex items-start gap-2.5">
                    <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                    <span>
                      {t('repositories.cloneRepositoryModal.warning')}
                    </span>
                  </p>
                </div>
                <div className="flex gap-3 pt-2 justify-end border-t border-slate-200/60 dark:border-slate-700/60">
                  <Button
                    variant="outline"
                    size="default"
                    className="min-w-[100px]"
                    onClick={() => {
                      setMostrarModalConfirmarReclon(false);
                      setRepoAClonar(null);
                      setRutaDestinoAClonar("");
                    }}
                  >
                    {t('repositories.cloneRepositoryModal.buttons.cancel')}
                  </Button>
                  <Button
                    size="default"
                    variant="destructive"
                    className="min-w-[120px] bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/25 flex items-center gap-2"
                    onClick={async () => {
                      if (repoAClonar) {
                        const item = repoAClonar;
                        setMostrarModalConfirmarReclon(false);
                        setRepoAClonar(null);
                        setRutaDestinoAClonar("");
                        // Llamar a clonarRepositorio con saltarConfirmacion = true
                        await clonarRepositorio(item, true);
                      }
                    }}
                  >
                    <Download className="w-4 h-4" />
                    {t('repositories.cloneRepositoryModal.buttons.clone')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )
      }

      {/* Modal para clonar todos los repositorios */}
      {
        mostrarModalClonarTodos && (() => {
          const carpetaActual = obtenerCarpetaActual();
          const itemsActuales = carpetaActual?.hijos || [];
          const repositorios = itemsActuales.filter(item => item.tipo === "archivo");
          const cantidadRepos = repositorios.length;

          return cantidadRepos > 0 ? (
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200"
              onClick={() => {
                setMostrarModalClonarTodos(false);
                setForzarReclonado(false);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  setMostrarModalClonarTodos(false);
                  setForzarReclonado(false);
                }
              }}
              tabIndex={-1}
            >
              <Card
                className="w-full max-w-2xl mx-4 bg-background border border-slate-200/80 dark:border-slate-700/80 shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-2 duration-300"
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    e.stopPropagation();
                    setMostrarModalClonarTodos(false);
                    setForzarReclonado(false);
                  }
                }}
              >
                <CardHeader className="pb-5 border-b border-slate-200/60 dark:border-slate-700/60 bg-gradient-to-r from-slate-50/50 to-transparent dark:from-slate-800/30">
                  <div className="flex-1">
                    <CardTitle className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
                      Clonar todos los repositorios
                    </CardTitle>
                    <CardDescription className="text-sm mt-1.5 text-slate-600 dark:text-slate-400">
                      Se clonarán {cantidadRepos} {cantidadRepos === 1 ? 'repositorio' : 'repositorios'} de la carpeta actual
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="flex items-start justify-between p-4 bg-slate-50/50 dark:bg-slate-800/30 rounded-xl border border-slate-200/60 dark:border-slate-700/60 transition-all duration-200 hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <div className="flex flex-col gap-2 flex-1 pr-4">
                      <label htmlFor="forzar-reclonado" className="text-sm font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                        Forzar re-clonado
                      </label>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        Si está activado, los repositorios ya clonados se eliminarán y se volverán a clonar desde cero
                      </p>
                    </div>
                    <Switch
                      id="forzar-reclonado"
                      checked={forzarReclonado}
                      onCheckedChange={setForzarReclonado}
                      className="mt-1"
                    />
                  </div>
                  {forzarReclonado && (
                    <div className="bg-amber-50/80 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/40 rounded-xl p-4 animate-in slide-in-from-top-1 duration-200">
                      <p className="text-sm text-amber-800 dark:text-amber-300 font-medium flex items-start gap-2.5">
                        <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                        <span>
                          <span className="font-semibold">Atención:</span> Se perderán todos los cambios locales no guardados en los repositorios que ya están clonados. Esta acción no se puede deshacer.
                        </span>
                      </p>
                    </div>
                  )}
                  <div className="flex gap-3 pt-2 justify-end border-t border-slate-200/60 dark:border-slate-700/60">
                    <Button
                      variant="outline"
                      size="default"
                      className="min-w-[100px]"
                      onClick={() => {
                        setMostrarModalClonarTodos(false);
                        setForzarReclonado(false);
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button
                      size="default"
                      className="min-w-[140px] bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 flex items-center gap-2"
                      onClick={() => {
                        clonarTodosLosRepositorios(forzarReclonado);
                      }}
                    >
                      <Download className="w-4 h-4" />
                      Clonar todos
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : null;
        })()
      }

      {/* Modal para purgar todo el cache */}
      {
        mostrarModalPurgarTodo && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"

            onKeyDown={(e) => {
              if (e.key === 'Escape') setMostrarModalPurgarTodo(false);
            }}
            tabIndex={-1}
          >
            <Card
              className="w-full max-w-2xl mx-4 bg-background border border-slate-200/80 dark:border-slate-700/80 shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-2 duration-300"
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  e.stopPropagation();
                  setMostrarModalPurgarTodo(false);
                }
              }}
            >
              <CardHeader className="pb-5 border-b border-slate-200/60 dark:border-slate-700/60 bg-gradient-to-r from-slate-50/50 to-transparent dark:from-slate-800/30">
                <div className="flex-1">
                  <CardTitle className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
                    {t('settings.data.purgeCache.purgeAll')}
                  </CardTitle>
                  <CardDescription className="text-sm mt-1.5 text-slate-600 dark:text-slate-400">
                    {t('settings.data.purgeCache.description')}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="bg-amber-50/80 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/40 rounded-xl p-4">
                  <p className="text-sm text-amber-800 dark:text-amber-300 font-medium flex items-start gap-2.5">
                    <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                    <span>{t('settings.data.purgeCache.purgeAllConfirm')}</span>
                  </p>
                </div>
                <div className="flex gap-3 pt-2 justify-end border-t border-slate-200/60 dark:border-slate-700/60">
                  <Button
                    variant="outline"
                    size="default"
                    className="min-w-[100px]"
                    onClick={() => setMostrarModalPurgarTodo(false)}
                  >
                    {t('common.cancel')}
                  </Button>
                  <Button
                    size="default"
                    variant="destructive"
                    className="min-w-[120px] bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/25"
                    onClick={ejecutarPurgarTodoCache}
                  >
                    {t('settings.data.purgeCache.purgeAll')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )
      }

      {/* Modal para purgar repositorio individual */}
      {
        mostrarModalPurgarRepo && repoAPurgar && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"
            onClick={() => {
              setMostrarModalPurgarRepo(false);
              setRepoAPurgar(null);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setMostrarModalPurgarRepo(false);
                setRepoAPurgar(null);
              }
            }}
            tabIndex={-1}
          >
            <Card
              className="w-full max-w-2xl mx-4 bg-background border border-slate-200/80 dark:border-slate-700/80 shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-2 duration-300"
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  e.stopPropagation();
                  setMostrarModalPurgarRepo(false);
                  setRepoAPurgar(null);
                }
              }}
            >
              <CardHeader className="pb-5 border-b border-slate-200/60 dark:border-slate-700/60 bg-gradient-to-r from-slate-50/50 to-transparent dark:from-slate-800/30">
                <div className="flex-1">
                  <CardTitle className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
                    {t('settings.data.purgeCache.purgeRepoConfirmTitle')}
                  </CardTitle>
                  <CardDescription className="text-sm mt-1.5 text-slate-600 dark:text-slate-400">
                    {t('settings.data.purgeCache.title')}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="bg-amber-50/80 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/40 rounded-xl p-4">
                  <p className="text-sm text-amber-800 dark:text-amber-300 font-medium flex items-start gap-2.5">
                    <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                    <span>
                      {t('settings.data.purgeCache.purgeRepoConfirmMessage', { name: repoAPurgar.nombre })}
                    </span>
                  </p>
                </div>
                <div className="flex gap-3 pt-2 justify-end border-t border-slate-200/60 dark:border-slate-700/60">
                  <Button
                    variant="outline"
                    size="default"
                    className="min-w-[100px]"
                    onClick={() => {
                      setMostrarModalPurgarRepo(false);
                      setRepoAPurgar(null);
                    }}
                  >
                    {t('common.cancel')}
                  </Button>
                  <Button
                    size="default"
                    variant="destructive"
                    className="min-w-[120px] bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/25"
                    onClick={ejecutarPurgarRepositorio}
                  >
                    {t('settings.data.purgeCache.delete')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )
      }

      {/* Modal para confirmar eliminación de colección */}
      {
        mostrarModalEliminarColeccion && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"

            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setMostrarModalEliminarColeccion(false);
                setColeccionAEliminar(null);
              }
            }}
            tabIndex={-1}
          >
            <Card
              className="w-full max-w-2xl mx-4 bg-background border border-slate-200/80 dark:border-slate-700/80 shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-2 duration-300"
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  e.stopPropagation();
                  setMostrarModalEliminarColeccion(false);
                  setColeccionAEliminar(null);
                }
              }}
            >
              <CardHeader className="pb-5 border-b border-slate-200/60 dark:border-slate-700/60 bg-gradient-to-r from-slate-50/50 to-transparent dark:from-slate-800/30">
                <div className="flex-1">
                  <CardTitle className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
                    {t('repositories.deleteCollectionModal.title')}
                  </CardTitle>
                  <CardDescription className="text-sm mt-1.5 text-slate-600 dark:text-slate-400">
                    {t('repositories.deleteCollectionModal.description')}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="bg-amber-50/80 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/40 rounded-xl p-4">
                  <p className="text-sm text-amber-800 dark:text-amber-300 font-medium flex items-start gap-2.5">
                    <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                    <span>
                      {t('repositories.deleteCollectionModal.warning')}
                    </span>
                  </p>
                </div>
                <div className="flex gap-3 pt-2 justify-end border-t border-slate-200/60 dark:border-slate-700/60">
                  <Button
                    variant="outline"
                    size="default"
                    className="min-w-[100px]"
                    onClick={() => {
                      setMostrarModalEliminarColeccion(false);
                      setColeccionAEliminar(null);
                    }}
                  >
                    {t('repositories.deleteCollectionModal.buttons.cancel')}
                  </Button>
                  <Button
                    size="default"
                    variant="destructive"
                    className="min-w-[120px] bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/25"
                    onClick={async () => {
                      if (!coleccionAEliminar) return;

                      const coleccionId = coleccionAEliminar;

                      // Función recursiva para eliminar la colección de la estructura
                      const eliminarDeEstructura = (items: FolderItem[]): FolderItem[] => {
                        return items.filter(item => {
                          if (item.id === coleccionId) {
                            return false; // Eliminar este item
                          }
                          if (item.hijos) {
                            item.hijos = eliminarDeEstructura(item.hijos);
                          }
                          return true;
                        });
                      };

                      const nuevaEstructura = eliminarDeEstructura(estructuraCarpetas);
                      setEstructuraCarpetas(nuevaEstructura);

                      if (window.electronAPI?.writeConfig) {
                        await window.electronAPI.writeConfig({ repositorios: nuevaEstructura });
                      }

                      setMostrarModalEliminarColeccion(false);
                      setColeccionAEliminar(null);
                    }}
                  >
                    {t('repositories.deleteCollectionModal.buttons.delete')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )
      }

      {/* Modal para confirmar eliminación de conexión */}
      {
        mostrarModalEliminarConexion && conexionAEliminar && (() => {
          const repositoriosAsociados = obtenerRepositoriosAsociados(conexionAEliminar.id, estructuraCarpetas);
          return (
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"

              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  setMostrarModalEliminarConexion(false);
                  setConexionAEliminar(null);
                }
              }}
              tabIndex={-1}
            >
              <Card
                className="w-full max-w-2xl mx-4 bg-background border border-slate-200/80 dark:border-slate-700/80 shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-2 duration-300"
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    e.stopPropagation();
                    setMostrarModalEliminarConexion(false);
                    setConexionAEliminar(null);
                  }
                }}
              >
                <CardHeader className="pb-5 border-b border-slate-200/60 dark:border-slate-700/60 bg-gradient-to-r from-slate-50/50 to-transparent dark:from-slate-800/30">
                  <div className="flex-1">
                    <CardTitle className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
                      Eliminar Conexión
                    </CardTitle>
                    <CardDescription className="text-sm mt-1.5 text-slate-600 dark:text-slate-400">
                      Esta acción no se puede deshacer
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="bg-amber-50/80 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/40 rounded-xl p-4">
                    <p className="text-sm text-amber-800 dark:text-amber-300 font-medium flex items-start gap-2.5">
                      <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                      <span>
                        ¿Estás seguro de que deseas eliminar la conexión <span className="font-semibold">"{conexionAEliminar.nombre}"</span>? Esta acción es permanente y no se puede deshacer.
                      </span>
                    </p>
                  </div>
                  {repositoriosAsociados.length > 0 && (
                    <div className="p-4 rounded-xl bg-slate-50/50 dark:bg-slate-800/30 border border-slate-200/60 dark:border-slate-700/60">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-950/30 flex-shrink-0">
                          <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-1">
                            {repositoriosAsociados.length} Repositorio{repositoriosAsociados.length !== 1 ? 's' : ''} asociado{repositoriosAsociados.length !== 1 ? 's' : ''}
                          </div>
                          <div className="text-xs text-slate-600 dark:text-slate-400 mb-3">
                            Al eliminar esta conexión, todos los repositorios asociados también serán eliminados de tu estructura.
                          </div>
                          <div className="space-y-1.5">
                            {repositoriosAsociados.slice(0, 4).map((repo) => (
                              <div key={repo.id} className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                                <FolderGit2 className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                                <span className="truncate">{repo.nombre}</span>
                              </div>
                            ))}
                            {repositoriosAsociados.length > 4 && (
                              <div className="text-xs text-slate-500 dark:text-slate-400 pt-1">
                                +{repositoriosAsociados.length - 4} repositorio{repositoriosAsociados.length - 4 !== 1 ? 's' : ''} más
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="flex gap-3 pt-2 justify-end border-t border-slate-200/60 dark:border-slate-700/60">
                    <Button
                      variant="outline"
                      size="default"
                      className="min-w-[100px]"
                      onClick={() => {
                        setMostrarModalEliminarConexion(false);
                        setConexionAEliminar(null);
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button
                      size="default"
                      variant="destructive"
                      className="min-w-[120px] bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/25"
                      onClick={confirmarEliminarConexion}
                    >
                      Eliminar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          );
        })()
      }

      {/* Modal para confirmar eliminación de repositorio */}
      {
        mostrarModalEliminarRepositorio && repositorioAEliminar && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"

            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setMostrarModalEliminarRepositorio(false);
                setRepositorioAEliminar(null);
              }
            }}
            tabIndex={-1}
          >
            <Card
              className="w-full max-w-2xl mx-4 bg-background border border-slate-200/80 dark:border-slate-700/80 shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-2 duration-300"
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  e.stopPropagation();
                  setMostrarModalEliminarRepositorio(false);
                  setRepositorioAEliminar(null);
                }
              }}
            >
              <CardHeader className="pb-5 border-b border-slate-200/60 dark:border-slate-700/60 bg-gradient-to-r from-slate-50/50 to-transparent dark:from-slate-800/30">
                <div className="flex-1">
                  <CardTitle className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
                    {t('repositories.deleteRepositoryModal.title')}
                  </CardTitle>
                  <CardDescription className="text-sm mt-1.5 text-slate-600 dark:text-slate-400">
                    {t('repositories.deleteRepositoryModal.description')}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="bg-amber-50/80 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/40 rounded-xl p-4">
                  <p className="text-sm text-amber-800 dark:text-amber-300 font-medium flex items-start gap-2.5">
                    <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                    <span>
                      {t('repositories.deleteRepositoryModal.warning', { name: repositorioAEliminar.nombre })}
                    </span>
                  </p>
                </div>
                <div className="flex gap-3 pt-2 justify-end border-t border-slate-200/60 dark:border-slate-700/60">
                  <Button
                    variant="outline"
                    size="default"
                    className="min-w-[100px]"
                    onClick={() => {
                      setMostrarModalEliminarRepositorio(false);
                      setRepositorioAEliminar(null);
                    }}
                  >
                    {t('repositories.deleteRepositoryModal.buttons.cancel')}
                  </Button>
                  <Button
                    size="default"
                    variant="destructive"
                    className="min-w-[120px] bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/25"
                    onClick={async () => {
                      if (!repositorioAEliminar) return;

                      const repoId = repositorioAEliminar.id;

                      // Función recursiva para eliminar el repositorio de la estructura
                      const eliminarDeEstructura = (items: FolderItem[]): FolderItem[] => {
                        return items.filter(item => {
                          if (item.id === repoId) {
                            return false; // Eliminar este item
                          }
                          if (item.hijos) {
                            item.hijos = eliminarDeEstructura(item.hijos);
                          }
                          return true;
                        });
                      };

                      const nuevaEstructura = eliminarDeEstructura(estructuraCarpetas);
                      setEstructuraCarpetas(nuevaEstructura);

                      if (window.electronAPI?.writeConfig) {
                        await window.electronAPI.writeConfig({ repositorios: nuevaEstructura });
                      }

                      setMostrarModalEliminarRepositorio(false);
                      setRepositorioAEliminar(null);
                    }}
                  >
                    {t('repositories.deleteRepositoryModal.buttons.delete')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )
      }

      {/* Modal para nueva identidad */}
      {
        mostrarModalNuevaIdentidad && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"

            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setMostrarModalNuevaIdentidad(false);
                setNombreNuevaIdentidad("");
                setEmailNuevaIdentidad("");
              }
            }}
            tabIndex={-1}
          >
            <Card
              className="w-full max-w-2xl mx-4 bg-background border border-slate-200/80 dark:border-slate-700/80 shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-2 duration-300"
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  e.stopPropagation();
                  setMostrarModalNuevaIdentidad(false);
                  setNombreNuevaIdentidad("");
                  setEmailNuevaIdentidad("");
                }
              }}
            >
              <CardHeader className="pb-5 border-b border-slate-200/60 dark:border-slate-700/60 bg-gradient-to-r from-slate-50/50 to-transparent dark:from-slate-800/30">
                <div className="flex-1">
                  <CardTitle className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
                    {t('settings.git.identities.modal.title')}
                  </CardTitle>
                  <CardDescription className="text-sm mt-1.5 text-slate-600 dark:text-slate-400">
                    {t('settings.git.identities.modal.description')}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <span>{t('settings.git.identities.modal.fullName.label')}</span>
                    <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
                      {t('settings.git.identities.modal.fullName.required')}
                    </span>
                  </label>
                  <input
                    type="text"
                    value={nombreNuevaIdentidad}
                    onChange={(e) => setNombreNuevaIdentidad(e.target.value)}
                    placeholder={t('settings.git.identities.modal.fullName.placeholder')}
                    className={cn(
                      "w-full px-4 py-3 text-sm rounded-xl border transition-all duration-200",
                      "bg-slate-50 dark:bg-slate-800/50",
                      "focus:outline-none focus:ring-2 focus:ring-offset-2",
                      "border-slate-200 dark:border-slate-700 focus:ring-primary focus:border-primary"
                    )}
                    autoFocus
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <span>{t('settings.git.identities.modal.email.label')}</span>
                    <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
                      {t('settings.git.identities.modal.email.required')}
                    </span>
                  </label>
                  <input
                    type="email"
                    value={emailNuevaIdentidad}
                    onChange={(e) => setEmailNuevaIdentidad(e.target.value)}
                    placeholder={t('settings.git.identities.modal.email.placeholder')}
                    className={cn(
                      "w-full px-4 py-3 text-sm rounded-xl border transition-all duration-200",
                      "bg-slate-50 dark:bg-slate-800/50",
                      "focus:outline-none focus:ring-2 focus:ring-offset-2",
                      !emailNuevaIdentidad.trim() || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNuevaIdentidad.trim())
                        ? "border-slate-200 dark:border-slate-700 focus:ring-primary focus:border-primary"
                        : "border-red-300 dark:border-red-700/50 focus:ring-red-500 focus:border-red-500"
                    )}
                  />
                  {emailNuevaIdentidad.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNuevaIdentidad.trim()) && (
                    <div className="flex items-center gap-1.5 text-sm text-red-600 dark:text-red-400 animate-in slide-in-from-top-1">
                      <AlertCircle className="w-4 h-4" />
                      <span>{t('settings.git.identities.modal.email.error')}</span>
                    </div>
                  )}
                </div>
                <div className="flex gap-3 pt-2 justify-end border-t border-slate-200/60 dark:border-slate-700/60">
                  <Button
                    variant="outline"
                    size="default"
                    className="min-w-[100px]"
                    onClick={() => {
                      setMostrarModalNuevaIdentidad(false);
                      setNombreNuevaIdentidad("");
                      setEmailNuevaIdentidad("");
                    }}
                  >
                    {t('common.cancel')}
                  </Button>
                  <Button
                    size="default"
                    className="min-w-[120px] bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!nombreNuevaIdentidad.trim() || !emailNuevaIdentidad.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNuevaIdentidad.trim())}
                    onClick={async () => {
                      if (!nombreNuevaIdentidad.trim() || !emailNuevaIdentidad.trim()) {
                        showToast('Por favor completa todos los campos', 'error');
                        return;
                      }

                      const nuevaIdentidad: GitIdentity = {
                        id: Date.now().toString(),
                        nombre: nombreNuevaIdentidad.trim(),
                        email: emailNuevaIdentidad.trim()
                      };

                      // Asegurar que la identidad por defecto siempre esté primero
                      const otrasIdentidades = gitIdentities.filter(id => id.id !== IDENTIDAD_DEFAULT_ID);
                      const identidadDefault = gitIdentities.find(id => id.id === IDENTIDAD_DEFAULT_ID) || IDENTIDAD_DEFAULT;
                      const nuevasIdentidades = [identidadDefault, ...otrasIdentidades, nuevaIdentidad];
                      setGitIdentities(nuevasIdentidades);

                      if (window.electronAPI?.writeConfig) {
                        try {
                          await window.electronAPI.writeConfig({ gitIdentities: nuevasIdentidades });
                        } catch (error) {
                          showToast('Error al guardar identidad', 'error');
                        }
                      }

                      setMostrarModalNuevaIdentidad(false);
                      setNombreNuevaIdentidad("");
                      setEmailNuevaIdentidad("");
                    }}
                  >
                    {t('settings.git.identities.modal.add')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )
      }

      {/* Modal para editar identidad */}
      {
        mostrarModalEditarIdentidad && identidadAEditar && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"
            onClick={() => {
              setMostrarModalEditarIdentidad(false);
              setIdentidadAEditar(null);
              setNombreNuevaIdentidad("");
              setEmailNuevaIdentidad("");
            }}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setMostrarModalEditarIdentidad(false);
                setIdentidadAEditar(null);
                setNombreNuevaIdentidad("");
                setEmailNuevaIdentidad("");
              }
            }}
            tabIndex={-1}
          >
            <Card
              className="w-full max-w-2xl mx-4 bg-background border border-slate-200/80 dark:border-slate-700/80 shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-2 duration-300"
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  e.stopPropagation();
                  setMostrarModalEditarIdentidad(false);
                  setIdentidadAEditar(null);
                  setNombreNuevaIdentidad("");
                  setEmailNuevaIdentidad("");
                }
              }}
            >
              <CardHeader className="pb-5 border-b border-slate-200/60 dark:border-slate-700/60 bg-gradient-to-r from-slate-50/50 to-transparent dark:from-slate-800/30">
                <div className="flex-1">
                  <CardTitle className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
                    {t('settings.git.identities.modal.editTitle')}
                  </CardTitle>
                  <CardDescription className="text-sm mt-1.5 text-slate-600 dark:text-slate-400">
                    {t('settings.git.identities.modal.editDescription')}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <span>{t('settings.git.identities.modal.fullName.label')}</span>
                    <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
                      {t('settings.git.identities.modal.fullName.required')}
                    </span>
                  </label>
                  <input
                    type="text"
                    value={nombreNuevaIdentidad}
                    onChange={(e) => setNombreNuevaIdentidad(e.target.value)}
                    placeholder={t('settings.git.identities.modal.fullName.placeholder')}
                    className={cn(
                      "w-full px-4 py-3 text-sm rounded-xl border transition-all duration-200",
                      "bg-slate-50 dark:bg-slate-800/50",
                      "focus:outline-none focus:ring-2 focus:ring-offset-2",
                      "border-slate-200 dark:border-slate-700 focus:ring-primary focus:border-primary"
                    )}
                    autoFocus
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <span>{t('settings.git.identities.modal.email.label')}</span>
                    <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
                      {t('settings.git.identities.modal.email.required')}
                    </span>
                  </label>
                  <input
                    type="email"
                    value={emailNuevaIdentidad}
                    onChange={(e) => setEmailNuevaIdentidad(e.target.value)}
                    placeholder={t('settings.git.identities.modal.email.placeholder')}
                    className={cn(
                      "w-full px-4 py-3 text-sm rounded-xl border transition-all duration-200",
                      "bg-slate-50 dark:bg-slate-800/50",
                      "focus:outline-none focus:ring-2 focus:ring-offset-2",
                      !emailNuevaIdentidad.trim() || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNuevaIdentidad.trim())
                        ? "border-slate-200 dark:border-slate-700 focus:ring-primary focus:border-primary"
                        : "border-red-300 dark:border-red-700/50 focus:ring-red-500 focus:border-red-500"
                    )}
                  />
                  {emailNuevaIdentidad.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNuevaIdentidad.trim()) && (
                    <div className="flex items-center gap-1.5 text-sm text-red-600 dark:text-red-400 animate-in slide-in-from-top-1">
                      <AlertCircle className="w-4 h-4" />
                      <span>{t('settings.git.identities.modal.email.error')}</span>
                    </div>
                  )}
                </div>
                <div className="flex gap-3 pt-2 justify-end border-t border-slate-200/60 dark:border-slate-700/60">
                  <Button
                    variant="outline"
                    size="default"
                    className="min-w-[100px]"
                    onClick={() => {
                      setMostrarModalEditarIdentidad(false);
                      setIdentidadAEditar(null);
                      setNombreNuevaIdentidad("");
                      setEmailNuevaIdentidad("");
                    }}
                  >
                    {t('common.cancel')}
                  </Button>
                  <Button
                    size="default"
                    className="min-w-[120px] bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!nombreNuevaIdentidad.trim() || !emailNuevaIdentidad.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNuevaIdentidad.trim())}
                    onClick={async () => {
                      if (!nombreNuevaIdentidad.trim() || !emailNuevaIdentidad.trim()) {
                        showToast('Por favor completa todos los campos', 'error');
                        return;
                      }

                      const identidadesActualizadas = gitIdentities.map(identidad =>
                        identidad.id === identidadAEditar.id
                          ? { ...identidad, nombre: nombreNuevaIdentidad.trim(), email: emailNuevaIdentidad.trim() }
                          : identidad
                      );

                      // Asegurar que la identidad por defecto siempre esté primero
                      const identidadDefault = identidadesActualizadas.find(id => id.id === IDENTIDAD_DEFAULT_ID) || IDENTIDAD_DEFAULT;
                      const otrasIdentidades = identidadesActualizadas.filter(id => id.id !== IDENTIDAD_DEFAULT_ID);
                      const identidadesOrdenadas = [identidadDefault, ...otrasIdentidades];
                      setGitIdentities(identidadesOrdenadas);

                      if (window.electronAPI?.writeConfig) {
                        try {
                          await window.electronAPI.writeConfig({ gitIdentities: identidadesOrdenadas });
                        } catch (error) {
                          showToast('Error al actualizar identidad', 'error');
                        }
                      }

                      setMostrarModalEditarIdentidad(false);
                      setIdentidadAEditar(null);
                      setNombreNuevaIdentidad("");
                      setEmailNuevaIdentidad("");
                    }}
                  >
                    {t('common.save')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )
      }

      {/* Modal para eliminar identidad */}
      {
        mostrarModalEliminarIdentidad && identidadAEliminar && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => {
              setMostrarModalEliminarIdentidad(false);
              setIdentidadAEliminar(null);
            }}
          >
            <Card
              className="w-full max-w-md bg-background border-2"
              onClick={(e) => e.stopPropagation()}
            >
              <CardHeader>
                <CardTitle className="text-lg">{t('settings.git.identities.modal.deleteTitle')}</CardTitle>
                <CardDescription>
                  {t('settings.git.identities.modal.deleteDescription')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-lg bg-muted/50 border">
                  <div className="space-y-1">
                    <div className="text-sm font-semibold">{identidadAEliminar.nombre}</div>
                    <div className="text-xs text-muted-foreground">{identidadAEliminar.email}</div>
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      setMostrarModalEliminarIdentidad(false);
                      setIdentidadAEliminar(null);
                    }}
                  >
                    {t('common.cancel')}
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="flex-1 bg-red-600 hover:bg-red-700"
                    onClick={async () => {
                      // Filtrar la identidad a eliminar, pero asegurar que la identidad por defecto siempre esté
                      const identidadesActualizadas = gitIdentities.filter(
                        identidad => identidad.id !== identidadAEliminar.id && identidad.id !== IDENTIDAD_DEFAULT_ID
                      );

                      // Asegurar que la identidad por defecto siempre esté primero
                      const identidadDefault = gitIdentities.find(id => id.id === IDENTIDAD_DEFAULT_ID) || IDENTIDAD_DEFAULT;
                      const identidadesOrdenadas = [identidadDefault, ...identidadesActualizadas];
                      setGitIdentities(identidadesOrdenadas);

                      if (window.electronAPI?.writeConfig) {
                        try {
                          await window.electronAPI.writeConfig({ gitIdentities: identidadesOrdenadas });
                        } catch (error) {
                          showToast('Error al eliminar identidad', 'error');
                        }
                      }

                      setMostrarModalEliminarIdentidad(false);
                      setIdentidadAEliminar(null);
                    }}
                  >
                    {t('common.delete')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )
      }

      {/* Toast Container */}
      <Toaster />

      {/* Wizard de Bienvenida */}
      {
        mostrarWizardBienvenida && wizardCargado && (
          <WelcomeWizard onComplete={completarWizardBienvenida} />
        )
      }
    </div >
  );
}

export default App;

