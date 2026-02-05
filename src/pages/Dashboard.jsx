/**
 * Página principal del Dashboard
 * Renderiza diferentes vistas según el rol del usuario (Client, Worker, Admin)
 * @module pages/Dashboard
 */

import { useCallback, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ClientHome from '../components/dashboard/ClientHome';
import WorkerHome from '../components/dashboard/WorkerHome';
import AdminDashboard from './admin/AdminDashboard';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../components/common/LanguageSwitcher';

// ============================================================================
// SUB-COMPONENTES
// ============================================================================

/**
 * Banner de búsqueda de trabajadores con IA
 * @param {Function} onClick - Callback al hacer clic
 * @param {Function} t - Función de traducción
 */
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

/**
 * Barra de navegación superior
 * @param {Object} user - Usuario actual
 * @param {Function} onLogout - Función de logout
 * @param {Function} t - Función de traducción
 * @param {Function} getRoleLabel - Función para obtener label del rol
 */
const Navbar = ({ user, onLogout, t, getRoleLabel }) => (
  <nav className="bg-surface border-b border-neutral-dark/5 sticky top-0 z-50">
    <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
      <h1 className="font-heading font-bold text-2xl text-neutral-dark">
        FindMy<span className="text-primary">Worker</span>
      </h1>
      
      <div className="flex items-center gap-4">
        <LanguageSwitcher />
        <div className="hidden md:flex flex-col items-end mr-2">
          <span className="text-sm font-bold text-neutral-dark">{user?.first_name}</span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 rounded-full">
            {getRoleLabel()}
          </span>
        </div>
        <button 
          onClick={onLogout}
          className="p-2 text-neutral-dark/60 hover:text-primary hover:bg-primary/5 rounded-full transition-colors cursor-pointer"
          title={t('navbar.logout')}
        >
          <LogOut size={20} />
        </button>
      </div>
    </div>
  </nav>
);

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * Dashboard principal - punto de entrada de la aplicación
 * Renderiza diferentes vistas según el rol: ADMIN, WORKER, CLIENT
 */
const Dashboard = () => {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  /**
   * Obtiene el label traducido del rol del usuario
   */
  const getRoleLabel = useCallback(() => {
    if (user?.is_superuser) return t('common.role_ADMIN');
    return t(`common.role_${user?.role}`);
  }, [user, t]);

  /**
   * Renderiza el contenido apropiado según el rol del usuario
   */
  const renderContent = useCallback(() => {
    if (user?.role === 'ADMIN' || user?.is_superuser) {
      return <AdminDashboard />;
    }
    
    if (user?.role === 'WORKER') {
      return <WorkerHome user={user} />;
    }
    
    return (
      <>
        <AISearchBanner onClick={() => navigate('/search-workers')} t={t} />
        <ClientHome user={user} />
      </>
    );
  }, [user, navigate, t]);

  return (
    <div className="min-h-screen bg-neutral-light">
      <Navbar 
        user={user} 
        onLogout={logout} 
        t={t} 
        getRoleLabel={getRoleLabel} 
      />

      <main className="max-w-6xl mx-auto px-4 py-8">
        {renderContent()}
      </main>
    </div>
  );
};

export default Dashboard;
