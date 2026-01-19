import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { 
  User, Hammer, Building2, ArrowRight, Loader2, 
  Mail, Lock, UserCircle, CheckCircle, AlertCircle 
} from 'lucide-react';
import { useTranslation, Trans } from 'react-i18next';
import LanguageSwitcher from '../components/common/LanguageSwitcher';

const Register = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    role: 'CLIENT'
  });

  const roles = [
    {
      value: 'CLIENT',
      icon: User,
      emoji: '👤',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    {
      value: 'WORKER',
      icon: Hammer,
      emoji: '🔨',
      color: 'from-primary to-[#a83f34]',
      bgColor: 'bg-orange-50',
      textColor: 'text-primary'
    },
    {
      value: 'COMPANY',
      icon: Building2,
      emoji: '🏢',
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600'
    }
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRoleSelect = (role) => {
    setFormData({ ...formData, role });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('auth/register/', formData);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      console.error(err);
      const errorMsg = err.response?.data?.email?.[0] || 
                       err.response?.data?.detail || 
                       t('auth.registerError');
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-light flex items-center justify-center p-4 py-10 relative">
      
      {/* Language Switcher */}
      <div className="absolute top-6 right-6 z-10">
        <LanguageSwitcher />
      </div>

      <div className="w-full max-w-3xl">
        
        {/* Header */}
        <div className="text-center mb-8 animate-in fade-in slide-in-from-top-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl shadow-lg mb-4">
            <Hammer className="text-white" size={32} />
          </div>
          <h1 className="font-heading text-4xl font-bold text-neutral-dark mb-2">
            <Trans i18nKey="auth.registerTitle">
              Únete a FindMy<span className="text-primary">Worker</span>
            </Trans>
          </h1>
          <p className="text-neutral-dark/60 text-lg">{t('auth.registerSubtitle')}</p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-2xl border border-neutral-dark/5 p-8 md:p-10 animate-in fade-in slide-in-from-bottom-4">
          
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
              <p className="text-green-700 text-sm font-medium">
                ✅ {t('auth.registerSuccess')} Redirigiendo...
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Step 1: Role Selection */}
            <div>
              <h2 className="font-heading text-xl font-bold text-neutral-dark mb-4 flex items-center gap-2">
                <span className="flex items-center justify-center w-8 h-8 bg-primary/10 text-primary rounded-full text-sm font-bold">
                  1
                </span>
                {t('auth.selectRole')}
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {roles.map(({ value, icon: Icon, emoji, color, bgColor, textColor }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => handleRoleSelect(value)}
                    className={`group relative p-5 rounded-2xl border-2 transition-all text-center overflow-hidden cursor-pointer ${
                      formData.role === value
                        ? 'border-primary shadow-lg scale-105'
                        : 'border-neutral-dark/10 hover:border-primary/30 hover:shadow-md'
                    }`}
                  >
                    {/* Background gradient on selected */}
                    {formData.role === value && (
                      <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-5`}></div>
                    )}

                    <div className="relative">
                      {/* Icon */}
                      <div className={`mx-auto w-14 h-14 rounded-2xl flex items-center justify-center mb-3 transition-all ${
                        formData.role === value 
                          ? `bg-gradient-to-br ${color} text-white shadow-md` 
                          : `${bgColor} ${textColor} group-hover:scale-110`
                      }`}>
                        <Icon size={28} />
                      </div>

                      {/* Text */}
                      <h3 className="font-bold text-neutral-dark mb-1">
                        {emoji} {t(`auth.role${value.charAt(0) + value.slice(1).toLowerCase()}`)}
                      </h3>
                      <p className="text-xs text-neutral-dark/60 leading-snug">
                        {t(`auth.role${value.charAt(0) + value.slice(1).toLowerCase()}Desc`)}
                      </p>

                      {/* Check badge */}
                      {formData.role === value && (
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center shadow-lg">
                          <CheckCircle size={16} className="text-white" />
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Personal Info */}
            <div>
              <h2 className="font-heading text-xl font-bold text-neutral-dark mb-4 flex items-center gap-2">
                <span className="flex items-center justify-center w-8 h-8 bg-primary/10 text-primary rounded-full text-sm font-bold">
                  2
                </span>
                {t('auth.personalInfo')}
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-neutral-dark mb-2 flex items-center gap-2">
                    <UserCircle size={16} />
                    {t('auth.nameLabel')}
                  </label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    required
                    placeholder="Juan"
                    className="w-full px-4 py-3.5 bg-white border border-neutral-dark/20 rounded-xl hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-neutral-dark mb-2 flex items-center gap-2">
                    <UserCircle size={16} />
                    {t('auth.lastNameLabel')}
                  </label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    required
                    placeholder="Pérez"
                    className="w-full px-4 py-3.5 bg-white border border-neutral-dark/20 rounded-xl hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* Step 3: Account Credentials */}
            <div>
              <h2 className="font-heading text-xl font-bold text-neutral-dark mb-4 flex items-center gap-2">
                <span className="flex items-center justify-center w-8 h-8 bg-primary/10 text-primary rounded-full text-sm font-bold">
                  3
                </span>
                {t('auth.accountCredentials')}
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-neutral-dark mb-2 flex items-center gap-2">
                    <Mail size={16} />
                    {t('auth.emailLabel')}
                  </label>
                  <input
                    type="email"
                    name="email"
                    autoComplete="email"
                    value={formData.email}
                    required
                    placeholder="tu@email.com"
                    className="w-full px-4 py-3.5 bg-white border border-neutral-dark/20 rounded-xl hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-neutral-dark mb-2 flex items-center gap-2">
                    <Lock size={16} />
                    {t('auth.passwordLabel')}
                  </label>
                  <input
                    type="password"
                    name="password"
                    autoComplete="new-password"
                    value={formData.password}
                    required
                    placeholder="••••••••"
                    className="w-full px-4 py-3.5 bg-white border border-neutral-dark/20 rounded-xl hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                    onChange={handleChange}
                  />
                  <p className="text-xs text-neutral-dark/50 mt-2">
                    {t('auth.passwordHint')}
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || success}
              className="w-full bg-gradient-to-r from-primary to-[#a83f34] hover:from-[#a83f34] hover:to-primary text-white font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed group flex items-center justify-center gap-3 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={22} />
                  {t('auth.creatingAccountBtn')}
                </>
              ) : success ? (
                <>
                  <CheckCircle size={22} />
                  {t('auth.registerSuccess')}
                </>
              ) : (
                <>
                  {t('auth.createAccountBtn')}
                  <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-neutral-dark/10 text-center">
            <p className="text-sm text-neutral-dark/70">
              {t('auth.alreadyHaveAccount')}{' '}
              <Link 
                to="/login" 
                className="text-primary font-bold hover:underline hover:text-[#a83f34] transition-colors cursor-pointer"
              >
                {t('auth.loginLink')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
