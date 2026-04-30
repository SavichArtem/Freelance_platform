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
      const lastChat = chats[0];
      if (lastChat.orderId) {
        navigate(`/messages/order/${lastChat.orderId}`, { replace: true });
      } else {
        navigate(`/messages/user/${lastChat.participantId}`, { replace: true });
      }
    }
  }, [loading, chats, navigate]);

  return null;
};

export default MessagesPage;