import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, User, FileText, Clock, CheckCircle, 
  XCircle, CreditCard, Loader2, AlertTriangle, DollarSign 
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '../api/axios';
import WorkHoursTable from '../components/orders/WorkHoursTable';
import ApproveHoursTable from '../components/orders/ApproveHoursTable';
import { usePriceSummary } from '../hooks/usePriceSummary';
import ConfirmModal from '../components/modals/ConfirmModal';

const OrderDetail = () => {
  const { t } = useTranslation();
  const { orderId } = useParams();
  const navigate = useNavigate();
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [user, setUser] = useState(null);
  const { summary, loading: summaryLoading, error: summaryError, refreshSummary } = usePriceSummary(orderId);
  
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    action: null,
    variant: 'warning'
  });

  useEffect(() => {
    fetchOrder();
    fetchUser();
  }, [orderId]);

  const fetchUser = async () => {
    try {
      const { data } = await api.get('/users/me/');
      setUser(data);
    } catch (err) {
      console.error('Error fetching user:', err);
    }
  };

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/orders/${orderId}/`);
      setOrder(data);
    } catch (err) {
      console.error('Error fetching order:', err);
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
  setConfirmModal({ isOpen: false, action: null });
  
  // Validación: No permitir completar sin precio acordado
  if (newStatus === 'COMPLETED' && (!summary || parseFloat(summary.agreed_price) === 0)) {
    alert(t('orders.cannotCompleteWithoutApprovedHours'));
    return;
  }
  
  try {
    setActionLoading(true);
    await api.patch(`/orders/${orderId}/status/`, { status: newStatus });
    await fetchOrder();
    await refreshSummary();
  } catch (error) {
    console.error('Error updating status:', error);
    
    // Extraer mensaje de error
    let errorMessage = t('orders.errorUpdatingStatus');
    
    if (error.response?.data) {
      if (error.response.data.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.response.data.error) {
        errorMessage = error.response.data.error;
      } else if (typeof error.response.data === 'string') {
        errorMessage = error.response.data;
      }
    }
    
        alert(errorMessage);
    } finally {
        setActionLoading(false);
    }
  };

  const openConfirmModal = (action, variant = 'warning') => {
    setConfirmModal({ isOpen: true, action, variant });
  };

  const getStatusBadge = (status) => {
    const styles = {
      PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      ACCEPTED: 'bg-blue-100 text-blue-800 border-blue-300',
      IN_ESCROW: 'bg-green-100 text-green-800 border-green-300',
      COMPLETED: 'bg-gray-100 text-gray-800 border-gray-300',
      CANCELLED: 'bg-red-100 text-red-800 border-red-300'
    };

    const labels = {
      PENDING: t('orderStatus.pending'),
      ACCEPTED: t('orderStatus.accepted'),
      IN_ESCROW: t('orderStatus.inEscrow'),
      COMPLETED: t('orderStatus.completed'),
      CANCELLED: t('orderStatus.cancelled')
    };

    return (
      <span className={`px-4 py-2 rounded-full text-sm font-bold border ${styles[status] || 'bg-gray-100'}`}>
        {labels[status] || status}
      </span>
    );
  };

  const getModalData = () => {
    const { action } = confirmModal;
    
    if (action === 'payment') {
      return {
        title: t('clientOrders.confirmPaymentTitle'),
        message: t('clientOrders.confirmPayment'),
        confirmText: t('clientOrders.confirmPaymentButton'),
        variant: 'success'
      };
    } else if (action === 'complete') {
      return {
        title: t('clientOrders.confirmCompleteTitle'),
        message: t('clientOrders.confirmComplete'),
        confirmText: t('clientOrders.confirmCompleteButton'),
        variant: 'success'
      };
    } else if (action === 'cancel') {
      return {
        title: t('clientOrders.confirmCancelTitle'),
        message: t('clientOrders.confirmCancel'),
        confirmText: t('clientOrders.confirmCancelButton'),
        variant: 'danger'
      };
    }
    
    return {};
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-light to-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin text-primary mx-auto mb-4" size={48} />
          <p className="text-neutral-dark/60 font-medium">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  const isWorker = user.role === 'WORKER';
  const isClient = user.role === 'CLIENT';
  const modalData = getModalData();

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-light to-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-neutral-dark/60 hover:text-primary mb-4 font-medium transition-colors cursor-pointer"
          >
            <ArrowLeft size={20} />
            {t('common.backToDashboard')}
          </Link>

          <div className="bg-white rounded-2xl shadow-sm border border-neutral-dark/5 p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="font-heading text-3xl font-bold text-neutral-dark mb-2">
                  {t('orders.orderNumber', { number: order.id })}
                </h1>
                <p className="text-neutral-dark/60">
                  {t('orders.createdOn')} {new Date(order.created_at).toLocaleDateString('es-CO', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              {getStatusBadge(order.status)}
            </div>
          </div>
        </div>

        {/* Order Info */}
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-dark/5 p-6">
          <h2 className="font-heading text-xl font-bold text-neutral-dark mb-4 flex items-center gap-2">
            <FileText className="text-primary" size={24} />
            {t('orders.orderInformation')}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">{isWorker ? t('orders.client') : t('orders.worker')}</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <User size={20} className="text-primary" />
                </div>
                <div>
                  <p className="font-bold text-neutral-dark">
                    {isWorker ? order.client_email : order.worker_name}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-2">{t('orders.description')}</p>
              <p className="text-neutral-dark bg-gray-50 p-3 rounded-lg">
                {order.description}
              </p>
            </div>
          </div>
        </div>

        {/* Solo mostrar sistema de horas si es pago por horas */}
        {(!order.agreed_price || parseFloat(order.agreed_price) === 0) ? (
          <>
            {/* Sistema de Horas */}
            {isWorker && (
              <WorkHoursTable 
                orderId={orderId} 
                workerRate={parseFloat(order.worker_hourly_rate) || 0}
                orderStatus={order.status}
                onHoursChanged={refreshSummary}
              />
            )}

            {isClient && (
              <ApproveHoursTable 
                orderId={orderId}
                orderStatus={order.status}
                refreshSummary={refreshSummary}
              />
            )}
          </>
        ) : (
          /* Precio Fijo - Mostrar precio acordado */
          <div className="bg-white rounded-2xl shadow-sm border border-neutral-dark/5 p-6">
            <h2 className="font-heading text-xl font-bold text-neutral-dark mb-4 flex items-center gap-2">
              <DollarSign className="text-primary" size={24} />
              {t('orders.agreedPrice')}
            </h2>
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
              <p className="text-sm text-gray-600 mb-2">{t('orders.fixedPriceAgreement')}</p>
              <p className="text-5xl font-bold text-primary">
                ${parseFloat(order.agreed_price).toLocaleString('es-CO')}
              </p>
            </div>
          </div>
        )}

        {/* Actions */}
        {isClient && (
          <div className="bg-white rounded-2xl shadow-sm border border-neutral-dark/5 p-6">
            <h2 className="font-heading text-xl font-bold text-neutral-dark mb-4">
              {t('orders.actions')}
            </h2>

            <div className="space-y-3">
              {/* ACCEPTED */}
              {order.status === 'ACCEPTED' && (
                <>
                  {summary && summary.agreed_price > 0 ? (
                    <button
                      onClick={() => openConfirmModal('payment', 'success')}
                      disabled={actionLoading}
                      className="w-full bg-primary hover:bg-[#a83f34] text-white font-bold py-4 rounded-xl flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                    >
                      {actionLoading ? (
                        <Loader2 className="animate-spin" size={22} />
                      ) : (
                        <>
                          <CreditCard size={22} />
                          {t('clientOrders.simulatePayment')} (${parseFloat(summary.agreed_price).toLocaleString('es-CO')})
                        </>
                      )}
                    </button>
                  ) : (
                    <div className="p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded-r-xl">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="text-yellow-600 shrink-0 mt-0.5" size={20} />
                        <div>
                          <p className="text-yellow-800 font-semibold text-sm mb-1">
                            {t('orders.cannotPayYet')}
                          </p>
                          <p className="text-yellow-700 text-xs">
                            {t('orders.approveHoursBeforePayment')}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <button
                    onClick={() => openConfirmModal('cancel', 'danger')}
                    disabled={actionLoading}
                    className="w-full bg-white border-2 border-red-300 text-red-700 font-medium py-3 rounded-xl hover:bg-red-50 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <XCircle size={20} />
                    {t('clientOrders.cancel')}
                  </button>
                </>
              )}

              {/* IN_ESCROW */}
              {order.status === 'IN_ESCROW' && (
                <button
                  onClick={() => openConfirmModal('complete', 'success')}
                  disabled={actionLoading}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transition-all cursor-pointer"
                >
                  {actionLoading ? (
                    <Loader2 className="animate-spin" size={22} />
                  ) : (
                    <>
                      <CheckCircle size={22} />
                      {t('clientOrders.markCompleted')}
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, action: null })}
        onConfirm={() => {
          if (confirmModal.action === 'payment') handleStatusChange('IN_ESCROW');
          else if (confirmModal.action === 'complete') handleStatusChange('COMPLETED');
          else if (confirmModal.action === 'cancel') handleStatusChange('CANCELLED');
        }}
        title={modalData.title}
        message={modalData.message}
        confirmText={modalData.confirmText}
        cancelText={t('common.cancel')}
        variant={modalData.variant}
      />
    </div>
  );
};

export default OrderDetail;
