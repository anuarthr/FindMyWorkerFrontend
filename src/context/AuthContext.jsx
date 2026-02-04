import { createContext, useState, useEffect, useContext, useCallback } from 'react';
import PropTypes from 'prop-types';
import api from '../api/axios';
import { jwtDecode } from 'jwt-decode';
import { STORAGE_KEYS } from '../config/constants';

/**
 * Contexto de autenticación
 * Proporciona estado global de autenticación, información del usuario y funciones de login/logout
 * @module context/AuthContext
 */
const AuthContext = createContext();

/**
 * Hook para acceder al contexto de autenticación
 * @returns {Object} Estado y métodos de autenticación {user, login, logout, isAuthenticated, loading}
 * @throws {Error} Si se usa fuera del AuthProvider
 */

export const useAuth = () => useContext(AuthContext);

/**
 * Provider de autenticación que envuelve la aplicación
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  /**
   * Cierra la sesión del usuario y limpia el localStorage
   */
  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  /**
   * Verifica si el usuario está autenticado al cargar la aplicación
   */
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      if (token) {
        try {
          const decoded = jwtDecode(token);
          // Verificar si el token no ha expirado
          if (decoded.exp * 1000 > Date.now()) {
            const res = await api.get('users/me/');
            setUser(res.data);
            setIsAuthenticated(true);
          } else {
            console.warn('Token expirado, cerrando sesión...');
            logout();
          }
        } catch (error) {
          // No hacer logout si es timeout - el backend puede estar lento
          if (error.code !== 'ECONNABORTED' && error.response?.status === 401) {
            console.error("Error de autenticación:", error);
            logout();
          } else {
            console.warn('Error al verificar sesión (backend lento):', error.message);
            // Mantener sesión si el token aún es válido
            setIsAuthenticated(true);
          }
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, [logout]);

  /**
   * Inicia sesión con email y contraseña
   * @param {string} email - Email del usuario
   * @param {string} password - Contraseña del usuario
   * @returns {Promise<Object>} Resultado de la operación {success: boolean, error?: string}
   */
  const login = useCallback(async (email, password) => {
    try {
      const res = await api.post('auth/login/', { email, password });
      // Guardar tokens en localStorage usando constantes
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, res.data.access);
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, res.data.refresh);
      
      setIsAuthenticated(true);
      
      // Obtener datos completos del usuario
      const userRes = await api.get('users/me/');
      setUser(userRes.data);
      
      return { success: true };
    } catch (error) {
      console.error('Error en login:', error);
      return { 
        success: false, 
        error: error.response?.data?.detail || "Credenciales inválidas" 
      };
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
