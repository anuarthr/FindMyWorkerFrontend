/**
 * Hook personalizado para gestionar horas de trabajo de una orden
 * Maneja registro, actualización, eliminación y aprobación de horas trabajadas
 * @module hooks/useWorkHours
 * 
 * @param {number} orderId - ID de la orden
 * @returns {Object} Estado y funciones {hours, loading, error, registerHours, updateHours, deleteHours, approveHours, refreshHours}
 */

import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

export const useWorkHours = (orderId) => {
  const [hours, setHours] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchHours = useCallback(async () => {
    if (!orderId) return;
    
    try {
      setLoading(true);
      setError(null);
      const { data } = await api.get(`/orders/${orderId}/work-hours/`);
      
      // Handle paginated response or direct array
      const hoursArray = data?.results || data?.data || data;
      setHours(Array.isArray(hoursArray) ? hoursArray : []);
    } catch (err) {
      console.error('Error fetching work hours:', err);
      setError(err.response?.data?.detail || 'Error al cargar las horas');
      setHours([]);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  const registerHours = useCallback(async (hoursData) => {
    const payload = {
      service_order: parseInt(orderId),
      date: hoursData.date,
      hours: hoursData.hours,
      description: hoursData.description
    };
    
    try {
      const { data } = await api.post(`/orders/${orderId}/work-hours/`, payload);
      await fetchHours();
      return data;
    } catch (err) {
      console.error('Error registrando horas:', err.response?.data);
      throw err;
    }
  }, [orderId, fetchHours]);

  const updateHours = useCallback(async (hourId, hoursData) => {
    const payload = {
      hours: hoursData.hours,
      description: hoursData.description
    };
    
    const { data } = await api.patch(`/orders/${orderId}/work-hours/${hourId}/`, payload);
    await fetchHours();
    return data;
  }, [orderId, fetchHours]);

  const deleteHours = useCallback(async (hourId) => {
    await api.delete(`/orders/${orderId}/work-hours/${hourId}/`);
    await fetchHours();
  }, [orderId, fetchHours]);

  const approveHours = useCallback(async (hourId, approved) => {
    const { data } = await api.post(`/orders/${orderId}/work-hours/${hourId}/approve/`, {
      approved
    });
    await fetchHours();
    return data;
  }, [orderId, fetchHours]);

  useEffect(() => {
    fetchHours();
  }, [fetchHours]);

  return {
    hours,
    loading,
    error,
    registerHours,
    updateHours,
    deleteHours,
    approveHours,
    refreshHours: fetchHours
  };
};
