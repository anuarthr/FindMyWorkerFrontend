import { useState } from 'react';
import { CheckCircle, XCircle, Clock, Loader2, AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useWorkHours } from '../../hooks/useWorkHours';
import PriceSummaryCard from './PriceSummaryCard';
import { usePriceSummary } from '../../hooks/usePriceSummary';

const ApproveHoursTable = ({ orderId, orderStatus }) => {
  const { t } = useTranslation();
  const { hours, loading, approveHours } = useWorkHours(orderId);
  const { summary, loading: summaryLoading, refreshSummary } = usePriceSummary(orderId);
  const [approvingId, setApprovingId] = useState(null);

  const canApproveHours = ['ACCEPTED', 'IN_ESCROW'].includes(orderStatus);

  const handleApprove = async (hourId, approved) => {
    try {
      setApprovingId(hourId);
      await approveHours(hourId, approved);
      await refreshSummary();
    } catch (err) {
      alert(t('orders.errorApprovingHours'));
    } finally {
      setApprovingId(null);
    }
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
    <div className="space-y-6">
      
      {/* Price Summary */}
      <PriceSummaryCard summary={summary} loading={summaryLoading} />

      {/* Hours Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-neutral-dark/5 p-6">
        
        {/* Header */}
        <div className="mb-6">
          <h2 className="font-heading text-2xl font-bold text-neutral-dark flex items-center gap-2">
            <Clock className="text-primary" size={28} />
            {t('orders.registeredHours')}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {t('orders.reviewAndApproveHours')}
          </p>
        </div>

        {/* Empty State */}
        {hours.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <Clock className="mx-auto text-gray-300 mb-4" size={64} />
            <p className="text-gray-500 text-lg mb-2">{t('orders.noHoursRegistered')}</p>
            <p className="text-gray-400 text-sm">{t('orders.workerWillRegisterSoon')}</p>
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
                      <span className="text-sm font-medium text-gray-900">
                        {new Date(log.date).toLocaleDateString('es-CO', {
                          weekday: 'short',
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-bold">
                        <Clock size={14} />
                        {parseFloat(log.hours).toFixed(1)}h
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-sm text-gray-700">{log.description}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {t('orders.workerName')}: {log.worker_name}
                      </p>
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
                          <AlertTriangle size={14} />
                          {t('orders.pending')}
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-center">
                      {canApproveHours && (
                        log.approved_by_client ? (
                          <button
                            onClick={() => handleApprove(log.id, false)}
                            disabled={approvingId === log.id}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 font-medium text-sm transition-all disabled:opacity-50 cursor-pointer"
                          >
                            {approvingId === log.id ? (
                              <Loader2 size={16} className="animate-spin" />
                            ) : (
                              <XCircle size={16} />
                            )}
                            {t('orders.revoke')}
                          </button>
                        ) : (
                          <button
                            onClick={() => handleApprove(log.id, true)}
                            disabled={approvingId === log.id}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm transition-all disabled:opacity-50 shadow-sm hover:shadow-md cursor-pointer"
                          >
                            {approvingId === log.id ? (
                              <Loader2 size={16} className="animate-spin" />
                            ) : (
                              <CheckCircle size={16} />
                            )}
                            {t('orders.approve')}
                          </button>
                        )
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer Info */}
        {hours.length > 0 && summary && summary.payment_pending > 0 && canApproveHours && (
          <div className="mt-6 p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded-r-xl">
            <div className="flex items-start gap-3">
              <AlertTriangle className="text-yellow-600 shrink-0 mt-0.5" size={20} />
              <div>
                <p className="text-yellow-800 font-semibold text-sm mb-1">
                  {t('orders.pendingApprovalWarning')}
                </p>
                <p className="text-yellow-700 text-xs">
                  {t('orders.approvePendingHoursToPayment')}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApproveHoursTable;