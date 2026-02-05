/**
 * Utilidades de formateo de fechas con soporte de internacionalización
 * Usa date-fns para formateo y cálculo de fechas relativas
 * @module utils/dateFormatters
 */

import { formatDistanceToNow } from 'date-fns';
import { es, enUS } from 'date-fns/locale';

/**
 * Formatea timestamp UTC a tiempo relativo (ej. "hace 2 días", "2 days ago")
 * Usa date-fns para calcular el tiempo transcurrido desde la fecha hasta ahora
 * 
 * @param {string} utcTimestamp - Timestamp ISO 8601 desde la API
 * @param {string} [locale='es'] - Locale de idioma ('es' o 'en')
 * @returns {string} Cadena de tiempo relativo localizada
 * 
 * @example
 * formatRelativeDate('2026-01-20T10:30:00.000Z', 'es')
 * // Retorna: "hace 2 días"
 * 
 * formatRelativeDate('2026-01-21T18:12:44.234Z', 'en')
 * // Retorna: "2 days ago"
 */
export const formatRelativeDate = (utcTimestamp, locale = 'es') => {
  // Mapeo de locale a objetos de date-fns
  const localeMap = {
    es: es,
    en: enUS
  };

  return formatDistanceToNow(new Date(utcTimestamp), {
    addSuffix: true, // Agrega "hace" o "ago"
    locale: localeMap[locale] || es // Fallback a español
  });
};

/**
 * Formatea fecha a formato local corto legible
 * 
 * @param {string} utcTimestamp - Timestamp ISO 8601
 * @param {string} [locale='es-CO'] - Cadena de locale para formateo
 * @returns {string} Fecha formateada en formato corto
 * 
 * @example
 * formatShortDate('2026-01-20T10:30:00.000Z', 'es-CO')
 * // Retorna: "20 ene 2026"
 * 
 * formatShortDate('2026-01-20T10:30:00.000Z', 'en-US')
 * // Retorna: "Jan 20, 2026"
 */
export const formatShortDate = (utcTimestamp, locale = 'es-CO') => {
  return new Date(utcTimestamp).toLocaleDateString(locale, {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};
