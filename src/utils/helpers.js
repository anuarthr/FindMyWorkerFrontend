/**
 * Utilidades y funciones helper generales
 * @module utils/helpers
 */

/**
 * Formatea un número como precio según el locale
 * @param {number} amount - Cantidad a formatear
 * @param {string} locale - Locale ('es' o 'en')
 * @returns {string} Precio formateado
 * @example formatPrice(50000, 'es') // "$ 50,000"
 */
export const formatPrice = (amount, locale = 'es') => {
  if (!amount && amount !== 0) return '$ 0';
  const localeCode = locale === 'es' ? 'es-CO' : 'en-US';
  return `$ ${Number(amount).toLocaleString(localeCode)}`;
};

/**
 * Formatea una fecha a formato legible según el locale
 * @param {string|Date} date - Fecha a formatear
 * @param {boolean} includeTime - Si incluir la hora
 * @param {string} locale - Locale ('es' o 'en')
 * @returns {string} Fecha formateada
 */
export const formatDate = (date, includeTime = false, locale = 'es') => {
  if (!date) return '';
  
  const dateObj = new Date(date);
  const localeCode = locale === 'es' ? 'es-CO' : 'en-US';
  
  const options = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  
  if (includeTime) {
    options.hour = '2-digit';
    options.minute = '2-digit';
  }
  
  return dateObj.toLocaleDateString(localeCode, options);
};

/**
 * Trunca un texto a una longitud máxima
 * @param {string} text - Texto a truncar
 * @param {number} maxLength - Longitud máxima
 * @returns {string} Texto truncado con "..."
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};

/**
 * Calcula la distancia entre dos puntos geográficos (fórmula de Haversine)
 * @param {number} lat1 - Latitud del punto 1
 * @param {number} lon1 - Longitud del punto 1
 * @param {number} lat2 - Latitud del punto 2
 * @param {number} lon2 - Longitud del punto 2
 * @returns {number} Distancia en kilómetros
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radio de la Tierra en km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Convierte grados a radianes
 * @param {number} degrees - Ángulo en grados
 * @returns {number} Ángulo en radianes
 */
const toRad = (degrees) => {
  return degrees * (Math.PI / 180);
};

/**
 * Valida si un email tiene formato válido
 * @param {string} email - Email a validar
 * @returns {boolean} true si el email es válido
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Valida si una contraseña cumple los requisitos mínimos
 * @param {string} password - Contraseña a validar
 * @param {Function} t - Función de traducción de i18next (opcional)
 * @returns {Object} {isValid: boolean, errors: string[]}
 */
export const validatePassword = (password, t = null) => {
  const errors = [];
  
  if (password.length < 8) {
    errors.push(t ? t('validation.minLength', { count: 8 }) : 'Debe tener al menos 8 caracteres');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push(t ? t('validation.requireUppercase') : 'Debe contener al menos una mayúscula');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push(t ? t('validation.requireLowercase') : 'Debe contener al menos una minúscula');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push(t ? t('validation.requireNumber') : 'Debe contener al menos un número');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Debounce - retrasa la ejecución de una función
 * @param {Function} func - Función a ejecutar
 * @param {number} wait - Tiempo de espera en ms
 * @returns {Function} Función con debounce
 */
export const debounce = (func, wait = 300) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Obtiene el color de badge según el estado de una orden
 * @param {string} status - Estado de la orden
 * @returns {string} Clase de color de Tailwind
 */
export const getOrderStatusColor = (status) => {
  const colors = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    ACCEPTED: 'bg-blue-100 text-blue-800',
    REJECTED: 'bg-red-100 text-red-800',
    IN_ESCROW: 'bg-purple-100 text-purple-800',
    IN_PROGRESS: 'bg-indigo-100 text-indigo-800',
    COMPLETED: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-gray-100 text-gray-800',
  };
  
  return colors[status] || 'bg-gray-100 text-gray-800';
};

/**
 * Genera iniciales a partir de un nombre completo
 * @param {string} name - Nombre completo
 * @returns {string} Iniciales (máximo 2 caracteres)
 */
export const getInitials = (name) => {
  if (!name) return '';
  
  const parts = name.trim().split(' ');
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

/**
 * Copia texto al portapapeles
 * @param {string} text - Texto a copiar
 * @returns {Promise<boolean>} true si se copió correctamente
 */
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Error al copiar al portapapeles:', err);
    return false;
  }
};

/**
 * Genera un ID único simple
 * @returns {string} ID único
 */
export const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export default {
  formatPrice,
  formatDate,
  truncateText,
  calculateDistance,
  isValidEmail,
  validatePassword,
  debounce,
  getOrderStatusColor,
  getInitials,
  copyToClipboard,
  generateId,
};
