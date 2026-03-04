import api from '../api/axios';

/**
 * Obtiene las métricas del tablero administrativo desde el backend.
 * Requiere que el usuario autenticado tenga el rol ADMIN.
 * @returns {Promise<object>} { user_statistics, profession_statistics, transaction_statistics }
 */
export const fetchDashboardMetrics = async () => {
  const { data } = await api.get('/users/admin/dashboard/');
  return data;
};
