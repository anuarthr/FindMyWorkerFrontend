/**
 * Página de solicitud de recuperación de contraseña
 * Permite a usuarios solicitar un token para resetear su contraseña
 * @module pages/ForgotPassword
 */

import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { requestPasswordReset } from '../api/users';
import { 
  Mail, ArrowLeft, Loader2, CheckCircle, AlertCircle, ShieldCheck
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../components/common/LanguageSwitcher';

/**
 * Componente de solicitud de recuperación de contraseña
 */
const ForgotPassword = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [devInfo, setDevInfo] = useState(null);

  /**
   * Maneja envío del formulario
   */
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);
    setDevInfo(null);

    try {
      const response = await requestPasswordReset(email);
      setSuccess(true);
      
      // En desarrollo, mostrar el token para testing
      if (response.dev_token) {
        setDevInfo({
          token: response.dev_token,
          uid: response.dev_uid
        });
      }
    } catch (err) {
      console.error('Error solicitando reset:', err);
      // Por seguridad, siempre mostramos éxito incluso si hay error
      // Para no revelar si el email existe
      setSuccess(true);
    } finally {
      setLoading(false);
    }
  }, [email]);

  return (
    <div className="min-h-screen bg-neutral-light flex items-center justify-center p-4 relative">
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>

      <div className="bg-surface w-full max-w-md p-8 rounded-xl shadow-lg border border-neutral-dark/10">
        
        {/* Back to Login */}
        <Link 
          to="/login" 
          className="inline-flex items-center text-neutral-dark/60 hover:text-primary mb-6 text-sm font-medium transition-all group"
        >
          <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" /> 
          {t('forgotPassword.backToLogin')}
        </Link>

        {/* Header */}
        {!success ? (
          <>
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-4">
                <ShieldCheck size={24} />
              </div>
              <h1 className="text-2xl font-bold text-neutral-dark mb-2">
                {t('forgotPassword.title')}
              </h1>
              <p className="text-neutral-dark/60 text-sm">
                {t('forgotPassword.subtitle')}
              </p>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-xl flex items-start gap-3">
                <AlertCircle className="text-red-600 shrink-0 mt-0.5" size={20} />
                <p className="text-red-700 text-sm font-medium">{error}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-neutral-dark mb-2 flex items-center gap-2">
                  <Mail size={16} />
                  {t('forgotPassword.emailLabel')}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="usuario@ejemplo.com"
                  className="w-full p-3.5 border border-neutral-dark/20 rounded-xl hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  required
                  disabled={loading}
                />
                <p className="text-xs text-neutral-dark/50 mt-1.5">
                  {t('forgotPassword.emailHint')}
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    {t('common.sending')}
                  </>
                ) : (
                  <>
                    <Mail size={20} className="group-hover:scale-110 transition-transform" />
                    {t('forgotPassword.sendButton')}
                  </>
                )}
              </button>
            </form>
          </>
        ) : (
          /* Success State */
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 mb-4">
              <CheckCircle size={32} />
            </div>
            <h2 className="text-2xl font-bold text-neutral-dark mb-3">
              {t('forgotPassword.successTitle')}
            </h2>
            <p className="text-neutral-dark/60 mb-6">
              {t('forgotPassword.successMessage')}
            </p>

            {/* Development Info */}
            {devInfo && (
              <div className="mb-6 p-4 bg-secondary/10 border border-secondary/30 rounded-xl text-left">
                <p className="text-xs font-bold text-secondary mb-2 uppercase">
                  🔧 {t('forgotPassword.devMode')}
                </p>
                <div className="space-y-2">
                  <div>
                    <span className="text-xs font-semibold text-neutral-dark">Token:</span>
                    <p className="text-sm text-neutral-dark font-mono bg-neutral-light p-2 rounded mt-1 break-all">
                      {devInfo.token}
                    </p>
                  </div>
                  <Link
                    to={`/reset-password?token=${devInfo.token}`}
                    className="block w-full text-center bg-secondary hover:bg-primary text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm"
                  >
                    {t('forgotPassword.useDevToken')}
                  </Link>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <p className="text-sm text-neutral-dark/60">
                {t('forgotPassword.checkSpam')}
              </p>
              <Link
                to="/login"
                className="inline-flex items-center text-primary hover:text-[#a83f34] font-semibold text-sm transition-colors"
              >
                <ArrowLeft size={16} className="mr-2" />
                {t('forgotPassword.backToLogin')}
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
