import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  MapPin, Star, Clock, ArrowLeft, ShieldCheck, 
  MessageSquare, CalendarCheck 
} from 'lucide-react';
import { getWorkerById } from '../../api/workers';

const WorkerPublicProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [worker, setWorker] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWorker = async () => {
      setLoading(true);
      const data = await getWorkerById(id);
      setWorker(data);
      setLoading(false);
    };
    fetchWorker();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-[#EFE6DD] flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C04A3E]"></div>
    </div>
  );

  if (!worker) return (
    <div className="min-h-screen bg-[#EFE6DD] flex flex-col items-center justify-center text-[#4A3B32]">
      <h2 className="text-2xl font-bold mb-2">Trabajador no encontrado</h2>
      <button onClick={() => navigate(-1)} className="text-[#C04A3E] underline">Volver al mapa</button>
    </div>
  );

  const userData = worker.user || worker;
  const firstName = userData.first_name || "Usuario";
  const lastName = userData.last_name || "";
  const fullName = `${firstName} ${lastName}`.trim() || "Sin Nombre";
  const avatar = userData.avatar || "https://placehold.co/150x150";
  const hourlyRate = parseInt(worker.hourly_rate || 0).toLocaleString();

  return (
    <div className="min-h-screen bg-[#EFE6DD] pb-10">
      
      {/* Navegación */}
      <div className="bg-[#4A3B32] text-white px-6 py-4 flex items-center gap-4 sticky top-0 z-50 shadow-md">
        <button 
          onClick={() => navigate(-1)} 
          className="p-2 hover:bg-white/10 rounded-full transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="font-bold text-lg hidden md:block">Volver a resultados</h1>
      </div>

      <div className="max-w-5xl mx-auto px-4 -mt-8 relative z-10">
        
        {/* HERO */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-[#4A3B32]/5">
          {/* Portada decorativa */}
          <div className="h-32 bg-gradient-to-r from-[#C04A3E] to-[#E37B5B]"></div>
          
          <div className="px-6 pb-6 md:px-10 flex flex-col md:flex-row gap-6">
            {/* Avatar Flotante */}
            <div className="-mt-16 flex-shrink-0">
              <img 
                src={avatar} 
                alt={fullName} 
                className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover bg-white"
              />
            </div>

            {/* Info Principal */}
            <div className="pt-2 md:pt-4 flex-1">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-[#4A3B32] capitalize">{fullName}</h1>
                  <p className="text-[#C04A3E] font-bold uppercase tracking-wider text-sm mt-1">
                    {worker.profession}
                  </p>
                  
                  <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <MapPin size={16} />
                      <span>Santa Marta, Magdalena</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <ShieldCheck size={16} className={worker.is_verified ? "text-green-600" : "text-gray-300"} />
                      <span>{worker.is_verified ? "Verificado" : "No verificado"}</span>
                    </div>
                  </div>
                </div>

                {/* Bloque de Precio y Rating */}
                <div className="flex items-center gap-6 bg-[#EFE6DD]/50 p-4 rounded-xl border border-[#4A3B32]/10">
                  <div className="text-center">
                    <p className="text-xs text-gray-500 uppercase font-bold">Tarifa</p>
                    <p className="text-2xl font-bold text-[#C04A3E]">${hourlyRate}<span className="text-sm text-gray-400">/hr</span></p>
                  </div>
                  <div className="w-px h-10 bg-gray-300"></div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500 uppercase font-bold">Rating</p>
                    <div className="flex items-center justify-center gap-1">
                      <span className="text-2xl font-bold text-[#4A3B32]">{worker.average_rating}</span>
                      <Star size={20} className="text-yellow-500 fill-current" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- GRID DE CONTENIDO --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          
          {/* Columna Izquierda: Detalles */}
          <div className="md:col-span-2 space-y-6">
            
            {/* Sobre Mí */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-[#4A3B32]/5">
              <h3 className="font-bold text-xl text-[#4A3B32] mb-4">Sobre mí</h3>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                {worker.bio || "Este profesional no ha agregado una descripción detallada aún. Contacta para más información."}
              </p>
            </div>

            {/* Habilidades */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-[#4A3B32]/5">
              <h3 className="font-bold text-xl text-[#4A3B32] mb-4">Habilidades & Servicios</h3>
              <div className="flex flex-wrap gap-2">
                {worker.skills?.length > 0 ? (
                  worker.skills.map((skill, index) => (
                    <span key={index} className="px-3 py-1.5 bg-[#EFE6DD] text-[#4A3B32] font-medium rounded-lg text-sm">
                      ✅ {skill.name}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-400 italic">No especificadas.</p>
                )}
              </div>
            </div>

            {/* (Placeholder) Reseñas */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-[#4A3B32]/5 opacity-60">
              <h3 className="font-bold text-xl text-[#4A3B32] mb-4 flex justify-between">
                Reseñas de Clientes
                <span className="text-xs bg-gray-100 px-2 py-1 rounded">Próximamente</span>
              </h3>
              <p className="text-gray-500 italic">El módulo de reseñas estará disponible pronto.</p>
            </div>
          </div>

          {/* Columna Derecha: Sticky Action Card */}
          <div className="relative">
            <div className="sticky top-24 space-y-4">
              <div className="bg-white p-6 rounded-2xl shadow-md border border-[#C04A3E]/20">
                <h3 className="font-bold text-lg text-[#4A3B32] mb-4">¿Te interesa este perfil?</h3>
                
                <div className="space-y-3">
                  <button className="w-full flex items-center justify-center gap-2 bg-[#C04A3E] text-white py-3.5 rounded-xl font-bold hover:bg-[#A0382E] transition-all shadow-lg shadow-[#C04A3E]/20 active:scale-95">
                    <CalendarCheck size={20} />
                    Contratar Ahora
                  </button>
                  
                  <button className="w-full flex items-center justify-center gap-2 bg-white border-2 border-[#4A3B32] text-[#4A3B32] py-3.5 rounded-xl font-bold hover:bg-gray-50 transition-all">
                    <MessageSquare size={20} />
                    Enviar Mensaje
                  </button>
                </div>
                
                <p className="text-xs text-center text-gray-400 mt-4">
                  Pagos protegidos por FindMyWorker Escrow.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default WorkerPublicProfile;
