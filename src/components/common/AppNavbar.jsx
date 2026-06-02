import { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, User, Lock, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import LanguageSwitcher from './LanguageSwitcher';

/**
 * Menú desplegable de usuario. Comparte UI entre cliente, trabajador y admin.
 */
const UserMenu = ({ user, onLogout, roleLabel, navigate, t }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

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
            {roleLabel}
          </span>
        </div>
        <ChevronDown
          size={16}
          className={`text-neutral-dark/60 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

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
              onClick={() => { navigate('/profile'); setIsOpen(false); }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-neutral-dark hover:bg-neutral-dark/5 transition-colors text-left"
            >
              <User size={16} />
              {t('userProfile.title')}
            </button>

            <button
              onClick={() => { navigate('/change-password'); setIsOpen(false); }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-neutral-dark hover:bg-neutral-dark/5 transition-colors text-left"
            >
              <Lock size={16} />
              {t('changePassword.title')}
            </button>
          </div>

          <div className="border-t border-neutral-dark/10 py-1">
            <button
              onClick={() => { onLogout(); setIsOpen(false); }}
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
 * Barra de navegación superior compartida por todos los dashboards
 * (cliente, trabajador y admin). Incluye logo, selector de idioma
 * y menú de usuario con cerrar sesión.
 */
const AppNavbar = ({ homeHref = '/dashboard' }) => {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const roleLabel = (() => {
    if (user?.is_superuser) return t('common.role_ADMIN');
    return t(`common.role_${user?.role}`);
  })();

  const handleLogout = useCallback(() => {
    logout();
    navigate('/');
  }, [logout, navigate]);

  return (
    <nav className="bg-surface border-b border-neutral-dark/5 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to={homeHref} className="font-heading font-bold text-2xl text-neutral-dark hover:opacity-80 transition-opacity">
          FindMy<span className="text-primary">Worker</span>
        </Link>

        <div className="flex items-center gap-4">
          <LanguageSwitcher />
          <UserMenu
            user={user}
            onLogout={handleLogout}
            roleLabel={roleLabel}
            navigate={navigate}
            t={t}
          />
        </div>
      </div>
    </nav>
  );
};

export default AppNavbar;
