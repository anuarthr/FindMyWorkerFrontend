import { Search, MapPin } from 'lucide-react';
import WorkerMap from '../WorkerMap';

const ClientHome = ({ user }) => {
  return (
    <div className="space-y-10 pb-10">
      {/*(Buscador IA)*/}
      <div className="bg-neutral-dark rounded-2xl p-8 md:p-12 text-center shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full -mr-16 -mt-16 blur-2xl"></div>
        
        <h2 className="relative z-10 font-heading text-3xl md:text-4xl font-bold text-white mb-4">
          ¿Qué necesitas construir hoy, {user.first_name}?
        </h2>
        
        <div className="relative z-10 max-w-2xl mx-auto mt-8">
          <div className="relative group">
            <input 
              type="text" 
              placeholder="Ej. Plomero, Electricista, 'Se rompió la tubería'..." 
              className="w-full py-4 pl-6 pr-16 rounded-full text-white focus:outline-none shadow-xl focus:ring-4 focus:ring-primary/30 bg-neutral-dark/50 placeholder-white/70 transition-colors"
            />
            <button className="absolute right-2 top-2 bg-primary hover:bg-primary-hover text-white p-2.5 rounded-full transition-transform active:scale-95 cursor-pointer">
              <Search size={24} />
            </button>
          </div>
          <p className="text-white/60 text-sm mt-3">
            Prueba nuestra <span className="text-secondary font-bold">Búsqueda con IA</span> describiendo tu problema.
          </p>
        </div>
      </div>

      <div>
        <h3 className="font-heading text-xl font-bold text-neutral-dark mb-4">Categorías Populares</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {['Plomería', 'Electricidad', 'Albañilería', 'Pintura'].map((cat) => (
            <div key={cat} className="bg-surface p-4 rounded-xl border border-neutral-dark/10 hover:border-primary hover:shadow-md cursor-pointer transition-all text-center">
              <span className="font-bold text-neutral-dark">{cat}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="text-primary" size={24} />
          <h3 className="font-heading text-xl font-bold text-neutral-dark">
            Talento cerca de ti
          </h3>
        </div>
        
        <div className="bg-surface rounded-2xl shadow-md border border-neutral-dark/10 p-1 overflow-hidden h-[500px] md:h-[600px] relative">
          <WorkerMap />
          
          {/* Overlay informativo */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-neutral-dark/80 to-transparent p-4 pointer-events-none z-[400]">
            <p className="text-white text-xs md:text-sm text-center">
              Explora el mapa para encontrar profesionales verificados en tu zona.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default ClientHome;
