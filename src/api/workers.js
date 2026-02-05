import api from './axios';

/**
 * Servicio de trabajadores - maneja todas las operaciones relacionadas con trabajadores
 */

/**
 * Obtiene lista de trabajadores con filtros aplicados
 * @param {Object} filters - Filtros de búsqueda
 * @param {number} filters.minPrice - Precio mínimo
 * @param {number} filters.maxPrice - Precio máximo
 * @param {number} filters.minRating - Rating mínimo
 * @param {string} filters.search - Texto de búsqueda
 * @param {string} filters.category - Categoría/profesión
 * @param {Object} filters.userLocation - Ubicación del usuario
 * @param {number} filters.radius - Radio de búsqueda en km
 * @param {string} filters.sortBy - Campo para ordenar
 * @returns {Promise<Array>} Lista de trabajadores
 */
/**
 * Limpia objeto removiendo propiedades undefined
 * @param {Object} obj - Objeto a limpiar
 * @returns {Object} Objeto sin propiedades undefined
 */
const cleanParams = (obj) => {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, value]) => value !== undefined)
  );
};

export const getWorkers = async (filters) => {
  const params = cleanParams({
    min_price: filters.minPrice,
    max_price: filters.maxPrice,
    min_rating: filters.minRating > 0 ? filters.minRating : undefined,
    search: filters.search || undefined,
    profession: filters.category || undefined,
    lat: filters.userLocation?.lat,
    lng: filters.userLocation?.lng,
    radius: filters.radius || 20,
    ordering: filters.sortBy || undefined
  });

  try {
    const response = await api.get('/workers/', { params });
    const data = response.data;
    return Array.isArray(data) ? data : data.results || [];
  } catch (error) {
    console.error('Error al obtener trabajadores:', error);
    // Retornar array vacío en caso de error para no romper la UI
    return [];
  }
};

/**
 * Obtiene los detalles completos de un trabajador específico
 * @param {number} id - ID del trabajador
 * @returns {Promise<Object|null>} Detalles del trabajador o null si hay error
 */
export const getWorkerById = async (id) => {
  try {
    const response = await api.get(`/workers/${id}/`);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener trabajador ${id}:`, error);
    // Retornar null en caso de error para manejo en componentes
    return null;
  }
};
