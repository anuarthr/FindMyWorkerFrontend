import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { userIcon, workerIcon } from '../../utils/mapIcons';
import 'leaflet/dist/leaflet.css';

function RecenterMap({ lat, lng }) {
  const map = useMap();
  useEffect(() => {
    if (lat && lng) {
      map.flyTo([lat, lng], 14, { duration: 1.5 });
    }
  }, [lat, lng, map]);
  return null;
}

export default function WorkerMap({ workers = [], userLocation }) {
  
  const center = userLocation ? [userLocation.lat, userLocation.lng] : [11.24079, -74.19904];

  return (
    <div className="relative w-full h-full z-0">
      <MapContainer center={center} zoom={13} className="w-full h-full z-0">
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {userLocation && <RecenterMap lat={userLocation.lat} lng={userLocation.lng} />}

        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
            <Popup><div className="text-center font-bold text-[#4A3B32]">¡Estás aquí!</div></Popup>
          </Marker>
        )}

        {workers.map((worker) => {
          const lat = parseFloat(worker.latitude);
          const lng = parseFloat(worker.longitude);
          
          if (!lat || !lng) return null;

          const userData = worker.user || worker;
          const firstName = userData.first_name || "";
          const lastName = userData.last_name || "";
          let fullName = `${firstName} ${lastName}`.trim();
          if (!fullName) fullName = "Usuario Sin Nombre";
          
          const avatar = userData.avatar || "https://placehold.co/50x50";

          return (
            <Marker key={worker.id} position={[lat, lng]} icon={workerIcon}>
              <Popup>
                <div className="min-w-[180px] p-1">
                   {/* Cabecera con Avatar pequeño y Nombre */}
                   <div className="flex items-center gap-3 mb-2">
                      <img src={avatar} alt="avatar" className="w-8 h-8 rounded-full object-cover border border-[#C04A3E]" />
                      <div>
                        <h3 className="font-bold text-[#4A3B32] text-sm leading-tight capitalize">
                            {fullName}
                        </h3>
                        <p className="text-[10px] uppercase font-bold text-[#C04A3E]">
                            {worker.profession}
                        </p>
                      </div>
                   </div>

                   <div className="flex justify-between items-center border-t border-gray-200 pt-2 mt-1">
                     <span className="font-bold text-[#4A3B32] text-sm">
                        ${parseInt(worker.hourly_rate).toLocaleString()}
                     </span>
                     <span className="text-xs text-yellow-600 font-bold bg-yellow-50 px-1 rounded">
                        ★ {worker.average_rating}
                     </span>
                   </div>
                   
                   <button className="w-full mt-2 bg-[#4A3B32] text-white text-xs py-1 rounded hover:bg-[#2e251f]">
                     Ver Perfil Completo
                   </button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
