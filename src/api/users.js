/**
 * Módulo de API para gestión de usuarios y autenticación
 * Incluye operaciones de perfil, cambio de contraseña y recuperación
 * @module api/users
 */

import api from './axios';

/**
 * Obtiene el perfil del usuario autenticado
 * @returns {Promise<Object>} Datos del usuario con información de contacto
 */
export const getUserProfile = async () => {
  const response = await api.get('users/me/');
  return response.data;
};

/**
 * Actualiza el perfil del usuario autenticado
 * Solo actualiza los campos enviados (PATCH parcial)
 * @param {Object} userData - Datos a actualizar
 * @param {string} [userData.first_name] - Nombre
 * @param {string} [userData.last_name] - Apellido
 * @param {string} [userData.phone_number] - Teléfono
 * @param {string} [userData.address] - Dirección
 * @param {string} [userData.city] - Ciudad
 * @param {string} [userData.state] - Estado
 * @param {string} [userData.country] - País
 * @param {string} [userData.postal_code] - Código postal
 * @returns {Promise<Object>} Usuario actualizado
 */
export const updateUserProfile = async (userData) => {
  const response = await api.patch('users/me/', userData);
  return response.data;
};

/**
 * Cambia la contraseña del usuario autenticado
 * Requiere contraseña actual para validación
 * @param {Object} passwords - Datos de contraseñas
 * @param {string} passwords.old_password - Contraseña actual
 * @param {string} passwords.new_password - Nueva contraseña (min 8 caracteres)
 * @param {string} passwords.confirm_password - Confirmación de nueva contraseña
 * @returns {Promise<Object>} Mensaje de éxito
 * @throws {Error} Si la contraseña actual es incorrecta o las nuevas no coinciden
 */
export const changePassword = async ({ old_password, new_password, confirm_password }) => {
  const response = await api.post('auth/change-password/', {
    old_password,
    new_password,
    confirm_password,
  });
  return response.data;
};

/**
 * Solicita un token de recuperación de contraseña
 * Envía instrucciones al email si existe (siempre retorna 200 por seguridad)
 * @param {string} email - Email del usuario
 * @returns {Promise<Object>} Mensaje genérico y token dev (en desarrollo)
 */
export const requestPasswordReset = async (email) => {
  const response = await api.post('auth/password-reset/', { email });
  return response.data;
};

/**
 * Confirma el reseteo de contraseña con el token recibido
 * @param {Object} resetData - Datos de reseteo
 * @param {string} resetData.token - Token recibido por email o dev
 * @param {string} resetData.new_password - Nueva contraseña
 * @param {string} resetData.confirm_password - Confirmación de nueva contraseña
 * @returns {Promise<Object>} Mensaje de éxito
 * @throws {Error} Si el token es inválido o expirado
 */
export const confirmPasswordReset = async ({ token, new_password, confirm_password }) => {
  const response = await api.post('auth/password-reset-confirm/', {
    token,
    new_password,
    confirm_password,
  });
  return response.data;
};

export default {
  getUserProfile,
  updateUserProfile,
  changePassword,
  requestPasswordReset,
  confirmPasswordReset,
};
