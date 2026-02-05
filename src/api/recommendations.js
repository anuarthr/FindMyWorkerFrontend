import api from './axios';

/**
 * Busca trabajadores usando búsqueda semántica con TF-IDF + geolocalización
 * @param {Object} params - Parámetros de búsqueda
 * @param {string} params.searchQuery - Texto de búsqueda en lenguaje natural
 * @param {number} params.lat - Latitud del usuario
 * @param {number} params.lon - Longitud del usuario
 * @param {string} [params.language] - Idioma de búsqueda: 'es' (solo español soportado)
 * @param {string} [params.serviceCategory] - Categoría de servicio/profesión
 * @param {number} [params.maxDistanceKm] - Radio máximo en km
 * @param {number} [params.page] - Número de página
 * @param {number} [params.pageSize] - Tamaño de página
 * @returns {Promise<Object>} Resultados con workers y metadata
 */
export const searchWorkers = async ({
  searchQuery,
  lat,
  lon,
  language = 'es',
  serviceCategory,
  maxDistanceKm = 50,
  page = 1,
  pageSize = 10
}) => {
  try {
    const normalizedLanguage = language.startsWith('es') ? 'es' : 'en';
    const hasLocation = lat != null && lon != null;

    const body = {
      query: searchQuery,
      language: normalizedLanguage,
      strategy: hasLocation ? 'hybrid' : 'tfidf',
      top_n: Math.min(pageSize, 20),
      ...(serviceCategory && { profession: serviceCategory }),
      ...(hasLocation && {
        latitude: lat,
        longitude: lon,
        max_distance_km: maxDistanceKm
      })
    };

    const response = await api.post('/users/workers/recommend/', body);
    
    return {
      count: response.data.total_results || 0,
      next: page * pageSize < (response.data.total_results || 0) ? page + 1 : null,
      previous: page > 1 ? page - 1 : null,
      results: response.data.recommendations || [],
      processed_query: response.data.processed_query,
      strategy_used: response.data.strategy_used,
      performance_ms: response.data.performance_ms
    };
  } catch (error) {
    console.error('Error en búsqueda de recomendaciones:', error);
    
    const status = error.response?.status;
    
    if (status === 400) {
      const data = error.response.data;
      const errorMsg = data.language?.[0] || 
                       data.query?.[0] ||
                       data.error || 
                       'Parámetros de búsqueda inválidos';
      throw new Error(errorMsg);
    }
    
    if (status === 503) {
      throw new Error('El modelo de ML aún no está entrenado. Intenta en 1-2 minutos.');
    }
    
    throw error;
  }
};

/**
 * Verifica el estado de salud del modelo de recomendaciones
 * @returns {Promise<Object>} Estado del modelo (trained, corpus_size, etc.)
 */
export const getRecommendationHealth = async () => {
  try {
    const response = await api.get('/users/workers/recommendation-health/');
    const data = response.data;
    
    return {
      ...data,
      trained: data.status === 'ready',
      backend_ready: true
    };
  } catch (error) {
    if (error.response?.status !== 404) {
      console.error('Error al verificar salud del modelo:', error);
    }
    
    return {
      status: error.response?.status === 404 ? 'endpoint_not_ready' : 'unknown',
      model_trained: false,
      trained: false,
      corpus_size: 0,
      vocabulary_size: 0,
      backend_ready: error.response?.status !== 404
    };
  }
};

/**
 * Obtiene métricas de uso del sistema de recomendaciones (solo admin)
 * @param {number} [days=30] - Días hacia atrás para analizar
 * @returns {Promise<Object>} Métricas y queries más buscadas (incluye breakdown por idioma)
 */
export const getRecommendationAnalytics = async (days = 30) => {
  try {
    const response = await api.get('/users/recommendation-analytics/', {
      params: { days }
    });
    return response.data;
  } catch (error) {
    console.error('Error al obtener analytics de recomendaciones:', error);
    throw error;
  }
};
