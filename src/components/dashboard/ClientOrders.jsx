import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { listMyOrders, updateOrderStatus } from '../../api/orders';
import { Clock, CreditCard, CheckCircle, XCircle, User, FileText, Loader2 } from 'lucide-react';

const ClientOrders = () => {
  const { t } = useTranslation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, [filter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const statusFilter = filter === 'ALL' ? null : filter;
      const data = await listMyOrders(statusFilter);
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSimulatePayment = async (orderId) => {
    if (!window.confirm(t('clientOrders.confirmPayment'))) return;
    
    try {
      setActionLoading(orderId);
      await updateOrderStatus(orderId, 'IN_ESCROW');
      await fetchOrders();
    } catch (error) {
      console.error('Error simulating payment:', error);
      alert(t('clientOrders.errorPayment'));
    } finally {
      setActionLoading(null);
    }
  };

  const handleMarkCompleted = async (orderId) => {
    if (!window.confirm(t('clientOrders.confirmComplete'))) return;
    
    try {
      setActionLoading(orderId);
      await updateOrderStatus(orderId, 'COMPLETED');
      await fetchOrders();
    } catch (error) {
      console.error('Error marking as completed:', error);
      alert(t('clientOrders.errorComplete'));
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm(t('clientOrders.confirmCancel'))) return;
    
    try {
      setActionLoading(orderId);
      await updateOrderStatus(orderId, 'CANCELLED');
      await fetchOrders();
    } catch (error) {
      console.error('Error cancelling order:', error);
      alert(t('clientOrders.errorCancel'));
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      ACCEPTED: 'bg-blue-100 text-blue-800 border-blue-300',
      IN_ESCROW: 'bg-green-100 text-green-800 border-green-300',
      COMPLETED: 'bg-gray-100 text-gray-800 border-gray-300',
      CANCELLED: 'bg-red-100 text-red-800 border-red-300'
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${styles[status] || 'bg-gray-100'}`}>
        {status}
      </span>
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="animate-spin h-12 w-12 text-[#C04A3E]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Header y Filtros */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#4A3B32]">{t('clientOrders.title')}</h2>
          <p className="text-gray-600 text-sm mt-1">{t('clientOrders.subtitle')}</p>
        </div>

        {/* Filtros */}
        <div className="flex gap-2 flex-wrap">
          {['ALL', 'PENDING', 'ACCEPTED', 'IN_ESCROW', 'COMPLETED'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === status
                  ? 'bg-[#C04A3E] text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {t(`clientOrders.filter.${status.toLowerCase()}`)}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de Órdenes */}
      {orders.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <FileText size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 text-lg">{t('clientOrders.noOrders')}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div 
              key={order.id} 
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col md:flex-row justify-between gap-4">
                
                {/* Info de la Orden */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#EFE6DD] flex items-center justify-center">
                        <User size={20} className="text-[#4A3B32]" />
                      </div>
                      <div>
                        <p className="font-bold text-[#4A3B32]">{order.worker_name}</p>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <Clock size={12} />
                          {formatDate(order.created_at)}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(order.status)}
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 mb-3">
                    <p className="text-sm font-medium text-gray-700 mb-1">{t('clientOrders.description')}:</p>
                    <p className="text-gray-600 text-sm leading-relaxed">{order.description}</p>
                  </div>

                  {order.agreed_price && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">{t('clientOrders.agreedPrice')}:</span> ${Number(order.agreed_price).toLocaleString()}
                    </p>
                  )}
                </div>

                {/* Acciones según estado */}
                <div className="flex md:flex-col gap-2 md:w-44">
                  
                  {/* PENDING: Esperando respuesta del trabajador */}
                  {order.status === 'PENDING' && (
                    <>
                      <div className="flex-1 bg-yellow-50 p-3 rounded-lg text-center">
                        <p className="text-xs text-yellow-800 font-medium">{t('clientOrders.waitingWorker')}</p>
                      </div>
                      <button
                        onClick={() => handleCancelOrder(order.id)}
                        disabled={actionLoading === order.id}
                        className="flex items-center justify-center gap-2 bg-white border-2 border-red-300 text-red-700 py-2 px-4 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors disabled:opacity-50"
                      >
                        <XCircle size={16} />
                        {t('clientOrders.cancel')}
                      </button>
                    </>
                  )}

                  {/* ACCEPTED: Trabajador aceptó, cliente debe pagar */}
                  {order.status === 'ACCEPTED' && (
                    <>
                      <button
                        onClick={() => handleSimulatePayment(order.id)}
                        disabled={actionLoading === order.id}
                        className="flex-1 flex items-center justify-center gap-2 bg-[#C04A3E] text-white py-3 px-4 rounded-lg font-medium hover:bg-[#a83f34] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                      >
                        {actionLoading === order.id ? (
                          <Loader2 className="animate-spin h-4 w-4" />
                        ) : (
                          <>
                            <CreditCard size={18} />
                            {t('clientOrders.simulatePayment')}
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleCancelOrder(order.id)}
                        disabled={actionLoading === order.id}
                        className="flex items-center justify-center gap-2 bg-white border-2 border-gray-300 text-gray-700 py-2 px-4 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                      >
                        <XCircle size={16} />
                        {t('clientOrders.cancel')}
                      </button>
                    </>
                  )}

                  {/* IN_ESCROW: Pago realizado, trabajo en progreso */}
                  {order.status === 'IN_ESCROW' && (
                    <button
                      onClick={() => handleMarkCompleted(order.id)}
                      disabled={actionLoading === order.id}
                      className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      {actionLoading === order.id ? (
                        <Loader2 className="animate-spin h-4 w-4" />
                      ) : (
                        <>
                          <CheckCircle size={18} />
                          {t('clientOrders.markCompleted')}
                        </>
                      )}
                    </button>
                  )}

                  {/* COMPLETED: Orden finalizada */}
                  {order.status === 'COMPLETED' && (
                    <div className="flex-1 bg-gray-50 p-3 rounded-lg text-center">
                      <CheckCircle size={20} className="mx-auto text-green-600 mb-1" />
                      <p className="text-xs text-gray-700 font-medium">{t('clientOrders.completed')}</p>
                    </div>
                  )}

                  {/* CANCELLED: Orden cancelada */}
                  {order.status === 'CANCELLED' && (
                    <div className="flex-1 bg-red-50 p-3 rounded-lg text-center">
                      <XCircle size={20} className="mx-auto text-red-600 mb-1" />
                      <p className="text-xs text-red-700 font-medium">{t('clientOrders.cancelled')}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClientOrders;
