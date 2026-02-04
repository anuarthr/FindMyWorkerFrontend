import { useState, useEffect, useRef, useCallback } from 'react';
import { buildWebSocketURL, WEBSOCKET_CONFIG, CLOSE_CODES, ERROR_MESSAGES } from '../utils/websocket';

/**
 * Hook personalizado para manejar la conexión WebSocket del chat
 * Proporciona gestión automática de conexión, reconexión y mensajes
 * @module hooks/useWebSocketChat
 * 
 * @param {number} orderId - ID de la orden para el chat
 * @param {string} token - Token JWT de autenticación
 * @param {boolean} enabled - Si el WebSocket debe estar activo
 * @param {Array} initialMessages - Mensajes iniciales a cargar
 * 
 * @returns {Object} Estado y funciones del chat
 * @returns {Array} messages - Lista de mensajes del chat
 * @returns {boolean} isConnected - Estado de conexión del WebSocket
 * @returns {boolean} isReconnecting - Si está intentando reconectar
 * @returns {string|null} error - Mensaje de error actual
 * @returns {Function} sendMessage - Función para enviar mensajes
 * @returns {Function} clearMessages - Función para limpiar mensajes
 * @returns {Function} reconnect - Función para reconectar manualmente
 * @returns {Function} disconnect - Función para desconectar manualmente
 */
export const useWebSocketChat = (orderId, token, enabled = true, initialMessages = []) => {
  // Estados del chat
  const [messages, setMessages] = useState(initialMessages);
  const [isConnected, setIsConnected] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [error, setError] = useState(null);
  const [connectionAttempts, setConnectionAttempts] = useState(0);

  // Referencias para manejar el ciclo de vida del WebSocket
  const socketRef = useRef(null);                    // Instancia del WebSocket
  const reconnectTimeoutRef = useRef(null);          // Timeout para reconexión
  const isConnectingRef = useRef(false);             // Flag para evitar conexiones múltiples
  const isMountedRef = useRef(true);                 // Flag para evitar actualizaciones después de unmount

  // Cargar mensajes iniciales cuando cambien
  useEffect(() => {
    if (initialMessages.length > 0) {
      setMessages(initialMessages);
    }
  }, [initialMessages]);

  /**
   * Envía un mensaje a través del WebSocket
   * @param {string} messageText - Texto del mensaje a enviar
   * @returns {boolean} true si el mensaje se envió correctamente
   */
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

  /**
   * Añade un nuevo mensaje a la lista (evita duplicados)
   * @param {Object} message - Mensaje a añadir
   */
  const addMessage = useCallback((message) => {
    if (!isMountedRef.current) return;
    
    setMessages(prev => {
      if (prev.some(m => m.id === message.id)) {
        return prev;
      }
      return [...prev, message];
    });
  }, []);

  /**
   * Establece la conexión WebSocket y configura los event handlers
   */
  const connect = useCallback(() => {
    // Evitar conexiones múltiples simultáneas
    if (isConnectingRef.current) {
      return;
    }

    // Validar que tenemos los datos necesarios
    if (!enabled || !orderId || !token || !isMountedRef.current) {
      return;
    }

    // Cerrar conexión existente si hay alguna
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

    // Handler: conexión establecida exitosamente
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

    // Handler: mensaje recibido del servidor
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
        // Error al parsear JSON, ignorar mensaje mal formado
      }
    };

    // Handler: error en la conexión
    ws.onerror = (event) => {
      if (!isMountedRef.current) return;
      
      setError('Error de conexión');
      isConnectingRef.current = false;
    };

    // Handler: conexión cerrada (normal o por error)
    ws.onclose = (event) => {
      if (!isMountedRef.current) return;
      
      setIsConnected(false);
      isConnectingRef.current = false;

      // Traducir código de error si existe
      if (ERROR_MESSAGES[event.code]) {
        setError(ERROR_MESSAGES[event.code]);
      }

      // Intentar reconectar si no fue un cierre normal y no hemos excedido los intentos
      if (
        isMountedRef.current &&
        event.code !== CLOSE_CODES.NORMAL_CLOSURE &&
        event.code !== CLOSE_CODES.CHAT_INACTIVE &&
        connectionAttempts < WEBSOCKET_CONFIG.MAX_RETRIES
      ) {
        setIsReconnecting(true);
        setConnectionAttempts(prev => prev + 1);

        // Programar reconexión después del delay configurado
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

  /**
   * Desconecta el WebSocket y limpia recursos
   */
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
    
    // Limpiar timeout de reconexión pendiente
    clearTimeout(reconnectTimeoutRef.current);
    isConnectingRef.current = false;
    setIsConnected(false);
  }, []);

  /**
   * Limpia todos los mensajes del chat
   */
  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  // Effect: conectar al montar y desconectar al desmontar
  useEffect(() => {
    isMountedRef.current = true;
    connect();

    return () => {
      disconnect();
    };
  }, [orderId, token, enabled]);

  // Retornar estado y funciones del hook
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
