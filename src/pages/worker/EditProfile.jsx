import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import LocationPicker from '../../components/LocationPicker';
import { 
  Save, ArrowLeft, Loader2, Briefcase, Clock, 
  DollarSign, FileText, MapPin, CheckCircle, AlertCircle 
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

const EditProfile = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    profession: '',
    years_experience: 0,
    hourly_rate: '',
    bio: '',
    latitude: null,  
    longitude: null,
  });

  const professions = [
    { value: 'PLUMBER', icon: '🔧' },
    { value: 'ELECTRICIAN', icon: '⚡' },
    { value: 'MASON', icon: '🧱' },
    { value: 'PAINTER', icon: '🎨' },
    { value: 'CARPENTER', icon: '🪚' },
    { value: 'OTHER', icon: '🛠️' }
  ];

  useEffect(() => {
    const fetchWorkerProfile = async () => {
      try {
        const { data } = await api.get('workers/me/');
        setFormData({
          profession: data.profession || '',
          years_experience: data.years_experience || 0,
          hourly_rate: data.hourly_rate || '',
          bio: data.bio || '',
          latitude: data.latitude, 
          longitude: data.longitude,
        });
      } catch (err) {
        console.error("Error cargando perfil:", err);
        setError(t('editProfile.error'));
      } finally {
        setFetching(false);
      }
    };
    fetchWorkerProfile();
  }, [t]);

  const handleLocationChange = (lat, lng) => {
    setFormData(prev => ({
      ...prev,
      latitude: lat,
      longitude: lng
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    const payload = {
      profession: formData.profession,
      years_experience: parseInt(formData.years_experience) || 0,
      hourly_rate: parseFloat(formData.hourly_rate) || 0,
      bio: formData.bio,
    };

    if (formData.latitude !== null && formData.longitude !== null) {
      payload.latitude = parseFloat(formData.latitude);
      payload.longitude = parseFloat(formData.longitude);
    }

    try {
      await api.patch('workers/me/', payload);
      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 
                       Object.values(err.response?.data || {}).flat().join(', ') ||
                       t('editProfile.error');
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-light to-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin text-primary mx-auto mb-4" size={48} />
          <p className="text-neutral-dark/60 font-medium">Cargando perfil...</p>
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
            {t('editProfile.backToDashboard')}
          </button>

          <div className="bg-white rounded-2xl shadow-sm border border-neutral-dark/5 p-6">
            <h1 className="font-heading text-3xl font-bold text-neutral-dark mb-2">
              {t('editProfile.title')}
            </h1>
            <p className="text-neutral-dark/60">{t('editProfile.subtitle')}</p>
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
            <p className="text-green-700 text-sm font-medium">{t('editProfile.success')}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Professional Info Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-neutral-dark/5 p-6 hover:shadow-md transition-shadow">
            <h2 className="font-heading text-xl font-bold text-neutral-dark mb-6 flex items-center gap-2">
              <Briefcase size={24} className="text-primary" />
              {t('editProfile.professionalInfoTitle')}
            </h2>

            <div className="space-y-5">
              {/* Profession */}
              <div>
                <label className="block text-sm font-semibold text-neutral-dark mb-2 flex items-center gap-2">
                  {t('editProfile.professionLabel')}
                </label>
                <div className="relative">
                  <select
                    value={formData.profession}
                    onChange={(e) => setFormData({...formData, profession: e.target.value})}
                    className="w-full p-3.5 pl-4 pr-10 border border-neutral-dark/20 rounded-xl bg-white hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all appearance-none cursor-pointer font-medium"
                    required
                  >
                    <option value="">{t('professions.select')}</option>
                    {professions.map(({ value, icon }) => (
                      <option key={value} value={value}>
                        {icon} {t(`professions.${value}`)}
                      </option>
                    ))}
                  </select>
                  <Briefcase className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-dark/30 pointer-events-none" size={20} />
                </div>
              </div>

              {/* Experience & Rate */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-neutral-dark mb-2 flex items-center gap-2">
                    <Clock size={16} />
                    {t('editProfile.experienceLabel')}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.years_experience}
                    onChange={(e) => setFormData({...formData, years_experience: parseInt(e.target.value) || 0})}
                    className="w-full p-3.5 border border-neutral-dark/20 rounded-xl hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-neutral-dark mb-2 flex items-center gap-2">
                    <DollarSign size={16} />
                    {t('editProfile.rateLabel')}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={formData.hourly_rate}
                    onChange={(e) => setFormData({...formData, hourly_rate: parseFloat(e.target.value) || 0})}
                    className="w-full p-3.5 border border-neutral-dark/20 rounded-xl hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    placeholder="50000"
                    required
                  />
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-semibold text-neutral-dark mb-2 flex items-center gap-2">
                  <FileText size={16} />
                  {t('editProfile.bioLabel')}
                </label>
                <textarea
                  rows="4"
                  value={formData.bio}
                  onChange={(e) => setFormData({...formData, bio: e.target.value})}
                  placeholder={t('editProfile.bioPlaceholder')}
                  className="w-full p-3.5 border border-neutral-dark/20 rounded-xl hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                ></textarea>
                <p className="text-xs text-neutral-dark/50 mt-1.5">
                  {formData.bio.length} / 500 {t('hiringModal.characters')}
                </p>
              </div>
            </div>
          </div>

          {/* Location Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-neutral-dark/5 p-6 hover:shadow-md transition-shadow">
            <h2 className="font-heading text-xl font-bold text-neutral-dark mb-2 flex items-center gap-2">
              <MapPin size={24} className="text-primary" />
              {t('editProfile.mapTitle')}
            </h2>
            <p className="text-sm text-neutral-dark/60 mb-4">
              {t('editProfile.mapSubtitle')}
            </p>
            
            <div className="bg-gray-50 p-2 rounded-xl border border-neutral-dark/10 overflow-hidden">
              <LocationPicker 
                latitude={formData.latitude} 
                longitude={formData.longitude} 
                onLocationChange={handleLocationChange} 
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || success}
            className="w-full bg-primary hover:bg-[#a83f34] text-white font-bold py-4 rounded-xl flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg group"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={22} />
                {t('editProfile.saving')}
              </>
            ) : success ? (
              <>
                <CheckCircle size={22} />
                {t('editProfile.success')}
              </>
            ) : (
              <>
                <Save size={22} className="group-hover:scale-110 transition-transform" />
                {t('editProfile.saveBtn')}
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;
