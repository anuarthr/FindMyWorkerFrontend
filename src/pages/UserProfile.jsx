/**
 * Página de perfil de usuario
 * Permite editar información personal y de contacto
 * Disponible para todos los roles (CLIENT, WORKER, ADMIN)
 * @module pages/UserProfile
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUserProfile, updateUserProfile } from '../api/users';
import {
  Save, ArrowLeft, Loader2, User, Mail,
  Phone, MapPin, Home, CheckCircle, AlertCircle,
  Camera, X
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { getAvatarUrl } from '../utils/profileHelpers';
import LocationPicker from '../components/LocationPicker';
import { loadClientLocation, saveClientLocation, clearClientLocation } from '../utils/clientLocation';

const MAX_AVATAR_BYTES = 5 * 1024 * 1024;
const ACCEPTED_AVATAR_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

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

  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const avatarInputRef = useRef(null);

  const [clientLocation, setClientLocation] = useState(() => loadClientLocation());
  const isClient = user?.role === 'CLIENT';

  const handleLocationChange = useCallback((lat, lng) => {
    setClientLocation((prev) => ({ lat, lng, radiusKm: prev?.radiusKm || 20 }));
  }, []);

  const handleRadiusChange = useCallback((e) => {
    const value = parseInt(e.target.value, 10) || 20;
    setClientLocation((prev) => prev ? { ...prev, radiusKm: value } : { lat: null, lng: null, radiusKm: value });
  }, []);

  const handleClearLocation = useCallback(() => {
    clearClientLocation();
    setClientLocation(null);
    toast.success(t('userProfile.locationCleared', 'Ubicación borrada'));
  }, [t]);

  const handleSaveLocation = useCallback(() => {
    if (!clientLocation?.lat || !clientLocation?.lng) {
      toast.error(t('userProfile.locationMissing', 'Selecciona un punto en el mapa primero.'));
      return;
    }
    saveClientLocation(clientLocation.lat, clientLocation.lng, clientLocation.radiusKm);
    toast.success(t('userProfile.locationSaved', 'Ubicación guardada'));
  }, [clientLocation, t]);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone_number: '',
    address: '',
    city: '',
    state: '',
    country: 'Colombia',
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
   * Selección de avatar: valida tipo y peso (5MB), genera preview blob:.
   * No sube nada hasta que el usuario confirme el formulario.
   */
  const handleAvatarChange = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ACCEPTED_AVATAR_TYPES.includes(file.type)) {
      setError(t('userProfile.avatarTypeError', 'Formato no soportado. Usa JPG, PNG o WEBP.'));
      e.target.value = '';
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      setError(t('userProfile.avatarSizeError', 'La imagen excede 5MB.'));
      e.target.value = '';
      return;
    }

    setError('');
    setAvatarFile(file);
    setAvatarPreview(prev => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
  }, [t]);

  const handleAvatarClear = useCallback(() => {
    setAvatarFile(null);
    setAvatarPreview(prev => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    if (avatarInputRef.current) avatarInputRef.current.value = '';
  }, []);

  useEffect(() => () => {
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
  }, [avatarPreview]);

  /**
   * Maneja envío del formulario.
   * Si hay avatarFile → multipart/form-data (backend acepta PATCH multipart
   * desde el fix reciente). Sin avatar → JSON como antes.
   */
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      let payload = formData;
      if (avatarFile) {
        const fd = new FormData();
        Object.entries(formData).forEach(([k, v]) => {
          if (v !== null && v !== undefined && v !== '') fd.append(k, v);
        });
        fd.append('avatar', avatarFile);
        payload = fd;
      }

      const updatedUser = await updateUserProfile(payload);
      setUser(prev => ({ ...prev, ...updatedUser }));
      setSuccess(true);
      handleAvatarClear();
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
  }, [formData, avatarFile, navigate, setUser, t, handleAvatarClear]);

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
              {/* Avatar */}
              <div>
                <label className="block text-sm font-semibold text-neutral-dark mb-3">
                  {t('userProfile.avatarLabel', 'Foto de perfil')}
                </label>
                <div className="flex items-center gap-5">
                  <div className="relative shrink-0">
                    <img
                      src={avatarPreview || getAvatarUrl(user, '100x100')}
                      alt="avatar"
                      className="w-24 h-24 rounded-full object-cover border-2 border-primary shadow-sm"
                    />
                    {avatarPreview && (
                      <button
                        type="button"
                        onClick={handleAvatarClear}
                        className="absolute -top-1 -right-1 bg-white border border-neutral-dark/20 rounded-full p-1 shadow hover:bg-red-50 hover:border-red-300 transition-colors"
                        title={t('userProfile.avatarRemove', 'Quitar selección')}
                      >
                        <X size={14} className="text-red-600" />
                      </button>
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      ref={avatarInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => avatarInputRef.current?.click()}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-neutral-dark/20 hover:border-primary hover:bg-primary/5 text-sm font-semibold text-neutral-dark transition-all"
                    >
                      <Camera size={18} />
                      {avatarFile
                        ? t('userProfile.avatarChange', 'Cambiar imagen')
                        : t('userProfile.avatarUpload', 'Subir nueva imagen')}
                    </button>
                    <p className="text-xs text-neutral-dark/50 mt-2">
                      {t('userProfile.avatarHint', 'JPG, PNG o WEBP. Máximo 5MB.')}
                    </p>
                    {avatarFile && (
                      <p className="text-xs text-primary mt-1 font-medium truncate max-w-xs">
                        {avatarFile.name}
                      </p>
                    )}
                  </div>
                </div>
              </div>

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
                  placeholder="+57 300 123 4567"
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
                  placeholder="Calle 22 # 14-30"
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
                    placeholder="Santa Marta"
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
                    placeholder="Magdalena"
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
                    placeholder="Colombia"
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
                    placeholder="470004"
                    maxLength="10"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Ubicación preferida — solo para clientes */}
          {isClient && (
            <div className="bg-white rounded-2xl shadow-sm border border-neutral-dark/5 p-6 hover:shadow-md transition-shadow">
              <h2 className="font-heading text-xl font-bold text-neutral-dark mb-2 flex items-center gap-2">
                <MapPin size={24} className="text-primary" />
                {t('userProfile.locationTitle', 'Ubicación preferida')}
              </h2>
              <p className="text-sm text-neutral-dark/60 mb-4">
                {t('userProfile.locationSubtitle', 'Define tu punto base para que el catálogo priorice trabajadores cercanos. Se guarda en este dispositivo, no en tu cuenta.')}
              </p>

              <div className="rounded-xl border border-neutral-dark/10 overflow-hidden bg-gray-50">
                <LocationPicker
                  latitude={clientLocation?.lat ?? null}
                  longitude={clientLocation?.lng ?? null}
                  onLocationChange={handleLocationChange}
                />
              </div>

              <div className="mt-4 space-y-3">
                <div>
                  <label className="block text-sm font-semibold text-neutral-dark mb-1">
                    {t('userProfile.locationRadiusLabel', 'Radio de búsqueda')}: {clientLocation?.radiusKm || 20} km
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="100"
                    step="5"
                    value={clientLocation?.radiusKm || 20}
                    onChange={handleRadiusChange}
                    className="w-full accent-primary"
                  />
                  <div className="flex justify-between text-xs text-neutral-dark/40 mt-1">
                    <span>5 km</span>
                    <span>100 km</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleSaveLocation}
                    className="flex-1 bg-primary hover:bg-primary-hover text-white font-semibold py-2.5 rounded-xl transition-colors"
                  >
                    {t('userProfile.locationSave', 'Guardar ubicación')}
                  </button>
                  {clientLocation && (
                    <button
                      type="button"
                      onClick={handleClearLocation}
                      className="px-4 py-2.5 border border-neutral-dark/20 hover:border-red-300 hover:text-red-600 text-neutral-dark font-medium rounded-xl transition-colors"
                    >
                      {t('userProfile.locationClear', 'Borrar')}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

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
