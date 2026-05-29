import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { getChatUnread, markChatRead } from '../api/orders';
import { useAuth } from './AuthContext';

/**
 * Contexto de chat flotante
 * - activeChat: orden actualmente abierta en el FloatingChat.
 * - unread: { total, byOrder } — conteo global y por orden, refrescado
 *   con polling cada 30s mientras hay sesión, y bajo demanda al abrir
 *   conversación / al detectar mensaje nuevo del WS.
 *
 * Invariante: mientras `activeChat?.orderId === N`, el contador de esa
 * orden se mantiene en 0 incluso si el polling devuelve otro valor.
 * Esto evita el "rebote" del badge en la ventana entre el abrir el
 * chat y que el backend persista el read-receipt.
 * @module context/ChatContext
 */
const ChatContext = createContext();

const POLL_INTERVAL_MS = 30_000;

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat debe usarse dentro de ChatProvider');
  }
  return context;
};

/** Quita una orden del map y descuenta su contribución al total. */
const clampOrderFromUnread = (data, orderId) => {
  if (!orderId) return data;
  const key = String(orderId);
  const removed = data.byOrder?.[key];
  if (!removed) return data;
  const next = { ...data.byOrder };
  delete next[key];
  return { total: Math.max(0, data.total - removed), byOrder: next };
};

export const ChatProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [activeChat, setActiveChat] = useState(null);
  const [unread, setUnread] = useState({ total: 0, byOrder: {} });
  const pollRef = useRef(null);
  // Ref para que refreshUnread (memoizado) vea siempre el activeChat actual
  // sin re-crearse y reiniciar el polling.
  const activeChatRef = useRef(null);
  useEffect(() => { activeChatRef.current = activeChat; }, [activeChat]);

  const refreshUnread = useCallback(async () => {
    if (!isAuthenticated) return;
    const data = await getChatUnread();
    const activeId = activeChatRef.current?.orderId;
    setUnread(clampOrderFromUnread(data, activeId));
  }, [isAuthenticated]);

  // Polling mientras hay sesión. Se pausa cuando el tab está oculto
  // para no quemar requests.
  useEffect(() => {
    if (!isAuthenticated) {
      setUnread({ total: 0, byOrder: {} });
      return undefined;
    }

    refreshUnread();

    const start = () => {
      if (pollRef.current) return;
      pollRef.current = setInterval(refreshUnread, POLL_INTERVAL_MS);
    };
    const stop = () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };

    const onVisibility = () => {
      if (document.hidden) {
        stop();
      } else {
        refreshUnread();
        start();
      }
    };

    start();
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      stop();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [isAuthenticated, refreshUnread]);

  const openChat = useCallback((orderId, orderStatus) => {
    setActiveChat({ orderId, orderStatus });
    // Decremento optimista para feedback instantáneo.
    setUnread(prev => clampOrderFromUnread(prev, orderId));
    // Notifica al backend para que persista el read-receipt; si el
    // endpoint no existe (404), el catch en markChatRead lo absorbe.
    markChatRead(orderId);
  }, []);

  const closeChat = useCallback(() => {
    setActiveChat(null);
    // Pequeño delay para que el backend procese eventos pendientes
    // del WS antes de re-consultar el conteo.
    setTimeout(refreshUnread, 500);
  }, [refreshUnread]);

  return (
    <ChatContext.Provider value={{
      activeChat,
      openChat,
      closeChat,
      unread,
      refreshUnread,
    }}>
      {children}
    </ChatContext.Provider>
  );
};

ChatProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
