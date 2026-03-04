import { useTranslation } from 'react-i18next';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, LabelList, Cell,
} from 'recharts';

const BAR_COLORS = ['#C04A3E', '#D4614D', '#E37B5B', '#E88A6E', '#EFA082',
                    '#C04A3E', '#D4614D', '#E37B5B', '#E88A6E', '#EFA082'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div role="tooltip" className="bg-surface border border-neutral-dark/10 shadow-md rounded-lg px-3 py-2 text-sm text-neutral-dark">
      <p className="font-semibold mb-1">{label}</p>
      <p>{payload[0].value} trabajadores</p>
    </div>
  );
};

/**
 * Gráfico de barras horizontales con las 10 profesiones más demandadas.
 */
const ProfessionChart = ({ professionStatistics }) => {
  const { t } = useTranslation();

  if (!professionStatistics?.length) {
    return (
      <section
        role="region"
        aria-labelledby="prof-chart-heading"
        className="bg-surface border border-neutral-dark/10 shadow-sm rounded-2xl p-6 flex flex-col items-center justify-center min-h-[320px]"
      >
        <h2 id="prof-chart-heading" className="text-lg font-heading font-semibold text-neutral-dark mb-4">
          {t('adminDashboard.topProfessions')}
        </h2>
        <svg className="w-12 h-12 text-neutral-dark/20 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M17 20h5v-2a4 4 0 00-5-3.87M9 20H4v-2a4 4 0 015-3.87m6-4a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
        <p className="text-neutral-dark/50 font-sans text-sm">{t('adminDashboard.noWorkersYet')}</p>
      </section>
    );
  }

  const data = professionStatistics.map((item) => ({
    ...item,
    label: t(`adminDashboard.professions.${item.profession}`, { defaultValue: item.profession }),
  }));

  return (
    <section
      role="region"
      aria-labelledby="prof-chart-heading"
      className="bg-surface border border-neutral-dark/10 shadow-sm rounded-2xl p-6"
    >
      <h2 id="prof-chart-heading" className="text-lg font-heading font-semibold text-neutral-dark mb-6">
        {t('adminDashboard.topProfessions')}
      </h2>
      <div aria-label={t('adminDashboard.topProfessions')}>
        <ResponsiveContainer width="100%" height={Math.max(300, data.length * 44)}>
          <BarChart data={data} layout="vertical" margin={{ right: 48, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#EFE6DD" horizontal={false} />
            <XAxis type="number" tick={{ fill: '#4A3B32', fontSize: 12 }} />
            <YAxis
              type="category"
              dataKey="label"
              width={130}
              tick={{ fill: '#4A3B32', fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="worker_count" radius={[0, 8, 8, 0]}>
              {data.map((_, i) => (
                <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
              ))}
              <LabelList
                dataKey="worker_count"
                position="right"
                style={{ fill: '#4A3B32', fontWeight: 600, fontSize: 12 }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
};

export default ProfessionChart;
