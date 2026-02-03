import { useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { searchWorkers, getRecommendationHealth } from '../api/recommendations';

/**
 * Hook personalizado para búsqueda semántica de trabajadores
 * Maneja estado, loading, errores, health check del modelo y detección automática de idioma
 */
export const useRecommendationSearch = () => {
  const { i18n } = useTranslation();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [modelStatus, setModelStatus] = useState({
    trained: false,
    corpus_size: 0,
    vocabulary_size: 0,
    backend_ready: null // null = no se ha verificado aún
  });
  const [pagination, setPagination] = useState({
    count: 0,
    next: null,
    previous: null,
    currentPage: 1
  });

  /**
   * Verifica si el modelo está entrenado
   */
  const checkModelHealth = useCallback(async () => {
    try {
      const health = await getRecommendationHealth();
      setModelStatus({
        trained: health.trained || false,
        corpus_size: health.corpus_size || 0,
        vocabulary_size: health.vocabulary_size || 0,
        backend_ready: health.backend_ready !== false
      });
      return health.trained || false;
    } catch (err) {
      console.error('Error al verificar modelo:', err);
      setModelStatus(prev => ({
        ...prev,
        backend_ready: false
      }));
      return false;
    }
  }, []);

  /**
   * Ejecuta búsqueda de trabajadores
   */
  const search = useCallback(async (searchQuery, location, filters = {}) => {
    if (!searchQuery || searchQuery.trim().length < 3) {
      setError('La búsqueda debe tener al menos 3 caracteres');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const currentLanguage = i18n.language.startsWith('es') ? 'es' : 'en';

      const response = await searchWorkers({
        searchQuery: searchQuery.trim(),
        lat: location?.lat,
        lon: location?.lon,
        language: currentLanguage,
        serviceCategory: filters.serviceCategory,
        maxDistanceKm: filters.maxDistanceKm || 50,
        page: filters.page || 1,
        pageSize: filters.pageSize || 10
      });

      setResults(response.results || []);
      setPagination({
        count: response.count || 0,
        next: response.next,
        previous: response.previous,
        currentPage: filters.page || 1
      });

      if (response.query_info?.model_status) {
        setModelStatus({
          trained: response.query_info.model_status.trained,
          corpus_size: response.query_info.model_status.corpus_size,
          vocabulary_size: response.query_info.model_status.vocabulary_size
        });
      }

    } catch (err) {
      setError(err.message || 'Error al buscar trabajadores');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [i18n.language]);

  /**
   * Limpia resultados y errores
   */
  const clearResults = useCallback(() => {
    setResults([]);
    setError(null);
    setPagination({
      count: 0,
      next: null,
      previous: null,
      currentPage: 1
    });
  }, []);

  // Verificar salud del modelo al montar el componente
  useEffect(() => {
    checkModelHealth();
  }, [checkModelHealth]);

  return {
    results,
    loading,
    error,
    modelStatus,
    pagination,
    search,
    clearResults,
    checkModelHealth,
    currentLanguage: i18n.language.startsWith('es') ? 'es' : 'en'
  };
};
