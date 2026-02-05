import { useState, useMemo, useCallback } from 'react';
import { MessageSquare, Minimize2, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useWebSocketChat } from '../../hooks/useWebSocketChat';
import { canChatInStatus } from '../../utils/websocket';
import { useChatHistory } from '../../hooks/useChatHistory';
import ConnectionStatus from './ConnectionStatus';
import MessageList from './MessageList';
import ChatInput from './ChatInput';

const FloatingChat = ({ orderId, orderStatus, currentUser, onClose }) => {
  const { t } = useTranslation();
  const [isMinimized, setIsMinimized] = useState(false);
  const isChatEnabled = useMemo(() => canChatInStatus(orderStatus), [orderStatus]);
  
  const { 
    messages: historyMessages, 
    loading: historyLoading 
  } = useChatHistory(orderId);

  const token = localStorage.getItem('access_token');

  const {
    messages,
    isConnected,
    isReconnecting,
    error: wsError,
    sendMessage,
  } = useWebSocketChat(orderId, token, isChatEnabled, historyMessages);

  const toggleMinimize = useCallback(() => setIsMinimized(prev => !prev), []);

  if (isMinimized) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={toggleMinimize}
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

  const alertMessage = !isChatEnabled
    ? (orderStatus === 'PENDING' ? t('chat.waitForAcceptance') : t('chat.orderClosed'))
    : wsError;

  return (
    <div className="fixed bottom-6 right-6 z-50 w-[420px] max-h-[600px] flex flex-col bg-white rounded-2xl shadow-2xl border border-neutral-dark/10 animate-in slide-in-from-bottom-5">
      <div className="bg-gradient-to-r from-primary to-[#a83f34] text-white px-4 py-3 rounded-t-2xl flex items-center justify-between">
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
            onClick={toggleMinimize}
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

      {alertMessage && (
        <div className={`border-b px-4 py-2 text-xs ${
          !isChatEnabled 
            ? 'bg-amber-50 border-amber-200 text-amber-800' 
            : 'bg-red-50 border-red-200 text-red-700'
        }`}>
          {t(alertMessage) || alertMessage}
        </div>
      )}

      <div className="flex-1 overflow-hidden">
        <MessageList
          messages={messages}
          currentUserId={currentUser?.id}
          currentUserRole={currentUser?.role}
          loading={historyLoading}
        />
      </div>

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
