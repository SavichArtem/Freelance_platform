import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import './Chat.css';

const Chat = ({ messages, partnerName, partnerAvatar, onSendMessage, loading, headerExtra, readOnly = false }) => {
  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);
  const fileInputRef = useRef(null);
  const { user } = useSelector(state => state.auth);

  const [newMessage, setNewMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileError, setFileError] = useState('');
  const [initialScrollDone, setInitialScrollDone] = useState(false);

  // Первый скролл при загрузке
  useEffect(() => {
    if (!initialScrollDone && messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
      setInitialScrollDone(true);
    }
  }, [messages, initialScrollDone]);

  // При получении нового сообщения — скроллим если мы внизу
  useEffect(() => {
    if (initialScrollDone && containerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      if (isNearBottom) {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [messages.length, initialScrollDone]);

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  };

  const formatChatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', { month: 'long', day: 'numeric' });
  };

  const isImageFile = (fileName) => fileName && /\.(jpg|jpeg|png|gif|webp)$/i.test(fileName);

  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} Б`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} КБ`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} МБ`;
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    setFileError('');
    if (!file) return;
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      setFileError('Неверный формат. Допустимы: jpg, png, pdf, doc');
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setFileError('Файл не должен превышать 20 МБ');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => setSelectedFile({ name: file.name, size: file.size, url: ev.target.result });
    reader.readAsDataURL(file);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSend = () => {
    if (!newMessage.trim() && !selectedFile) return;
    onSendMessage({ text: newMessage.trim(), file: selectedFile });
    setNewMessage('');
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chat-widget">
      <div className="chat-widget-header">
        <div className="chat-widget-user">
          <div className="chat-widget-avatar">
            {partnerAvatar ? (
              <img src={partnerAvatar} alt={partnerName} />
            ) : (
              <div className="avatar-placeholder">{partnerName?.charAt(0).toUpperCase() || '?'}</div>
            )}
          </div>
          <h3>{partnerName || 'Собеседник'}</h3>
        </div>
        {headerExtra && <div className="chat-header-actions">{headerExtra}</div>}
      </div>

      <div className="chat-widget-messages" ref={containerRef}>
        {loading ? (
          <div className="messages-empty">Загрузка...</div>
        ) : messages.length === 0 ? (
          <div className="messages-empty">Нет сообщений. Начните общение!</div>
        ) : (
          messages.map((msg, index) => {
            const isMine = msg.senderId === user?.id;
            const showDate = index === 0 || formatChatDate(msg.timestamp) !== formatChatDate(messages[index - 1].timestamp);
            return (
              <div key={msg.id}>
                {showDate && <div className="date-separator"><span>{formatChatDate(msg.timestamp)}</span></div>}
                <div className={`message ${isMine ? 'message-mine' : 'message-theirs'}`}>
                  {!isMine && <div className="message-sender">{msg.senderName}</div>}
                  {msg.text && <div className="message-bubble"><p>{msg.text}</p></div>}
                  {msg.file && (
                    <div className="message-file">
                      {isImageFile(msg.file.name) ? (
                        <img src={msg.file.url || msg.file.name} alt={msg.file.name} onClick={() => window.open(msg.file.url || msg.file.name, '_blank')} />
                      ) : (
                        <>
                          <svg className="file-icon-svg" viewBox="0 0 24 24" width="18" height="18">
                            <path fill="#6c757d" d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zM6 20V4h7v5h5v11H6z"/>
                          </svg>
                          <span className="file-name" onClick={() => window.open(msg.file.url || '#', '_blank')}>{msg.file.name}</span>
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

      {!readOnly && (
        <>
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
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path fill="#6c757d" d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6H10v9.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 3.04 2.46 5.5 5.5 5.5s5.5-2.46 5.5-5.5V6h-1.5z"/>
              </svg>
            </button>
            <div className="message-input-field">
              <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyDown={handleKeyDown} placeholder="Введите сообщение..." />
            </div>
            <button onClick={handleSend} className="btn-send" disabled={!newMessage.trim() && !selectedFile}>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="white">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
              </svg>
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Chat;