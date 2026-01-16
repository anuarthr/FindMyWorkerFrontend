import { useState, useEffect } from 'react';
import { MessageSquare, Minimize2, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '../../api/axios';
import { useWebSocketChat } from '../../hooks/useWebSocketChat';
import { canChatInStatus } from '../../utils/websocket';
import ConnectionStatus from './ConnectionStatus';
import MessageList from './MessageList';
import ChatInput from './ChatInput';

const FloatingChat = ({ orderId, orderStatus, currentUser, onClose }) => {
  const { t } = useTranslation();
  const [isMinimized, setIsMinimized] = useState(false);
  const [historyMessages, setHistoryMessages] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  const token = localStorage.getItem('access_token');
  const isChatEnabled = canChatInStatus(orderStatus);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        setHistoryLoading(true);
        const { data } = await api.get(`/orders/${orderId}/messages/`);
        setHistoryMessages(data.messages || []);
        console.log(`✅ Historial cargado: ${data.total_messages || 0} mensajes`);
      } catch (err) {
        console.error('Error cargando historial:', err);
        setHistoryMessages([]);
      } finally {
        setHistoryLoading(false);
      }
    };

    if (orderId && token) {
      loadHistory();
    }
  }, [orderId, token]);

  const {
    messages,
    isConnected,
    isReconnecting,
    error: wsError,
    sendMessage,
  } = useWebSocketChat(orderId, token, isChatEnabled, historyMessages);

  if (isMinimized) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsMinimized(false)}
          className="bg-primary hover:bg-[#a83f34] text-white px-5 py-3 rounded-full shadow-2xl flex items-center gap-3 transition-all hover:scale-105"
        >
          <MessageSquare size={24} />
          <span className="font-bold">{t('chat.title')}</span>
          {messages.length > 0 && (
            <span className="bg-white text-primary w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">
              {messages.length}
            </span>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-[380px] max-h-[600px] flex flex-col bg-white rounded-2xl shadow-2xl border border-neutral-dark/10 animate-in slide-in-from-bottom-5">
      {/* Header */}
      <div className="bg-linear-to-r from-primary to-[#a83f34] text-white px-4 py-3 rounded-t-2xl flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare size={20} />
          <div>
            <h3 className="font-bold text-sm">{t('chat.title')}</h3>
            <p className="text-xs text-white/80">
              {t('chat.orderNumber', { number: orderId })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ConnectionStatus
            isConnected={isConnected}
            isReconnecting={isReconnecting}
          />
          
          <button
            onClick={() => setIsMinimized(true)}
            className="hover:bg-white/20 p-1.5 rounded-lg transition-colors"
            aria-label={t('chat.minimize')}
          >
            <Minimize2 size={16} />
          </button>
          
          <button
            onClick={onClose}
            className="hover:bg-white/20 p-1.5 rounded-lg transition-colors"
            aria-label={t('common.close')}
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Error de WebSocket */}
      {wsError && (
        <div className="bg-red-50 border-b border-red-200 px-4 py-2 text-xs text-red-700">
          {t(wsError) || wsError}
        </div>
      )}

      {/* Chat deshabilitado */}
      {!isChatEnabled && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-xs text-amber-800">
          {orderStatus === 'PENDING' && t('chat.waitForAcceptance')}
          {['COMPLETED', 'CANCELLED'].includes(orderStatus) && t('chat.orderClosed')}
        </div>
      )}

      {/* Mensajes */}
      <div className="flex-1 overflow-hidden">
        <MessageList
          messages={messages}
          currentUserId={currentUser?.id}
          currentUserRole={currentUser?.role}
          loading={historyLoading}
        />
      </div>

      {/* Input */}
      <ChatInput
        onSendMessage={sendMessage}
        disabled={!isChatEnabled}
        isConnected={isConnected}
        placeholder={t('chat.typeMessage')}
      />
    </div>
  );
};

export default FloatingChat;
