import { useTranslation } from 'react-i18next';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { format } from 'date-fns';
import { es, enUS } from 'date-fns/locale';
import { formatCurrency } from '../../../utils/dashboardHelpers';
import i18n from '../../../i18n';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div role="tooltip" className="bg-surface border border-neutral-dark/10 shadow-md rounded-lg px-3 py-2 text-sm text-neutral-dark">
      <p className="font-semibold mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.color }}>
          {p.name}:{' '}
          {p.dataKey === 'revenue'
            ? formatCurrency(p.value)
            : p.value.toLocaleString('es-CO')}
        </p>
      ))}
    </div>
  );
};

/**
 * Gráfico de líneas con doble eje: órdenes (eje izquierdo) e ingresos en COP (eje derecho).
 * El backend devuelve revenue como string decimal (Django Decimal), por eso se parsea antes de pasarlo a Recharts.
 */
const RevenueChart = ({ revenueTrend }) => {
  const { t } = useTranslation();
  const locale = i18n.language === 'es' ? es : enUS;

  if (!revenueTrend?.length) {
    return (
      <section
        role="region"
        aria-labelledby="revenue-chart-heading"
        className="bg-surface border border-neutral-dark/10 shadow-sm rounded-2xl p-6 flex flex-col items-center justify-center min-h-[320px]"
      >
        <h2 id="revenue-chart-heading" className="text-lg font-heading font-semibold text-neutral-dark mb-4">
          {t('adminDashboard.revenueTrend')}
        </h2>
        <svg className="w-12 h-12 text-neutral-dark/20 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm6 0V9a2 2 0 00-2-2h-2a2 2 0 00-2 2v10a2 2 0 002 2h2a2 2 0 002-2zm6 0V5a2 2 0 00-2-2h-2a2 2 0 00-2 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
        </svg>
        <p className="text-neutral-dark/50 font-sans text-sm">{t('adminDashboard.noTrendData')}</p>
        <p className="text-neutral-dark/40 font-sans text-xs mt-1">{t('adminDashboard.noTrendSuggestion')}</p>
      </section>
    );
  }

  const data = revenueTrend.map((item) => ({
    ...item,
    revenue: parseFloat(item.revenue),
    monthLabel: format(new Date(item.month + '-01'), 'MMM yyyy', { locale }),
  }));

  return (
    <section
      role="region"
      aria-labelledby="revenue-chart-heading"
      className="bg-surface border border-neutral-dark/10 shadow-sm rounded-2xl p-6"
    >
      <h2 id="revenue-chart-heading" className="text-lg font-heading font-semibold text-neutral-dark mb-6">
        {t('adminDashboard.revenueTrend')}
      </h2>
      <div aria-label={t('adminDashboard.revenueTrend')}>
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={data} margin={{ top: 8, right: 48, bottom: 8, left: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#EFE6DD" />
            <XAxis dataKey="monthLabel" tick={{ fill: '#4A3B32', fontSize: 12 }} />
            <YAxis
              yAxisId="left"
              orientation="left"
              tick={{ fill: '#4A3B32', fontSize: 11 }}
              tickFormatter={(v) => v.toLocaleString('es-CO')}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fill: '#C04A3E', fontSize: 11 }}
              tickFormatter={(v) => `$${(v / 1_000_000).toFixed(1)}M`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="orders"
              stroke="#4A3B32"
              strokeWidth={2.5}
              dot={{ fill: '#4A3B32', r: 4 }}
              activeDot={{ r: 6 }}
              name={t('adminDashboard.orders')}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="revenue"
              stroke="#C04A3E"
              strokeWidth={2.5}
              dot={{ fill: '#C04A3E', r: 4 }}
              activeDot={{ r: 6 }}
              name={t('adminDashboard.revenue')}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
};

export default RevenueChart;
