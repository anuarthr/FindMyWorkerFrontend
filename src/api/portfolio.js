// src/api/portfolio.js
import api from './axios';

const normalizeListResponse = (response) => {
  const data = response.data;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.results)) return data.results;
  return [];
};

export const getMyPortfolio = async () => {
  const response = await api.get('/users/workers/portfolio/');
  return normalizeListResponse(response);
};

/**
 * Lista los portfolio items públicos de un trabajador.
 * @param {number|string} workerId - ID del WorkerProfile (no del User).
 * @param {Object} [opts]
 * @param {number|string} [opts.orderId] - Si viene, el backend filtra a
 *   los items asociados a esa orden (útil para la sección "Evidencia del
 *   trabajo" en OrderDetail). Endpoint público — no requiere JWT.
 */
export const getWorkerPortfolio = async (workerId, { orderId } = {}) => {
  const params = orderId != null ? { order_id: orderId } : undefined;
  const response = await api.get(`/users/workers/${workerId}/portfolio/`, { params });
  return normalizeListResponse(response);
};

export const createPortfolioItem = async (formData, config = {}) => {
  // No especificar Content-Type, el interceptor de axios lo maneja automáticamente
  const response = await api.post('/users/workers/portfolio/', formData, config);
  return response.data;
};

export const updatePortfolioItem = async (id, payload, isMultipart = false, config = {}) => {
  // El interceptor de axios detecta automáticamente FormData y establece el Content-Type correcto
  // Para objetos JSON normales, usa application/json
  const response = await api.patch(`/users/workers/portfolio/${id}/`, payload, config);
  return response.data;
};

export const deletePortfolioItem = async (id) => {
  await api.delete(`/users/workers/portfolio/${id}/`);
};
