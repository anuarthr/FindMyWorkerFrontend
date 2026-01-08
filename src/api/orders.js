import api from './axios';

export const createServiceOrder = async ({ worker, description }) => {
  try {
    const response = await api.post('/orders/', {
      worker,
      description
    });
    return response.data;
  } catch (error) {
    if (error.response?.data) {
      const errorData = error.response.data;
      
      if (errorData.worker) {
        throw new Error(errorData.worker[0]);
      }
      if (errorData.description) {
        throw new Error(errorData.description[0]);
      }
      if (errorData.detail) {
        throw new Error(errorData.detail);
      }
    }
    throw error;
  }
};

export const listMyOrders = async (status = null) => {
  const params = status ? { status } : {};
  const response = await api.get('/orders/list/', { params });
  return response.data;
};

export const getOrderDetail = async (orderId) => {
  const response = await api.get(`/orders/${orderId}/`);
  return response.data;
};

export const updateOrderStatus = async (orderId, newStatus) => {
  const response = await api.patch(`/orders/${orderId}/status/`, {
    status: newStatus
  });
  return response.data;
};
