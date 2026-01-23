/**
 * @fileoverview Servicio API para gestión de evaluaciones de trabajadores
 * Maneja la creación, obtención y paginación de reviews
 */

import api from './axios';

/**
 * Crear una evaluación para una orden completada
 * 
 * @param {number} orderId - ID de la orden completada
 * @param {Object} reviewData - Datos de la evaluación
 * @param {number} reviewData.rating - Calificación de 1 a 5 estrellas
 * @param {string} reviewData.comment - Comentario de la evaluación (mínimo 10 caracteres)
 * @returns {Promise<Object>} Objeto de la evaluación creada
 * @throws {Error} Si falla la validación, orden no completada, o límite de tasa excedido
 */
export const createReview = async (orderId, reviewData) => {
  try {
    const { data } = await api.post(`/orders/${orderId}/review/`, {
      rating: reviewData.rating,
      comment: reviewData.comment.trim()
    });
    return data;
  } catch (error) {
    if (error.response?.status === 429) {
      const retryAfter = error.response.headers['retry-after'];
      const minutes = Math.ceil(retryAfter / 60);
      throw new Error(
        `Has creado muchas evaluaciones. Intenta de nuevo en ${minutes} minuto${minutes > 1 ? 's' : ''}.`
      );
    }

    if (error.response?.status === 400) {
      const errors = error.response.data;
      if (errors.non_field_errors) {
        throw new Error(errors.non_field_errors[0]);
      }
      throw error;
    }

    if (error.response?.status === 403) {
      throw new Error('Solo el cliente de esta orden puede crear una evaluación.');
    }

    throw new Error('Error al crear la evaluación. Intenta de nuevo.');
  }
};

/**
 * Obtener evaluaciones paginadas de un trabajador específico
 * @param {string} workerId - ID del trabajador
 * @param {number} [page=1] - Número de página
 * @param {number} [pageSize=10] - Elementos por página (máximo 100)
 * @returns {Promise<Object>} Respuesta de evaluaciones paginadas
 * @returns {Array} reviews - Array de objetos de evaluaciones
 * @returns {Object} worker - Datos resumidos del trabajador
 * @returns {Object} pagination - Metadatos de paginación
 */
export const getWorkerReviews = async (workerId, page = 1, pageSize = 10) => {
  try {
    const { data } = await api.get(
      `/reviews/?worker=${workerId}&page=${page}&page_size=${pageSize}`
    );

    return {
      reviews: data.results || [],
      worker: data.worker,
      pagination: {
        count: data.count,
        next: data.next,
        previous: data.previous,
        currentPage: page,
        totalPages: Math.ceil(data.count / pageSize)
      }
    };
  } catch (error) {
    if (error.response?.status === 404) {
      throw new Error('Trabajador no encontrado.');
    }
    throw new Error('Error al cargar las evaluaciones.');
  }
};
