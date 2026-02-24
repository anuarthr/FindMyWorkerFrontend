/**
 * Página principal del Dashboard
 * Renderiza diferentes vistas según el rol del usuario (Client, Worker, Admin)
 * @module pages/Dashboard
 */

import { useCallback, useMemo, useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, Lock, ChevronDown } from 'lucide-react';
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
 * Menú desplegable de usuario
 */
const UserMenu = ({ user, onLogout, getRoleLabel, navigate, t }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-2 rounded-lg hover:bg-neutral-dark/5 transition-colors"
      >
        <div className="hidden md:flex flex-col items-end">
          <span className="text-sm font-bold text-neutral-dark">{user?.first_name}</span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 rounded-full">
            {getRoleLabel()}
          </span>
        </div>
        <ChevronDown 
          size={16} 
          className={`text-neutral-dark/60 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-neutral-dark/10 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
          <div className="p-3 border-b border-neutral-dark/10">
            <p className="text-sm font-bold text-neutral-dark">
              {user?.first_name} {user?.last_name}
            </p>
            <p className="text-xs text-neutral-dark/60 mt-0.5">{user?.email}</p>
          </div>

          <div className="py-1">
            <button
              onClick={() => {
                navigate('/profile');
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-neutral-dark hover:bg-neutral-dark/5 transition-colors text-left"
            >
              <User size={16} />
              {t('userProfile.title')}
            </button>

            <button
              onClick={() => {
                navigate('/change-password');
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-neutral-dark hover:bg-neutral-dark/5 transition-colors text-left"
            >
              <Lock size={16} />
              {t('changePassword.title')}
            </button>
          </div>

          <div className="border-t border-neutral-dark/10 py-1">
            <button
              onClick={() => {
                onLogout();
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
            >
              <LogOut size={16} />
              {t('navbar.logout')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Barra de navegación superior
 * @param {Object} user - Usuario actual
 * @param {Function} onLogout - Función de logout
 * @param {Function} t - Función de traducción
 * @param {Function} getRoleLabel - Función para obtener label del rol
 */
const Navbar = ({ user, onLogout, t, getRoleLabel, navigate }) => (
  <nav className="bg-surface border-b border-neutral-dark/5 sticky top-0 z-50">
    <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
      <h1 className="font-heading font-bold text-2xl text-neutral-dark">
        FindMy<span className="text-primary">Worker</span>
      </h1>
      
      <div className="flex items-center gap-4">
        <LanguageSwitcher />
        <UserMenu 
          user={user} 
          onLogout={onLogout} 
          getRoleLabel={getRoleLabel}
          navigate={navigate}
          t={t}
        />
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
        navigate={navigate}
      />

      <main className="max-w-6xl mx-auto px-4 py-8">
        {renderContent()}
      </main>
    </div>
  );
};

export default Dashboard;
