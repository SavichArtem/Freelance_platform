import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchOrderByIdStart,
  fetchOrderByIdSuccess,
  fetchOrderByIdFailure,
  completeOrderSuccess,
  returnMoneySuccess,
  openDisputeSuccess,
  clearMessage,
} from "../../store/slices/ordersSlice";
import { ordersApi } from "../../api/ordersApi";
import { messagesApi } from "../../api/messagesApi";
import { reviewsApi } from "../../api/reviewsApi";
import Chat from "../../components/Chat/Chat";
import "./OrderDetailPage.css";

const STATUS_MAP = {
  in_progress: "Выполняется",
  completed: "Выполнен",
  dispute: "Спор",
  returned: "Возврат",
};
const STATUS_CLASS = {
  in_progress: "status-progress",
  completed: "status-completed",
  dispute: "status-dispute",
  returned: "status-returned",
};
const DISPUTE_REASONS = [
  "Некачественная работа",
  "Нарушение сроков",
  "Несоответствие ТЗ",
  "Другое",
];

const OrderDetailPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const {
    currentOrder: order,
    loading,
    error,
    message,
  } = useSelector((state) => state.orders);
  const [showDisputeForm, setShowDisputeForm] = useState(false);
  const [disputeData, setDisputeData] = useState({ reason: "", comment: "" });
  const [disputeError, setDisputeError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [orderMessages, setOrderMessages] = useState([]);

  const loadOrder = () => {
    dispatch(fetchOrderByIdStart());
    ordersApi
      .getById(orderId)
      .then((res) => dispatch(fetchOrderByIdSuccess(res.data)))
      .catch((err) =>
        dispatch(
          fetchOrderByIdFailure(err.response?.data?.message || "Ошибка"),
        ),
      );
  };

  const loadMessages = () => {
    messagesApi
      .getOrderMessages(orderId)
      .then((res) => setOrderMessages(res.data.messages))
      .catch(() => {});
  };

  useEffect(() => {
    loadOrder();
    loadMessages();
    return () => dispatch(clearMessage());
  }, [orderId]);

  useEffect(() => {
    if (message) {
      setSuccessMessage(message);
      dispatch(clearMessage());
      loadOrder();
      setTimeout(() => setSuccessMessage(""), 5000);
    }
  }, [message]);
  useEffect(() => {
    if (
      order &&
      user &&
      order.status === "completed" &&
      user.role === "customer"
    ) {
      reviewsApi
        .checkOrder(order.id)
        .then((res) => setReviewSubmitted(res.data.alreadyReviewed))
        .catch(() => {});
    }
  }, [order, user]);
  useEffect(() => {
    const handleFocus = () => loadMessages();
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [orderId]);

  const handleSendChatMessage = async (data) => {
    try {
      await messagesApi.sendToOrder(orderId, data);
      loadMessages();
    } catch (err) {
      console.error(err);
    }
  };
  const formatDate = (d) =>
    d
      ? new Date(d).toLocaleDateString("ru-RU", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "—";

  const handleConfirmComplete = async () => {
    if (window.confirm("Подтвердить?")) {
      try {
        const res = await ordersApi.complete(order.id);
        dispatch(completeOrderSuccess(res.data));
      } catch (err) {
        dispatch({
          type: "orders/completeOrderFailure",
          payload: err.response?.data?.message,
        });
      }
    }
  };
  const handleOpenDispute = () => {
    setShowDisputeForm(true);
    setDisputeData({ reason: "", comment: "" });
    setDisputeError("");
  };
  const handleDisputeSubmit = async (e) => {
    e.preventDefault();
    if (!disputeData.reason) {
      setDisputeError("Выберите причину");
      return;
    }
    if (!disputeData.comment.trim()) {
      setDisputeError("Опишите суть претензии");
      return;
    }
    try {
      const res = await ordersApi.openDispute(order.id, disputeData);
      dispatch(openDisputeSuccess(res.data));
      setShowDisputeForm(false);
    } catch (err) {
      setDisputeError(err.response?.data?.message || "Ошибка");
    }
  };
  const handleReturnMoney = async () => {
    if (window.confirm("Вернуть деньги?")) {
      try {
        const res = await ordersApi.returnMoney(order.id);
        dispatch(returnMoneySuccess(res.data));
      } catch (err) {
        dispatch({
          type: "orders/returnMoneyFailure",
          payload: err.response?.data?.message,
        });
      }
    }
  };
  const handleSubmitReview = async () => {
    if (!reviewText.trim()) {
      setReviewError("Напишите текст");
      return;
    }
    setSubmittingReview(true);
    try {
      await reviewsApi.create({
        orderId: order.id,
        rating: reviewRating,
        text: reviewText,
      });
      setReviewSubmitted(true);
      setSuccessMessage("Отзыв отправлен");
    } catch (err) {
      setReviewError(err.response?.data?.message || "Ошибка");
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading)
    return (
      <div className="order-detail-page">
        <div className="container">
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Загрузка...</p>
          </div>
        </div>
      </div>
    );
  if (error)
    return (
      <div className="order-detail-page">
        <div className="container">
          <div className="error-message">{error}</div>
          <button onClick={() => navigate(-1)} className="btn-back">
            ← Назад
          </button>
        </div>
      </div>
    );
  if (!order || !user) return null;

  const isCustomer = user.role === "customer",
    isFreelancer = user.role === "freelancer";
  const canReview =
    order.status === "completed" && isCustomer && !reviewSubmitted;
  const partnerName = isCustomer ? order.freelancerName : order.customerName;
  const partnerUserId = isCustomer
    ? order.freelancerUserId
    : order.customerUserId;
  const chatHeaderExtra = (
    <div className="chat-header-actions">
      <Link to={`/messages/user/${partnerUserId}`} className="btn-order-link">
        Открыть в сообщениях
      </Link>
    </div>
  );

  return (
    <div className="order-detail-page">
      <div className="container">
        <button onClick={() => navigate(-1)} className="btn-back">
          ← Назад к заказам
        </button>
        {successMessage && (
          <div className="message-alert message-success">{successMessage}</div>
        )}
        <div className="order-detail-layout">
          <div className="order-info-section">
            <div className="order-card">
              <div className="order-card-header">
                <h1 className="order-number">{order.orderNumber}</h1>
                <span className={`status-badge ${STATUS_CLASS[order.status]}`}>
                  {STATUS_MAP[order.status]}
                </span>
              </div>
              <div className="order-details">
                <div className="detail-row">
                  <span className="detail-label">Услуга:</span>
                  <span className="detail-value">{order.serviceName}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Бюджет:</span>
                  <span className="detail-value detail-price">
                    {Number(order.budget).toLocaleString()} ₽
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Дата:</span>
                  <span className="detail-value">
                    {formatDate(order.createdAt)}
                  </span>
                </div>
                {order.completedAt && (
                  <div className="detail-row">
                    <span className="detail-label">Завершен:</span>
                    <span className="detail-value">
                      {formatDate(order.completedAt)}
                    </span>
                  </div>
                )}
                <div className="detail-row">
                  <span className="detail-label">
                    {isCustomer ? "Фрилансер:" : "Заказчик:"}
                  </span>
                  <span className="detail-value">
                    {isCustomer ? order.freelancerName : order.customerName}
                  </span>
                </div>
              </div>
              {order.status === "in_progress" && (
                <div className="order-actions">
                  {isCustomer && (
                    <>
                      <button onClick={handleConfirmComplete} className="btn btn-success">Подтвердить</button>
                      <button onClick={handleOpenDispute} className="btn btn-danger">Спор</button>
                    </>
                  )}
                  {isFreelancer && (
                    <button onClick={handleReturnMoney} className="btn btn-warning">Вернуть деньги</button>
                  )}
                </div>
              )}
              {order.status === "dispute" && order.dispute && (
                <div className="dispute-info">
                  <h3>Спор</h3>
                  <p>Причина: {order.dispute.reason}</p>
                  <p>Комментарий: {order.dispute.comment}</p>
                  <p>
                    Статус:{" "}
                    {order.dispute.status === "open" ? "Открыт" : "Решен"}
                  </p>
                  {order.dispute.resolution && (
                    <p>
                      Решение:{" "}
                      {order.dispute.resolution === "customer"
                        ? "Заказчику"
                        : "Фрилансеру"}
                    </p>
                  )}
                  {order.dispute.adminComment && (
                    <p>Комментарий админа: {order.dispute.adminComment}</p>
                  )}
                </div>
              )}
              {canReview && (
                <div className="review-section">
                  <h3>Отзыв</h3>
                  {reviewError && (
                    <div className="form-error-message">{reviewError}</div>
                  )}
                  <div className="stars-input">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <span key={s} className={`star-input ${s <= reviewRating ? "star-active" : ""}`} onClick={() => setReviewRating(s)}>
                        ★
                      </span>
                    ))}
                  </div>
                  <textarea value={reviewText} onChange={(e) => setReviewText(e.target.value)} className="form-input form-textarea" rows="3"
                    placeholder="Отзыв..."
                    maxLength={1000}/>
                  <div className="review-char-count">
                    {reviewText.length}/1000
                  </div>
                  <button onClick={handleSubmitReview} className="btn btn-primary" disabled={submittingReview}>Отправить</button>
                </div>
              )}
              {reviewSubmitted && (
                <div className="review-submitted">
                  <p>Отзыв оставлен</p>
                </div>
              )}
            </div>
            {showDisputeForm && (
              <div className="dispute-form-card">
                <h2>Спор</h2>
                {disputeError && (
                  <div className="form-error-message">{disputeError}</div>
                )}
                <form onSubmit={handleDisputeSubmit}>
                  <div className="form-group">
                    <label className="form-label">Причина</label>
                    <select
                      name="reason"
                      value={disputeData.reason}
                      onChange={(e) =>
                        setDisputeData((prev) => ({
                          ...prev,
                          reason: e.target.value,
                        }))
                      }
                      className="form-input"
                    >
                      <option value="">Выберите</option>
                      {DISPUTE_REASONS.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Комментарий</label>
                    <textarea
                      name="comment"
                      value={disputeData.comment}
                      onChange={(e) =>
                        setDisputeData((prev) => ({
                          ...prev,
                          comment: e.target.value,
                        }))
                      }
                      className="form-input form-textarea"
                      rows="4"
                      placeholder="Опишите..."
                    />
                  </div>
                  <div className="form-actions">
                    <button type="submit" className="btn btn-danger">Отправить</button>
                    <button type="button" className="btn btn-secondary" onClick={() => setShowDisputeForm(false)}>Отмена</button>
                  </div>
                </form>
              </div>
            )}
          </div>
          <div className="order-chat-section">
            <Chat messages={orderMessages} partnerName={partnerName} onSendMessage={handleSendChatMessage} headerExtra={chatHeaderExtra}/>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
