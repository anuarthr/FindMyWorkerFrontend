import { useTranslation } from 'react-i18next';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { formatNumber } from '../../../utils/dashboardHelpers';

const ROLE_COLORS = {
  CLIENT:  '#E37B5B',
  WORKER:  '#C04A3E',
  ADMIN:   '#4A3B32',
  COMPANY: '#556B2F',
};

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      role="tooltip"
      className="bg-surface border border-neutral-dark/10 shadow-md rounded-lg px-3 py-2 text-sm text-neutral-dark"
    >
      <p className="font-semibold">{payload[0].name}</p>
      <p>{formatNumber(payload[0].value)} usuarios</p>
    </div>
  );
};

/**
 * Gráfico de dona + tabla desglosada con el conteo de usuarios por rol.
 */
const UserStatsSection = ({ userStatistics }) => {
  const { t } = useTranslation();
  const { by_role, total } = userStatistics;

  const chartData = Object.entries(by_role)
    .filter(([, count]) => count > 0)
    .map(([role, count]) => ({
      role: t(`adminDashboard.roles.${role}`),
      rawRole: role,
      count,
    }));

  return (
    <section
      role="region"
      aria-labelledby="user-dist-heading"
      className="bg-surface border border-neutral-dark/10 shadow-sm rounded-2xl p-6"
    >
      <h2
        id="user-dist-heading"
        className="text-lg font-heading font-semibold text-neutral-dark mb-6"
      >
        {t('adminDashboard.userDistribution')}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        {/* Doughnut */}
        <div aria-label={t('adminDashboard.userDistribution')}>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={chartData}
                dataKey="count"
                nameKey="role"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
              >
                {chartData.map((entry) => (
                  <Cell key={entry.rawRole} fill={ROLE_COLORS[entry.rawRole]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                formatter={(value) => (
                  <span className="text-sm text-neutral-dark font-sans">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Tabla breakdown */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm font-sans">
            <thead>
              <tr className="border-b border-neutral-dark/10">
                <th className="text-left py-2 text-neutral-dark/60 font-medium">Rol</th>
                <th className="text-right py-2 text-neutral-dark/60 font-medium">Total</th>
                <th className="text-right py-2 text-neutral-dark/60 font-medium">%</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(by_role).map(([role, count]) => (
                <tr
                  key={role}
                  className="border-b border-neutral-dark/5 hover:bg-neutral-light/60 transition"
                >
                  <td className="py-3 flex items-center gap-2">
                    <span
                      className="inline-block w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: ROLE_COLORS[role] }}
                      aria-hidden="true"
                    />
                    {t(`adminDashboard.roles.${role}`)}
                  </td>
                  <td className="py-3 text-right font-semibold text-neutral-dark">
                    {formatNumber(count)}
                  </td>
                  <td className="py-3 text-right text-neutral-dark/60">
                    {total > 0
                      ? `${((count / total) * 100).toFixed(1)}%`
                      : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

export default UserStatsSection;
