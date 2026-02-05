import { useState, useCallback } from 'react';
import { Plus, Clock, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useWorkHours } from '../../hooks/useWorkHours';
import RegisterHoursModal from './RegisterHoursModal';
import { DateCell, HoursBadge, ApprovalStatusBadge, PaymentAmount, WorkerActions, EmptyHoursState } from './HourRow';

const WorkHoursTable = ({ orderId, workerRate, orderStatus }) => {
  const { t } = useTranslation();
  const { hours, loading, registerHours, updateHours, deleteHours } = useWorkHours(orderId);
  const [showModal, setShowModal] = useState(false);
  const [editingHour, setEditingHour] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const validWorkerRate = parseFloat(workerRate) || 0;
  const canRegisterHours = ['ACCEPTED', 'IN_ESCROW'].includes(orderStatus);

  const handleEdit = useCallback((hour) => {
    setEditingHour(hour);
    setShowModal(true);
  }, []);

  const handleDelete = useCallback(async (hourId) => {
    if (!confirm(t('orders.confirmDeleteHours'))) return;
    
    try {
      setDeletingId(hourId);
      await deleteHours(hourId);
    } catch (err) {
      alert(t('orders.errorDeletingHours'));
    } finally {
      setDeletingId(null);
    }
  }, [deleteHours, t]);

  const handleSubmit = useCallback(async (data) => {
    if (editingHour) {
      await updateHours(editingHour.id, data);
    } else {
      await registerHours(data);
    }
  }, [editingHour, updateHours, registerHours]);

  const handleCloseModal = useCallback(() => {
    setShowModal(false);
    setEditingHour(null);
  }, []);

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
        <EmptyHoursState 
          message={t('orders.noHoursRegistered')}
          subtitle={t('orders.clickRegisterToStart')}
        />
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
                      <DateCell date={log.date} />
                    </div>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <HoursBadge hours={log.hours} />
                  </td>
                  <td className="py-4 px-4">
                    <p className="text-sm text-gray-700 line-clamp-2">{log.description}</p>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <PaymentAmount amount={log.calculated_payment} />
                  </td>
                  <td className="py-4 px-4 text-center">
                    <ApprovalStatusBadge approved={log.approved_by_client} />
                  </td>
                  <td className="py-4 px-4">
                    <WorkerActions
                      hour={log}
                      isDeletingThis={deletingId === log.id}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
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
