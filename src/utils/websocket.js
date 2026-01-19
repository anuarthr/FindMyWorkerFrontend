/**
 * Configuración de WebSocket para el sistema de chat en tiempo real
 * @module utils/websocket
 */

// URL base del WebSocket (usar variable de entorno en producción)
export const WS_BASE_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000';

/**
 * Configuración general de WebSocket
 * @constant
 * @type {Object}
 * @property {number} MAX_RETRIES - Número máximo de intentos de reconexión
 * @property {number} RECONNECT_DELAY - Tiempo de espera entre reconexiones (ms)
 * @property {number} PING_INTERVAL - Intervalo para mensajes keep-alive (ms)
 */
export const WEBSOCKET_CONFIG = {
  MAX_RETRIES: 5,
  RECONNECT_DELAY: 3000, // 3 segundos
  PING_INTERVAL: 30000,  // 30 segundos
};

/**
 * Códigos de cierre de WebSocket personalizados
 * @constant
 * @type {Object}
 */
export const CLOSE_CODES = {
  NORMAL_CLOSURE: 1000,   // Cierre normal
  UNAUTHORIZED: 4001,     // Token inválido o expirado
  FORBIDDEN: 4003,        // Sin permisos para acceder al chat
  NOT_FOUND: 4004,        // Orden no encontrada
  CHAT_INACTIVE: 4005,    // Chat inactivo (orden completada/cancelada)
};

/**
 * Mensajes de error traducibles para cada código de cierre
 * @constant
 * @type {Object}
 */
export const ERROR_MESSAGES = {
  [CLOSE_CODES.UNAUTHORIZED]: 'auth.sessionExpired',
  [CLOSE_CODES.FORBIDDEN]: 'chat.noPermission',
  [CLOSE_CODES.NOT_FOUND]: 'chat.orderNotFound',
  [CLOSE_CODES.CHAT_INACTIVE]: 'chat.chatInactive',
};

/**
 * Construye la URL completa del WebSocket para una orden específica
 * @param {number} orderId - ID de la orden
 * @param {string} token - Token JWT de autenticación
 * @returns {string} URL completa del WebSocket
 */
export const buildWebSocketURL = (orderId, token) => {
  return `${WS_BASE_URL}/ws/chat/${orderId}/?token=${token}`;
};

/**
 * Verifica si el chat está disponible para un estado de orden específico
 * @param {string} status - Estado actual de la orden
 * @returns {boolean} true si el chat está disponible para ese estado
 */
export const canChatInStatus = (status) => {
  const ALLOWED_STATUSES = ['ACCEPTED', 'IN_ESCROW', 'IN_PROGRESS'];
  return ALLOWED_STATUSES.includes(status);
};

/**
 * Formatea la marca de tiempo de un mensaje relativa al tiempo actual
 * @param {string|Date} timestamp - Marca de tiempo del mensaje
 * @param {string} locale - Idioma para el formato ('es' o 'en')
 * @returns {string} Tiempo formateado (ej: "Hace 5m", "Hace 2h", "15 ene")
 */
export const formatMessageTime = (timestamp, locale = 'es') => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  // Menos de 1 minuto
  if (diffMins < 1) return locale === 'es' ? 'Ahora' : 'Now';
  // Menos de 1 hora
  if (diffMins < 60) return locale === 'es' ? `Hace ${diffMins}m` : `${diffMins}m ago`;
  // Menos de 24 horas
  if (diffHours < 24) return locale === 'es' ? `Hace ${diffHours}h` : `${diffHours}h ago`;
  // Menos de 7 días
  if (diffDays < 7) return locale === 'es' ? `Hace ${diffDays}d` : `${diffDays}d ago`;

  // Más de 7 días: mostrar fecha
  return date.toLocaleDateString(locale === 'es' ? 'es-CO' : 'en-US', {
    month: 'short',
    day: 'numeric',
  });
};
