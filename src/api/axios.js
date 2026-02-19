import axios from 'axios';
import i18n from '../i18n';
import { API_CONFIG, STORAGE_KEYS } from '../config/constants';

/**
 * Instancia configurada de Axios para comunicación con el backend
 * Incluye interceptores para autenticación automática y manejo de errores
 */
const api = axios.create({
  // Usar variable de entorno o fallback a localhost
  baseURL: API_CONFIG.BASE_URL,
  // No especificar Content-Type por defecto, se manejará en el interceptor
  // Timeout de 10 segundos para evitar requests colgados
  timeout: API_CONFIG.TIMEOUT,
});

/**
 * Interceptor de request: añade token de autenticación y lenguaje a todas las peticiones
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Añadir idioma actual del usuario para respuestas localizadas
    config.headers['Accept-Language'] = i18n.language;
    
    // Si los datos son FormData, NO establecer Content-Type
    // Axios lo manejará automáticamente con el boundary correcto
    if (!(config.data instanceof FormData)) {
      // Solo para peticiones no-FormData, usar application/json
      config.headers['Content-Type'] = 'application/json';
    } else {
      // Si es FormData, eliminar cualquier Content-Type predefinido
      // para que axios lo genere automáticamente
      delete config.headers['Content-Type'];
    }
    
    return config;
  },
  (error) => {
    console.error('Error en la petición:', error);
    return Promise.reject(error);
  }
);

/**
 * Interceptor de response: maneja errores de autenticación y otros errores comunes
 */
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Manejo específico de timeout
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout - la petición tardó demasiado');
      error.message = 'La petición tardó demasiado. Por favor, intenta de nuevo.';
    }
    
    // Manejo de error 401: sesión expirada o no autorizado
    if (error.response && error.response.status === 401) {
      console.warn('Sesión expirada, redirigiendo al login...');
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      // Evitar redirección si ya estamos en login
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    
    // Manejo de error 403: permiso denegado
    if (error.response && error.response.status === 403) {
      console.error('Acceso denegado - permisos insuficientes');
    }
    
    // Manejo de error 500: error del servidor
    if (error.response && error.response.status >= 500) {
      console.error('Error del servidor:', error.response.status);
    }
    
    return Promise.reject(error);
  }
);

export default api;
