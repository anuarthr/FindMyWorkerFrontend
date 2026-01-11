import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

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