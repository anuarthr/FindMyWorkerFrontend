import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import LocationPicker from '../../components/LocationPicker';
import { Save, ArrowLeft, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const EditProfile = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    profession: '',
    years_experience: 0,
    hourly_rate: '',
    bio: '',
    latitude: null,  
    longitude: null,
  });

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
      } finally {
        setFetching(false);
      }
    };
    fetchWorkerProfile();
  }, []);

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

    const payload = {
      profession: formData.profession,
      years_experience: formData.years_experience,
      hourly_rate: formData.hourly_rate,
      bio: formData.bio,
      latitude: formData.latitude !== null ? parseFloat(formData.latitude) : null,
      longitude: formData.longitude !== null ? parseFloat(formData.longitude) : null
    };

    try {
      await api.patch('workers/me/', payload);
      navigate('/dashboard');
    } catch (err) {
      console.error("Error guardando perfil:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-light p-6">
      <div className="max-w-2xl mx-auto bg-surface rounded-xl shadow-lg p-8 border border-neutral-dark/10">
        
        <button 
          onClick={() => navigate('/dashboard')} 
          className="flex items-center text-neutral-dark/60 hover:text-primary mb-6 text-sm font-bold transition-colors"
        >
          <ArrowLeft size={16} className="mr-1" /> {t('editProfile.backToDashboard')}
        </button>

        <h1 className="font-heading text-2xl font-bold text-neutral-dark mb-2">
          {t('editProfile.title')}
        </h1>
        
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div>
            <label className="block text-sm font-medium text-neutral-dark mb-1">{t('editProfile.professionLabel')}</label>
            <input
              type="text"
              value={formData.profession}
              onChange={(e) => setFormData({...formData, profession: e.target.value})}
              className="w-full p-3 border border-neutral-dark/20 rounded-lg"
              required
            />
          </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Experiencia */}
            <div>
              <label className="block text-sm font-medium text-neutral-dark mb-1">{t('editProfile.experienceLabel')}</label>
              <input
                type="number"
                value={formData.years_experience}
                onChange={(e) => setFormData({...formData, years_experience: e.target.value})}
                className="w-full p-3 border border-neutral-dark/20 rounded-lg"
                required
              />
            </div>

            {/* Tarifa */}
            <div>
              <label className="block text-sm font-medium text-neutral-dark mb-1">{t('editProfile.rateLabel')}</label>
              <input
                type="number"
                step="0.01"
                value={formData.hourly_rate}
                onChange={(e) => setFormData({...formData, hourly_rate: e.target.value})}
                className="w-full p-3 border border-neutral-dark/20 rounded-lg"
                required
              />
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-neutral-dark mb-1">{t('editProfile.bioLabel')}</label>
            <textarea
              rows="4"
              value={formData.bio}
              onChange={(e) => setFormData({...formData, bio: e.target.value})}
              className="w-full p-3 border border-neutral-dark/20 rounded-lg"
            ></textarea>
          </div>

          {/* Mapa */}
          <div className="pt-6 border-t border-neutral-dark/10">
             <h3 className="font-heading text-lg font-bold text-neutral-dark mb-4">
               📍 {t('editProfile.mapTitle')}
             </h3>
             <p className="text-sm text-gray-500 mb-3">
               {t('editProfile.mapSubtitle')}
             </p>
             
             <div className="bg-white p-1 rounded-xl border border-neutral-dark/20">
               <LocationPicker 
                 latitude={formData.latitude} 
                 longitude={formData.longitude} 
                 onLocationChange={handleLocationChange} 
               />
             </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 mt-4"
          >
            {loading ? <Loader2 className="animate-spin" /> : <Save size={20} />}
            {t('editProfile.saveBtn')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;
