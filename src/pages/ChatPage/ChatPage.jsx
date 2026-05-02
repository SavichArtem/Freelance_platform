import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchChats, fetchUserMessages, fetchOrderMessages, sendUserMessage, sendOrderMessage } from '../../store/slices/messagesSlice';
import { ordersApi } from '../../api/ordersApi';
import Chat from '../../components/Chat/Chat';
import './ChatPage.css';

const ChatPage = () => {
  const { userId, orderId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { chats, currentMessages, currentPartner } = useSelector(state => state.messages);
  const { user } = useSelector(state => state.auth);
  const [showSidebar, setShowSidebar] = useState(true);
  const [activeOrderId, setActiveOrderId] = useState(null);

  const isOrderChat = !!orderId;
  const chatId = isOrderChat ? `order_${orderId}` : `user_${userId}`;

  useEffect(() => {
    dispatch(fetchChats());
    if (isOrderChat) {
      dispatch(fetchOrderMessages(orderId));
    } else if (userId) {
      dispatch(fetchUserMessages(userId));
    }
    setShowSidebar(false);
  }, [userId, orderId, dispatch, isOrderChat]);

  useEffect(() => {
    loadActiveOrder();
  }, [currentPartner, userId]);

  const loadActiveOrder = async () => {
    const partnerId = currentPartner?.id || Number(userId);
    if (!partnerId || partnerId === user?.id) return;

    try {
      const res = await ordersApi.getAll({});
      const orders = res.data.orders || [];
      const active = orders.find(o =>
        (o.freelancerName === currentPartner?.login || o.customerName === currentPartner?.login) &&
        (o.status === 'in_progress' || o.status === 'dispute')
      );
      setActiveOrderId(active?.id || null);
    } catch {
      setActiveOrderId(null);
    }
  };

  const handleSendMessage = (data) => {
    if (isOrderChat) {
      dispatch(sendOrderMessage({ orderId, ...data }));
    } else if (userId) {
      dispatch(sendUserMessage({ userId, ...data }));
    }
    dispatch(fetchChats());
  };

  const handleChatClick = (chat) => {
    if (chat.participantId === user?.id) return;
    navigate(`/messages/user/${chat.participantId}`, { replace: true });
    setShowSidebar(false);
  };

  const partnerName = currentPartner?.login || 'Собеседник';
  const partnerAvatar = currentPartner?.avatar || null;

  const headerExtra = (
    <div className="chat-header-actions">
      <button className="mobile-back-btn" onClick={() => setShowSidebar(true)}>←</button>
      {activeOrderId && (
        <Link to={`/orders/${activeOrderId}`} className="btn-order-link">К заказу</Link>
      )}
    </div>
  );

  return (
    <div className="chat-page">
      <div className="chat-container">
        <div className={`chat-sidebar ${!showSidebar ? 'hidden' : ''}`}>
          <div className="chat-sidebar-header">
            <h3>Чаты</h3>
          </div>
          <div className="chats-mini-list">
            {chats.filter(c => c.participantId !== user?.id).map(chat => (
              <div
                key={chat.chatId || chat.id}
                onClick={() => handleChatClick(chat)}
                className={`chat-mini-item ${chat.participantId === (currentPartner?.id || Number(userId)) ? 'chat-mini-active' : ''}`}
              >
                <div className="chat-mini-avatar">
                  {chat.participantAvatar ? (
                    <img src={chat.participantAvatar} alt={chat.participantName} />
                  ) : (
                    <div className="avatar-placeholder">{chat.participantName?.charAt(0).toUpperCase()}</div>
                  )}
                </div>
                <div className="chat-mini-info">
                  <span className="chat-mini-name">{chat.participantName}</span>
                  <span className="chat-mini-last">{chat.lastMessage}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={`chat-main ${showSidebar ? 'hidden' : ''}`}>
          <Chat
            messages={currentMessages}
            partnerName={partnerName}
            partnerAvatar={partnerAvatar}
            onSendMessage={handleSendMessage}
            headerExtra={headerExtra}
          />
        </div>
      </div>
    </div>
  );
};

export default ChatPage;