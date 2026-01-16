/**
 * @fileoverview Definiciones de tipos TypeScript para la aplicación.
 * 
 * Este módulo contiene todas las definiciones de tipos, interfaces
 * y tipos personalizados utilizados en toda la aplicación.
 */

/**
 * Tipo de pestaña principal de la aplicación.
 * 
 * @typedef {("inicio"|"repositorios"|"conexiones"|"configuracion")} TabType
 */
export type TabType = "inicio" | "repositorios" | "conexiones" | "configuracion";

/**
 * Tipo de pestaña de configuración.
 * 
 * @typedef {("general"|"datos"|"git"|"temas"|"actualizacion"|"acerca")} ConfigTabType
 */
export type ConfigTabType = "general" | "datos" | "git" | "temas" | "actualizacion" | "acerca";

/**
 * Tipo que representa un elemento de carpeta o repositorio.
 * 
 * @typedef {Object} FolderItem
 * @property {string} id - Identificador único del elemento
 * @property {string} nombre - Nombre del elemento
 * @property {"coleccion"|"archivo"} tipo - Tipo de elemento
 * @property {string} [descripcion] - Descripción opcional
 * @property {FolderItem[]} [hijos] - Array de elementos hijos (para carpetas)
 * @property {boolean} [privado] - Indica si el repositorio es privado
 * @property {string} [proveedor] - Proveedor Git (GitHub, GitLab, etc.)
 * @property {number} [ahead] - Número de commits adelante del remoto
 * @property {number} [behind] - Número de commits detrás del remoto
 * @property {boolean} [favorito] - Indica si está marcado como favorito
 * @property {string} [urlClon] - URL para clonar el repositorio
 * @property {boolean} [clonado] - Indica si el repositorio está clonado localmente
 * @property {number} [idConexion] - ID de la conexión asociada
 * @property {string} [organizacion] - Nombre de la organización
 * @property {string} [nombreGit] - Nombre del repositorio en Git
 */
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
  backgroundColor?: string;
};

/**
 * Detalles de una conexión Git.
 * 
 * @typedef {Object} ConnectionDetails
 * @property {string} userName - Nombre de usuario de la conexión
 * @property {string|null} createdAt - Fecha de creación de la conexión
 * @property {string[]} organizations - Array de organizaciones asociadas
 * @property {number} totalRepos - Total de repositorios
 * @property {number} publicRepos - Número de repositorios públicos
 * @property {number} privateRepos - Número de repositorios privados
 */
export type ConnectionDetails = {
  userName: string;
  createdAt: string | null;
  organizations: string[];
  totalRepos: number;
  publicRepos: number;
  privateRepos: number;
};

/**
 * Tipo que representa una conexión Git.
 * 
 * @typedef {Object} Connection
 * @property {number} id - Identificador único de la conexión
 * @property {string} nombre - Nombre de la conexión
 * @property {string} tipo - Tipo de proveedor (GitHub, GitLab, etc.)
 * @property {string} host - Host del servidor Git
 * @property {string} tokenEncriptado - Token de autenticación encriptado
 * @property {string} [fechaCreacion] - Fecha de creación de la conexión
 * @property {ConnectionDetails} [details] - Información adicional obtenida de la API
 */
export type Connection = {
  id: number;
  nombre: string;
  tipo: string;
  host: string;
  tokenEncriptado: string; // Token encriptado
  fechaCreacion?: string;
  details?: ConnectionDetails; // Información adicional de la API
  identidadId?: string; // ID de la identidad asociada
};

