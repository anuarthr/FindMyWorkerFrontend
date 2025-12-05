import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { AlertTriangle, CheckCircle, Edit2, Briefcase, MapPin, Loader2 } from 'lucide-react';

const WorkerHome = ({ user }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFreshProfile = async () => {
      try {
        const { data } = await api.get('workers/me/');
        setProfile(data);
      } catch (error) {
        console.error("Error refrescando perfil worker:", error);
        setProfile(user.worker_profile);
      } finally {
        setLoading(false);
      }
    };

    fetchFreshProfile();
  }, [user]);

  if (loading) {
    return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-primary" /></div>;
  }

  const isProfileComplete = profile?.profession && profile?.latitude && profile?.longitude;

  const handleVerifyMe = async () => {
  try {
    await api.patch('workers/me/', { is_verified: true });
    alert("¡Ahora estás verificado! Deberías aparecer en el mapa.");
    window.location.reload();
  } catch (e) {
    console.error(e);
  }
};

  return (
    <div className="space-y-8">
      
      <div className="flex justify-between items-end">
        <div>
          <h1 className="font-heading text-3xl font-bold text-neutral-dark">
            Hola, {user.first_name} 👋
          </h1>
          <p className="text-neutral-dark/60 mt-1">Tu panel de control freelance.</p>
        </div>
        
        {isProfileComplete && (
          <Link 
            to="/profile/edit" 
            className="hidden md:flex items-center gap-2 text-sm font-bold text-primary hover:text-primary-hover bg-primary/10 px-4 py-2 rounded-lg transition-colors"
          >
            <Edit2 size={16} /> Editar Perfil
          </Link>
        )}
      </div>

      {!isProfileComplete ? (
        <div className="bg-secondary/10 border border-secondary text-neutral-dark p-6 rounded-xl flex flex-col md:flex-row items-start gap-4 animate-in fade-in slide-in-from-top-4">
          <div className="bg-white p-2 rounded-full text-secondary shrink-0 shadow-sm">
            <AlertTriangle size={24} />
          </div>
          <div className="flex-1">
            <h3 className="font-heading font-bold text-lg text-neutral-dark">
              ¡Completa tu perfil para aparecer en el mapa!
            </h3>
            <p className="text-sm opacity-80 mb-4 leading-relaxed">
              Los clientes usan el mapa para encontrar talento cercano. Necesitamos saber tu 
              <span className="font-bold"> profesión</span> y <span className="font-bold">ubicación</span>.
            </p>
            <Link 
              to="/profile/edit" 
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-lg font-bold text-sm transition-all shadow-md hover:shadow-lg active:scale-95"
            >
              Completar Perfil Ahora <span className="text-lg">→</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-neutral-dark/10 rounded-xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4 w-full">
             <div className="w-12 h-12 rounded-full bg-neutral-light flex items-center justify-center text-2xl">
               👷
             </div>
             <div>
               <h3 className="font-bold text-lg text-neutral-dark flex items-center gap-2">
                 {profile.profession}
                 <span className="bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">
                   Activo
                 </span>
               </h3>
               <div className="flex items-center gap-3 text-xs text-neutral-dark/60 mt-1">
                 <span className="flex items-center gap-1"><Briefcase size={12}/> {profile.years_experience} años exp.</span>
                 <span className="flex items-center gap-1"><MapPin size={12}/> Visible en mapa</span>
               </div>
             </div>
          </div>
          
          <Link 
            to="/profile/edit" 
            className="w-full md:w-auto flex justify-center items-center gap-2 border border-neutral-dark/20 hover:border-primary text-neutral-dark hover:text-primary px-4 py-2 rounded-lg font-bold text-sm transition-colors"
          >
            <Edit2 size={16} />
            Editar
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface p-6 rounded-xl shadow-sm border border-neutral-dark/5">
          <p className="text-sm text-neutral-dark/60 font-bold uppercase mb-2">Ganancias del Mes</p>
          <p className="text-3xl font-heading font-bold text-primary">$0.00</p>
        </div>
        <div className="bg-surface p-6 rounded-xl shadow-sm border border-neutral-dark/5">
          <p className="text-sm text-neutral-dark/60 font-bold uppercase mb-2">Trabajos Activos</p>
          <p className="text-3xl font-heading font-bold text-neutral-dark">0</p>
        </div>
        <div className="bg-surface p-6 rounded-xl shadow-sm border border-neutral-dark/5">
          <p className="text-sm text-neutral-dark/60 font-bold uppercase mb-2">Calificación</p>
          <div className="flex items-center gap-2">
            <p className="text-3xl font-heading font-bold text-neutral-dark">5.0</p>
            <CheckCircle size={24} className="text-green-500" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkerHome;
