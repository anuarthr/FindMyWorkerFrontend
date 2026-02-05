import { useState, useCallback } from 'react';
import { Clock, Loader2, AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useWorkHours } from '../../hooks/useWorkHours';
import PriceSummaryCard from './PriceSummaryCard';
import { usePriceSummary } from '../../hooks/usePriceSummary';
import { DateCell, HoursBadge, ApprovalStatusBadge, PaymentAmount, ApprovalActions, EmptyHoursState } from './HourRow';

const ApproveHoursTable = ({ orderId, orderStatus }) => {
  const { t } = useTranslation();
  const { hours, loading, approveHours } = useWorkHours(orderId);
  const { summary, loading: summaryLoading, refreshSummary } = usePriceSummary(orderId);
  const [approvingId, setApprovingId] = useState(null);

  const canApproveHours = ['ACCEPTED', 'IN_ESCROW'].includes(orderStatus);

  const handleApprove = useCallback(async (hourId, approved) => {
    try {
      setApprovingId(hourId);
      await approveHours(hourId, approved);
      await refreshSummary();
    } catch (err) {
      alert(t('orders.errorApprovingHours'));
    } finally {
      setApprovingId(null);
    }
  }, [approveHours, refreshSummary, t]);

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
          <EmptyHoursState 
            message={t('orders.noHoursRegistered')}
            subtitle={t('orders.workerWillRegisterSoon')}
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
                      <DateCell date={log.date} />
                    </td>
                    <td className="py-4 px-4 text-center">
                      <HoursBadge hours={log.hours} />
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-sm text-gray-700">{log.description}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {t('orders.workerName')}: {log.worker_name}
                      </p>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <PaymentAmount amount={log.calculated_payment} />
                    </td>
                    <td className="py-4 px-4 text-center">
                      <ApprovalStatusBadge approved={log.approved_by_client} />
                    </td>
                    <td className="py-4 px-4 text-center">
                      <ApprovalActions
                        hour={log}
                        isApproving={approvingId === log.id}
                        onApprove={handleApprove}
                        canApprove={canApproveHours}
                      />
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