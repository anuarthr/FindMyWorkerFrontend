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

/**
 * Obtiene el conteo de mensajes no leídos por orden.
 *
 * Contrato real del backend:
 *   { total: 5, orders: [{ order_id: 12, unread_count: 3 }, ...] }
 *   { total: 0, orders: [] }   // sin pendientes
 *
 * Acepta también formatos legacy por defensa:
 *   - array suelta de {order_id, unread_count}
 *   - { by_order: { "12": 3 } }
 *
 * Normaliza a { total, byOrder: { [orderId]: count } } para que el
 * resto de la app indexe por id de orden sin importar el shape.
 * @returns {Promise<{ total: number, byOrder: Object<string, number> }>}
 */
export const getChatUnread = async () => {
  try {
    const { data } = await api.get('/orders/chat/unread/');

    const buildFromArray = (arr) => {
      const byOrder = {};
      let total = 0;
      arr.forEach((row) => {
        const id = row.order_id ?? row.id;
        const count = Number(row.unread_count ?? row.count ?? 0);
        if (id != null && count > 0) {
          byOrder[String(id)] = count;
          total += count;
        }
      });
      return { byOrder, total };
    };

    // Formato canónico del backend: { total, orders: [{order_id, unread_count}] }
    if (data && Array.isArray(data.orders)) {
      const { byOrder, total: derived } = buildFromArray(data.orders);
      const total = Number.isFinite(data.total) ? Number(data.total) : derived;
      return { total, byOrder };
    }

    // Defensa: array suelta sin envoltorio.
    if (Array.isArray(data)) {
      return buildFromArray(data);
    }

    // Defensa: { by_order: { "12": 3, ... } }
    if (data && typeof data.by_order === 'object' && data.by_order !== null) {
      const byOrder = {};
      Object.entries(data.by_order).forEach(([id, count]) => {
        const n = Number(count);
        if (n > 0) byOrder[String(id)] = n;
      });
      const total = Number(data.total ?? Object.values(byOrder).reduce((s, n) => s + n, 0));
      return { total, byOrder };
    }

    return { total: 0, byOrder: {} };
  } catch (err) {
    console.error('Error obteniendo unread de chat:', err);
    return { total: 0, byOrder: {} };
  }
};

/**
 * Marca como leídos los mensajes de chat de una orden.
 * Se llama al abrir el FloatingChat para que el contador unread se
 * actualice en el siguiente poll y no "rebote" al valor anterior.
 * El backend devuelve 204 / 200 según implementación; aquí solo nos
 * importa que no lance y dejar registro silencioso si falla.
 * @param {number} orderId
 * @returns {Promise<void>}
 */
export const markChatRead = async (orderId) => {
  try {
    await api.post(`/orders/${orderId}/chat/mark-read/`);
  } catch (err) {
    // No interrumpe la UX — el chat puede seguir abierto. El siguiente
    // poll de unread eventualmente reconcilia.
    console.warn('No se pudo marcar el chat como leído:', err?.response?.status);
  }
};

/**
 * Obtiene órdenes completadas del worker sin portfolio asociado
 * @returns {Promise<Array>} Lista de órdenes completadas disponibles para portfolio
 */
export const getCompletedOrdersWithoutPortfolio = async () => {
  try {
    const response = await api.get('/orders/workers/me/completed-without-portfolio/');
    return response.data;
  } catch (error) {
    console.error('Error al obtener órdenes completadas:', error);
    throw error;
  }
};
