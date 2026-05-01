import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrderById, completeOrder, returnMoney, openDispute, clearMessage } from '../../store/slices/ordersSlice';
import { reviewsApi } from '../../api/reviewsApi';
import './OrderDetailPage.css';

const STATUS_MAP = {
  in_progress: 'Выполняется',
  completed: 'Выполнен',
  dispute: 'Спор',
  returned: 'Возврат',
};

const STATUS_CLASS = {
  in_progress: 'status-progress',
  completed: 'status-completed',
  dispute: 'status-dispute',
  returned: 'status-returned',
};

const DISPUTE_REASONS = [
  'Некачественная работа',
  'Нарушение сроков',
  'Несоответствие ТЗ',
  'Другое',
];

const OrderDetailPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { currentOrder: order, loading, error, message } = useSelector(state => state.orders);

  const [showDisputeForm, setShowDisputeForm] = useState(false);
  const [disputeData, setDisputeData] = useState({ reason: '', comment: '' });
  const [disputeError, setDisputeError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Состояния для отзыва
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (orderId) {
      dispatch(fetchOrderById(orderId));
    }
    return () => {
      dispatch(clearMessage());
    };
  }, [orderId, dispatch]);

  useEffect(() => {
    if (message) {
      setSuccessMessage(message);
      dispatch(clearMessage());
      dispatch(fetchOrderById(orderId));
      setTimeout(() => setSuccessMessage(''), 5000);
    }
  }, [message, dispatch, orderId]);

  useEffect(() => {
    if (order?.status === 'completed' && isCustomer) {
      reviewsApi.checkOrder(order.id)
        .then(res => {
          if (res.data.alreadyReviewed) setReviewSubmitted(true);
        })
        .catch(() => {});
    }
  }, [order, isCustomer]);

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleConfirmComplete = () => {
    if (window.confirm('Вы уверены, что хотите подтвердить выполнение заказа?')) {
      dispatch(completeOrder(order.id));
    }
  };

  const handleOpenDispute = () => {
    setShowDisputeForm(true);
    setDisputeData({ reason: '', comment: '' });
    setDisputeError('');
  };

  const handleDisputeChange = (e) => {
    const { name, value } = e.target;
    setDisputeData(prev => ({ ...prev, [name]: value }));
    if (disputeError) setDisputeError('');
  };

  const handleDisputeSubmit = (e) => {
    e.preventDefault();
    setDisputeError('');

    if (!disputeData.reason) {
      setDisputeError('Выберите причину спора');
      return;
    }
    if (!disputeData.comment.trim()) {
      setDisputeError('Опишите суть претензии');
      return;
    }

    dispatch(openDispute({ orderId: order.id, data: disputeData }))
      .unwrap()
      .then(() => setShowDisputeForm(false))
      .catch((err) => setDisputeError(err));
  };

  const handleReturnMoney = () => {
    if (window.confirm('Вы уверены, что хотите вернуть деньги заказчику?')) {
      dispatch(returnMoney(order.id));
    }
  };

  const handleSubmitReview = async () => {
    if (!reviewText.trim()) {
      setReviewError('Напишите текст отзыва');
      return;
    }
    setSubmittingReview(true);
    setReviewError('');

    try {
      await reviewsApi.create({
        orderId: order.id,
        rating: reviewRating,
        text: reviewText,
      });
      setReviewSubmitted(true);
      setSuccessMessage('Отзыв успешно отправлен');
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (error) {
      setReviewError(error.response?.data?.message || 'Ошибка при отправке отзыва');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="order-detail-page">
        <div className="container">
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Загрузка заказа...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="order-detail-page">
        <div className="container">
          <div className="error-message">{error}</div>
          <button onClick={() => navigate(-1)} className="btn-back">← Назад к заказам</button>
        </div>
      </div>
    );
  }

  if (!order) return null;

  const isCustomer = user?.role === 'customer';
  const isFreelancer = user?.role === 'freelancer';

  return (
    <div className="order-detail-page">
      <div className="container">
        <button onClick={() => navigate(-1)} className="btn-back">← Назад к заказам</button>

        {successMessage && (
          <div className="message-alert message-success">{successMessage}</div>
        )}

        <div className="order-detail-layout">
          <div className="order-info-section">
            <div className="order-card">
              <div className="order-card-header">
                <h1 className="order-number">{order.orderNumber}</h1>
                <span className={`status-badge ${STATUS_CLASS[order.status]}`}>
                  {STATUS_MAP[order.status] || order.status}
                </span>
              </div>

              <div className="order-details">
                <div className="detail-row">
                  <span className="detail-label">Услуга:</span>
                  <span className="detail-value">{order.serviceName}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Бюджет:</span>
                  <span className="detail-value detail-price">{Number(order.budget).toLocaleString()} ₽</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Дата создания:</span>
                  <span className="detail-value">{formatDate(order.createdAt)}</span>
                </div>
                {order.completedAt && (
                  <div className="detail-row">
                    <span className="detail-label">Дата завершения:</span>
                    <span className="detail-value">{formatDate(order.completedAt)}</span>
                  </div>
                )}
                <div className="detail-row">
                  <span className="detail-label">{isCustomer ? 'Фрилансер:' : 'Заказчик:'}</span>
                  <span className="detail-value">{isCustomer ? order.freelancerName : order.customerName}</span>
                </div>
                {order.description && (
                  <div className="detail-row detail-description">
                    <span className="detail-label">Описание:</span>
                    <span className="detail-value">{order.description}</span>
                  </div>
                )}
              </div>

              {order.status === 'in_progress' && (
                <div className="order-actions">
                  {isCustomer && (
                    <>
                      <button onClick={handleConfirmComplete} className="btn btn-success">Подтвердить выполнение</button>
                      <button onClick={handleOpenDispute} className="btn btn-danger">Открыть спор</button>
                    </>
                  )}
                  {isFreelancer && (
                    <button onClick={handleReturnMoney} className="btn btn-warning">Вернуть деньги заказчику</button>
                  )}
                </div>
              )}

              {order.status === 'dispute' && order.dispute && (
                <div className="dispute-info">
                  <h3>Информация о споре</h3>
                  <p><strong>Причина:</strong> {order.dispute.reason}</p>
                  <p><strong>Комментарий:</strong> {order.dispute.comment}</p>
                  <p><strong>Статус:</strong> {order.dispute.status === 'open' ? 'Открыт' : 'Решен'}</p>
                  {order.dispute.resolution && (
                    <p><strong>Решение:</strong> {order.dispute.resolution === 'customer' ? 'В пользу заказчика' : 'В пользу фрилансера'}</p>
                  )}
                  {order.dispute.adminComment && (
                    <p><strong>Комментарий администратора:</strong> {order.dispute.adminComment}</p>
                  )}
                </div>
              )}

              {order.status === 'completed' && isCustomer && !reviewSubmitted && (
                <div className="review-section">
                  <h3>Оставить отзыв</h3>
                  {reviewError && <div className="form-error-message">{reviewError}</div>}
                  <div className="stars-input">
                    {[1, 2, 3, 4, 5].map(star => (
                      <span
                        key={star}
                        className={`star-input ${star <= reviewRating ? 'star-active' : ''}`}
                        onClick={() => setReviewRating(star)}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <textarea
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    className="form-input form-textarea"
                    rows="3"
                    placeholder="Напишите отзыв о работе фрилансера..."
                    maxLength={1000}
                  />
                  <div className="review-char-count">{reviewText.length}/1000</div>
                  <button
                    onClick={handleSubmitReview}
                    className="btn btn-primary"
                    disabled={submittingReview}
                  >
                    {submittingReview ? 'Отправка...' : 'Отправить отзыв'}
                  </button>
                </div>
              )}

              {reviewSubmitted && (
                <div className="review-submitted">
                  <p>Вы уже оставили отзыв на этот заказ</p>
                </div>
              )}
            </div>

            {showDisputeForm && (
              <div className="dispute-form-card">
                <h2>Открытие спора</h2>
                {disputeError && <div className="form-error-message">{disputeError}</div>}
                <form onSubmit={handleDisputeSubmit}>
                  <div className="form-group">
                    <label className="form-label">Причина спора</label>
                    <select name="reason" value={disputeData.reason} onChange={handleDisputeChange} className="form-input">
                      <option value="">Выберите причину</option>
                      {DISPUTE_REASONS.map(reason => (
                        <option key={reason} value={reason}>{reason}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Комментарий</label>
                    <textarea
                      name="comment"
                      value={disputeData.comment}
                      onChange={handleDisputeChange}
                      className="form-input form-textarea"
                      rows="4"
                      placeholder="Опишите суть претензии..."
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
            <div className="chat-card">
              <div className="chat-header">
                <h3>Чат по заказу</h3>
              </div>
              <div className="chat-messages">
                <div className="chat-empty">
                  <p>Чат доступен на странице сообщений</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;