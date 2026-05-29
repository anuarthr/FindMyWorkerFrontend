/**
 * Iconos personalizados de Leaflet para el mapa
 * Define marcadores visuales para usuarios y trabajadores en el mapa interactivo
 * @module utils/mapIcons
 */

import L from 'leaflet';
// Patch global: Leaflet busca los íconos del marker por defecto por URL
// relativa (`marker-icon.png`) que no existe en el bundle de Vite. Importamos
// los assets del paquete leaflet para que Vite los procese y devuelva URLs
// hash-cacheadas, luego los inyectamos al L.Icon.Default. Side effect: se
// aplica una sola vez al cargar este módulo, así cualquier <Marker /> sin
// `icon` prop explícito (ej. LocationPicker) muestra el pin correcto.
import markerIconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import markerIconUrl from 'leaflet/dist/images/marker-icon.png';
import markerShadowUrl from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIconRetinaUrl,
  iconUrl: markerIconUrl,
  shadowUrl: markerShadowUrl,
});

/**
 * Icono de marcador para ubicación del usuario/cliente
 * Representa la ubicación actual del usuario en el mapa con un icono de persona
 * @type {L.DivIcon}
 */

export const userIcon = L.divIcon({
  className: 'custom-icon',
  html: `<div class="w-8 h-8 bg-[#4A3B32] rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">ircle cx="12" cy="12" r="10"/>ircle cx="12" cy="10" r="3"/><path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662"/></svg>
         </div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});

/**
 * Icono de marcador para ubicación de trabajadores
 * Representa la ubicación de trabajadores en el mapa con un icono de herramienta
 * Incluye animación de rebote para mayor visibilidad
 * @type {L.DivIcon}
 */
export const workerIcon = L.divIcon({
  className: 'custom-icon',
  html: `<div class="w-8 h-8 bg-[#C04A3E] rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white animate-bounce-short">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
         </div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});
