export type TabType = "inicio" | "repositorios" | "conexiones" | "configuracion";
export type ConfigTabType = "general" | "datos" | "git" | "temas" | "actualizacion" | "acerca";

export type FolderItem = {
  id: string;
  nombre: string;
  tipo: "coleccion" | "archivo";
  descripcion?: string;
  hijos?: FolderItem[];
  privado?: boolean;
  proveedor?: string;
  ahead?: number;
  behind?: number;
  favorito?: boolean;
  urlClon?: string;
  clonado?: boolean;
  idConexion?: number;
  organizacion?: string;
  nombreGit?: string;
};

export type ConnectionDetails = {
  userName: string;
  createdAt: string | null;
  organizations: string[];
  totalRepos: number;
  publicRepos: number;
  privateRepos: number;
};

export type Connection = {
  id: number;
  nombre: string;
  tipo: string;
  host: string;
  tokenEncriptado: string; // Token encriptado
  fechaCreacion?: string;
  details?: ConnectionDetails; // Información adicional de la API
};

