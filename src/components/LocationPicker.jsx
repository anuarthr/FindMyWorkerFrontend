/**
 * Componente selector de ubicación con mapa interactivo
 * Permite seleccionar ubicación mediante click en mapa o GPS
 * 
 * @param {Object} props
 * @param {number} props.latitude - Latitud inicial
 * @param {number} props.longitude - Longitud inicial
 * @param {Function} props.onLocationChange - Callback cuando cambia la ubicación
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { Navigation } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

const LocationPicker = ({ latitude, longitude, onLocationChange }) => {
  const { t } = useTranslation();
  
  // Centro por defecto (Santa Marta, Colombia)
  const defaultCenter = useMemo(() => ({ 
    lat: 11.24079, 
    lng: -74.19904 
  }), []); 
  const [position, setPosition] = useState(null);

  useEffect(() => {
    if (latitude && longitude) {
      setPosition({ lat: parseFloat(latitude), lng: parseFloat(longitude) });
    }
  }, [latitude, longitude]);

  // Obtener ubicación actual del GPS del dispositivo
  const handleGetCurrentLocation = useCallback((e) => {
    e.preventDefault();
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const newPos = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setPosition(newPos);
        onLocationChange(newPos.lat, newPos.lng);
      });
    } else {
      alert(t('locationPicker.gpsNotSupported'));
    }
  }, [onLocationChange, t]);

  // Componente interno para manejar eventos del mapa
  const MapController = useCallback(() => {
    const map = useMapEvents({
      click(e) {
        const newPos = e.latlng;
        setPosition(newPos);
        onLocationChange(newPos.lat, newPos.lng);
        map.flyTo(newPos, map.getZoom());
      },
    });

    useEffect(() => {
      if (position) {
        map.flyTo(position, map.getZoom());
      }
    }, [map]);

    return position === null ? null : <Marker position={position} />;
  }, [position, onLocationChange]);

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <label className="block text-sm font-bold text-neutral-dark">
          📍 {t('locationPicker.title')}
        </label>
        <button
          onClick={handleGetCurrentLocation}
          className="flex items-center gap-2 text-xs font-bold text-primary hover:text-primary-hover transition-colors cursor-pointer"
          type="button"
        >
          <Navigation size={14} />
          {t('locationPicker.useGps')}
        </button>
      </div>

      <div className="h-64 w-full rounded-xl overflow-hidden border border-neutral-dark/20 shadow-inner z-0 relative">
        <MapContainer 
          center={defaultCenter} 
          zoom={13} 
          className="h-full w-full"
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap'
          />
          <MapController />
        </MapContainer>
      </div>
      <p className="text-xs text-gray-500">
        {t('locationPicker.hint')}
      </p>
    </div>
  );
};

LocationPicker.propTypes = {
  latitude: PropTypes.number,
  longitude: PropTypes.number,
  onLocationChange: PropTypes.func.isRequired,
};

export default LocationPicker;
