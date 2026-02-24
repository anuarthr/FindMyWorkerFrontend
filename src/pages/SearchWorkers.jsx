/**
 * Página de búsqueda semántica de trabajadores con IA
 * Permite buscar trabajadores usando búsqueda semántica con modelo de recomendación
 * @module pages/SearchWorkers
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import SearchBar from '../components/recommendations/SearchBar';
import WorkerRecommendationList from '../components/recommendations/WorkerRecommendationList';
import { useRecommendationSearch } from '../hooks/useRecommendationSearch';

/**
 * Badge del estado del modelo de recomendación
 * @param {Object} modelStatus - Estado del modelo {trained, corpus_size, vocabulary_size, available}
 * @param {Function} t - Función de traducción
 */
const ModelStatusBadge = ({ modelStatus, t }) => {
  // Si available es false, mostrar "No disponible"
  if (modelStatus.available === false) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500">
          {t('search.modelStatus')}: 
        </span>
        <span className="text-xs font-bold px-2 py-1 rounded-full bg-red-100 text-red-700">
          {t('search.unavailable')}
        </span>
      </div>
    );
  }
  
  return (
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
  );
};

/**
 * Header de la página con navegación y estado del modelo
 * @param {Function} onBack - Callback para volver al dashboard
 * @param {Function} t - Función de traducción
 * @param {Object} modelStatus - Estado del modelo de recomendación
 */
const PageHeader = ({ onBack, t, modelStatus }) => (
  <div className="bg-white border-b border-neutral-dark/10 sticky top-0 z-40 shadow-sm">
    <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2 text-neutral-dark hover:text-primary hover:bg-neutral-light rounded-full transition-colors"
          title={t('common.backToDashboard')}
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="font-bold text-xl text-neutral-dark">
          🤖 {t('search.title')}
        </h1>
      </div>
      <ModelStatusBadge modelStatus={modelStatus} t={t} />
    </div>
  </div>
);

/**
 * Alerta de error con botón de reintentar
 * @param {string} error - Mensaje de error
 * @param {Function} onRetry - Callback para reintentar la búsqueda
 * @param {Function} t - Función de traducción
 */
const ErrorAlert = ({ error, onRetry, t }) => (
  <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md flex items-start justify-between">
    <div>
      <p className="font-bold text-red-800 text-sm mb-1">
        {t('common.error')}
      </p>
      <p className="text-red-700 text-xs">{error}</p>
    </div>
    <button
      onClick={onRetry}
      className="flex items-center gap-1 text-xs font-bold text-red-700 hover:text-red-900 transition-colors"
    >
      <RefreshCw size={14} />
      {t('recommendations.retry')}
    </button>
  </div>
);

/**
 * Banner informativo cuando el sistema de IA no está disponible
 * @param {Function} onBackToDashboard - Callback para volver al dashboard
 * @param {Function} t - Función de traducción
 */
const AIUnavailableBanner = ({ onBackToDashboard, t }) => (
  <div className="bg-secondary/10 border-l-4 border-secondary p-6 rounded-md">
    <div className="flex items-start gap-4">
      <div className="text-4xl">🔧</div>
      <div className="flex-1">
        <h3 className="font-bold text-neutral-dark text-lg mb-2">
          {t('search.systemPreparingTitle')}
        </h3>
        <p className="text-neutral-dark text-sm mb-3">
          {t('search.systemPreparingMessage')}
        </p>
        <p className="text-neutral-dark/80 text-xs mb-4">
          {t('search.systemPreparingAction')}
        </p>
        <button
          onClick={onBackToDashboard}
          className="px-4 py-2 bg-primary text-white hover:bg-primary-hover rounded-md text-sm font-medium transition-colors flex items-center gap-2"
        >
          <ArrowLeft size={16} />
          {t('search.backToDashboard')}
        </button>
      </div>
    </div>
  </div>
);

/**
 * Componente principal de búsqueda de trabajadores
 * Maneja búsqueda semántica, filtros, paginación y polling del estado del modelo
 */
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

  // Constantes
  const POLLING_INTERVAL_MS = 30000;

  // Determinar si se debe hacer polling
  const shouldPoll = !modelStatus.trained && modelStatus.backend_ready !== false;

  // Polling para verificar si el modelo se entrena
  useEffect(() => {
    if (!shouldPoll) return;

    const interval = setInterval(checkModelHealth, POLLING_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [shouldPoll, checkModelHealth]);

  // Redirigir si no es cliente
  useEffect(() => {
    if (user && user.role !== 'CLIENT') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Handlers
  const handleSearch = useCallback((query, location, filters) => {
    setCurrentQuery(query);
    setCurrentLocation(location);
    setCurrentFilters(filters);
    search(query, location, { ...filters, page: 1 });
  }, [search]);

  const handlePageChange = useCallback((newPage) => {
    if (!currentQuery || !currentLocation) return;
    search(currentQuery, currentLocation, { ...currentFilters, page: newPage });
  }, [currentQuery, currentLocation, currentFilters, search]);

  const handleRetry = useCallback(() => {
    clearResults();
    if (currentQuery && currentLocation) {
      search(currentQuery, currentLocation, currentFilters);
    }
  }, [currentQuery, currentLocation, currentFilters, search, clearResults]);

  const handleBackToDashboard = () => navigate('/dashboard');

  // Verificar si hay resultados o está cargando
  const hasResults = useMemo(() => 
    results.length > 0 || loading,
    [results.length, loading]
  );

  // Verificar si el sistema de IA está no disponible
  const isAIUnavailable = modelStatus.available === false;

  return (
    <div className="min-h-screen bg-neutral-light">
      <PageHeader 
        onBack={handleBackToDashboard} 
        t={t} 
        modelStatus={modelStatus} 
      />

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Mostrar banner informativo si el sistema no está disponible */}
        {isAIUnavailable && (
          <AIUnavailableBanner 
            onBackToDashboard={handleBackToDashboard} 
            t={t} 
          />
        )}

        {/* Mostrar barra de búsqueda solo si el sistema está disponible */}
        {!isAIUnavailable && (
          <SearchBar 
            onSearch={handleSearch} 
            loading={loading}
            modelStatus={modelStatus}
          />
        )}

        {/* Mostrar errores (solo si no es el banner de no disponible) */}
        {!isAIUnavailable && error && (
          <ErrorAlert error={error} onRetry={handleRetry} t={t} />
        )}

        {/* Mostrar resultados */}
        {!isAIUnavailable && hasResults && (
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
