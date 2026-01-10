import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { listMyOrders, updateOrderStatus } from '../../api/orders';
import { Clock, CheckCircle, XCircle, User, FileText, ArrowRight } from 'lucide-react';
import ConfirmModal from '../modals/ConfirmModal'; // ← NUEVO IMPORT

const WorkerOrders = () => {
  const { t } = useTranslation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [actionLoading, setActionLoading] = useState(null);
  
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    action: null,
    orderId: null
  });

  useEffect(() => {
    fetchOrders();
  }, [filter]);

  const getStatusLabel = (status) => {
  const statusMap = {
    'PENDING': t('orderStatus.pending'),
    'ACCEPTED': t('orderStatus.accepted'),
    'IN_ESCROW': t('orderStatus.inEscrow'),
    'COMPLETED': t('orderStatus.completed'),
    'CANCELLED': t('orderStatus.cancelled')
  };
  return statusMap[status] || status;
};

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

  const openConfirmModal = (action, orderId) => {
    setConfirmModal({ isOpen: true, action, orderId });
  };

  const closeConfirmModal = () => {
    setConfirmModal({ isOpen: false, action: null, orderId: null });
  };

  const handleConfirmedAction = async () => {
    const { action, orderId } = confirmModal;
    
    try {
      setActionLoading(orderId);
      
      if (action === 'accept') {
        await updateOrderStatus(orderId, 'ACCEPTED');
      } else if (action === 'reject') {
        await updateOrderStatus(orderId, 'CANCELLED');
      }
      
      await fetchOrders();
    } catch (error) {
      console.error(`Error ${action}ing order:`, error);
      alert(t(`workerOrders.error${action.charAt(0).toUpperCase() + action.slice(1)}ing`));
    } finally {
      setActionLoading(null);
    }
  };

  const getModalData = () => {
    const { action } = confirmModal;
    
    if (action === 'accept') {
      return {
        title: t('workerOrders.confirmAcceptTitle'),
        message: t('workerOrders.confirmAccept'),
        confirmText: t('workerOrders.accept'),
        variant: 'success'
      };
    } else if (action === 'reject') {
      return {
        title: t('workerOrders.confirmRejectTitle'),
        message: t('workerOrders.confirmReject'),
        confirmText: t('workerOrders.reject'),
        variant: 'danger'
      };
    }
    
    return {};
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
        {getStatusLabel(status)}
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C04A3E]"></div>
      </div>
    );
  }

  const modalData = getModalData();

  return (
    <>
      <div className="space-y-6">
        
        {/* Header y Filtros */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-[#4A3B32]">{t('workerOrders.title')}</h2>
            <p className="text-gray-600 text-sm mt-1">{t('workerOrders.subtitle')}</p>
          </div>

          <div className="flex gap-2 flex-wrap">
            {['ALL', 'PENDING', 'ACCEPTED', 'IN_ESCROW', 'COMPLETED'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium cursor-pointer hover:scale-[1.02] transition-all ${
                  filter === status
                    ? 'bg-[#C04A3E] text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {t(`workerOrders.filter.${status.toLowerCase()}`)}
              </button>
            ))}
          </div>
        </div>

        {/* Lista de Órdenes */}
        {orders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <FileText size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">{t('workerOrders.noOrders')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div 
                key={order.id} 
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#EFE6DD] flex items-center justify-center">
                          <User size={20} className="text-[#4A3B32]" />
                        </div>
                        <div>
                          <p className="font-bold text-[#4A3B32]">{order.client_email}</p>
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            <Clock size={12} />
                            {formatDate(order.created_at)}
                          </p>
                        </div>
                      </div>
                      {getStatusBadge(order.status)}
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4 mb-3">
                      <p className="text-sm font-medium text-gray-700 mb-1">{t('workerOrders.description')}:</p>
                      <p className="text-gray-600 text-sm leading-relaxed">{order.description}</p>
                    </div>

                    {order.agreed_price && (
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">{t('workerOrders.agreedPrice')}:</span> ${Number(order.agreed_price).toLocaleString()}
                      </p>
                    )}

                    {order.status === 'IN_ESCROW' && (
                      <div className="mt-3">
                        <Link
                          to={`/orders/${order.id}`}
                          className="inline-flex items-center gap-2 text-primary hover:text-[#a83f34] font-medium text-sm transition-colors"
                        >
                          <Clock size={16} />
                          {t('orders.registerHours')}
                          <ArrowRight size={16} />
                        </Link>
                      </div>
                    )}
                  </div>

                  {order.status === 'PENDING' && (
                    <div className="flex md:flex-col gap-2 md:w-40">
                      <button
                        onClick={() => openConfirmModal('accept', order.id)}
                        disabled={actionLoading === order.id}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-[#C04A3E] text-white py-2.5 px-4 rounded-lg font-medium hover:bg-[#a83f34] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed cursor-pointer hover:scale-[1.02] transition-all"
                      >
                        {actionLoading === order.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        ) : (
                          <>
                            <CheckCircle size={18} />
                            {t('workerOrders.accept')}
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => openConfirmModal('reject', order.id)}
                        disabled={actionLoading === order.id}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white border-2 border-gray-300 text-gray-700 py-2.5 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer hover:scale-[1.02] transition-all"
                      >
                        <XCircle size={18} />
                        {t('workerOrders.reject')}
                      </button>
                    </div>
                  )}

                  {order.status === 'ACCEPTED' && (
                    <div className="flex items-center justify-center md:w-40 text-center">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="text-xs text-blue-800 font-medium">{t('workerOrders.waitingPayment')} </p>
                      </div>
                    </div>
                  )}

                  {order.status === 'IN_ESCROW' && (
                    <div className="flex items-center justify-center md:w-40 text-center">
                      <div className="bg-green-50 p-4 rounded-lg">
                        <p className="text-xs text-green-800 font-medium">{t('workerOrders.inProgress')}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={closeConfirmModal}
        onConfirm={handleConfirmedAction}
        title={modalData.title}
        message={modalData.message}
        confirmText={modalData.confirmText}
        cancelText={t('common.cancel')}
        variant={modalData.variant}
      />
    </>
  );
};

export default WorkerOrders;
