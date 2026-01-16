import { useState } from 'react';
import { Send, Lock } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const ChatInput = ({ onSendMessage, disabled, isConnected, placeholder }) => {
  const { t } = useTranslation();
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!inputValue.trim() || disabled || !isConnected) {
      return;
    }

    const success = onSendMessage(inputValue);
    if (success) {
      setInputValue('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border-t border-neutral-dark/10 bg-white p-4">
      <div className="flex items-center gap-3">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled || !isConnected}
          placeholder={
            disabled 
              ? t('chat.chatClosed') 
              : !isConnected 
                ? t('chat.waitingConnection')
                : placeholder || t('chat.typeMessage')
          }
          className="flex-1 px-4 py-3 border border-neutral-dark/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary disabled:bg-gray-100 disabled:cursor-not-allowed transition-all"
        />
        
        <button
          type="submit"
          disabled={disabled || !isConnected || !inputValue.trim()}
          className="bg-primary hover:bg-[#a83f34] text-white px-5 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-md hover:shadow-lg disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-primary"
        >
          {disabled ? (
            <Lock size={20} />
          ) : (
            <Send size={20} />
          )}
          <span className="hidden sm:inline">{t('chat.send')}</span>
        </button>
      </div>

      {disabled && (
        <p className="text-xs text-neutral-dark/60 mt-2 flex items-center gap-1">
          <Lock size={12} />
          {t('chat.chatClosedReason')}
        </p>
      )}
    </form>
  );
};

export default ChatInput;
