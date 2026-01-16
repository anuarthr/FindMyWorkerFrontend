import { useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import MessageBubble from './MessageBubble';

const MessageList = ({ messages, currentUserId, currentUserRole, loading }) => {
  const { t } = useTranslation();
  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={32} />
        <span className="ml-3 text-neutral-dark/60">{t('chat.loadingMessages')}</span>
      </div>
    );
  }

  if (!messages || messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-neutral-light rounded-full flex items-center justify-center mx-auto mb-3">
            <span className="text-3xl">💬</span>
          </div>
          <p className="text-neutral-dark/60 text-sm">
            {t('chat.noMessages')}
          </p>
          <p className="text-neutral-dark/40 text-xs mt-1">
            {t('chat.startConversation')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="flex-1 overflow-y-auto px-4 py-6 space-y-2"
      style={{ maxHeight: 'calc(100vh - 400px)' }}
    >
      {messages.map((message) => (
        <MessageBubble
          key={message.id}
          message={message}
          isOwn={message.sender === currentUserId}
          currentUserRole={currentUserRole}
        />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;