import { createContext, useContext, useState } from 'react';
import PropTypes from 'prop-types';

/**
 * Contexto para gestionar el estado del chat flotante
 * Permite abrir/cerrar conversaciones desde cualquier parte de la app
 */
const ChatContext = createContext();

/**
 * Hook para acceder al contexto de chat
 * @throws {Error} Si se usa fuera del ChatProvider
 */
export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat debe usarse dentro de ChatProvider');
  }
  return context;
};

/**
 * Provider del contexto de chat
 * @param {Object} props
 * @param {React.ReactNode} props.children - Componentes hijos
 */
export const ChatProvider = ({ children }) => {
  // Estado del chat activo: {orderId, orderStatus} o null
  const [activeChat, setActiveChat] = useState(null);

  /**
   * Abre una conversación de chat
   * @param {number} orderId - ID de la orden
   * @param {string} orderStatus - Estado de la orden
   */
  const openChat = (orderId, orderStatus) => {
    setActiveChat({ orderId, orderStatus });
  };

  /**
   * Cierra la conversación activa
   */
  const closeChat = () => {
    setActiveChat(null);
  };

  return (
    <ChatContext.Provider value={{ activeChat, openChat, closeChat }}>
      {children}
    </ChatContext.Provider>
  );
};

ChatProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
