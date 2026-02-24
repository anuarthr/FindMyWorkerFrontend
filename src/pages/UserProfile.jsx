/**
 * Página de perfil de usuario
 * Permite editar información personal y de contacto
 * Disponible para todos los roles (CLIENT, WORKER, ADMIN)
 * @module pages/UserProfile
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUserProfile, updateUserProfile } from '../api/users';
import { 
  Save, ArrowLeft, Loader2, User, Mail, 
  Phone, MapPin, Home, CheckCircle, AlertCircle 
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

/**
 * Componente de perfil de usuario
 * Permite modificar información personal y de contacto
 */
const UserProfile = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone_number: '',
    address: '',
    city: '',
    state: '',
    country: 'México',
    postal_code: '',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getUserProfile();
        setFormData({
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          phone_number: data.phone_number || '',
          address: data.address || '',
          city: data.city || '',
          state: data.state || '',
          country: data.country || 'México',
          postal_code: data.postal_code || '',
        });
      } catch (err) {
        console.error("Error cargando perfil:", err);
        setError(t('userProfile.loadError'));
      } finally {
        setFetching(false);
      }
    };
    fetchProfile();
  }, [t]);

  /**
   * Maneja cambios en los campos del formulario
   */
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  /**
   * Maneja envío del formulario de edición
   */
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const updatedUser = await updateUserProfile(formData);
      // Actualizar el contexto de auth con los nuevos datos
      setUser(prev => ({ ...prev, ...updatedUser }));
      setSuccess(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 
                       Object.values(err.response?.data || {}).flat().join(', ') ||
                       t('userProfile.saveError');
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [formData, navigate, setUser, t]);

  if (fetching) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-light to-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin text-primary mx-auto mb-4" size={48} />
          <p className="text-neutral-dark/60 font-medium">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-light to-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        
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
            <h1 className="font-heading text-3xl font-bold text-neutral-dark mb-2">
              {t('userProfile.title')}
            </h1>
            <p className="text-neutral-dark/60">{t('userProfile.subtitle')}</p>
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
            <p className="text-green-700 text-sm font-medium">{t('userProfile.saveSuccess')}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Personal Information Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-neutral-dark/5 p-6 hover:shadow-md transition-shadow">
            <h2 className="font-heading text-xl font-bold text-neutral-dark mb-6 flex items-center gap-2">
              <User size={24} className="text-primary" />
              {t('userProfile.personalInfoTitle')}
            </h2>

            <div className="space-y-5">
              {/* First Name */}
              <div>
                <label className="block text-sm font-semibold text-neutral-dark mb-2">
                  {t('userProfile.firstName')}
                </label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  className="w-full p-3.5 border border-neutral-dark/20 rounded-xl hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  placeholder="Juan"
                  required
                />
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-sm font-semibold text-neutral-dark mb-2">
                  {t('userProfile.lastName')}
                </label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  className="w-full p-3.5 border border-neutral-dark/20 rounded-xl hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  placeholder="Pérez"
                  required
                />
              </div>

              {/* Email - Read only */}
              <div>
                <label className="text-sm font-semibold text-neutral-dark mb-2 flex items-center gap-2">
                  <Mail size={16} />
                  {t('userProfile.email')}
                </label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full p-3.5 border border-neutral-dark/20 rounded-xl bg-neutral-dark/5 text-neutral-dark/50 cursor-not-allowed"
                />
                <p className="text-xs text-neutral-dark/50 mt-1.5">
                  {t('userProfile.emailReadOnly')}
                </p>
              </div>

              {/* Role - Read only */}
              <div>
                <label className="block text-sm font-semibold text-neutral-dark mb-2">
                  {t('userProfile.role')}
                </label>
                <input
                  type="text"
                  value={t(`common.role_${user?.role}`) || ''}
                  disabled
                  className="w-full p-3.5 border border-neutral-dark/20 rounded-xl bg-neutral-dark/5 text-neutral-dark/50 cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Contact Information Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-neutral-dark/5 p-6 hover:shadow-md transition-shadow">
            <h2 className="font-heading text-xl font-bold text-neutral-dark mb-2 flex items-center gap-2">
              <Phone size={24} className="text-primary" />
              {t('userProfile.contactInfoTitle')}
            </h2>
            <p className="text-sm text-neutral-dark/60 mb-6">
              {t('userProfile.contactInfoSubtitle')}
            </p>

            <div className="space-y-5">
              {/* Phone Number */}
              <div>
                <label className="block text-sm font-semibold text-neutral-dark mb-2">
                  {t('userProfile.phoneNumber')} <span className="text-neutral-dark/40 font-normal">({t('common.optional')})</span>
                </label>
                <input
                  type="tel"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleChange}
                  className="w-full p-3.5 border border-neutral-dark/20 rounded-xl hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  placeholder="+52 333 123 4567"
                />
              </div>

              {/* Address */}
              <div>
                <label className="text-sm font-semibold text-neutral-dark mb-2 flex items-center gap-2">
                  <Home size={16} />
                  {t('userProfile.address')} <span className="text-neutral-dark/40 font-normal">({t('common.optional')})</span>
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full p-3.5 border border-neutral-dark/20 rounded-xl hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  placeholder="Calle Principal 123"
                />
              </div>

              {/* City & State */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-neutral-dark mb-2 flex items-center gap-2">
                    <MapPin size={16} />
                    {t('userProfile.city')} <span className="text-neutral-dark/40 font-normal">({t('common.optional')})</span>
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full p-3.5 border border-neutral-dark/20 rounded-xl hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    placeholder="Guadalajara"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-neutral-dark mb-2">
                    {t('userProfile.state')} <span className="text-neutral-dark/40 font-normal">({t('common.optional')})</span>
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    className="w-full p-3.5 border border-neutral-dark/20 rounded-xl hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    placeholder="Jalisco"
                  />
                </div>
              </div>

              {/* Country & Postal Code */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-neutral-dark mb-2">
                    {t('userProfile.country')} <span className="text-neutral-dark/40 font-normal">({t('common.optional')})</span>
                  </label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className="w-full p-3.5 border border-neutral-dark/20 rounded-xl hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    placeholder="México"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-neutral-dark mb-2">
                    {t('userProfile.postalCode')} <span className="text-neutral-dark/40 font-normal">({t('common.optional')})</span>
                  </label>
                  <input
                    type="text"
                    name="postal_code"
                    value={formData.postal_code}
                    onChange={handleChange}
                    className="w-full p-3.5 border border-neutral-dark/20 rounded-xl hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    placeholder="44100"
                    maxLength="10"
                  />
                </div>
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
                {t('userProfile.saveSuccess')}
              </>
            ) : (
              <>
                <Save size={22} className="group-hover:scale-110 transition-transform" />
                {t('common.save')}
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UserProfile;
