/**
 * Hook personalizado para obtener resumen de precios de una orden
 * Maneja el estado, carga automática y refrescado manual del resumen
 * @module hooks/usePriceSummary
 */

import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

/**
 * Hook para obtener el resumen de precios de una orden
 * @param {number} orderId - ID de la orden
 * @returns {Object} Estado del resumen {summary, loading, error, refreshSummary}
 */

export const usePriceSummary = (orderId) => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSummary = useCallback(async () => {
    if (!orderId) return;
    
    try {
      setLoading(true);
      setError(null);
      const { data } = await api.get(`/orders/${orderId}/price-summary/`);
      setSummary(data);
    } catch (err) {
      console.error('Error fetching price summary:', err);
      setError(err.response?.data?.detail || 'Error al cargar el resumen');
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  return {
    summary,
    loading,
    error,
    refreshSummary: fetchSummary
  };
};
