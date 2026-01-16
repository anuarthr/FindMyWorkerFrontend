// URL base del WebSocket (cambiar en producción)
export const WS_BASE_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000';

export const WEBSOCKET_CONFIG = {
  MAX_RETRIES: 5,
  RECONNECT_DELAY: 3000,
  PING_INTERVAL: 30000,
};

export const CLOSE_CODES = {
  NORMAL_CLOSURE: 1000,
  UNAUTHORIZED: 4001,
  FORBIDDEN: 4003,
  NOT_FOUND: 4004,
  CHAT_INACTIVE: 4005,
};

export const ERROR_MESSAGES = {
  [CLOSE_CODES.UNAUTHORIZED]: 'auth.sessionExpired',
  [CLOSE_CODES.FORBIDDEN]: 'chat.noPermission',
  [CLOSE_CODES.NOT_FOUND]: 'chat.orderNotFound',
  [CLOSE_CODES.CHAT_INACTIVE]: 'chat.chatInactive',
};

export const buildWebSocketURL = (orderId, token) => {
  return `${WS_BASE_URL}/ws/chat/${orderId}/?token=${token}`;
};

export const canChatInStatus = (status) => {
  const ALLOWED_STATUSES = ['ACCEPTED', 'IN_ESCROW', 'IN_PROGRESS'];
  return ALLOWED_STATUSES.includes(status);
};

export const formatMessageTime = (timestamp, locale = 'es') => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return locale === 'es' ? 'Ahora' : 'Now';
  if (diffMins < 60) return locale === 'es' ? `Hace ${diffMins}m` : `${diffMins}m ago`;
  if (diffHours < 24) return locale === 'es' ? `Hace ${diffHours}h` : `${diffHours}h ago`;
  if (diffDays < 7) return locale === 'es' ? `Hace ${diffDays}d` : `${diffDays}d ago`;

  return date.toLocaleDateString(locale === 'es' ? 'es-CO' : 'en-US', {
    month: 'short',
    day: 'numeric',
  });
};
