/**
 * Página principal del Dashboard
 * Renderiza diferentes vistas según el rol del usuario (Client, Worker, Admin)
 * @module pages/Dashboard
 */

import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import ClientHome from '../components/dashboard/ClientHome';
import WorkerHome from '../components/dashboard/WorkerHome';
import { useTranslation } from 'react-i18next';
import AppNavbar from '../components/common/AppNavbar';

const AISearchBanner = ({ onClick, t }) => (
  <div
    onClick={onClick}
    className="bg-gradient-to-r from-[#C04A3E] to-[#E37B5B] rounded-xl p-6 mb-6 cursor-pointer hover:shadow-xl transition-all duration-300 group"
  >
    <div className="flex items-center justify-between">
      <div>
        <h3 className="text-white font-bold text-xl mb-2 flex items-center gap-2">
          🤖 {t('dashboard.aiSearch')}
        </h3>
        <p className="text-white/90 text-sm">
          {t('dashboard.aiSearchDesc')}
        </p>
      </div>
      <div className="text-white text-4xl group-hover:scale-110 transition-transform">
        →
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Admin tiene su propio panel en /admin (con navbar y métricas). Si
  // un admin aterriza aquí (p.ej. tras login), lo redirigimos para que
  // no se renderice un navbar duplicado encima de AdminDashboard.
  useEffect(() => {
    if (user?.role === 'ADMIN' || user?.is_superuser) {
      navigate('/admin', { replace: true });
    }
  }, [user, navigate]);

  if (user?.role === 'ADMIN' || user?.is_superuser) return null;

  return (
    <div className="min-h-screen bg-neutral-light">
      <AppNavbar />

      <main className="max-w-6xl mx-auto px-4 py-8">
        {user?.role === 'WORKER' ? (
          <WorkerHome user={user} />
        ) : (
          <>
            <AISearchBanner onClick={() => navigate('/search-workers')} t={t} />
            <ClientHome user={user} />
          </>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
