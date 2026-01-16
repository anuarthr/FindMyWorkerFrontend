import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import FloatingChat from './FloatingChat';

const FloatingChatManager = () => {
  const { activeChat, closeChat } = useChat();
  const { user } = useAuth();

  if (!activeChat || !user) {
    return null;
  }

  return (
    <FloatingChat
      orderId={activeChat.orderId}
      orderStatus={activeChat.orderStatus}
      currentUser={user}
      onClose={closeChat}
    />
  );
};

export default FloatingChatManager;
