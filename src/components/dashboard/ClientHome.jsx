import React, { useState, useEffect } from 'react';
import { Search, List, Map as MapIcon, Filter, ArrowUpDown } from 'lucide-react';
import WorkerMap from './WorkerMap';       
import FiltersSidebar from './FiltersSidebar'; 
import WorkerCard from './WorkerCard';
import { getWorkers } from '../../api/workers';

const ClientHome = ({ user }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [viewMode, setViewMode] = useState('list');
  const [loading, setLoading] = useState(false);
  
  const [workers, setWorkers] = useState([]);
  const [userLocation, setUserLocation] = useState(null);

  const [filters, setFilters] = useState({
    search: '',
    category: '',
    minPrice: 0,
    maxPrice: 200000,
    minRating: 0,
    sortBy: '-average_rating',
  });

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error("Error Geo:", error);
          setUserLocation({ lat: 11.24079, lng: -74.19904 }); // Santa Marta Default
        }
      );
    } else {
        setUserLocation({ lat: 11.24079, lng: -74.19904 });
    }
  }, []);

  // 2. Cargar Workers
  useEffect(() => {
    const fetchWorkers = async () => {
      setLoading(true);
      const activeFilters = { 
        ...filters, 
        userLocation: userLocation, 
        radius: 20 
      };
      
      try {
        const data = await getWorkers(activeFilters);
        setWorkers(data || []);
      } catch (error) {
        console.error("Error fetching:", error);
      } finally {
        setLoading(false);
      }
    };

    if (userLocation) {
        fetchWorkers();
    }
  }, [filters, userLocation]);

  return (
    <div className="space-y-6 pb-10 bg-[#EFE6DD] min-h-screen">
      
      {/* HEADER BUSCADOR */}
      <div className="bg-[#4A3B32] rounded-b-3xl p-8 md:p-12 text-center shadow-lg relative overflow-hidden mx-4 mt-4">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#C04A3E]/20 rounded-full blur-2xl"></div>
        
        <h2 className="relative z-10 font-sans text-2xl md:text-3xl font-bold text-white mb-4">
          ¿Qué necesitas hoy, {user?.first_name || 'Visitante'}?
        </h2>
        
        <div className="relative z-10 max-w-2xl mx-auto mt-6">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Ej. Plomero..." 
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="w-full py-3 pl-5 pr-12 rounded-full text-white bg-white/10 border border-white/20 placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-[#C04A3E]"
            />
            <Search className="absolute right-4 top-3 text-white/80" size={20} />
          </div>
        </div>
      </div>

      {/* ÁREA PRINCIPAL */}
      <div className="px-4 md:px-6 max-w-7xl mx-auto flex flex-col lg:flex-row gap-6 items-start">
        
        {/* Sidebar */}
        <div className={`lg:block ${isSidebarOpen ? 'block fixed inset-0 z-50 bg-white p-4' : 'hidden'}`}>
           <FiltersSidebar 
             filters={filters} 
             setFilters={setFilters} 
             isOpen={isSidebarOpen} 
             toggleSidebar={() => setIsSidebarOpen(false)}
           />
        </div>

        {/* Panel Central */}
        <div className="flex-1 w-full">
          
          {/* Toolbar */}
          <div className="flex justify-between items-center mb-4 bg-white p-3 rounded-lg shadow-sm">
            <div className="flex items-center gap-2">
               <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 bg-gray-100 rounded">
                 <Filter size={18} />
               </button>
               <span className="font-bold text-[#4A3B32] text-sm">
                 {workers.length} Resultados
               </span>
            </div>

            <div className="flex bg-gray-100 p-1 rounded-md">
                 <button 
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-white shadow text-[#C04A3E]' : 'text-gray-400'}`}
                 >
                   <List size={18} />
                 </button>
                 <button 
                    onClick={() => setViewMode('map')}
                    className={`p-1.5 rounded ${viewMode === 'map' ? 'bg-white shadow text-[#C04A3E]' : 'text-gray-400'}`}
                 >
                   <MapIcon size={18} />
                 </button>
            </div>
          </div>

          {/* Vistas */}
          <div className="min-h-[500px] relative">
            {loading && (
               <div className="absolute inset-0 bg-white/60 z-20 flex items-center justify-center">
                 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C04A3E]"></div>
               </div>
            )}

            {viewMode === 'map' ? (
              <div className="h-[600px] rounded-xl overflow-hidden border border-[#4A3B32]/10 shadow-md bg-gray-100">
                 {/* IMPORTANTE: Pasamos workers como prop */}
                 <WorkerMap workers={workers} userLocation={userLocation} />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {workers.map(worker => (
                  <WorkerCard key={worker.id} worker={worker} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientHome;
