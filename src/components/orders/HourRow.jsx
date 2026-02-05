/**
 * Componentes compartidos para visualización de horas de trabajo
 */

import React from 'react';
import { Clock, CheckCircle, AlertCircle, Edit, Trash2, Loader2, XCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

/**
 * Componente de fila de horas con formato de fecha
 */
export const DateCell = ({ date }) => (
  <span className="text-sm font-medium text-gray-900">
    {new Date(date).toLocaleDateString('es-CO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })}
  </span>
);

/**
 * Componente de badge de horas
 */
export const HoursBadge = ({ hours }) => (
  <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-bold">
    <Clock size={14} />
    {parseFloat(hours).toFixed(1)}h
  </span>
);

/**
 * Componente de badge de estado de aprobación
 */
export const ApprovalStatusBadge = ({ approved }) => {
  const { t } = useTranslation();
  
  return approved ? (
    <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
      <CheckCircle size={14} />
      {t('orders.approved')}
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold">
      <AlertCircle size={14} />
      {t('orders.pending')}
    </span>
  );
};

/**
 * Componente de monto de pago formateado
 */
export const PaymentAmount = ({ amount }) => (
  <span className="text-lg font-bold text-gray-900">
    ${parseFloat(amount).toLocaleString('es-CO')}
  </span>
);

/**
 * Botones de acción para horas aprobadas (aprobar/revocar)
 */
export const ApprovalActions = ({ hour, isApproving, onApprove, canApprove }) => {
  const { t } = useTranslation();
  
  if (!canApprove) return null;
  
  return hour.approved_by_client ? (
    <button
      onClick={() => onApprove(hour.id, false)}
      disabled={isApproving}
      className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 font-medium text-sm transition-all disabled:opacity-50 cursor-pointer"
    >
      {isApproving ? (
        <Loader2 size={16} className="animate-spin" />
      ) : (
        <XCircle size={16} />
      )}
      {t('orders.revoke')}
    </button>
  ) : (
    <button
      onClick={() => onApprove(hour.id, true)}
      disabled={isApproving}
      className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm transition-all disabled:opacity-50 shadow-sm hover:shadow-md cursor-pointer"
    >
      {isApproving ? (
        <Loader2 size={16} className="animate-spin" />
      ) : (
        <CheckCircle size={16} />
      )}
      {t('orders.approve')}
    </button>
  );
};

/**
 * Botones de acción para trabajador (editar/eliminar)
 */
export const WorkerActions = ({ hour, isDeletingThis, onEdit, onDelete }) => {
  const { t } = useTranslation();
  
  if (hour.approved_by_client) {
    return (
      <span className="text-xs text-gray-400 text-center block">
        {t('orders.approved')}
      </span>
    );
  }
  
  return (
    <div className="flex items-center justify-center gap-2">
      <button
        onClick={() => onEdit(hour)}
        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
        title={t('common.edit')}
      >
        <Edit size={18} />
      </button>
      <button
        onClick={() => onDelete(hour.id)}
        disabled={isDeletingThis}
        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
        title={t('common.delete')}
      >
        {isDeletingThis ? (
          <Loader2 size={18} className="animate-spin" />
        ) : (
          <Trash2 size={18} />
        )}
      </button>
    </div>
  );
};

/**
 * Tabla vacía de horas
 */
export const EmptyHoursState = ({ message, subtitle }) => (
  <div className="text-center py-12 bg-gray-50 rounded-xl">
    <Clock className="mx-auto text-gray-300 mb-4" size={64} />
    <p className="text-gray-500 text-lg mb-2">{message}</p>
    <p className="text-gray-400 text-sm">{subtitle}</p>
  </div>
);
