import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchChats } from '../../store/slices/messagesSlice';

const MessagesPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { chats, loading } = useSelector(state => state.messages);
  const { isAuthenticated } = useSelector(state => state.auth);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    dispatch(fetchChats());
  }, [dispatch, isAuthenticated, navigate]);

  useEffect(() => {
    if (!loading && chats.length > 0) {
      const lastChat = chats.find(c => c.participantId !== undefined);
      if (lastChat) {
        navigate(`/messages/user/${lastChat.participantId}`, { replace: true });
      }
    }
  }, [loading, chats, navigate]);

  if (loading) return null;

  if (chats.length === 0) {
    return (
      <div style={{
        height: 'calc(100vh - 60px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-primary)'
      }}>
        <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '56px', marginBottom: '12px' }}>💬</div>
          <h3 style={{ fontSize: '18px', color: 'var(--text-primary)', marginBottom: '6px' }}>Нет сообщений</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Найдите фрилансера в каталоге услуг и начните общение</p>
        </div>
      </div>
    );
  }

  return null;
};

export default MessagesPage;