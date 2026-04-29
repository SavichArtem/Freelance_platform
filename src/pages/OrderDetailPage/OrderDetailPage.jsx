import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrderById } from '../../store/slices/ordersSlice';
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
  const { currentOrder: order, loading, error } = useSelector(state => state.orders);

  const [showDisputeForm, setShowDisputeForm] = useState(false);
  const [disputeData, setDisputeData] = useState({
    reason: '',
    comment: '',
  });
  const [disputeError, setDisputeError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (orderId) {
      dispatch(fetchOrderById(orderId));
    }
  }, [orderId, dispatch]);

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
      setMessage('Работа принята, деньги переведены фрилансеру');
      setTimeout(() => setMessage(''), 3000);
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

    if (!disputeData.reason) {
      setDisputeError('Выберите причину спора');
      return;
    }
    if (!disputeData.comment.trim()) {
      setDisputeError('Опишите суть претензии');
      return;
    }

    setMessage('Спор открыт, ожидайте решения администратора');
    setShowDisputeForm(false);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleReturnMoney = () => {
    if (window.confirm('Вы уверены, что хотите вернуть деньги заказчику?')) {
      setMessage('Средства возвращены заказчику');
      setTimeout(() => setMessage(''), 3000);
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
        <button onClick={() => navigate(-1)} className="btn-back">
          ← Назад к заказам
        </button>

        {message && (
          <div className="message-alert">{message}</div>
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
                    {order.budget.toLocaleString()} ₽
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Дата создания:</span>
                  <span className="detail-value">{formatDate(order.createdAt)}</span>
                </div>
                {order.deadline && (
                  <div className="detail-row">
                    <span className="detail-label">Срок выполнения:</span>
                    <span className="detail-value">{formatDate(order.deadline)}</span>
                  </div>
                )}
                {order.completedAt && (
                  <div className="detail-row">
                    <span className="detail-label">Дата завершения:</span>
                    <span className="detail-value">{formatDate(order.completedAt)}</span>
                  </div>
                )}
                <div className="detail-row">
                  <span className="detail-label">
                    {isCustomer ? 'Фрилансер:' : 'Заказчик:'}
                  </span>
                  <span className="detail-value">
                    {isCustomer ? order.freelancerName : order.customerName}
                  </span>
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
                      <button
                        onClick={handleConfirmComplete}
                        className="btn btn-success"
                      >
                        Подтвердить выполнение
                      </button>
                      <button
                        onClick={handleOpenDispute}
                        className="btn btn-danger"
                      >
                        Открыть спор
                      </button>
                    </>
                  )}
                  {isFreelancer && (
                    <button
                      onClick={handleReturnMoney}
                      className="btn btn-warning"
                    >
                      Вернуть деньги заказчику
                    </button>
                  )}
                </div>
              )}

              {order.status === 'dispute' && order.disputeReason && (
                <div className="dispute-info">
                  <h3>Информация о споре</h3>
                  <p><strong>Причина:</strong> {order.disputeReason}</p>
                  <p><strong>Комментарий:</strong> {order.disputeComment}</p>
                </div>
              )}
            </div>

            {showDisputeForm && (
              <div className="dispute-form-card">
                <h2>Открытие спора</h2>
                {disputeError && (
                  <div className="form-error-message">{disputeError}</div>
                )}
                <form onSubmit={handleDisputeSubmit}>
                  <div className="form-group">
                    <label className="form-label">Причина спора</label>
                    <select
                      name="reason"
                      value={disputeData.reason}
                      onChange={handleDisputeChange}
                      className="form-input"
                    >
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
                    <button type="submit" className="btn btn-danger">
                      Отправить
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setShowDisputeForm(false)}
                    >
                      Отмена
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          <div className="order-chat-section">
            <div className="chat-card">
              <div className="chat-header">
                <h3>Чат по заказу</h3>
                <span className="chat-status offline">оффлайн</span>
              </div>
              <div className="chat-messages">
                <div className="chat-empty">
                  <p>История сообщений появится здесь</p>
                </div>
              </div>
              <div className="chat-input">
                <textarea
                  className="chat-textarea"
                  rows="3"
                  placeholder="Введите сообщение..."
                />
                <div className="chat-actions">
                  <button type="button" className="btn-attach">
                    Прикрепить файл
                  </button>
                  <button type="button" className="btn btn-primary btn-send">
                    Отправить
                  </button>
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