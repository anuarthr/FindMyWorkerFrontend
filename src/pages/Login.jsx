/**
 * Página de inicio de sesión
 * Permite a los usuarios autenticarse con email y contraseña
 * @module pages/Login
 */

import { useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Briefcase, Lock, Mail, ArrowLeft, Loader2, Sparkles, Copy } from 'lucide-react';
import { useTranslation, Trans } from 'react-i18next';
import toast from 'react-hot-toast';
import LanguageSwitcher from '../components/common/LanguageSwitcher';

/**
 * Credenciales demo cargadas en el backend para que un reclutador
 * pueda probar la app sin registrarse. Mismo password para todos.
 * El CTA principal usa al cliente; los otros tres permiten probar
 * el flujo de trabajador (con perfiles, órdenes y portafolio reales).
 */
const DEMO_PASSWORD = 'Demo1234!';
// El admin usa una contraseña distinta a los demás demos. Si en el
// futuro hay más excepciones, basta con añadir el campo `password`.
const DEMO_USERS = [
  { roleKey: 'client', email: 'demo_cliente@findmyworker.com', emoji: '👤' },
  { roleKey: 'plumber', email: 'carlos.plomero@findmyworker.com', emoji: '🔧' },
  { roleKey: 'electrician', email: 'lucia.electricista@findmyworker.com', emoji: '⚡' },
  { roleKey: 'painter', email: 'miguel.pintor@findmyworker.com', emoji: '🎨' },
  { roleKey: 'admin', email: 'admin@findmyworker.com.co', emoji: '🛡️', password: '123456789' },
];

const passwordFor = (email) =>
  DEMO_USERS.find(u => u.email === email)?.password || DEMO_PASSWORD;

/**
 * Componente de página de Login
 * Maneja autenticación de usuarios y redirección al dashboard
 */
const Login = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoOpen, setDemoOpen] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await login(formData.email, formData.password);
      if (res.success) {
        navigate('/dashboard');
      } else {
        setError(res.error === "Credenciales inválidas" ? t('auth.invalidCredentials') : res.error);
      }
    } finally {
      setLoading(false);
    }
  }, [formData.email, formData.password, login, navigate, t]);

  /**
   * Auto-login con credenciales demo. Rellena visualmente el form (para
   * que el usuario vea qué email usa) y dispara el login inmediatamente.
   */
  const loginAsDemo = useCallback(async (email) => {
    const pwd = passwordFor(email);
    setFormData({ email, password: pwd });
    setError('');
    setLoading(true);
    try {
      const res = await login(email, pwd);
      if (res.success) {
        navigate('/dashboard');
      } else {
        setError(res.error === "Credenciales inválidas" ? t('auth.invalidCredentials') : res.error);
      }
    } finally {
      setLoading(false);
    }
  }, [login, navigate, t]);

  const copyCreds = useCallback(async (email) => {
    try {
      await navigator.clipboard.writeText(`${email} / ${passwordFor(email)}`);
      toast.success(t('auth.demoCopied', 'Credenciales copiadas'));
    } catch {
      toast.error(t('auth.demoCopyFailed', 'No se pudo copiar'));
    }
  }, [t]);

  return (
    <div className="min-h-screen bg-neutral-light flex items-center justify-center p-4 relative">
      <div className="absolute top-4 left-4">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs text-neutral-dark/50 hover:text-primary transition-colors"
        >
          <ArrowLeft size={14} />
          {t('header.home')}
        </Link>
      </div>
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
                disabled={loading}
                value={formData.email}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-neutral-dark/20 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all placeholder:text-neutral-dark/30 text-neutral-dark disabled:opacity-60"
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
                disabled={loading}
                value={formData.password}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-neutral-dark/20 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all placeholder:text-neutral-dark/30 text-neutral-dark disabled:opacity-60"
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
            disabled={loading}
            className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3 rounded-lg transition-colors shadow-md hover:shadow-lg cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading && <Loader2 size={18} className="animate-spin" />}
            {t('auth.loginBtn')}
          </button>
        </form>

        {/* Credenciales demo — atajo para reclutadores que quieren probar
            la app sin pasar por el registro. Cliente es el CTA primario;
            los workers viven en un acordeón opcional para no saturar. */}
        <div className="mt-6 rounded-xl border border-primary/20 bg-primary/5 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={16} className="text-primary" />
            <p className="text-sm font-bold text-neutral-dark">
              {t('auth.demoTitle', 'Pruébalo sin registrarte')}
            </p>
          </div>
          <p className="text-xs text-neutral-dark/70 mb-3">
            {t('auth.demoSubtitle', 'Datos reales pre-cargados: portafolios, órdenes y reseñas listos para explorar.')}
          </p>
          <button
            type="button"
            onClick={() => loginAsDemo('demo_cliente@findmyworker.com')}
            disabled={loading}
            className="w-full bg-neutral-dark hover:bg-neutral-dark/90 text-white font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            👤 {t('auth.demoLoginAsClient', 'Entrar como cliente demo')}
          </button>

          <button
            type="button"
            onClick={() => setDemoOpen(o => !o)}
            className="mt-3 text-xs text-primary font-semibold hover:underline w-full text-center"
          >
            {demoOpen
              ? t('auth.demoHideOthers', 'Ocultar otros usuarios')
              : t('auth.demoShowOthers', 'Ver usuarios trabajadores')}
          </button>

          {demoOpen && (
            <ul className="mt-3 space-y-2">
              {DEMO_USERS.filter(u => u.roleKey !== 'client').map(u => (
                <li
                  key={u.email}
                  className="bg-white rounded-lg border border-neutral-dark/10 p-2.5 flex items-center gap-2"
                >
                  <span className="text-base shrink-0">{u.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-neutral-dark capitalize">
                      {t(`auth.demoRole_${u.roleKey}`, u.roleKey)}
                    </p>
                    <p className="text-[11px] text-neutral-dark/60 truncate font-mono">
                      {u.email}
                    </p>
                    {u.password && (
                      <p className="text-[10px] text-neutral-dark/50 font-mono">
                        {t('auth.demoPasswordInline', 'pass: ')}{u.password}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => copyCreds(u.email)}
                    disabled={loading}
                    className="p-1.5 text-neutral-dark/60 hover:text-primary disabled:opacity-50"
                    title={t('auth.demoCopy', 'Copiar credenciales')}
                  >
                    <Copy size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => loginAsDemo(u.email)}
                    disabled={loading}
                    className="text-[11px] font-bold bg-primary/10 hover:bg-primary/20 text-primary px-2 py-1 rounded disabled:opacity-50"
                  >
                    {t('auth.demoEnter', 'Entrar')}
                  </button>
                </li>
              ))}
              <li className="text-[11px] text-neutral-dark/50 text-center pt-1">
                {t('auth.demoPasswordHint', 'Contraseña por defecto: ')}
                <code className="font-mono text-neutral-dark/70">{DEMO_PASSWORD}</code>
              </li>
            </ul>
          )}
        </div>

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
