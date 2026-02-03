import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import SearchBar from '../components/recommendations/SearchBar';
import WorkerRecommendationList from '../components/recommendations/WorkerRecommendationList';
import { useRecommendationSearch } from '../hooks/useRecommendationSearch';

const SearchWorkers = () => {
  const { t } = useTranslation();  
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    results,
    loading,
    error,
    modelStatus,
    pagination,
    search,
    clearResults,
    checkModelHealth
  } = useRecommendationSearch();

  const [currentQuery, setCurrentQuery] = useState('');
  const [currentLocation, setCurrentLocation] = useState(null);
  const [currentFilters, setCurrentFilters] = useState({});
  const [pollingInterval, setPollingInterval] = useState(null);

  // Polling para verificar si el modelo se entrena
  useEffect(() => {
    // Solo hacer polling si el backend está disponible y el modelo no está entrenado
    if (!modelStatus.trained && modelStatus.backend_ready !== false) {
      const interval = setInterval(() => {
        checkModelHealth();
      }, 30000); // Cada 30 segundos
      setPollingInterval(interval);
    } else if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }

    return () => {
      if (pollingInterval) clearInterval(pollingInterval);
    };
  }, [modelStatus.trained, modelStatus.backend_ready, checkModelHealth]);

  // Redirigir si no es cliente
  useEffect(() => {
    if (user && user.role !== 'CLIENT') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSearch = (query, location, filters) => {
    setCurrentQuery(query);
    setCurrentLocation(location);
    setCurrentFilters(filters);
    search(query, location, { ...filters, page: 1 });
  };

  const handlePageChange = (newPage) => {
    if (currentQuery && currentLocation) {
      search(currentQuery, currentLocation, { ...currentFilters, page: newPage });
    }
  };

  const handleRetry = () => {
    clearResults();
    if (currentQuery && currentLocation) {
      search(currentQuery, currentLocation, currentFilters);
    }
  };

  return (
    <div className="min-h-screen bg-[#EFE6DD]">
      {/* Header */}
      <div className="bg-white border-b border-[#4A3B32]/10 sticky top-0 z-40 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 text-[#4A3B32] hover:text-[#C04A3E] hover:bg-[#EFE6DD] rounded-full transition-colors"
              title={t('common.backToDashboard')}
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="font-bold text-xl text-[#4A3B32]">
              🤖 {t('search.title')}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">
              {t('search.modelStatus')}: 
            </span>
            <span className={`text-xs font-bold px-2 py-1 rounded-full ${
              modelStatus.trained ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
            }`}>
              {modelStatus.trained ? t('search.ready') : t('search.training')}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Barra de búsqueda */}
        <SearchBar 
          onSearch={handleSearch} 
          loading={loading}
          modelStatus={modelStatus}
        />

        {/* Error display */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md flex items-start justify-between">
            <div>
              <p className="font-bold text-red-800 text-sm mb-1">
                {t('common.error')}
              </p>
              <p className="text-red-700 text-xs">
                {error}
              </p>
            </div>
            <button
              onClick={handleRetry}
              className="flex items-center gap-1 text-xs font-bold text-red-700 hover:text-red-900 transition-colors"
            >
              <RefreshCw size={14} />
              {t('recommendations.retry')}
            </button>
          </div>
        )}

        {/* Lista de resultados */}
        {(results.length > 0 || loading) && (
          <WorkerRecommendationList
            results={results}
            loading={loading}
            query={currentQuery}
            pagination={pagination}
            onPageChange={handlePageChange}
          />
        )}
      </main>
    </div>
  );
};

export default SearchWorkers;
