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

export const getWorkerPortfolio = async (workerId) => {
  const response = await api.get(`/users/workers/${workerId}/portfolio/`);
  return normalizeListResponse(response);
};

export const createPortfolioItem = async (formData, config = {}) => {
  const response = await api.post('/users/workers/portfolio/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    ...config,
  });
  return response.data;
};

export const updatePortfolioItem = async (id, payload, isMultipart = false, config = {}) => {
  const response = await api.patch(
    `/users/workers/portfolio/${id}/`,
    payload,
    {
      headers: isMultipart
        ? { 'Content-Type': 'multipart/form-data' }
        : { 'Content-Type': 'application/json' },
      ...config,
    }
  );
  return response.data;
};

export const deletePortfolioItem = async (id) => {
  await api.delete(`/users/workers/portfolio/${id}/`);
};
