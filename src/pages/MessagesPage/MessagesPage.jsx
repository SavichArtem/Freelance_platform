import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchChats } from '../../store/slices/messagesSlice';

const MessagesPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { chats, loading } = useSelector(state => state.messages);
  const { isAuthenticated, user, token } = useSelector(state => state.auth);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (token && !loaded) {
      setLoaded(true);
      dispatch(fetchChats());
    }
  }, [token, loaded, dispatch]);

  useEffect(() => {
    if (!loading && loaded && user && chats.length > 0) {
      const myChats = chats.filter(c => c.participantId && c.participantId !== user.id);
      if (myChats.length > 0) {
        navigate(`/messages/user/${myChats[0].participantId}`, { replace: true });
      }
    }
  }, [loading, loaded, chats, user, navigate]);

  if (!loaded || loading) return null;

  if (!user || chats.filter(c => c.participantId && c.participantId !== user.id).length === 0) {
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