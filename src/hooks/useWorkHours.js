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
      setHours(data);
    } catch (err) {
      console.error('Error fetching work hours:', err);
      setError(err.response?.data?.detail || 'Error al cargar las horas');
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
    
    const { data } = await api.post(`/orders/${orderId}/work-hours/`, payload);
    await fetchHours();
    return data;
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
