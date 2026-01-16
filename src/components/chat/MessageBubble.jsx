import { useTranslation } from 'react-i18next';
import { formatMessageTime } from '../../utils/websocket';
import { User } from 'lucide-react';

const MessageBubble = ({ message, isOwn, currentUserRole }) => {
  const { t, i18n } = useTranslation();

  const bubbleStyle = isOwn
    ? 'bg-primary text-white ml-auto'
    : 'bg-neutral-light text-neutral-dark mr-auto';

  const roleColors = {
    CLIENT: 'bg-blue-100 text-blue-800',
    WORKER: 'bg-green-100 text-green-800',
    ADMIN: 'bg-purple-100 text-purple-800',
  };

  return (
    <div className={`flex flex-col max-w-[75%] ${isOwn ? 'items-end' : 'items-start'} mb-4`}>
      {/* Header del mensaje */}
      {!isOwn && (
        <div className="flex items-center gap-2 mb-1 px-2">
          <div className="w-6 h-6 rounded-full bg-neutral-dark/10 flex items-center justify-center">
            <User size={14} className="text-neutral-dark/60" />
          </div>
          <span className="text-xs font-semibold text-neutral-dark">
            {message.sender_name}
          </span>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${roleColors[message.sender_role]}`}>
            {t(`roles.${message.sender_role.toLowerCase()}`)}
          </span>
        </div>
      )}

      {/* Burbuja del mensaje */}
      <div className={`px-4 py-2 rounded-2xl shadow-sm ${bubbleStyle} ${isOwn ? 'rounded-tr-sm' : 'rounded-tl-sm'}`}>
        <p className="text-sm whitespace-pre-wrap wrap-break-word">
          {message.content}
        </p>
      </div>

      {/* Timestamp */}
      <span className="text-[11px] text-neutral-dark/40 mt-1 px-2">
        {formatMessageTime(message.timestamp, i18n.language)}
      </span>
    </div>
  );
};

export default MessageBubble;
