/**
 * Componente de barra de búsqueda para recomendaciones de trabajadores
 * Incluye búsqueda por texto, ubicación con mapa, y filtros avanzados
 */

import { useState, useCallback } from 'react';
import { Search, MapPin, Navigation, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { useTranslation } from 'react-i18next';

const DEFAULT_CENTER = { lat: 11.24079, lng: -74.19904 }; // Santa Marta
const MIN_QUERY_LENGTH = 3;

const ModelTrainingAlert = ({ t }) => (
  <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-md flex items-start gap-3">
    <Loader2 className="text-amber-600 animate-spin flex-shrink-0 mt-0.5" size={20} />
    <div>
      <p className="font-bold text-amber-800 text-sm">
        🤖 {t('search.modelTraining')}
      </p>
      <p className="text-amber-700 text-xs mt-1">
        {t('search.modelTrainingDesc')}
      </p>
    </div>
  </div>
);

const ModelReadyAlert = ({ t }) => (
  <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded-md">
    <p className="text-xs text-blue-800">
      {t('search.languageNote')}
    </p>
  </div>
);

const LocationDisplay = ({ location, showMap, setShowMap, t }) => (
  <div className="flex items-center gap-2 text-sm text-gray-600 bg-[#EFE6DD] px-3 py-2 rounded-md">
    <MapPin size={16} className="text-[#C04A3E]" />
    <span>
      {location.lat.toFixed(6)}, {location.lon.toFixed(6)}
    </span>
    <button
      type="button"
      onClick={() => setShowMap(!showMap)}
      className="ml-auto text-xs font-bold text-[#C04A3E] hover:underline"
    >
      {showMap ? t('search.hideMap') : t('search.showMap')}
    </button>
  </div>
);

const ValidationMessage = ({ isValid, loading, modelStatus, query, t }) => {
  if (isValid || loading) return null;
  
  const getMessage = () => {
    if (!modelStatus.trained) return t('search.waitingModel');
    if (!query.trim()) return t('search.enterQuery');
    if (query.trim().length < MIN_QUERY_LENGTH) return t('search.queryTooShort');
    return '';
  };

  return (
    <p className="text-xs text-center text-gray-500">
      {getMessage()}
    </p>
  );
};

/**
 * Componente principal de búsqueda
 * @param {Function} onSearch - Callback para ejecutar búsqueda
 * @param {boolean} loading - Estado de carga
 * @param {Object} modelStatus - Estado del modelo ML
 */
const SearchBar = ({ onSearch, loading, modelStatus }) => {
  const { t } = useTranslation();
  
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [filters, setFilters] = useState({
    serviceCategory: '',
    maxDistanceKm: 50
  });
  const [mapPosition, setMapPosition] = useState(null);
  const [gettingLocation, setGettingLocation] = useState(false);

  // Estado derivado: validación de búsqueda
  const isValid = query.trim().length >= MIN_QUERY_LENGTH && modelStatus.trained;

  // Obtener ubicación actual del usuario
  const handleGetCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      alert(t('search.gpsNotSupported'));
      return;
    }

    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newPos = { lat: pos.coords.latitude, lon: pos.coords.longitude };
        setLocation(newPos);
        setMapPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGettingLocation(false);
      },
      (error) => {
        console.error('Error obteniendo ubicación:', error);
        alert(t('search.locationError'));
        setGettingLocation(false);
      }
    );
  }, [t]);

  // Ejecutar búsqueda con parámetros actuales
  const handleSearch = useCallback(() => {
    if (isValid) {
      onSearch(query, location, filters);
    }
  }, [isValid, query, location, filters, onSearch]);

  // Manejar enter en textarea
  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSearch();
    }
  }, [handleSearch]);

  // Componente interno para manejar clics en el mapa
  const MapClickHandler = useCallback(() => {
    useMapEvents({
      click(e) {
        const newPos = { lat: e.latlng.lat, lon: e.latlng.lng };
        setLocation(newPos);
        setMapPosition(e.latlng);
      },
    });
    return mapPosition ? <Marker position={mapPosition} /> : null;
  }, [mapPosition]);

  return (
    <div className="bg-white rounded-xl shadow-md border border-[#4A3B32]/10 p-6 space-y-4">
      {/* Alertas de estado */}
      {!modelStatus.trained && <ModelTrainingAlert t={t} />}
      {modelStatus.trained && <ModelReadyAlert t={t} />}
      
      <div>
        <label className="block text-sm font-bold text-[#4A3B32] mb-2">
          {t('search.queryLabel')}
        </label>
        <div className="relative">
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={t('search.placeholder')}
            disabled={!modelStatus.trained}
            rows={3}
            className="w-full px-4 py-3 pr-12 border border-[#4A3B32]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C04A3E] focus:border-transparent resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          <Search 
            className="absolute right-4 top-3 text-[#4A3B32]/40" 
            size={20} 
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {t('search.queryHint')}
        </p>
      </div>
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-bold text-[#4A3B32]">
            📍 {t('search.locationLabel')} <span className="text-gray-400 font-normal text-xs">({t('common.optional')})</span>
          </label>
          <button
            type="button"
            onClick={handleGetCurrentLocation}
            disabled={gettingLocation || !modelStatus.trained}
            className="flex items-center gap-2 text-xs font-bold text-[#C04A3E] hover:text-[#E37B5B] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {gettingLocation ? (
              <Loader2 className="animate-spin" size={14} />
            ) : (
              <Navigation size={14} />
            )}
            {t('search.useLocation')}
          </button>
        </div>

        {location && (
          <LocationDisplay 
            location={location} 
            showMap={showMap} 
            setShowMap={setShowMap} 
            t={t} 
          />
        )}
        {showMap && (
          <div className="mt-3 h-64 w-full rounded-lg overflow-hidden border border-[#4A3B32]/20 shadow-inner">
            <MapContainer 
              center={mapPosition || DEFAULT_CENTER} 
              zoom={13} 
              className="h-full w-full"
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; OpenStreetMap'
              />
              <MapClickHandler />
            </MapContainer>
          </div>
        )}

        {!showMap && !location && (
          <button
            type="button"
            onClick={() => setShowMap(true)}
            disabled={!modelStatus.trained}
            className="w-full mt-2 py-2 border-2 border-dashed border-[#4A3B32]/20 rounded-lg text-sm text-[#4A3B32]/60 hover:border-[#C04A3E] hover:text-[#C04A3E] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('search.selectOnMap')}
          </button>
        )}
      </div>
      <div>
        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center justify-between w-full text-sm font-bold text-[#4A3B32] hover:text-[#C04A3E] transition-colors"
        >
          <span>{t('search.advancedFilters')}</span>
          {showFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {showFilters && (
          <div className="mt-4 space-y-4 pl-2 border-l-2 border-[#EFE6DD]">
            <div>
              <label className="block text-xs font-bold text-[#4A3B32] mb-1">
                {t('search.categoryLabel')}
              </label>
              <select
                value={filters.serviceCategory}
                onChange={(e) => setFilters({ ...filters, serviceCategory: e.target.value })}
                className="w-full px-3 py-2 border border-[#4A3B32]/20 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C04A3E]"
              >
                <option value="">{t('search.allCategories')}</option>
                <option value="plumbing">{t('search.category_plumbing')}</option>
                <option value="electrical">{t('search.category_electrical')}</option>
                <option value="construction">{t('search.category_construction')}</option>
                <option value="cleaning">{t('search.category_cleaning')}</option>
                <option value="other">{t('search.category_other')}</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#4A3B32] mb-1">
                {t('search.radiusLabel')}: {filters.maxDistanceKm} km
              </label>
              <input
                type="range"
                min="5"
                max="100"
                step="5"
                value={filters.maxDistanceKm}
                onChange={(e) => setFilters({ ...filters, maxDistanceKm: parseInt(e.target.value) })}
                className="w-full h-2 bg-[#EFE6DD] rounded-lg appearance-none cursor-pointer accent-[#C04A3E]"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>5 km</span>
                <span>100 km</span>
              </div>
            </div>
          </div>
        )}
      </div>
      <button
        onClick={handleSearch}
        disabled={!isValid || loading}
        className="w-full py-3 bg-[#C04A3E] text-white font-bold rounded-lg hover:bg-[#A03A2E] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin" size={20} />
            {t('search.searching')}
          </>
        ) : (
          <>
            <Search size={20} />
            {t('search.button')}
          </>
        )}
      </button>
      
      <ValidationMessage 
        isValid={isValid} 
        loading={loading} 
        modelStatus={modelStatus} 
        query={query} 
        t={t} 
      />
    </div>
  );
};

export default SearchBar;

