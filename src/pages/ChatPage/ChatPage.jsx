import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchChats, fetchUserMessages, fetchOrderMessages, sendUserMessage, sendOrderMessage } from '../../store/slices/messagesSlice';
import './ChatPage.css';

const ChatPage = () => {
  const { userId, orderId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const { chats, currentMessages, currentPartner } = useSelector(state => state.messages);
  const { user } = useSelector(state => state.auth);

  const [newMessage, setNewMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileError, setFileError] = useState('');
  const [showSidebar, setShowSidebar] = useState(true);

  const isOrderChat = !!orderId;
  const chatId = isOrderChat ? `order_${orderId}` : `user_${userId}`;

  useEffect(() => {
    dispatch(fetchChats());
    if (isOrderChat) {
      dispatch(fetchOrderMessages(orderId));
    } else if (userId) {
      dispatch(fetchUserMessages(userId));
    }
  }, [userId, orderId, dispatch, isOrderChat]);

  useEffect(() => {
    scrollToBottom();
  }, [currentMessages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', { month: 'long', day: 'numeric' });
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} Б`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} КБ`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} МБ`;
  };

  const isImageFile = (fileName) => {
    return fileName && /\.(jpg|jpeg|png|gif|webp)$/i.test(fileName);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    setFileError('');
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      setFileError('Неверный формат файла. Допустимы: jpg, png, pdf, doc');
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setFileError('Файл не должен превышать 20 МБ');
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      setSelectedFile({
        name: file.name,
        size: file.size,
        type: file.type,
        url: ev.target.result,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSend = () => {
    if (!newMessage.trim() && !selectedFile) return;
    const data = { text: newMessage.trim(), file: selectedFile };
    if (isOrderChat) {
      dispatch(sendOrderMessage({ orderId, ...data }));
    } else if (userId) {
      dispatch(sendUserMessage({ userId, ...data }));
    }
    setNewMessage('');
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChatClick = (chat) => {
    if (chat.orderId) {
      navigate(`/messages/order/${chat.orderId}`);
    } else {
      navigate(`/messages/user/${chat.participantId}`);
    }
    setShowSidebar(false);
  };

  const partnerName = currentPartner?.login || 'Собеседник';
  const partnerAvatar = currentPartner?.avatar || null;

  return (
    <div className="main-content-no-scroll">
    <div className="chat-page">
      <div className="chat-container">
        <div className={`chat-sidebar ${!showSidebar ? 'hidden' : ''}`}>
          <div className="chat-sidebar-header">
  <h3>Чаты</h3>
</div>
          <div className="chats-mini-list">
            {chats.map(chat => (
              <div
                key={chat.chatId || chat.id}
                onClick={() => handleChatClick(chat)}
                className={`chat-mini-item ${chat.chatId === chatId || `user_${chat.participantId}` === chatId || `order_${chat.orderId}` === chatId ? 'chat-mini-active' : ''}`}
              >
                <div className="chat-mini-avatar">
                  {chat.participantAvatar ? (
                    <img src={chat.participantAvatar} alt={chat.participantName} />
                  ) : (
                    <div className="avatar-placeholder">
                      {chat.participantName?.charAt(0).toUpperCase()}
                    </div>
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
          <div className="chat-main-header">
            <div className="chat-main-user">
              <button className="mobile-back-btn" onClick={() => setShowSidebar(true)}>←</button>
              <div className="chat-main-avatar">
                {partnerAvatar ? (
                  <img src={partnerAvatar} alt={partnerName} />
                ) : (
                  <div className="avatar-placeholder">{partnerName.charAt(0).toUpperCase()}</div>
                )}
              </div>
              <div>
                <h3>{partnerName}</h3>
              </div>
            </div>
            {isOrderChat && (
              <Link to={`/orders/${orderId}`} className="btn-order-link">К заказу</Link>
            )}
          </div>

          <div className="messages-container">
            {currentMessages.length === 0 ? (
              <div className="messages-empty"><p>Нет сообщений. Начните общение!</p></div>
            ) : (
              currentMessages.map((msg, index) => {
                const isMine = msg.senderId === user?.id;
                const showDate = index === 0 || formatDate(msg.timestamp) !== formatDate(currentMessages[index - 1].timestamp);
                return (
                  <div key={msg.id}>
                    {showDate && <div className="date-separator"><span>{formatDate(msg.timestamp)}</span></div>}
                    <div className={`message ${isMine ? 'message-mine' : 'message-theirs'}`}>
                      {!isMine && <div className="message-sender">{msg.senderName}</div>}
                      {msg.text && <div className="message-bubble"><p>{msg.text}</p></div>}
                      {msg.file && (
                        <div className="message-file">
                          {isImageFile(msg.file.name) ? (
                            <img
                              src={msg.file.url || msg.file.name}
                              alt={msg.file.name}
                              onClick={() => window.open(msg.file.url || msg.file.name, '_blank')}
                            />
                          ) : (
                            <>
                              <svg className="file-icon-svg" viewBox="0 0 24 24" width="20" height="20">
                                <path fill="#6c757d" d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zM6 20V4h7v5h5v11H6z"/>
                              </svg>
                              <a href={msg.file.url || '#'} download={msg.file.name} className="file-name">
                                {msg.file.name}
                              </a>
                            </>
                          )}
                          {msg.file.size && <span className="file-size">{formatFileSize(msg.file.size)}</span>}
                        </div>
                      )}
                      <div className="message-time">{formatTime(msg.timestamp)}</div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {fileError && <div className="file-error">{fileError}</div>}
          {selectedFile && (
            <div className="file-preview">
              <span>📎 {selectedFile.name}</span>
              <button onClick={handleRemoveFile} className="btn-remove-file">✕</button>
            </div>
          )}

          <div className="message-input">
            <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="file-input-hidden" accept=".jpg,.jpeg,.png,.pdf,.doc,.docx" />
            <button onClick={() => fileInputRef.current?.click()} className="btn-attach" title="Прикрепить файл">
              <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path fill="#6c757d" d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6H10v9.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 3.04 2.46 5.5 5.5 5.5s5.5-2.46 5.5-5.5V6h-1.5z"/>
              </svg>
            </button>
            <div className="message-input-field">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Введите сообщение..."
              />
            </div>
            <button onClick={handleSend} className="btn-send" disabled={!newMessage.trim() && !selectedFile}>
              <svg viewBox="0 0 24 24" width="20" height="20" fill="white">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default ChatPage;