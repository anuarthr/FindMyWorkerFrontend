/**
 * Componente de resumen de costos de orden
 * Muestra horas aprobadas, horas pendientes y precio total acordado
 * 
 * @param {Object} summary - Resumen de costos con horas y pagos
 * @param {boolean} loading - Estado de carga del resumen
 */

import { DollarSign, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const PriceSummaryCard = ({ summary, loading }) => {
  const { t } = useTranslation();

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200 animate-pulse">
        <div className="h-6 bg-blue-200 rounded w-1/2 mb-4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-blue-200 rounded w-3/4"></div>
          <div className="h-4 bg-blue-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (!summary) return null;

  return (
    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200 shadow-sm">
      <h3 className="font-heading text-xl font-bold text-neutral-dark mb-4 flex items-center gap-2">
        <DollarSign className="text-primary" size={24} />
        {t('orders.costSummary')}
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Horas Aprobadas */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 text-green-600 mb-2">
            <CheckCircle size={18} />
            <p className="text-sm font-medium">{t('orders.approvedHours')}</p>
          </div>
          <p className="text-2xl font-bold text-neutral-dark">
            {parseFloat(summary.total_hours_approved || 0).toFixed(1)}h
          </p>
          <p className="text-sm text-gray-600 mt-1">
            ${parseFloat(summary.payment_approved || 0).toLocaleString('es-CO')}
          </p>
        </div>

        {/* Horas Pendientes */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 text-yellow-600 mb-2">
            <Clock size={18} />
            <p className="text-sm font-medium">{t('orders.pendingHours')}</p>
          </div>
          <p className="text-2xl font-bold text-neutral-dark">
            {parseFloat(summary.total_hours_pending || 0).toFixed(1)}h
          </p>
          <p className="text-sm text-gray-600 mt-1">
            ${parseFloat(summary.payment_pending || 0).toLocaleString('es-CO')}
          </p>
        </div>
      </div>

      {/* Precio Total */}
      <div className="mt-4 pt-4 border-t border-blue-200">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">
            {t('orders.agreedPrice')}:
          </span>
          <span className="text-3xl font-bold text-primary">
            ${parseFloat(summary.agreed_price || 0).toLocaleString('es-CO')}
          </span>
        </div>
        
        {summary.payment_pending > 0 && (
          <p className="text-xs text-yellow-700 mt-2 flex items-center gap-1">
            <AlertCircle size={14} />
            {t('orders.pendingApproval')}: +${parseFloat(summary.payment_pending).toLocaleString('es-CO')}
          </p>
        )}
      </div>

      {/* Tarifa por Hora */}
      <div className="mt-3 text-center text-xs text-gray-600">
        {t('orders.hourlyRate')}: ${parseFloat(summary.worker_hourly_rate || 0).toLocaleString('es-CO')}/h
      </div>
    </div>
  );
};

export default PriceSummaryCard;
