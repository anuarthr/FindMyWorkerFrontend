import React, { useState, useEffect, useCallback } from 'react';
import { Search, List, Map as MapIcon, Filter } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import WorkerMap from './WorkerMap';       
import FiltersSidebar from './FiltersSidebar'; 
import WorkerCard from './WorkerCard';
import ClientOrders from './ClientOrders';
import { getWorkers } from '../../api/workers';

/**
 * Ubicación por defecto (Santa Marta, Colombia)
 */
const DEFAULT_LOCATION = { lat: 11.24079, lng: -74.19904 };

/**
 * Componente de encabezado de búsqueda con saludo
 */
const SearchHeader = ({ userName, searchValue, onSearchChange, t }) => (
  <div className="bg-[#4A3B32] rounded-b-3xl p-8 md:p-12 text-center shadow-lg relative overflow-hidden mx-4 mt-4">
    <div className="absolute top-0 right-0 w-32 h-32 bg-[#C04A3E]/20 rounded-full blur-2xl"></div>
    
    <h2 className="relative z-10 font-sans text-2xl md:text-3xl font-bold text-white mb-4">
      {t('clientHome.greeting', { name: userName })}
    </h2>
    
    <div className="relative z-10 max-w-2xl mx-auto mt-6">
      <div className="relative">
        <input 
          type="text" 
          placeholder={t('clientHome.searchPlaceholder')} 
          value={searchValue}
          onChange={onSearchChange}
          className="w-full py-3 pl-5 pr-12 rounded-full text-white bg-white/10 border border-white/20 placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-[#C04A3E]"
        />
        <Search className="absolute right-4 top-3 text-white/80" size={20} />
      </div>
    </div>
  </div>
);

/**
 * Barra de herramientas con selector de modo de vista
 */
const ToolbarButtons = ({ viewMode, onViewModeChange, t }) => (
  <div className="flex bg-gray-100 p-1 rounded-md">
    <button 
      onClick={() => onViewModeChange('list')}
      className={`p-1.5 rounded cursor-pointer ${viewMode === 'list' ? 'bg-white shadow text-[#C04A3E]' : 'text-gray-400'}`}
    >
      <List size={18} />
    </button>
    <button 
      onClick={() => onViewModeChange('map')}
      className={`p-1.5 rounded cursor-pointer ${viewMode === 'map' ? 'bg-white shadow text-[#C04A3E]' : 'text-gray-400'}`}
    >
      <MapIcon size={18} />
    </button>
  </div>
);

const ClientHome = ({ user }) => {
  const { t } = useTranslation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [viewMode, setViewMode] = useState('list');
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [refetchKey, setRefetchKey] = useState(0);

  const [workers, setWorkers] = useState([]);
  const [userLocation, setUserLocation] = useState(null);

  const handleRetry = useCallback(() => {
    setFetchError(false);
    setRefetchKey(k => k + 1);
  }, []);

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
        () => {
          setUserLocation(DEFAULT_LOCATION);
        }
      );
    } else {
      setUserLocation(DEFAULT_LOCATION);
    }
  }, []);

  useEffect(() => {
    // Flag para ignorar el resultado si el efecto se re-ejecutó antes de que respondiera
    let cancelled = false;

    const fetchWorkers = async () => {
      setLoading(true);
      setFetchError(false);

      // La geo-ubicación se usa SOLO para el mapa y como filtro opcional del sidebar.
      // En la vista de lista no se filtra por distancia para no excluir trabajadores
      // que no tienen coordenadas asignadas cerca del usuario.
      const activeFilters = {
        ...filters,
        userLocation: null,
        radius: undefined,
      };

      try {
        const data = await getWorkers(activeFilters);
        if (cancelled) return;
        setWorkers(Array.isArray(data) ? data : []);
      } catch (error) {
        if (cancelled) return;
        setFetchError(true);
        setWorkers([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchWorkers();

    return () => { cancelled = true; };
  }, [filters, refetchKey]); // userLocation se quitó intencionalmente — no filtra la lista por geo

  const handleSearchChange = useCallback((e) => {
    setFilters(prev => ({ ...prev, search: e.target.value }));
  }, []);

  const handleToggleSidebar = useCallback(() => {
    setIsSidebarOpen(prev => !prev);
  }, []);

  const userName = user?.first_name || t('clientHome.visitor');

  return (
    <div className="space-y-6 pb-10 bg-[#EFE6DD] min-h-screen">
      
      {/* HEADER BUSCADOR */}
      <SearchHeader 
        userName={userName}
        searchValue={filters.search}
        onSearchChange={handleSearchChange}
        t={t}
      />

      {/* ÁREA PRINCIPAL */}
      <div className="px-4 md:px-6 max-w-7xl mx-auto flex flex-col lg:flex-row gap-6 items-start">
        
        {/* Sidebar */}
        <div className={`lg:block ${isSidebarOpen ? 'block fixed inset-0 z-50 bg-white p-4' : 'hidden'}`}>
           <FiltersSidebar 
             filters={filters} 
             setFilters={setFilters} 
             isOpen={isSidebarOpen} 
             toggleSidebar={handleToggleSidebar}
           />
        </div>

        {/* Panel Central */}
        <div className="flex-1 w-full">
          
          {/* Toolbar */}
          <div className="flex justify-between items-center mb-4 bg-white p-3 rounded-lg shadow-sm">
            <div className="flex items-center gap-2">
               <button onClick={handleToggleSidebar} className="lg:hidden p-2 bg-gray-100 rounded cursor-pointer">
                 <Filter size={18} />
               </button>
               <span className="font-bold text-[#4A3B32] text-sm">
                 {t('clientHome.resultsCount', { count: workers.length })}
               </span>
            </div>

            <ToolbarButtons 
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              t={t}
            />
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
                 <WorkerMap workers={workers} userLocation={userLocation} />
              </div>
            ) : fetchError ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <svg className="w-12 h-12 text-[#C04A3E]/40 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M12 9v4m0 4h.01M12 3a9 9 0 100 18A9 9 0 0012 3z" />
                </svg>
                <p className="text-[#4A3B32] font-semibold mb-1">{t('common.error')}</p>
                <p className="text-gray-500 text-sm mb-4">No se pudo conectar con el servidor. Verifica tu conexión.</p>
                <button
                  onClick={handleRetry}
                  className="bg-[#C04A3E] hover:bg-[#A63D33] text-white rounded-lg px-4 py-2 text-sm transition"
                >
                  Reintentar
                </button>
              </div>
            ) : !loading && workers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <svg className="w-12 h-12 text-[#4A3B32]/20 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M17 20h5v-2a4 4 0 00-5-3.87M9 20H4v-2a4 4 0 015-3.87m6-4a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <p className="text-[#4A3B32] font-semibold">{t('clientHome.noWorkers')}</p>
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

      {/* ========== SECCIÓN DE ÓRDENES DEL CLIENTE (NUEVO) ========== */}
      <div className="px-4 md:px-6 max-w-7xl mx-auto mt-12">
        <ClientOrders />
      </div>
    </div>
  );
};

export default ClientHome;
