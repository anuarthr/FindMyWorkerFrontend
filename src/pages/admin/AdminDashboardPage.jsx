import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { formatDistanceToNow } from 'date-fns';
import { es, enUS } from 'date-fns/locale';
import { useDashboardMetrics } from '../../hooks/useDashboardMetrics';
import DashboardSkeleton from '../../components/admin/dashboard/DashboardSkeleton';
import StatCard from '../../components/admin/dashboard/StatCard';
import UserStatsSection from '../../components/admin/dashboard/UserStatsSection';
import ProfessionChart from '../../components/admin/dashboard/ProfessionChart';
import RevenueChart from '../../components/admin/dashboard/RevenueChart';
import OrdersByStatus from '../../components/admin/dashboard/OrdersByStatus';
import ErrorBoundary from '../../components/admin/ErrorBoundary';
import { formatCurrency, formatNumber } from '../../utils/dashboardHelpers';
import i18n from '../../i18n';

// Heroicons inline (evita añadir una dependencia solo para íconos)
const UsersIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
      d="M17 20h5v-2a4 4 0 00-5-3.87M9 20H4v-2a4 4 0 015-3.87m6-4a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);
const TrendingUpIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
);
const ClipboardIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
  </svg>
);
const CurrencyIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const RefreshIcon = ({ spinning }) => (
  <svg
    className={`w-4 h-4 ${spinning ? 'animate-spin' : ''}`}
    fill="none" stroke="currentColor" viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);
const BackIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);

// Pantallas de error a página completa
const BlockingError = ({ icon, title, message, action }) => (
  <div className="min-h-screen bg-neutral-light flex items-center justify-center p-8">
    <div className="bg-surface border border-neutral-dark/10 shadow-md rounded-2xl p-10 max-w-md w-full text-center">
      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-5">
        {icon}
      </div>
      <p className="text-xl font-heading font-semibold text-neutral-dark mb-2">{title}</p>
      {message && <p className="text-sm text-neutral-dark/60 mb-6">{message}</p>}
      {action}
    </div>
  </div>
);

// Componente principal
const AdminDashboardPage = () => {
  const { data, loading, error, lastUpdated, refresh } = useDashboardMetrics();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dateLocale = i18n.language === 'es' ? es : enUS;

  // Compuertas de error
  if (error === 401) {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    navigate('/login', { replace: true });
    return null;
  }

  if (error === 403) {
    return (
      <BlockingError
        icon={<svg className="w-7 h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 15v2m0-6a2 2 0 100 4 2 2 0 000-4zm9 3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        title={t('adminDashboard.errors.forbidden')}
        action={
          <button onClick={() => navigate(-1)} className="bg-primary hover:bg-primary-hover text-white rounded-lg px-5 py-2 transition font-sans flex items-center gap-2 mx-auto">
            <BackIcon /> Volver
          </button>
        }
      />
    );
  }

  if (error === 429) {
    return (
      <BlockingError
        icon={<svg className="w-7 h-7 text-status-pending" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        title={t('adminDashboard.errors.tooManyRequests')}
        action={<button onClick={refresh} className="bg-primary hover:bg-primary-hover text-white rounded-lg px-5 py-2 transition font-sans mx-auto">{t('adminDashboard.refresh')}</button>}
      />
    );
  }

  if (error === 500 || error === 'network_error') {
    return (
      <BlockingError
        icon={<svg className="w-7 h-7 text-status-cancelled" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 9v4m0 4h.01M12 3a9 9 0 100 18A9 9 0 0012 3z" /></svg>}
        title={error === 'network_error' ? t('adminDashboard.errors.networkError') : t('adminDashboard.errors.serverError')}
        action={<button onClick={refresh} className="bg-primary hover:bg-primary-hover text-white rounded-lg px-5 py-2 transition font-sans mx-auto">{t('adminDashboard.refresh')}</button>}
      />
    );
  }

  if (loading) return <DashboardSkeleton />;

  const { user_statistics, profession_statistics, transaction_statistics } = data;

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-neutral-light p-4 md:p-8">

        {/* Encabezado */}
        <header className="mb-8 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            {/* Breadcrumb */}
            <p className="text-xs text-neutral-dark/50 font-sans mb-1 uppercase tracking-wider">
              Panel Administrativo
            </p>
            <h1 className="text-3xl font-heading font-bold text-neutral-dark">
              {t('adminDashboard.title')}
            </h1>
            {lastUpdated && (
              <p className="text-sm text-neutral-dark/50 mt-1 font-sans">
                {t('adminDashboard.lastUpdate')}:{' '}
                {formatDistanceToNow(lastUpdated, { addSuffix: true, locale: dateLocale })}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto">
            {/* Volver al admin de verificaciones */}
            <button
              onClick={() => navigate('/admin')}
              className="flex items-center gap-2 bg-neutral-dark/10 hover:bg-neutral-dark/20 text-neutral-dark rounded-lg px-4 py-2 transition font-sans text-sm"
            >
              <BackIcon />
              Verificaciones
            </button>

            <button
              onClick={refresh}
              disabled={loading}
              aria-busy={loading}
              className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white rounded-lg px-4 py-2 transition font-sans disabled:opacity-60"
            >
              <RefreshIcon spinning={loading} />
              {t('adminDashboard.refresh')}
            </button>
          </div>
        </header>

        {/* ── Tarjetas KPI ── */}
        <section aria-labelledby="kpi-heading" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <h2 id="kpi-heading" className="sr-only">Métricas principales</h2>

          <StatCard
            id="kpi-total-users"
            title={t('adminDashboard.totalUsers')}
            value={formatNumber(user_statistics.total)}
            icon={<UsersIcon />}
            color="primary"
            trend={user_statistics.growth.last_7_days}
          />
          <StatCard
            id="kpi-new-users"
            title={t('adminDashboard.newUsers')}
            value={formatNumber(user_statistics.growth.last_30_days)}
            icon={<TrendingUpIcon />}
            color="completed"
          />
          <StatCard
            id="kpi-total-orders"
            title={t('adminDashboard.totalOrders')}
            value={formatNumber(transaction_statistics.total_orders)}
            icon={<ClipboardIcon />}
            color="dark"
          />
          <StatCard
            id="kpi-commission"
            title={t('adminDashboard.platformRevenue')}
            value={formatCurrency(transaction_statistics.platform_commission_10pct)}
            icon={<CurrencyIcon />}
            color="secondary"
          />
        </section>

        {/* Fila de gráficos 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <UserStatsSection userStatistics={user_statistics} />
          <ProfessionChart professionStatistics={profession_statistics} />
        </div>

        {/* Fila de gráficos 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <RevenueChart revenueTrend={transaction_statistics.revenue_trend} />
          <OrdersByStatus byStatus={transaction_statistics.by_status} />
        </div>

      </div>
    </ErrorBoundary>
  );
};

export default AdminDashboardPage;
