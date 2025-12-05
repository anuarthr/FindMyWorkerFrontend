import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { Navigation } from 'lucide-react';

export default function LocationPicker({ latitude, longitude, onLocationChange }) {
  const defaultCenter = { lat: 11.24079, lng: -74.19904 }; // Santa Marta por defecto
  const [position, setPosition] = useState(null);

  useEffect(() => {
    if (latitude && longitude) {
      setPosition({ lat: parseFloat(latitude), lng: parseFloat(longitude) });
    }
  }, [latitude, longitude]);

  const handleGetCurrentLocation = (e) => {
    e.preventDefault();
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const newPos = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setPosition(newPos);
        onLocationChange(newPos.lat, newPos.lng);
      });
    } else {
      alert("La geolocalización no es soportada por este navegador.");
    }
  };

  function MapController() {
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
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <label className="block text-sm font-bold text-neutral-dark">
          📍 Ubicación de Trabajo
        </label>
        <button
          onClick={handleGetCurrentLocation}
          className="flex items-center gap-2 text-xs font-bold text-primary hover:text-primary-hover transition-colors cursor-pointer"
          type="button"
        >
          <Navigation size={14} />
          Usar mi ubicación GPS
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
        Toca en el mapa para ajustar tu ubicación exacta.
      </p>
    </div>
  );
}
