/**
 * Página de inicio de sesión
 * Permite a los usuarios autenticarse con email y contraseña
 * @module pages/Login
 */

import { useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Briefcase, Lock, Mail } from 'lucide-react';
import { useTranslation, Trans } from 'react-i18next';
import LanguageSwitcher from '../components/common/LanguageSwitcher';

/**
 * Componente de página de Login
 * Maneja autenticación de usuarios y redirección al dashboard
 */
const Login = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  /**
   * Maneja el envío del formulario de login
   */
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setError('');
    const res = await login(formData.email, formData.password);
    if (res.success) {
      navigate('/dashboard');
    } else {
      // Intentamos traducir el error si coincide con clave, sino texto raw
      setError(res.error === "Credenciales inválidas" ? t('auth.invalidCredentials') : res.error);
    }
  }, [formData.email, formData.password, login, navigate, t]);

  return (
    <div className="min-h-screen bg-neutral-light flex items-center justify-center p-4 relative">
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>

      <div className="bg-surface w-full max-w-md p-8 rounded-xl shadow-lg border border-neutral-dark/10">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-4">
            <Briefcase size={24} />
          </div>
          <h1 className="font-heading text-2xl font-bold text-neutral-dark">
            <Trans i18nKey="auth.loginTitle">
              Bienvenido a FindMy<span className="text-primary">Worker</span>
            </Trans>
          </h1>
          <p className="text-neutral-dark/60 mt-2 text-sm">{t('auth.loginSubtitle')}</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-neutral-dark mb-1.5">{t('auth.emailLabel')}</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-dark/40" size={18} />
              <input
                type="email"
                autoComplete="email"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-neutral-dark/20 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all placeholder:text-neutral-dark/30 text-neutral-dark"
                placeholder={t('auth.emailPlaceholder')}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-dark mb-1.5">{t('auth.passwordLabel')}</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-dark/40" size={18} />
              <input
                type="password"
                autoComplete="current-password"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-neutral-dark/20 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all placeholder:text-neutral-dark/30 text-neutral-dark"
                placeholder={t('auth.passwordPlaceholder')}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
            <div className="text-right mt-1.5">
              <Link to="/forgot-password" className="text-xs text-primary hover:underline">
                {t('auth.forgotPassword')}
              </Link>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3 rounded-lg transition-colors shadow-md hover:shadow-lg cursor-pointer"
          >
            {t('auth.loginBtn')}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-neutral-dark/70">
          {t('auth.noAccount')}{' '}
          <Link to="/register" className="text-primary font-semibold hover:underline cursor-pointer">
            {t('auth.registerLink')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
