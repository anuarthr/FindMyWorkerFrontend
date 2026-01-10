import { useState, useEffect } from 'react';
import api from '../api/axios';

export const usePriceSummary = (orderId) => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSummary = async () => {
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
  };

  useEffect(() => {
    fetchSummary();
  }, [orderId]);

  return {
    summary,
    loading,
    error,
    refreshSummary: fetchSummary
  };
};
