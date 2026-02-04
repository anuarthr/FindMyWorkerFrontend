/**
 * Funciones auxiliares para formateo de datos de perfil de usuario/trabajador
 * Proporciona utilidades para nombres, moneda y avatares
 * @module utils/profileHelpers
 */

/**
 * Obtiene nombre completo desde datos de usuario o trabajador
 * Combina first_name y last_name, con fallback si no existen
 * @param {Object} userData - Objeto de datos de usuario o trabajador con first_name y last_name
 * @param {string} [defaultName='Usuario'] - Nombre por defecto si no se encuentra ninguno
 * @returns {string} Nombre completo o nombre por defecto
 * @example getFullName({first_name: 'Juan', last_name: 'Pérez'}) // "Juan Pérez"
 * @example getFullName({first_name: 'Ana'}) // "Ana"
 * @example getFullName({}) // "Usuario"
 */
export const getFullName = (userData, defaultName = 'Usuario') => {
  const firstName = userData?.first_name || '';
  const lastName = userData?.last_name || '';
  const fullName = `${firstName} ${lastName}`.trim();
  return fullName || defaultName;
};

/**
 * Formatea valor numérico como moneda localizada
 * Usa Intl.NumberFormat para formateo correcto según el locale
 * @param {number} value - Valor numérico a formatear
 * @param {string} [locale='es-CO'] - Locale para formateo (es-CO, en-US, etc.)
 * @param {string} [currency='COP'] - Código ISO 4217 de moneda (COP, USD, EUR, etc.)
 * @returns {string} String de moneda formateada con símbolo
 * @example formatCurrency(50000, 'es-CO', 'COP') // "$ 50.000"
 * @example formatCurrency(100, 'en-US', 'USD') // "$100"
 */
export const formatCurrency = (value, locale = 'es-CO', currency = 'COP') => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value || 0);
};

/**
 * Obtiene URL de avatar con fallback a placeholder
 * Retorna avatar del usuario o genera un placeholder con iniciales
 * @param {Object} userData - Objeto de datos de usuario con propiedad avatar
 * @param {string} [size='100x100'] - Parámetro de tamaño para placeholder (ej., '100x100', '50x50')
 * @returns {string} URL del avatar o URL del placeholder
 * @example getAvatarUrl({avatar: 'https://cdn.com/avatar.jpg'}) // "https://cdn.com/avatar.jpg"
 * @example getAvatarUrl({}, '50x50') // "https://placehold.co/50x50?text=WK"
 */
export const getAvatarUrl = (userData, size = '100x100') => {
  return userData?.avatar || `https://placehold.co/${size}?text=WK`;
};
