/**
 * Constantes de configuración de la aplicación FindMyWorker
 * Centraliza URLs, configuraciones, roles, estados y valores constantes
 * utilizados a lo largo de toda la aplicación.
 * @module config/constants
 */

/**
 * Resuelve la URL base del backend desde variables Vite con fallback compatible.
 * Prefiere VITE_API_BASE_URL (host puro, sin /api/), pero acepta VITE_API_URL
 * heredada (con /api o /api/) y le quita el sufijo para uso uniforme.
 * @returns {string} URL base normalizada SIN slash final ni sufijo /api
 */
const resolveBackendOrigin = () => {
  const explicit = import.meta.env.VITE_API_BASE_URL;
  if (explicit) return explicit.replace(/\/+$/, '');

  const legacy = import.meta.env.VITE_API_URL;
  if (legacy) {
    return legacy.replace(/\/+$/, '').replace(/\/api$/, '');
  }
  return 'http://localhost:8000';
};

const BACKEND_ORIGIN = resolveBackendOrigin();
const API_URL = `${BACKEND_ORIGIN}/api/`;
const WS_ORIGIN = (import.meta.env.VITE_WS_URL || BACKEND_ORIGIN.replace(/^http/i, 'ws')).replace(/\/+$/, '');

/**
 * Configuración de la API
 * @constant {Object}
 * @property {string} BACKEND_ORIGIN - Host puro del backend (http(s)://host[:port]) sin /api ni slash final
 * @property {string} BASE_URL - URL base de la API REST (BACKEND_ORIGIN + /api/) para axios.create
 * @property {string} WS_URL - URL base del WebSocket derivada del mismo host (ws://host o wss://host)
 * @property {number} TIMEOUT - Timeout para requests HTTP en milisegundos (30s para backend lento)
 */
export const API_CONFIG = {
  BACKEND_ORIGIN,
  BASE_URL: API_URL,
  WS_URL: WS_ORIGIN,
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
  IN_ESCROW: 'IN_ESCROW',       // Pago retenido en garantía
  COMPLETED: 'COMPLETED',       // Completada (pago liberado)
  CANCELLED: 'CANCELLED',       // Cancelada (también cubre rechazo desde PENDING)
};

/**
 * Estados en los que el chat está activo y disponible.
 * El backend bloquea envío de mensajes cuando la orden está CANCELLED o COMPLETED
 * (códigos de cierre WS 4005). Espejamos ese contrato aquí.
 * @constant {string[]}
 */
export const CHAT_ACTIVE_STATUSES = ['ACCEPTED', 'IN_ESCROW'];

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
  // Coordenadas por defecto (Santa Marta, Magdalena — alcance del MVP)
  DEFAULT_CENTER: {
    lat: 11.2404,
    lng: -74.1990,
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
  CLIENT_LOCATION: 'client_location',
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
