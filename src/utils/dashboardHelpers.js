/**
 * Formatea un valor numérico como moneda en pesos colombianos.
 * Usa Intl.NumberFormat para adaptarse automáticamente a la locale (sin decimales para COP).
 */
export const formatCurrency = (value) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(parseFloat(value ?? 0));

/**
 * Formatea un número con separadores de miles de la locale colombiana.
 */
export const formatNumber = (value) =>
  new Intl.NumberFormat('es-CO').format(value ?? 0);
