import { useTranslation } from 'react-i18next';
import { formatCurrency, formatNumber } from '../../../utils/dashboardHelpers';

const STATUS_ORDER = ['PENDING', 'ACCEPTED', 'IN_ESCROW', 'COMPLETED', 'CANCELLED'];

// Clases de Tailwind que referencian las variables CSS definidas en index.css
const STATUS_STYLES = {
  COMPLETED: 'bg-status-completed/10 text-status-completed border-status-completed/20',
  PENDING:   'bg-status-pending/10   text-status-pending   border-status-pending/20',
  ACCEPTED:  'bg-status-accepted/10  text-status-accepted  border-status-accepted/20',
  IN_ESCROW: 'bg-status-inEscrow/10  text-status-inEscrow  border-status-inEscrow/20',
  CANCELLED: 'bg-status-cancelled/10 text-status-cancelled border-status-cancelled/20',
};

/**
 * Lista de filas por estado de orden con conteo e ingresos.
 * Muestra etiquetas de estado como badges de colores siguiendo la paleta del sistema de diseño.
 */
const OrdersByStatus = ({ byStatus }) => {
  const { t } = useTranslation();

  return (
    <section
      role="region"
      aria-labelledby="orders-status-heading"
      className="bg-surface border border-neutral-dark/10 shadow-sm rounded-2xl p-6"
    >
      <h2
        id="orders-status-heading"
        className="text-lg font-heading font-semibold text-neutral-dark mb-6"
      >
        {t('adminDashboard.ordersByStatus')}
      </h2>

      <div className="flex flex-col gap-3">
        {STATUS_ORDER.map((status) => {
          const entry = byStatus[status];
          if (!entry) return null;
          return (
            <div
              key={status}
              className="flex items-center justify-between p-4 bg-neutral-light/60 rounded-xl border border-neutral-dark/5 hover:shadow-sm transition"
            >
              <div className="flex items-center gap-3 flex-wrap min-w-0">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold font-sans border ${STATUS_STYLES[status]} flex-shrink-0`}>
                  {t(`adminDashboard.orderStatus.${status}`)}
                </span>
                <span className="text-neutral-dark font-sans font-medium text-sm truncate">
                  {formatNumber(entry.count)} {t('adminDashboard.orders').toLowerCase()}
                </span>
              </div>
              <span className="text-neutral-dark font-heading font-bold text-sm ml-4 flex-shrink-0">
                {formatCurrency(entry.revenue)}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default OrdersByStatus;
