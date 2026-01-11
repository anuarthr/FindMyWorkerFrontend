import { useState } from 'react';
import { Plus, Edit, Trash2, Clock, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useWorkHours } from '../../hooks/useWorkHours';
import RegisterHoursModal from './RegisterHoursModal';

const WorkHoursTable = ({ orderId, workerRate, orderStatus }) => {
  const { t } = useTranslation();
  const { hours, loading, registerHours, updateHours, deleteHours } = useWorkHours(orderId);
  const [showModal, setShowModal] = useState(false);
  const [editingHour, setEditingHour] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const validWorkerRate = parseFloat(workerRate) || 0;
  const canRegisterHours = ['ACCEPTED', 'IN_ESCROW'].includes(orderStatus);

  const handleEdit = (hour) => {
    setEditingHour(hour);
    setShowModal(true);
  };

  const handleDelete = async (hourId) => {
    if (!confirm(t('orders.confirmDeleteHours'))) return;
    
    try {
      setDeletingId(hourId);
      await deleteHours(hourId);
    } catch (err) {
      alert(t('orders.errorDeletingHours'));
    } finally {
      setDeletingId(null);
    }
  };

  const handleSubmit = async (data) => {
    if (editingHour) {
      await updateHours(editingHour.id, data);
    } else {
      await registerHours(data);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingHour(null);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-neutral-dark/5 p-8 text-center">
        <Loader2 className="animate-spin text-primary mx-auto mb-4" size={48} />
        <p className="text-gray-600">{t('common.loading')}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-neutral-dark/5 p-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="font-heading text-2xl font-bold text-neutral-dark flex items-center gap-2">
            <Clock className="text-primary" size={28} />
            {t('orders.workHours')}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {t('orders.registerDailyHours')}
          </p>
        </div>
        
        {canRegisterHours && (
          <button
            onClick={() => setShowModal(true)}
            className="bg-gradient-to-r from-primary to-[#a83f34] text-white px-5 py-3 rounded-xl font-medium hover:shadow-lg transition-all flex items-center gap-2 group"
          >
            <Plus size={20} className="group-hover:rotate-90 transition-transform" />
            {t('orders.registerHours')}
          </button>
        )}
      </div>

      {/* Empty State */}
      {hours.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <Clock className="mx-auto text-gray-300 mb-4" size={64} />
          <p className="text-gray-500 text-lg mb-2">{t('orders.noHoursRegistered')}</p>
          <p className="text-gray-400 text-sm">{t('orders.clickRegisterToStart')}</p>
        </div>
      ) : (
        /* Table */
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">{t('orders.date')}</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">{t('orders.hours')}</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">{t('orders.description')}</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">{t('orders.payment')}</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">{t('orders.status')}</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {hours.map((log) => (
                <tr key={log.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900">
                        {new Date(log.date).toLocaleDateString('es-CO', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-bold">
                      <Clock size={14} />
                      {parseFloat(log.hours).toFixed(1)}h
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <p className="text-sm text-gray-700 line-clamp-2">{log.description}</p>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <span className="text-lg font-bold text-gray-900">
                      ${parseFloat(log.calculated_payment).toLocaleString('es-CO')}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    {log.approved_by_client ? (
                      <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
                        <CheckCircle size={14} />
                        {t('orders.approved')}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold">
                        <AlertCircle size={14} />
                        {t('orders.pending')}
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    {!log.approved_by_client ? (
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEdit(log)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title={t('common.edit')}
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(log.id)}
                          disabled={deletingId === log.id}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                          title={t('common.delete')}
                        >
                          {deletingId === log.id ? (
                            <Loader2 size={18} className="animate-spin" />
                          ) : (
                            <Trash2 size={18} />
                          )}
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400 text-center block">
                        {t('orders.approved')}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <RegisterHoursModal
          orderId={orderId}
          workerRate={validWorkerRate}
          onClose={handleCloseModal}
          onSuccess={handleSubmit}
          editData={editingHour}
        />
      )}
    </div>
  );
};

export default WorkHoursTable;
