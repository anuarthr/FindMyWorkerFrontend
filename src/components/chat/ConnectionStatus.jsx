import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const ConnectionStatus = ({ isConnected, isReconnecting, onReconnect }) => {
  const { t } = useTranslation();

  if (isConnected) {
    return (
      <div className="flex items-center gap-2 text-green-600 text-sm">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        <Wifi size={16} />
        <span className="font-medium">{t('chat.connected')}</span>
      </div>
    );
  }

  if (isReconnecting) {
    return (
      <div className="flex items-center gap-2 text-amber-600 text-sm">
        <RefreshCw size={16} className="animate-spin" />
        <span className="font-medium">{t('chat.reconnecting')}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-red-600 text-sm">
      <div className="w-2 h-2 bg-red-500 rounded-full" />
      <WifiOff size={16} />
      <span className="font-medium">{t('chat.disconnected')}</span>
      {onReconnect && (
        <button
          onClick={onReconnect}
          className="ml-2 text-xs underline hover:text-red-700"
        >
          {t('chat.retry')}
        </button>
      )}
    </div>
  );
};

export default ConnectionStatus;
