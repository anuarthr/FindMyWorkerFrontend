/**
 * Funciones auxiliares para gestión de órdenes de servicio
 * Proporciona utilidades para formateo de estado, fechas y manejo de errores
 * @module utils/orderHelpers
 */

/**
 * Obtiene etiqueta de estado localizada para una orden
 * @param {string} status - Estado de la orden (PENDING, ACCEPTED, IN_ESCROW, COMPLETED, CANCELLED)
 * @param {Function} t - Función de traducción i18next
 * @returns {string} Etiqueta de estado localizada
 * @example getStatusLabel('PENDING', t) // "Pendiente" o "Pending"
 */
export const getStatusLabel = (status, t) => {
  const statusMap = {
    'PENDING': t('orderStatus.pending'),
    'ACCEPTED': t('orderStatus.accepted'),
    'IN_ESCROW': t('orderStatus.inEscrow'),
    'COMPLETED': t('orderStatus.completed'),
    'CANCELLED': t('orderStatus.cancelled')
  };
  return statusMap[status] || status;
};

/**
 * Obtiene clases CSS de Tailwind para el badge de estado de orden
 * Retorna string de clases completo listo para aplicar
 * @param {string} status - Estado de la orden
 * @returns {string} String de clases CSS para el badge
 * @example getStatusBadgeClasses('PENDING') // "px-3 py-1 rounded-full text-xs font-bold border bg-yellow-100 text-yellow-800 border-yellow-300"
 */
export const getStatusBadgeClasses = (status) => {
  const styles = {
    PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    ACCEPTED: 'bg-blue-100 text-blue-800 border-blue-300',
    IN_ESCROW: 'bg-green-100 text-green-800 border-green-300',
    COMPLETED: 'bg-gray-100 text-gray-800 border-gray-300',
    CANCELLED: 'bg-red-100 text-red-800 border-red-300'
  };

  return `px-3 py-1 rounded-full text-xs font-bold border ${styles[status] || 'bg-gray-100'}`;
};

/**
 * Formatea fecha ISO a string localizado con fecha y hora
 * @param {string} dateString - String de fecha ISO 8601 desde la API
 * @param {string} [locale='es-ES'] - Locale para formateo (es-ES, en-US, etc.)
 * @returns {string} String de fecha formateada con día, mes, año y hora
 * @example formatDate('2026-01-20T10:30:00Z', 'es-ES') // "20 ene 2026, 10:30"
 */
export const formatDate = (dateString, locale = 'es-ES') => {
  const date = new Date(dateString);
  return date.toLocaleDateString(locale, { 
    day: '2-digit', 
    month: 'short', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Extrae mensaje de error legible de respuesta de API
 * Maneja diferentes estructuras de error del backend
 * @param {Object} error - Objeto de error de Axios con respuesta
 * @param {string} fallbackMessage - Mensaje por defecto si falla la extracción
 * @returns {string} Mensaje de error extraído o fallback
 * @example extractErrorMessage(axiosError, 'Error desconocido') // "No tienes permisos"
 */
export const extractErrorMessage = (error, fallbackMessage) => {
  if (error.response?.data) {
    if (error.response.data.detail) {
      return error.response.data.detail;
    } else if (error.response.data.error) {
      return error.response.data.error;
    } else if (typeof error.response.data === 'string') {
      return error.response.data;
    }
  }
  return fallbackMessage;
};
