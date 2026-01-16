// src/components/chat/ChatRoom.jsx
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { MessageSquare, X, AlertTriangle } from 'lucide-react';
import api from '../../api/axios';
import { useWebSocketChat } from '../../hooks/useWebSocketChat';
import { canChatInStatus } from '../../utils/websocket';
import ConnectionStatus from './ConnectionStatus';
import MessageList from './MessageList';
import ChatInput from './ChatInput';

const ChatRoom = ({ orderId, orderStatus, currentUser, onClose }) => {
  const { t } = useTranslation();
  const [historyMessages, setHistoryMessages] = useState([]); // ✅ NUEVO
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState(null);

  const token = localStorage.getItem('access_token');
  const isChatEnabled = canChatInStatus(orderStatus);

  // ✅ Cargar historial ANTES de conectar WebSocket
  useEffect(() => {
    const loadHistory = async () => {
      try {
        setHistoryLoading(true);
        const { data } = await api.get(`/orders/${orderId}/messages/`);
        
        if (data.messages && data.messages.length > 0) {
          console.log(`✅ Historial cargado: ${data.total_messages} mensajes`);
          setHistoryMessages(data.messages); // ✅ GUARDAR historial
        } else {
          setHistoryMessages([]); // ✅ Lista vacía si no hay mensajes
        }
      } catch (err) {
        console.error('Error cargando historial:', err);
        setHistoryError(t('chat.errorLoadingHistory'));
        setHistoryMessages([]); // ✅ Lista vacía en caso de error
      } finally {
        setHistoryLoading(false);
      }
    };

    if (orderId && token) {
      loadHistory();
    }
  }, [orderId, token, t]);

  // ✅ Hook de WebSocket CON mensajes iniciales
  const {
    messages,
    isConnected,
    isReconnecting,
    error: wsError,
    sendMessage,
    reconnect,
  } = useWebSocketChat(orderId, token, isChatEnabled, historyMessages);

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-neutral-dark/10 flex flex-col h-[600px] max-h-[80vh]">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-[#a83f34] text-white px-6 py-4 rounded-t-2xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-2 rounded-lg">
            <MessageSquare size={24} />
          </div>
          <div>
            <h3 className="font-heading font-bold text-lg">
              {t('chat.title')}
            </h3>
            <p className="text-xs text-white/80">
              {t('chat.orderNumber', { number: orderId })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <ConnectionStatus
            isConnected={isConnected}
            isReconnecting={isReconnecting}
            onReconnect={reconnect}
          />
          
          {onClose && (
            <button
              onClick={onClose}
              className="hover:bg-white/20 p-2 rounded-lg transition-colors"
              aria-label={t('common.close')}
            >
              <X size={20} />
            </button>
          )}
        </div>
      </div>

      {/* Alert de estado de orden */}
      {!isChatEnabled && (
        <div className="bg-amber-50 border-b border-amber-200 px-6 py-3 flex items-start gap-3">
          <AlertTriangle className="text-amber-600 shrink-0 mt-0.5" size={18} />
          <div>
            <p className="text-amber-800 font-semibold text-sm">
              {t('chat.chatNotAvailable')}
            </p>
            <p className="text-amber-700 text-xs mt-1">
              {orderStatus === 'PENDING' && t('chat.waitForAcceptance')}
              {['COMPLETED', 'CANCELLED'].includes(orderStatus) && t('chat.orderClosed')}
            </p>
          </div>
        </div>
      )}

      {/* Error de WebSocket */}
      {wsError && (
        <div className="bg-red-50 border-b border-red-200 px-6 py-3 flex items-start gap-3">
          <AlertTriangle className="text-red-600 shrink-0 mt-0.5" size={18} />
          <p className="text-red-700 text-sm">
            {t(wsError) || wsError}
          </p>
        </div>
      )}

      {/* Error de historial */}
      {historyError && (
        <div className="bg-yellow-50 border-b border-yellow-200 px-6 py-3">
          <p className="text-yellow-700 text-sm">{historyError}</p>
        </div>
      )}

      {/* Lista de mensajes */}
      <MessageList
        messages={messages}
        currentUserId={currentUser?.id}
        currentUserRole={currentUser?.role}
        loading={historyLoading}
      />

      {/* Input de mensaje */}
      <ChatInput
        onSendMessage={sendMessage}
        disabled={!isChatEnabled}
        isConnected={isConnected}
        placeholder={t('chat.typeMessage')}
      />
    </div>
  );
};

export default ChatRoom;
