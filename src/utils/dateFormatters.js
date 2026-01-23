/**
 * @fileoverview Utilidades de formateo de fechas con soporte i18n
 */

import { formatDistanceToNow } from 'date-fns';
import { es, enUS } from 'date-fns/locale';

/**
 * Formatear timestamp UTC a tiempo relativo (ej. "hace 2 días")
 * 
 * @param {string} utcTimestamp - Timestamp ISO 8601 desde la API
 * @param {string} [locale='es'] - Locale de idioma ('es' o 'en')
 * @returns {string} Cadena de tiempo relativo
 * 
 * @example
 * formatRelativeDate('2026-01-20T10:30:00.000Z', 'es')
 * // Retorna: "hace 2 días"
 * 
 * formatRelativeDate('2026-01-21T18:12:44.234Z', 'en')
 * // Retorna: "2 days ago"
 */
export const formatRelativeDate = (utcTimestamp, locale = 'es') => {
  const localeMap = {
    es: es,
    en: enUS
  };

  return formatDistanceToNow(new Date(utcTimestamp), {
    addSuffix: true,
    locale: localeMap[locale] || es
  });
};

/**
 * Formatear fecha a formato local corto
 * 
 * @param {string} utcTimestamp - Timestamp ISO 8601
 * @param {string} [locale='es-CO'] - Cadena de locale
 * @returns {string} Fecha formateada
 * 
 * @example
 * formatShortDate('2026-01-20T10:30:00.000Z')
 * // Retorna: "20 ene 2026"
 */
export const formatShortDate = (utcTimestamp, locale = 'es-CO') => {
  return new Date(utcTimestamp).toLocaleDateString(locale, {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};
