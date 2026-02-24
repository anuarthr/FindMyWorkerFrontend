/**
 * Página de confirmación de reseteo de contraseña
 * Permite a usuarios resetear su contraseña usando un token
 * @module pages/ResetPassword
 */

import { useState, useCallback, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { confirmPasswordReset } from '../api/users';
import { 
  Lock, ArrowLeft, Loader2, CheckCircle, AlertCircle, 
  Eye, EyeOff, ShieldCheck
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../components/common/LanguageSwitcher';

/**
 * Componente de confirmación de reseteo de contraseña
 */
const ResetPassword = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    new: false,
    confirm: false,
  });

  const [formData, setFormData] = useState({
    new_password: '',
    confirm_password: '',
  });

  // Verificar que hay token en la URL
  useEffect(() => {
    if (!token) {
      setError(t('resetPassword.noToken'));
    }
  }, [token, t]);

  /**
   * Verifica la fortaleza de la contraseña
   */
  const getPasswordStrength = (password) => {
    if (!password) return { level: 0, label: '' };
    if (password.length < 8) return { level: 1, label: t('changePassword.weak'), color: 'bg-red-500' };
    
    let strength = 1;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;

    if (strength >= 4) return { level: 3, label: t('changePassword.strong'), color: 'bg-green-500' };
    if (strength >= 2) return { level: 2, label: t('changePassword.medium'), color: 'bg-secondary' };
    return { level: 1, label: t('changePassword.weak'), color: 'bg-red-500' };
  };

  const passwordStrength = getPasswordStrength(formData.new_password);

  /**
   * Maneja cambios en los campos del formulario
   */
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Limpiar errores del campo al editar
    setFieldErrors(prev => ({
      ...prev,
      [name]: null
    }));
  }, []);

  /**
   * Alterna visibilidad de contraseñas
   */
  const togglePasswordVisibility = useCallback((field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  }, []);

  /**
   * Maneja envío del formulario
   */
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setFieldErrors({});
    setSuccess(false);

    // Validación cliente
    if (formData.new_password.length < 8) {
      setFieldErrors({ new_password: t('changePassword.minLength') });
      setLoading(false);
      return;
    }

    if (formData.new_password !== formData.confirm_password) {
      setFieldErrors({ confirm_password: t('changePassword.passwordsMismatch') });
      setLoading(false);
      return;
    }

    try {
      await confirmPasswordReset({
        token,
        new_password: formData.new_password,
        confirm_password: formData.confirm_password,
      });
      setSuccess(true);
      
      // Redirigir al login después de 3 segundos
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      console.error('Error confirmando reset:', err);
      
      // Manejar errores específicos
      if (err.response?.data) {
        const errors = err.response.data;
        
        if (errors.detail) {
          setError(errors.detail);
        }
        if (errors.new_password) {
          setFieldErrors({ new_password: Array.isArray(errors.new_password) ? errors.new_password[0] : errors.new_password });
        }
        if (errors.confirm_password) {
          setFieldErrors({ confirm_password: Array.isArray(errors.confirm_password) ? errors.confirm_password[0] : errors.confirm_password });
        }
        
        // Si no hay errores específicos, mostrar error genérico
        if (!errors.detail && !errors.new_password && !errors.confirm_password) {
          setError(t('resetPassword.error'));
        }
      } else {
        setError(t('resetPassword.error'));
      }
    } finally {
      setLoading(false);
    }
  }, [formData, token, navigate, t]);

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
          {t('resetPassword.backToLogin')}
        </Link>

        {/* Success State */}
        {success ? (
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 mb-4">
              <CheckCircle size={32} />
            </div>
            <h2 className="text-2xl font-bold text-neutral-dark mb-3">
              {t('resetPassword.successTitle')}
            </h2>
            <p className="text-neutral-dark/60 mb-6">
              {t('resetPassword.successMessage')}
            </p>
            <Link
              to="/login"
              className="inline-flex items-center justify-center w-full bg-primary hover:bg-primary-hover text-white font-bold py-3.5 rounded-xl transition-all"
            >
              {t('resetPassword.goToLogin')}
            </Link>
          </div>
        ) : (
          /* Form State */
          <>
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-4">
                <ShieldCheck size={24} />
              </div>
              <h1 className="text-2xl font-bold text-neutral-dark mb-2">
                {t('resetPassword.title')}
              </h1>
              <p className="text-neutral-dark/60 text-sm">
                {t('resetPassword.subtitle')}
              </p>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-xl flex items-start gap-3">
                <AlertCircle className="text-red-600 shrink-0 mt-0.5" size={20} />
                <div>
                  <p className="text-red-700 text-sm font-medium">{error}</p>
                  {error === t('resetPassword.noToken') && (
                    <Link 
                      to="/forgot-password" 
                      className="text-red-600 hover:text-red-800 text-xs underline mt-1 inline-block"
                    >
                      {t('resetPassword.requestNew')}
                    </Link>
                  )}
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* New Password */}
              <div>
                <label className="text-sm font-semibold text-neutral-dark mb-2 flex items-center gap-2">
                  <Lock size={16} />
                  {t('resetPassword.newPassword')}
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.new ? 'text' : 'password'}
                    name="new_password"
                    value={formData.new_password}
                    onChange={handleChange}
                    className={`w-full p-3.5 pr-12 border rounded-xl hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all ${
                      fieldErrors.new_password ? 'border-red-500' : 'border-neutral-dark/20'
                    }`}
                    minLength="8"
                    required
                    disabled={loading || !token}
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('new')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-dark/40 hover:text-neutral-dark transition-colors"
                  >
                    {showPasswords.new ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                
                {/* Password Strength Indicator */}
                {formData.new_password && (
                  <div className="mt-2">
                    <div className="flex gap-1 mb-1">
                      {[1, 2, 3].map((level) => (
                        <div 
                          key={level}
                          className={`h-1.5 flex-1 rounded-full transition-colors ${
                            level <= passwordStrength.level ? passwordStrength.color : 'bg-neutral-dark/10'
                          }`}
                        />
                      ))}
                    </div>
                    <p className={`text-xs ${passwordStrength.level >= 2 ? 'text-green-600' : 'text-secondary'}`}>
                      {passwordStrength.label}
                    </p>
                  </div>
                )}
                
                {fieldErrors.new_password && (
                  <p className="text-red-600 text-xs mt-1.5">{fieldErrors.new_password}</p>
                )}
                <p className="text-xs text-neutral-dark/50 mt-1.5">
                  {t('changePassword.requirements')}
                </p>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="text-sm font-semibold text-neutral-dark mb-2 flex items-center gap-2">
                  <Lock size={16} />
                  {t('resetPassword.confirmPassword')}
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.confirm ? 'text' : 'password'}
                    name="confirm_password"
                    value={formData.confirm_password}
                    onChange={handleChange}
                    className={`w-full p-3.5 pr-12 border rounded-xl hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all ${
                      fieldErrors.confirm_password ? 'border-red-500' : 'border-neutral-dark/20'
                    }`}
                    required
                    disabled={loading || !token}
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('confirm')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-dark/40 hover:text-neutral-dark transition-colors"
                  >
                    {showPasswords.confirm ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {fieldErrors.confirm_password && (
                  <p className="text-red-600 text-xs mt-1.5">{fieldErrors.confirm_password}</p>
                )}
                {formData.confirm_password && formData.new_password === formData.confirm_password && (
                  <p className="text-green-600 text-xs mt-1.5 flex items-center gap-1">
                    <CheckCircle size={12} />
                    {t('changePassword.passwordsMatch')}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || !token}
                className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    {t('common.saving')}
                  </>
                ) : (
                  <>
                    <ShieldCheck size={20} className="group-hover:scale-110 transition-transform" />
                    {t('resetPassword.resetButton')}
                  </>
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
