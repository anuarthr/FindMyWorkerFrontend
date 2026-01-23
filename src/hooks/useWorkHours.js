import { useState, useEffect } from 'react';
import api from '../api/axios';

export const useWorkHours = (orderId) => {
  const [hours, setHours] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchHours = async () => {
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
  };

  const registerHours = async (hoursData) => {
  const payload = {
    service_order: parseInt(orderId),
    date: hoursData.date,
    hours: hoursData.hours,
    description: hoursData.description
  };
  
  console.group('🔍 useWorkHours - registerHours');
  console.log('📦 Payload:', payload);
  console.log('🆔 Order ID:', orderId);
  console.log('📅 Date:', payload.date, '(type:', typeof payload.date, ')');
  console.log('⏰ Hours:', payload.hours, '(type:', typeof payload.hours, ')');
  console.log('📝 Description:', payload.description);
  
  // ✅ NUEVO - Ver qué fecha se está generando
  console.log('🗓️ Today:', new Date().toISOString().split('T')[0]);
  console.log('🗓️ Date being sent:', payload.date);
  console.log('🗓️ Are they equal?', payload.date === new Date().toISOString().split('T')[0]);
  console.groupEnd();
  
  try {
    const { data } = await api.post(`/orders/${orderId}/work-hours/`, payload);
    await fetchHours();
    return data;
  } catch (err) {
    console.group('❌ useWorkHours - Error Detail');
    console.error('Error Response:', err.response?.data);
    console.error('Error Status:', err.response?.status);
    
    // ✅ NUEVO - Expandir el error de date
    if (err.response?.data?.date) {
      console.error('📅 Date Error:', err.response.data.date);
      console.error('📅 Date Error Type:', typeof err.response.data.date);
      console.error('📅 Date Error Content:', JSON.stringify(err.response.data.date));
    }
    console.groupEnd();
    throw err;
    }
  };

  const updateHours = async (hourId, hoursData) => {
    const payload = {
      hours: hoursData.hours,
      description: hoursData.description
    };
    
    const { data } = await api.patch(`/orders/${orderId}/work-hours/${hourId}/`, payload);
    await fetchHours();
    return data;
  };

  const deleteHours = async (hourId) => {
    await api.delete(`/orders/${orderId}/work-hours/${hourId}/`);
    await fetchHours();
  };

  const approveHours = async (hourId, approved) => {
    const { data } = await api.post(`/orders/${orderId}/work-hours/${hourId}/approve/`, {
      approved
    });
    await fetchHours();
    return data;
  };

  useEffect(() => {
    fetchHours();
  }, [orderId]);

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
