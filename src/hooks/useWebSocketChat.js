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
  const isMountedRef = useRef(true);

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
      return false;
    }

    try {
      socketRef.current.send(JSON.stringify({
        message: messageText.trim()
      }));
      return true;
    } catch (err) {
      if (isMountedRef.current) {
        setError('Error al enviar el mensaje');
      }
      return false;
    }
  }, []);

  const addMessage = useCallback((message) => {
    if (!isMountedRef.current) return;
    
    setMessages(prev => {
      if (prev.some(m => m.id === message.id)) {
        return prev;
      }
      return [...prev, message];
    });
  }, []);

  const connect = useCallback(() => {
    if (isConnectingRef.current) {
      return;
    }

    if (!enabled || !orderId || !token || !isMountedRef.current) {
      return;
    }

    if (socketRef.current) {
      socketRef.current.onopen = null;
      socketRef.current.onmessage = null;
      socketRef.current.onerror = null;
      socketRef.current.onclose = null;
      
      socketRef.current.close(CLOSE_CODES.NORMAL_CLOSURE);
      socketRef.current = null;
    }

    isConnectingRef.current = true;

    const wsUrl = buildWebSocketURL(orderId, token);
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      if (!isMountedRef.current) {
        ws.close(CLOSE_CODES.NORMAL_CLOSURE);
        return;
      }
      
      setIsConnected(true);
      setIsReconnecting(false);
      setError(null);
      setConnectionAttempts(0);
      isConnectingRef.current = false;
    };

    ws.onmessage = (event) => {
      if (!isMountedRef.current) return;
      
      try {
        const data = JSON.parse(event.data);

        if (data.type === 'chat_message') {
          addMessage(data);
        } else if (data.type === 'error') {
          setError(data.message);
        }
      } catch (err) {
      }
    };

    ws.onerror = (event) => {
      if (!isMountedRef.current) return;
      
      setError('Error de conexión');
      isConnectingRef.current = false;
    };

    ws.onclose = (event) => {
      if (!isMountedRef.current) return;
      
      setIsConnected(false);
      isConnectingRef.current = false;

      if (ERROR_MESSAGES[event.code]) {
        setError(ERROR_MESSAGES[event.code]);
      }

      if (
        isMountedRef.current &&
        event.code !== CLOSE_CODES.NORMAL_CLOSURE &&
        event.code !== CLOSE_CODES.CHAT_INACTIVE &&
        connectionAttempts < WEBSOCKET_CONFIG.MAX_RETRIES
      ) {
        setIsReconnecting(true);
        setConnectionAttempts(prev => prev + 1);

        reconnectTimeoutRef.current = setTimeout(() => {
          if (isMountedRef.current) {
            connect();
          }
        }, WEBSOCKET_CONFIG.RECONNECT_DELAY);
      } else if (connectionAttempts >= WEBSOCKET_CONFIG.MAX_RETRIES) {
        setError('No se pudo conectar al chat. Recarga la página.');
      }
    };

    socketRef.current = ws;
  }, [orderId, token, enabled, connectionAttempts, addMessage]);

  const disconnect = useCallback(() => {
    isMountedRef.current = false;
    
    if (socketRef.current) {
      socketRef.current.onopen = null;
      socketRef.current.onmessage = null;
      socketRef.current.onerror = null;
      socketRef.current.onclose = null;
      
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
    isMountedRef.current = true;
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
