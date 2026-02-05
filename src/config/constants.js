/**
 * Constantes de configuración de la aplicación FindMyWorker
 * Centraliza URLs, configuraciones, roles, estados y valores constantes
 * utilizados a lo largo de toda la aplicación.
 * @module config/constants
 */

/**
 * Configuración de la API
 * @constant {Object}
 * @property {string} BASE_URL - URL base de la API REST
 * @property {string} WS_URL - URL base del WebSocket para chat en tiempo real
 * @property {number} TIMEOUT - Timeout para requests HTTP en milisegundos (30s para backend lento)
 */
export const API_CONFIG = {
  // URL base de la API REST
  BASE_URL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/',
  // URL base del WebSocket
  WS_URL: import.meta.env.VITE_WS_URL || 'ws://localhost:8000',
  // Timeout para requests HTTP (ms) - 30s para backend lento
  TIMEOUT: 30000,
};

/**
 * Roles de usuario disponibles en el sistema
 * @constant {Object}
 * @property {string} ADMIN - Administrador con acceso completo
 * @property {string} CLIENT - Cliente que contrata servicios
 * @property {string} WORKER - Trabajador que ofrece servicios
 */
export const USER_ROLES = {
  ADMIN: 'ADMIN',
  CLIENT: 'CLIENT',
  WORKER: 'WORKER',
};

/**
 * Estados posibles de una orden de servicio
 * Representa el ciclo de vida completo de una orden desde su creación hasta su finalización
 * @constant {Object}
 */
export const ORDER_STATUS = {
  PENDING: 'PENDING',           // Pendiente de aceptación
  ACCEPTED: 'ACCEPTED',         // Aceptada por el trabajador
  REJECTED: 'REJECTED',         // Rechazada por el trabajador
  IN_ESCROW: 'IN_ESCROW',       // En depósito de garantía
  IN_PROGRESS: 'IN_PROGRESS',   // En progreso
  COMPLETED: 'COMPLETED',       // Completada
  CANCELLED: 'CANCELLED',       // Cancelada
};

/**
 * Estados en los que el chat está activo y disponible
 * El chat solo está disponible cuando la orden ha sido aceptada y no ha sido completada/cancelada
 * @constant {string[]}
 */
export const CHAT_ACTIVE_STATUSES = ['ACCEPTED', 'IN_ESCROW', 'IN_PROGRESS'];

/**
 * Mapeo de profesiones backend → UI (bilingüe)
 */
export const PROFESSION_TRANSLATIONS = {
  es: {
    'PLUMBER': 'Plomero',
    'ELECTRICIAN': 'Electricista',
    'CARPENTER': 'Carpintero',
    'PAINTER': 'Pintor',
    'GARDENER': 'Jardinero',
    'CLEANER': 'Limpieza',
    'MECHANIC': 'Mecánico',
    'WELDER': 'Soldador',
    'MASON': 'Albañil',
    'ROOFER': 'Techador',
    'LOCKSMITH': 'Cerrajero',
    'GLAZIER': 'Vidriero',
    'TILER': 'Azulejero',
    'PLASTERER': 'Yesero',
    'HANDYMAN': 'Manitas',
    'OTHER': 'Otro'
  },
  en: {
    'PLUMBER': 'Plumber',
    'ELECTRICIAN': 'Electrician',
    'CARPENTER': 'Carpenter',
    'PAINTER': 'Painter',
    'GARDENER': 'Gardener',
    'CLEANER': 'Cleaner',
    'MECHANIC': 'Mechanic',
    'WELDER': 'Welder',
    'MASON': 'Mason',
    'ROOFER': 'Roofer',
    'LOCKSMITH': 'Locksmith',
    'GLAZIER': 'Glazier',
    'TILER': 'Tiler',
    'PLASTERER': 'Plasterer',
    'HANDYMAN': 'Handyman',
    'OTHER': 'Other'
  }
};

/**
 * Configuración de paginación
 */
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
};

/**
 * Configuración de mapas
 */
export const MAP_CONFIG = {
  // Radio de búsqueda por defecto (km)
  DEFAULT_RADIUS: 20,
  // Zoom inicial del mapa
  DEFAULT_ZOOM: 13,
  // Coordenadas por defecto (Bogotá, Colombia)
  DEFAULT_CENTER: {
    lat: 4.7110,
    lng: -74.0721,
  },
};

/**
 * Configuración de validación
 */
export const VALIDATION = {
  // Longitud mínima de contraseña
  MIN_PASSWORD_LENGTH: 8,
  // Longitud máxima de descripción de orden
  MAX_ORDER_DESCRIPTION_LENGTH: 500,
  // Precio mínimo para una orden
  MIN_ORDER_PRICE: 0,
  // Precio máximo para una orden
  MAX_ORDER_PRICE: 10000000,
};

/**
 * Tiempo de espera para notificaciones (ms)
 */
export const NOTIFICATION_DURATION = 5000;

/**
 * Claves de almacenamiento local (localStorage)
 * Centraliza las claves para evitar errores de typos
 * @constant {Object}
 * @property {string} ACCESS_TOKEN - Token JWT de acceso
 * @property {string} REFRESH_TOKEN - Token JWT de refresco
 * @property {string} USER_LANGUAGE - Idioma preferido del usuario (es/en)
 */
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_LANGUAGE: 'user_language',
};

export default {
  API_CONFIG,
  USER_ROLES,
  ORDER_STATUS,
  CHAT_ACTIVE_STATUSES,
  PROFESSION_TRANSLATIONS,
  PAGINATION,
  MAP_CONFIG,
  VALIDATION,
  NOTIFICATION_DURATION,
  STORAGE_KEYS,
};
