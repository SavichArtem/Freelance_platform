import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchChatsStart,
  fetchChatsSuccess,
  clearMessages,
} from "../../store/slices/messagesSlice";
import { messagesApi } from "../../api/messagesApi";

const MessagesPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { chats, loading } = useSelector((state) => state.messages);
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [redirected, setRedirected] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    dispatch(clearMessages());
    dispatch(fetchChatsStart());
    messagesApi
      .getChats()
      .then((res) => dispatch(fetchChatsSuccess(res.data)))
      .catch(() => {});
  }, [dispatch, isAuthenticated, navigate]);

  useEffect(() => {
    if (!loading && !redirected && user && chats.length > 0) {
      const myChats = chats.filter(
        (c) => c.participantId && c.participantId !== user.id,
      );
      if (myChats.length > 0) {
        setRedirected(true);
        navigate(`/messages/user/${myChats[0].participantId}`, {
          replace: true,
        });
      }
    }
  }, [loading, chats, user, navigate, redirected]);

  if (loading) return null;
  if (
    !user ||
    chats.filter((c) => c.participantId && c.participantId !== user.id)
      .length === 0
  ) {
    return (
      <div
        style={{
          height: "calc(100vh - 60px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--bg-primary)",
        }}
      >
        <div style={{ textAlign: "center", color: "var(--text-muted)" }}>
          <div style={{ fontSize: 56, marginBottom: 12 }}>💬</div>
          <h3
            style={{
              fontSize: 18,
              color: "var(--text-primary)",
              marginBottom: 6,
            }}
          >
            Нет сообщений
          </h3>
          <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>
            Найдите фрилансера в каталоге услуг и начните общение
          </p>
        </div>
      </div>
    );
  }
  return null;
};

export default MessagesPage;
