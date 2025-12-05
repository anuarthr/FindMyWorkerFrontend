import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import axios from 'axios';
import { Search, MapPin, Loader2 } from 'lucide-react';
import { userIcon, workerIcon } from '../utils/mapIcons';

function RecenterMap({ lat, lng }) {
  const map = useMap();
  useEffect(() => {
    if (lat && lng) {
      map.flyTo([lat, lng], 14, { duration: 1.5 });
    }
  }, [lat, lng, map]);
  return null;
}

//movimiento del mapa
function MapDragger({ onDragEnd }) {
  useMapEvents({
    moveend: (e) => {
      onDragEnd(e.target.getCenter());
    },
  });
  return null;
}

export default function WorkerMap() {
  const [myLocation, setMyLocation] = useState(null);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchCenter, setSearchCenter] = useState(null);
  const [showSearchBtn, setShowSearchBtn] = useState(false);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setMyLocation({ lat: latitude, lng: longitude });
          setSearchCenter({ lat: latitude, lng: longitude });
          fetchWorkers(latitude, longitude);
        },
        (error) => {
          console.error("Error geolocation:", error);
          const defaultLat = 11.24079;
          const defaultLng = -74.19904;
          setMyLocation({ lat: defaultLat, lng: defaultLng });
          fetchWorkers(defaultLat, defaultLng);
        }
      );
    }
  }, []);

  const fetchWorkers = async (lat, lng) => {
    setLoading(true);
    setShowSearchBtn(false);
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/workers/', {
        params: {
          lat: lat,
          lng: lng,
          radius: 15
        }
      });
      setWorkers(response.data);
    } catch (error) {
      console.error("Error fetching workers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMapMove = (newCenter) => {
    if (searchCenter) {
      const dist = Math.sqrt(
        Math.pow(newCenter.lat - searchCenter.lat, 2) + 
        Math.pow(newCenter.lng - searchCenter.lng, 2)
      );
      if (dist > 0.01) { 
        setShowSearchBtn(true);
        setSearchCenter({ lat: newCenter.lat, lng: newCenter.lng });
      }
    }
  };

  return (
    <div className="relative w-full h-[600px] rounded-xl overflow-hidden shadow-lg border border-[#4A3B32]/10 bg-[#EFE6DD]">
      
      {/* Botón Flotante "Buscar en esta zona" */}
      {showSearchBtn && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[400]">
          <button
            onClick={() => fetchWorkers(searchCenter.lat, searchCenter.lng)}
            className="flex items-center gap-2 bg-[#C04A3E] text-white px-4 py-2 rounded-full shadow-lg font-bold text-sm hover:bg-[#A0382E] transition-all animate-in fade-in slide-in-from-top-2"
          >
            {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <Search className="w-4 h-4" />}
            Buscar en esta zona
          </button>
        </div>
      )}

      {/* Mapa */}
      <MapContainer
        center={myLocation || [11.24079, -74.19904]} // Default temporal
        zoom={13}
        className="w-full h-full z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Componentes lógicos del mapa */}
        {myLocation && <RecenterMap lat={myLocation.lat} lng={myLocation.lng} />}
        <MapDragger onDragEnd={handleMapMove} />

        {/* Marcador: Mi Ubicación */}
        {myLocation && (
          <Marker position={[myLocation.lat, myLocation.lng]} icon={userIcon}>
            <Popup className="custom-popup">
              <div className="text-center font-bold text-[#4A3B32]">
                ¡Estás aquí!
              </div>
            </Popup>
          </Marker>
        )}

        {/* Marcadores: Trabajadores */}
        {workers.map((worker, index) => (
          <Marker
            key={index}
            position={[worker.latitude, worker.longitude]}
            icon={workerIcon}
          >
            <Popup>
              <div className="p-1 min-w-[150px]">
                <div className="flex items-center justify-between mb-2">
                  <span className="bg-[#E37B5B]/20 text-[#C04A3E] text-xs font-bold px-2 py-0.5 rounded-full uppercase">
                    {worker.profession}
                  </span>
                  <span className="flex items-center text-yellow-500 text-xs font-bold">
                    ★ {worker.average_rating}
                  </span>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2 mb-2 italic">
                  "{worker.bio}"
                </p>
                <div className="border-t border-gray-100 pt-2 mt-2 flex justify-between items-center">
                  <span className="font-bold text-[#4A3B32]">
                    ${parseInt(worker.hourly_rate).toLocaleString()}/hr
                  </span>
                  <button className="text-xs bg-[#4A3B32] text-white px-2 py-1 rounded hover:bg-[#2A211C]">
                    Ver Perfil
                  </button>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      
      {/* Leyenda simple */}
      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur p-2 rounded-lg shadow z-[400] text-xs space-y-1">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#4A3B32]"></div>
          <span>Tú</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#C04A3E]"></div>
          <span>Trabajador</span>
        </div>
      </div>
    </div>
  );
}
