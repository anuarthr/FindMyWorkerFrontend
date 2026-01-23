/**
 * @fileoverview Hook personalizado para obtener y gestionar reviews de trabajadores
 * Maneja paginación, estados de carga y manejo de errores
 */

import { useState, useEffect, useCallback } from 'react';
import { getWorkerReviews } from '../api/reviews';

/**
 * useWorkerReviews - Hook para gestionar reviews de trabajadores con paginación
 * 
 * @param {string} workerId - ID del trabajador
 * @param {number} [initialPageSize=10] - Elementos por página
 * @returns {Object} Estado de reviews y métodos
 * 
 * @example
 * const { reviews, worker, loading, error, loadMore, hasMore } = useWorkerReviews('4');
 */
export const useWorkerReviews = (workerId, initialPageSize = 10) => {
  const [reviews, setReviews] = useState([]);
  const [worker, setWorker] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 0,
    count: 0,
    next: null,
    previous: null
  });
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);

  const fetchReviews = useCallback(async (page = 1, append = false) => {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const data = await getWorkerReviews(workerId, page, initialPageSize);

      setReviews(prev => append ? [...prev, ...data.reviews] : data.reviews);
      setWorker(data.worker);
      setPagination(data.pagination);

    } catch (err) {
      console.error('Error fetching reviews:', err);
      setError(err.message || 'Error al cargar las evaluaciones');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [workerId, initialPageSize]);

  const loadMore = useCallback(() => {
    if (pagination.next && !loadingMore) {
      fetchReviews(pagination.currentPage + 1, true);
    }
  }, [pagination.next, pagination.currentPage, loadingMore, fetchReviews]);

  const refresh = useCallback(() => {
    fetchReviews(1, false);
  }, [fetchReviews]);

  const addReview = useCallback((newReview) => {
    setReviews(prev => [newReview, ...prev]);
    setPagination(prev => ({
      ...prev,
      count: prev.count + 1
    }));
  }, []);

  useEffect(() => {
    if (workerId) {
      fetchReviews(1, false);
    }
  }, [workerId, fetchReviews]);

  return {
    reviews,
    worker,
    loading,
    loadingMore,
    error,
    pagination,
    hasMore: !!pagination.next,
    loadMore,
    refresh,
    addReview
  };
};

export default useWorkerReviews;
