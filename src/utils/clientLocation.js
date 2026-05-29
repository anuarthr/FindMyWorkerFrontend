/**
 * Persistencia de la ubicación preferida del cliente.
 * Sin backend: vive en localStorage. El cliente la define en UserProfile y
 * ClientHome la usa para enriquecer las llamadas a getWorkers (lat/lng + radius).
 */
import { STORAGE_KEYS } from '../config/constants';

export const loadClientLocation = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CLIENT_LOCATION);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (typeof parsed?.lat !== 'number' || typeof parsed?.lng !== 'number') return null;
    return parsed;
  } catch {
    return null;
  }
};

export const saveClientLocation = (lat, lng, radiusKm = 20) => {
  const payload = { lat: parseFloat(lat), lng: parseFloat(lng), radiusKm: Number(radiusKm) || 20 };
  localStorage.setItem(STORAGE_KEYS.CLIENT_LOCATION, JSON.stringify(payload));
  return payload;
};

export const clearClientLocation = () => {
  localStorage.removeItem(STORAGE_KEYS.CLIENT_LOCATION);
};
