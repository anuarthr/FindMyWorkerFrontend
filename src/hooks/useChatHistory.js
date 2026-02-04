/**
 * Hook personalizado para cargar el historial de mensajes de un chat
 * Obtiene mensajes previos de una orden desde la API
 * @module hooks/useChatHistory
 * 
 * @param {number} orderId - ID de la orden
 * @returns {Object} Estado del historial {messages, loading, error}
 */

import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { STORAGE_KEYS } from '../config/constants';
export const useChatHistory = (orderId) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadHistory = useCallback(async () => {
    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      
      if (!orderId || !token) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const { data } = await api.get(`/orders/${orderId}/messages/`);
        
        const messagesArray = data?.messages || data?.results || data?.data || data;
        setMessages(Array.isArray(messagesArray) ? messagesArray : []);
      } catch (err) {
        console.error('Error loading chat history:', err);
        setError('chat.errorLoadingHistory');
        setMessages([]);
      } finally {
        setLoading(false);
      }
  }, [orderId]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  return { messages, loading, error };
};
