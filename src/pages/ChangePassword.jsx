/**
 * Página de cambio de contraseña
 * Permite a usuarios autenticados cambiar su contraseña
 * Requiere contraseña actual para validación
 * @module pages/ChangePassword
 */

import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { changePassword } from '../api/users';
import { 
  Save, ArrowLeft, Loader2, Lock, Eye, EyeOff,
  CheckCircle, AlertCircle, Shield
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

/**
 * Componente de cambio de contraseña
 */
const ChangePassword = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false,
  });

  const [formData, setFormData] = useState({
    old_password: '',
    new_password: '',
    confirm_password: '',
  });

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
      await changePassword(formData);
      setSuccess(true);
      
      // Cerrar sesión después de 2 segundos
      setTimeout(() => {
        logout();
        navigate('/login');
      }, 2000);
    } catch (err) {
      console.error('Error cambiando contraseña:', err);
      
      // Manejar errores específicos por campo
      if (err.response?.data) {
        const errors = err.response.data;
        
        if (errors.old_password) {
          setFieldErrors({ old_password: Array.isArray(errors.old_password) ? errors.old_password[0] : errors.old_password });
        }
        if (errors.new_password) {
          setFieldErrors({ new_password: Array.isArray(errors.new_password) ? errors.new_password[0] : errors.new_password });
        }
        if (errors.confirm_password) {
          setFieldErrors({ confirm_password: Array.isArray(errors.confirm_password) ? errors.confirm_password[0] : errors.confirm_password });
        }
        if (errors.detail) {
          setError(errors.detail);
        }
        
        // Si no hay errores específicos, mostrar error genérico
        if (!errors.old_password && !errors.new_password && !errors.confirm_password && !errors.detail) {
          setError(t('changePassword.error'));
        }
      } else {
        setError(t('changePassword.error'));
      }
    } finally {
      setLoading(false);
    }
  }, [formData, logout, navigate, t]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-light to-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        
        {/* Header */}
        <div className="mb-6">
          <button 
            onClick={() => navigate('/dashboard')} 
            className="group flex items-center text-neutral-dark/60 hover:text-primary mb-4 text-sm font-medium transition-all"
          >
            <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" /> 
            {t('common.backToDashboard')}
          </button>

          <div className="bg-white rounded-2xl shadow-sm border border-neutral-dark/5 p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary/10 rounded-xl">
                <Shield size={32} className="text-primary" />
              </div>
              <div>
                <h1 className="font-heading text-3xl font-bold text-neutral-dark mb-2">
                  {t('changePassword.title')}
                </h1>
                <p className="text-neutral-dark/60">{t('changePassword.subtitle')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
            <AlertCircle className="text-red-600 shrink-0 mt-0.5" size={20} />
            <p className="text-red-700 text-sm font-medium">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-r-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
            <CheckCircle className="text-green-600 shrink-0 mt-0.5" size={20} />
            <div>
              <p className="text-green-700 text-sm font-medium">{t('changePassword.success')}</p>
              <p className="text-green-600 text-xs mt-1">{t('changePassword.redirecting')}</p>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Password Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-neutral-dark/5 p-6 hover:shadow-md transition-shadow">
            <div className="space-y-5">
              
              {/* Current Password */}
              <div>
                <label className="text-sm font-semibold text-neutral-dark mb-2 flex items-center gap-2">
                  <Lock size={16} />
                  {t('changePassword.currentPassword')}
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.old ? 'text' : 'password'}
                    name="old_password"
                    value={formData.old_password}
                    onChange={handleChange}
                    className={`w-full p-3.5 pr-12 border rounded-xl hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all ${
                      fieldErrors.old_password ? 'border-red-500' : 'border-neutral-dark/20'
                    }`}
                    required
                    disabled={success}
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('old')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-dark/40 hover:text-neutral-dark transition-colors"
                  >
                    {showPasswords.old ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {fieldErrors.old_password && (
                  <p className="text-red-600 text-xs mt-1.5">{fieldErrors.old_password}</p>
                )}
              </div>

              {/* New Password */}
              <div>
                <label className="text-sm font-semibold text-neutral-dark mb-2 flex items-center gap-2">
                  <Lock size={16} />
                  {t('changePassword.newPassword')}
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
                    disabled={success}
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
                  {t('changePassword.confirmPassword')}
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
                    disabled={success}
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
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || success}
            className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-4 rounded-xl flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg group"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={22} />
                {t('common.saving')}
              </>
            ) : success ? (
              <>
                <CheckCircle size={22} />
                {t('changePassword.success')}
              </>
            ) : (
              <>
                <Save size={22} className="group-hover:scale-110 transition-transform" />
                {t('changePassword.changeButton')}
              </>
            )}
          </button>

          {/* Security Note */}
          <div className="bg-neutral-light/50 border border-primary/20 rounded-xl p-4">
            <p className="text-sm text-neutral-dark">
              <span className="font-semibold text-primary">{t('changePassword.securityNote')}</span> {t('changePassword.logoutNote')}
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;
