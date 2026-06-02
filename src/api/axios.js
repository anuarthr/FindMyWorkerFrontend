import axios from 'axios';
import toast from 'react-hot-toast';
import i18n from '../i18n';
import { API_CONFIG, STORAGE_KEYS } from '../config/constants';

/**
 * Backend en Render free se duerme tras ~15 min sin tráfico y tarda
 * 30–60s en despertar. La primera request post-sleep cae como
 * ERR_NETWORK o timeout. Con esta bandera mostramos un toast amable
 * y reintentamos una vez con timeout extendido para no asustar al
 * reclutador con un "Network Error" genérico.
 */
let coldStartToastId = null;
let isWarmedUp = false;

/**
 * "Pinea" al backend silenciosamente para arrancar el despertar antes
 * de que el usuario haga una request real. Idempotente: una vez que
 * recibe respuesta, no vuelve a despertar.
 *
 * Usa /admin/login/ porque devuelve HTML pequeño sin auth, perfecto
 * para wake-up. Errores se ignoran (el ping es best-effort).
 */
export const wakeBackend = () => {
  if (isWarmedUp) return Promise.resolve();
  return fetch(`${API_CONFIG.BACKEND_ORIGIN}/admin/login/`, {
    method: 'GET',
    credentials: 'omit',
    mode: 'no-cors',
  })
    .then(() => { isWarmedUp = true; })
    .catch(() => { /* best-effort */ });
};

/**
 * Instancia configurada de Axios para comunicación con el backend.
 * Se reutiliza en toda la app — única `axios.create` del frontend.
 * Incluye interceptores para autenticación automática, idioma, y rotación
 * transparente del refresh token (BLACKLIST_AFTER_ROTATION=True en backend).
 */
const api = axios.create({
  // baseURL = http(s)://host/api/  (BACKEND_ORIGIN + /api/)
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
});

/**
 * Cliente axios separado (sin interceptores) usado SOLO para llamar al endpoint
 * de refresh. Evita recursión infinita si el refresh devuelve 401.
 */
const rawClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
});

/**
 * Endpoint de refresh JWT.
 * Path real en backend: core/urls.py → 'api/auth/refresh/' (NO 'token/refresh/').
 * baseURL ya incluye '/api/', así que relativo queda 'auth/refresh/'.
 */
const REFRESH_ENDPOINT = 'auth/refresh/';

// Promesa única en curso de refresh para evitar múltiples llamadas simultáneas
// cuando varias requests se topan con un 401 al mismo tiempo.
let refreshInFlight = null;

const clearTokens = () => {
  localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
};

const performTokenRefresh = async () => {
  const refresh = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  if (!refresh) throw new Error('NO_REFRESH_TOKEN');

  const { data } = await rawClient.post(REFRESH_ENDPOINT, { refresh });

  // SimpleJWT con ROTATE_REFRESH_TOKENS + BLACKLIST_AFTER_ROTATION devuelve
  // SIEMPRE access + refresh nuevo. GUARDAR AMBOS o el siguiente refresh
  // fallará con 401 (token blacklisted).
  if (!data?.access) throw new Error('NO_ACCESS_IN_REFRESH');
  localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, data.access);
  if (data.refresh) {
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, data.refresh);
  }
  return data.access;
};

/**
 * Interceptor de request: añade token de autenticación y lenguaje a todas las peticiones.
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    config.headers['Accept-Language'] = i18n.language;

    // Si los datos son FormData, NO establecer Content-Type:
    // axios añade el boundary correcto automáticamente. Imprescindible
    // para PATCH /users/me/ con avatar y para portfolio upload.
    if (!(config.data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json';
    } else {
      delete config.headers['Content-Type'];
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Interceptor de response:
 *  - 401 con refresh disponible → intenta rotar y reintenta la request original.
 *  - 401 sin refresh, o refresh fallido → limpia sesión y redirige a /login.
 *  - 5xx / 403 → log informativo.
 */
api.interceptors.response.use(
  (response) => {
    // Primera respuesta exitosa = backend despierto. Limpiamos cualquier
    // toast de cold start que siga visible y cerramos el flag.
    if (!isWarmedUp) {
      isWarmedUp = true;
      if (coldStartToastId) {
        toast.dismiss(coldStartToastId);
        coldStartToastId = null;
      }
    }
    return response;
  },
  async (error) => {
    const original = error.config;
    const isNetworkOrTimeout = error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK' || error.message === 'Network Error';

    // Cold start de Render: la primera request post-sleep falla con
    // ERR_NETWORK o timeout. Mostramos toast amigable y reintentamos
    // UNA vez con timeout extendido. Solo aplica al primer fallo de
    // red de la sesión — luego se asume backend despierto.
    if (isNetworkOrTimeout && original && !original._coldStartRetry && !isWarmedUp) {
      original._coldStartRetry = true;
      if (!coldStartToastId) {
        coldStartToastId = toast.loading(
          i18n.t('common.coldStart', 'El servidor está despertando, esto puede tardar hasta un minuto la primera vez…'),
          { duration: 90000 }
        );
      }
      // Dispara wake-up explícito en paralelo (en caso de no haberlo
      // hecho antes) y reintenta con timeout más largo.
      wakeBackend();
      original.timeout = 90000;
      try {
        const retry = await api(original);
        return retry;
      } catch (retryErr) {
        if (coldStartToastId) {
          toast.dismiss(coldStartToastId);
          coldStartToastId = null;
        }
        return Promise.reject(retryErr);
      }
    }

    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout - la petición tardó demasiado');
      error.message = 'La petición tardó demasiado. Por favor, intenta de nuevo.';
    }

    const status = error.response?.status;
    const isRefreshCall = original?.url?.includes(REFRESH_ENDPOINT);

    if (status === 401 && original && !original._retry && !isRefreshCall) {
      const hadToken = !!localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      const hasRefresh = !!localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);

      if (hadToken && hasRefresh) {
        original._retry = true;
        try {
          if (!refreshInFlight) {
            refreshInFlight = performTokenRefresh().finally(() => {
              refreshInFlight = null;
            });
          }
          const newAccess = await refreshInFlight;
          original.headers = original.headers || {};
          original.headers['Authorization'] = `Bearer ${newAccess}`;
          return api(original);
        } catch (refreshErr) {
          console.warn('Refresh JWT falló, cerrando sesión:', refreshErr?.message);
          clearTokens();
          if (!window.location.pathname.includes('/login')) {
            window.location.href = '/login';
          }
          return Promise.reject(refreshErr);
        }
      }

      // No hay refresh o no había sesión activa → comportamiento anterior.
      clearTokens();
      if (hadToken && !window.location.pathname.includes('/login')) {
        console.warn('Sesión expirada, redirigiendo al login...');
        window.location.href = '/login';
      }
    }

    if (status === 403) {
      console.error('Acceso denegado - permisos insuficientes');
    }

    if (status >= 500) {
      console.error('Error del servidor:', status);
    }

    return Promise.reject(error);
  }
);

export default api;
