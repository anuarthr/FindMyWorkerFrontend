import { useState, useEffect, useRef, useCallback } from 'react';
import { buildWebSocketURL, WEBSOCKET_CONFIG, CLOSE_CODES, ERROR_MESSAGES } from '../utils/websocket';

export const useWebSocketChat = (orderId, token, enabled = true, initialMessages = []) => {
  const [messages, setMessages] = useState(initialMessages);
  const [isConnected, setIsConnected] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [error, setError] = useState(null);
  const [connectionAttempts, setConnectionAttempts] = useState(0);

  const socketRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const isConnectingRef = useRef(false);

  useEffect(() => {
    if (initialMessages.length > 0) {
      setMessages(initialMessages);
    }
  }, [initialMessages]);

  const sendMessage = useCallback((messageText) => {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      console.error('WebSocket no está conectado');
      return false;
    }

    if (!messageText || !messageText.trim()) {
      console.warn('Mensaje vacío, no se envía');
      return false;
    }

    try {
      socketRef.current.send(JSON.stringify({
        message: messageText.trim()
      }));
      return true;
    } catch (err) {
      console.error('Error al enviar mensaje:', err);
      setError('Error al enviar el mensaje');
      return false;
    }
  }, []);

  const addMessage = useCallback((message) => {
    setMessages(prev => {
      if (prev.some(m => m.id === message.id)) {
        return prev;
      }
      return [...prev, message];
    });
  }, []);

  const connect = useCallback(() => {
    if (isConnectingRef.current) {
      console.log('⚠️ Conexión ya en progreso, omitiendo...');
      return;
    }

    if (!enabled || !orderId || !token) {
      console.log('Chat no habilitado o faltan parámetros');
      return;
    }

    if (socketRef.current) {
      socketRef.current.close(CLOSE_CODES.NORMAL_CLOSURE);
      socketRef.current = null;
    }

    isConnectingRef.current = true;

    const wsUrl = buildWebSocketURL(orderId, token);
    console.log(`🔌 Conectando a: ${wsUrl}`);

    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('✅ WebSocket conectado');
      setIsConnected(true);
      setIsReconnecting(false);
      setError(null);
      setConnectionAttempts(0);
      isConnectingRef.current = false;
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === 'connection_established') {
          console.log('📡', data.message);
        } else if (data.type === 'chat_message') {
          addMessage(data);
        } else if (data.type === 'error') {
          console.error('❌ Error del servidor:', data.message);
          setError(data.message);
        } else {
          console.log('📨 Mensaje desconocido:', data);
        }
      } catch (err) {
        console.error('Error al parsear mensaje:', err);
      }
    };

    ws.onerror = (event) => {
      console.error('❌ Error en WebSocket:', event);
      setError('Error de conexión');
      isConnectingRef.current = false;
    };

    ws.onclose = (event) => {
      console.log(`🔌 WebSocket cerrado. Código: ${event.code}`);
      setIsConnected(false);
      isConnectingRef.current = false;

      if (ERROR_MESSAGES[event.code]) {
        setError(ERROR_MESSAGES[event.code]);
      }

      if (
        event.code !== CLOSE_CODES.NORMAL_CLOSURE &&
        event.code !== CLOSE_CODES.CHAT_INACTIVE &&
        connectionAttempts < WEBSOCKET_CONFIG.MAX_RETRIES
      ) {
        setIsReconnecting(true);
        setConnectionAttempts(prev => prev + 1);

        reconnectTimeoutRef.current = setTimeout(() => {
          console.log(`🔄 Reintentando conexión... (${connectionAttempts + 1}/${WEBSOCKET_CONFIG.MAX_RETRIES})`);
          connect();
        }, WEBSOCKET_CONFIG.RECONNECT_DELAY);
      } else if (connectionAttempts >= WEBSOCKET_CONFIG.MAX_RETRIES) {
        setError('No se pudo conectar al chat. Recarga la página.');
      }
    };

    socketRef.current = ws;
  }, [orderId, token, enabled, connectionAttempts, addMessage]);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.close(CLOSE_CODES.NORMAL_CLOSURE);
      socketRef.current = null;
    }
    clearTimeout(reconnectTimeoutRef.current);
    isConnectingRef.current = false;
    setIsConnected(false);
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  useEffect(() => {
    connect();
    return () => {
      disconnect();
    };
  }, [orderId, token, enabled]);

  return {
    messages,
    isConnected,
    isReconnecting,
    error,
    sendMessage,
    clearMessages,
    reconnect: connect,
    disconnect,
  };
};

export default useWebSocketChat;
