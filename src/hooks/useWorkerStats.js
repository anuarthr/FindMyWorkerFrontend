/**
 * Hook personalizado para obtener estadísticas de un trabajador
 * Maneja métricas de trabajos activos, ganancias y calificaciones
 * @module hooks/useWorkerStats
 * 
 * @returns {Object} Estado de estadísticas
 * @returns {Object} stats - Estadísticas del trabajador (active_jobs, monthly_earnings, total_earnings, completed_jobs, average_rating)
 * @returns {boolean} loading - Estado de carga
 * @returns {string|null} error - Mensaje de error
 * @returns {Function} refetch - Función para recargar estadísticas
 */

import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

/**
 * Hook para obtener y gestionar estadísticas del trabajador actual
 */

export const useWorkerStats = () => {
  const [stats, setStats] = useState({
    active_jobs: 0,
    monthly_earnings: 0,
    total_earnings: 0,
    completed_jobs: 0,
    average_rating: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data } = await api.get('/orders/workers/me/metrics/');
      setStats(data);
    } catch (err) {
      console.error('Error fetching worker stats:', err);
      setError(err.response?.data?.detail || 'Error al cargar las estadísticas');
      
      // Mantener valores en 0 si hay error
      setStats({
        active_jobs: 0,
        monthly_earnings: 0,
        total_earnings: 0,
        completed_jobs: 0,
        average_rating: 0
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { 
    stats, 
    loading, 
    error, 
    refetch: fetchStats 
  };
};

export default useWorkerStats;