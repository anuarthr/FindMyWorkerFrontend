import { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { MessageSquare, X, Loader2, Inbox } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import { listMyOrders } from '../../api/orders';
import { canChatInStatus, formatMessageTime } from '../../utils/websocket';
import { resolveMediaUrl } from '../../utils/profileHelpers';
import { getStatusLabel, getStatusBadgeClasses } from '../../utils/orderHelpers';

/**
 * Bandeja de chat flotante (FAB).
 * Persistente para usuarios autenticados — permite abrir cualquier
 * conversación activa sin tener que entrar al detalle de la orden.
 *
 * Comportamiento:
 *  - FAB redondo abajo-izquierda (FloatingChat ocupa abajo-derecha).
 *  - Click → abre un popover con la lista de órdenes en estado
 *    ACCEPTED o IN_ESCROW (las únicas con chat habilitado).
 *  - Click en una orden → openChat(orderId, status) y cierra el popover.
 *  - Oculto en rutas públicas (landing/login/register/reset) y mientras
 *    el FloatingChat ya está abierto sobre la misma orden.
 */
const HIDDEN_ROUTES = ['/', '/login', '/register', '/forgot-password', '/reset-password'];

const ChatInboxLauncher = () => {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuth();
  const { activeChat, openChat, unread } = useChat();
  const location = useLocation();

  const [isOpen, setIsOpen] = useState(false);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const isHiddenRoute = useMemo(
    () => HIDDEN_ROUTES.includes(location.pathname),
    [location.pathname]
  );

  const eligibleOrders = useMemo(
    () => orders.filter((o) => canChatInStatus(o.status)),
    [orders]
  );

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listMyOrders();
      const arr = Array.isArray(data) ? data : (data?.results || data?.data || []);
      setOrders(arr);
    } catch (err) {
      console.error('Error cargando bandeja de chat:', err);
      setError(t('chat.inboxError', 'No se pudo cargar la bandeja.'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    if (isOpen) fetchOrders();
  }, [isOpen, fetchOrders]);

  const handleOpenConversation = useCallback((order) => {
    openChat(order.id, order.status);
    setIsOpen(false);
  }, [openChat]);

  if (!isAuthenticated || !user || isHiddenRoute) return null;

  const locale = (typeof navigator !== 'undefined' && navigator.language?.startsWith('es')) ? 'es' : 'en';

  /**
   * Extrae info diferenciadora de la contraparte para el item del inbox:
   *  - name, subtitle (profesión si soy CLIENT, descripción truncada si soy WORKER)
   *  - avatarUrl, fallback con iniciales
   * Resiliente a campos faltantes — listMyOrders puede no devolver todo.
   */
  const counterpartInfo = (order) => {
    const isClient = user.role === 'CLIENT';
    const name = isClient
      ? (order.worker_name || order.worker_email || '')
      : (order.client_name || order.client_email || '');
    const subtitle = isClient
      ? (order.worker_profession || order.description || '')
      : (order.description || '');
    const avatarRaw = isClient ? order.worker_avatar : order.client_avatar;
    const avatarUrl = resolveMediaUrl(avatarRaw);
    const initial = name?.trim()?.[0]?.toUpperCase() || '?';
    return { name: name || `#${order.id}`, subtitle, avatarUrl, initial };
  };

  return (
    <>
      {/* FAB — siempre visible. Si hay activeChat, FloatingChat queda
          abajo-derecha; este botón vive abajo-izquierda para no chocar. */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="fixed bottom-6 left-6 z-40 bg-primary hover:bg-[#a83f34] text-white w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110"
        aria-label={t('chat.openInbox', 'Abrir bandeja de chats')}
        title={t('chat.openInbox', 'Abrir bandeja de chats')}
      >
        {isOpen ? <X size={22} /> : <Inbox size={22} />}
        {!isOpen && unread.total > 0 && (
          <span
            className="absolute -top-1 -right-1 min-w-[22px] h-[22px] px-1.5 bg-red-600 text-white text-[11px] font-bold rounded-full flex items-center justify-center border-2 border-white shadow"
            aria-label={t('chat.unreadCount', '{{count}} sin leer', { count: unread.total })}
          >
            {unread.total > 99 ? '99+' : unread.total}
          </span>
        )}
      </button>

      {/* Popover
          - `overflow-hidden` en el contenedor recorta el contenido al
            border-radius y obliga al inner div con overflow-y-auto a
            scrollear cuando hay más items que altura disponible.
          - `dvh` (dynamic viewport height) se contrae con la barra del
            navegador en mobile, evitando que el popover quede debajo
            del fold. Fallback a vh en navegadores antiguos.
          - Doble max-height: el style inline gana sobre la clase si dvh
            está soportado; si no, el navegador descarta dvh y aplica vh. */}
      {isOpen && (
        <div
          className="fixed bottom-24 left-6 z-40 w-[360px] max-w-[calc(100vw-3rem)] max-h-[calc(100vh-9rem)] flex flex-col overflow-hidden bg-white rounded-2xl shadow-2xl border border-neutral-dark/10 animate-in slide-in-from-bottom-5"
          style={{ maxHeight: 'min(70dvh, calc(100dvh - 8rem))' }}
        >
          <div className="bg-gradient-to-r from-primary to-[#a83f34] text-white px-4 py-3 flex items-center gap-2 shrink-0">
            <MessageSquare size={20} />
            <h3 className="font-bold text-sm flex-1">
              {t('chat.inboxTitle', 'Tus conversaciones')}
            </h3>
            {eligibleOrders.length > 0 && (
              <span className="text-[10px] font-bold bg-white/20 px-1.5 py-0.5 rounded-full">
                {eligibleOrders.length}
              </span>
            )}
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="hover:bg-white/20 p-1.5 rounded-lg transition-colors"
              aria-label={t('common.close')}
            >
              <X size={16} />
            </button>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
            {loading && (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="animate-spin text-primary" size={28} />
              </div>
            )}

            {!loading && error && (
              <p className="p-4 text-sm text-red-600 text-center">{error}</p>
            )}

            {!loading && !error && eligibleOrders.length === 0 && (
              <div className="p-6 text-center">
                <MessageSquare size={40} className="mx-auto text-neutral-dark/20 mb-3" />
                <p className="text-sm text-neutral-dark/60">
                  {t('chat.inboxEmpty', 'Aún no tienes chats activos. Te aparecerán aquí cuando aceptes una orden.')}
                </p>
              </div>
            )}

            {!loading && !error && eligibleOrders.length > 0 && (
              <ul className="divide-y divide-neutral-dark/5">
                {eligibleOrders.map((order) => {
                  const isActiveHere = activeChat?.orderId === order.id;
                  const unreadCount = unread.byOrder[String(order.id)] || 0;
                  const { name, subtitle, avatarUrl, initial } = counterpartInfo(order);
                  const lastActivity = order.last_message_at || order.updated_at || order.created_at;
                  return (
                    <li key={order.id}>
                      <button
                        type="button"
                        onClick={() => handleOpenConversation(order)}
                        disabled={isActiveHere}
                        className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors ${
                          isActiveHere
                            ? 'bg-primary/5 cursor-default'
                            : 'hover:bg-neutral-light/50'
                        }`}
                      >
                        {/* Avatar real o iniciales */}
                        <div className="relative shrink-0">
                          {avatarUrl ? (
                            <img
                              src={avatarUrl}
                              alt={name}
                              className="w-11 h-11 rounded-full object-cover border border-neutral-dark/10"
                              onError={(e) => { e.currentTarget.style.display = 'none'; }}
                            />
                          ) : (
                            <div className="w-11 h-11 rounded-full bg-primary/10 text-primary flex items-center justify-center text-base font-bold border border-neutral-dark/10">
                              {initial}
                            </div>
                          )}
                          {unreadCount > 0 && (
                            <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-red-600 border-2 border-white rounded-full" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          {/* Línea 1: nombre + fecha relativa */}
                          <div className="flex items-baseline justify-between gap-2">
                            <p className={`text-sm truncate ${unreadCount > 0 ? 'font-bold text-neutral-dark' : 'font-semibold text-neutral-dark'}`}>
                              {name}
                            </p>
                            {lastActivity && (
                              <span className="text-[10px] text-neutral-dark/40 shrink-0">
                                {formatMessageTime(lastActivity, locale)}
                              </span>
                            )}
                          </div>

                          {/* Línea 2: snippet diferenciador (profesión o descripción) */}
                          {subtitle && (
                            <p className="text-xs text-neutral-dark/60 truncate mt-0.5">
                              {subtitle}
                            </p>
                          )}

                          {/* Línea 3: badge de estado + número de orden */}
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className={getStatusBadgeClasses(order.status)}>
                              {getStatusLabel(order.status, t)}
                            </span>
                            <span className="text-[10px] text-neutral-dark/40 font-mono">
                              #{order.id}
                            </span>
                          </div>
                        </div>

                        {/* Acción / contador */}
                        <div className="self-center shrink-0">
                          {isActiveHere ? (
                            <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                              {t('chat.open', 'Abierto')}
                            </span>
                          ) : unreadCount > 0 ? (
                            <span className="min-w-5 h-5 px-1.5 bg-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                              {unreadCount > 99 ? '99+' : unreadCount}
                            </span>
                          ) : null}
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ChatInboxLauncher;
