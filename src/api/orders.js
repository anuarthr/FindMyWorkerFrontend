import api from './axios';

/**
 * Servicio de órdenes - maneja todas las operaciones relacionadas con órdenes de servicio
 */

/**
 * Extrae mensaje de error de respuesta del backend
 * @param {Object} errorData - Datos de error de la respuesta
 * @returns {string|null} Mensaje de error o null
 */
const extractErrorMessage = (errorData) => {
  const errorFields = ['worker', 'description', 'agreed_price'];
  
  for (const field of errorFields) {
    if (errorData[field]) {
      return errorData[field][0];
    }
  }
  
  return errorData.detail || null;
};

/**
 * Crea una nueva orden de servicio
 * @param {Object} params - Parámetros de la orden
 * @param {number} params.worker - ID del trabajador
 * @param {string} params.description - Descripción del servicio
 * @param {number} params.agreed_price - Precio acordado (opcional)
 * @returns {Promise<Object>} Datos de la orden creada
 * @throws {Error} Error con mensaje descriptivo
 */
export const createServiceOrder = async ({ worker, description, agreed_price }) => {
  try {
    const payload = { worker, description };
    
    if (agreed_price !== null && agreed_price !== undefined && agreed_price > 0) {
      payload.agreed_price = agreed_price;
    }
    
    const response = await api.post('/orders/', payload);
    return response.data;
  } catch (error) {
    if (error.response?.data) {
      const errorMessage = extractErrorMessage(error.response.data);
      if (errorMessage) {
        throw new Error(errorMessage);
      }
    }
    throw error;
  }
};

/**
 * Obtiene la lista de órdenes del usuario actual
 * @param {string|null} status - Filtrar por estado de la orden (opcional)
 * @returns {Promise<Array>} Lista de órdenes
 */
export const listMyOrders = async (status = null) => {
  try {
    const params = status ? { status } : {};
    const response = await api.get('/orders/list/', { params });
    return response.data;
  } catch (error) {
    console.error('Error al obtener órdenes:', error);
    throw error;
  }
};

/**
 * Obtiene los detalles completos de una orden específica
 * @param {number} orderId - ID de la orden
 * @returns {Promise<Object>} Detalles de la orden
 */
export const getOrderDetail = async (orderId) => {
  try {
    const response = await api.get(`/orders/${orderId}/`);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener orden ${orderId}:`, error);
    throw error;
  }
};

/**
 * Actualiza el estado de una orden
 * @param {number} orderId - ID de la orden
 * @param {string} newStatus - Nuevo estado de la orden
 * @returns {Promise<Object>} Orden actualizada
 */
export const updateOrderStatus = async (orderId, newStatus) => {
  try {
    const response = await api.patch(`/orders/${orderId}/status/`, {
      status: newStatus
    });
    return response.data;
  } catch (error) {
    console.error(`Error al actualizar orden ${orderId}:`, error);
    throw error;
  }
};
