import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { Save, ArrowLeft, Loader2 } from 'lucide-react';

const EditProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    profession: '',
    years_experience: 0,
    hourly_rate: '',
    bio: '',
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
        });
      } catch (err) {
        console.error("Error cargando perfil:", err);
        setError("No pudimos cargar tu información profesional.");
      } finally {
        setFetching(false);
      }
    };

    fetchWorkerProfile();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.patch('workers/me/', formData);
      
      navigate('/dashboard');
    } catch (err) {
      console.error("Error guardando perfil:", err);
      setError("Error al guardar los cambios. Verifica tu conexión.");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-light">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-light p-6">
      <div className="max-w-2xl mx-auto bg-surface rounded-xl shadow-lg p-8 border border-neutral-dark/10">
        
        {/* Header y Botón Volver */}
        <button 
          onClick={() => navigate('/dashboard')} 
          className="flex items-center text-neutral-dark/60 hover:text-primary mb-6 text-sm font-bold transition-colors"
        >
          <ArrowLeft size={16} className="mr-1" /> Volver al Dashboard
        </button>

        <h1 className="font-heading text-2xl font-bold text-neutral-dark mb-2">
          Editar Perfil Profesional
        </h1>
        <p className="text-neutral-dark/60 mb-6 text-sm">
          Mantén tu información actualizada para aparecer en más búsquedas.
        </p>

        {/* Mensaje de Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profesión */}
          <div>
            <label className="block text-sm font-medium text-neutral-dark mb-1">Profesión / Oficio</label>
            <input
              type="text"
              value={formData.profession}
              onChange={(e) => setFormData({...formData, profession: e.target.value})}
              className="w-full p-3 border border-neutral-dark/20 rounded-lg focus:ring-2 focus:ring-primary outline-none transition-shadow"
              placeholder="Ej. Plomero, Electricista, Carpintero..."
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Experiencia */}
            <div>
              <label className="block text-sm font-medium text-neutral-dark mb-1">Años de Experiencia</label>
              <input
                type="number"
                min="0"
                value={formData.years_experience}
                onChange={(e) => setFormData({...formData, years_experience: e.target.value})}
                className="w-full p-3 border border-neutral-dark/20 rounded-lg focus:ring-2 focus:ring-primary outline-none transition-shadow"
                required
              />
            </div>

            {/* Tarifa */}
            <div>
              <label className="block text-sm font-medium text-neutral-dark mb-1">Tarifa por Hora ($)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-dark/40">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.hourly_rate}
                  onChange={(e) => setFormData({...formData, hourly_rate: e.target.value})}
                  className="w-full p-3 pl-8 border border-neutral-dark/20 rounded-lg focus:ring-2 focus:ring-primary outline-none transition-shadow"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-neutral-dark mb-1">Biografía y Habilidades</label>
            <textarea
              rows="5"
              value={formData.bio}
              onChange={(e) => setFormData({...formData, bio: e.target.value})}
              className="w-full p-3 border border-neutral-dark/20 rounded-lg focus:ring-2 focus:ring-primary outline-none resize-none transition-shadow"
              placeholder="Describe detalladamente qué trabajos realizas. Ejemplo: Instalación de grifos, reparación de fugas, mantenimiento de calentadores..."
              required
            ></textarea>
            <p className="text-xs text-neutral-dark/50 mt-1 text-right">
              Tip: Usa palabras clave específicas. La IA las usará para recomendarte.
            </p>
          </div>

          {/* Botón Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={20} /> Guardando...
              </>
            ) : (
              <>
                <Save size={20} /> Guardar Cambios
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;
