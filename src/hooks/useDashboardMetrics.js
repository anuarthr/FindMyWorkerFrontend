import { useState, useEffect, useCallback } from 'react';
import { fetchDashboardMetrics } from '../services/dashboardService';

/**
 * Hook personalizado que obtiene y gestiona las métricas del tablero administrativo.
 * Expone loading, error (código HTTP o 'network_error'), data y un callback de refresco manual.
 * Sin auto-refresco para respetar el rate limit del backend de 10 peticiones/min.
 */
export const useDashboardMetrics = () => {
  const [state, setState] = useState({
    data: null,
    loading: true,
    error: null,
    lastUpdated: null,
  });

  const loadMetrics = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const data = await fetchDashboardMetrics();
      setState({
        data,
        loading: false,
        error: null,
        lastUpdated: new Date(),
      });
    } catch (err) {
      setState({
        data: null,
        loading: false,
        error: err.response?.status ?? 'network_error',
        lastUpdated: null,
      });
    }
  }, []);

  useEffect(() => {
    loadMetrics();
  }, [loadMetrics]);

  return { ...state, refresh: loadMetrics };
};
