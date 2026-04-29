import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrders } from '../../store/slices/ordersSlice';
import './OrdersPage.css';

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

const OrdersPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector(state => state.auth);
  const { items: orders, loading, error } = useSelector(state => state.orders);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    dispatch(fetchOrders({ 
      userId: user?.id, 
      role: user?.role,
      status: statusFilter !== 'all' ? statusFilter : undefined 
    }));
  }, [dispatch, user, isAuthenticated, navigate, statusFilter]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatPrice = (price) => {
    return `${price.toLocaleString()} ₽`;
  };

  const filteredOrders = orders.filter(order => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      order.orderNumber?.toLowerCase().includes(query) ||
      order.freelancerName?.toLowerCase().includes(query) ||
      order.customerName?.toLowerCase().includes(query) ||
      order.serviceName?.toLowerCase().includes(query)
    );
  });

  const title = user?.role === 'freelancer' ? 'Продажи' : 'Покупки';

  return (
    <div className="orders-page">
      <div className="container">
        <h1 className="orders-title">{title}</h1>

        <div className="orders-filters">
          <div className="search-box">
            <input
              type="text"
              placeholder="Поиск по номеру, имени, услуге..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input search-input"
            />
          </div>
          <div className="filter-box">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="form-input filter-select"
            >
              <option value="all">Все статусы</option>
              <option value="in_progress">Выполняется</option>
              <option value="completed">Выполнен</option>
              <option value="dispute">Спор</option>
              <option value="returned">Возврат</option>
            </select>
          </div>
        </div>

        {loading && (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Загрузка заказов...</p>
          </div>
        )}

        {error && (
          <div className="error-message">{error}</div>
        )}

        {!loading && !error && (
          <>
            {filteredOrders.length === 0 ? (
              <div className="empty-state">
                <p>У вас пока нет заказов</p>
              </div>
            ) : (
              <div className="orders-list">
                <div className="orders-table-header">
                  <div className="col-date">Дата</div>
                  <div className="col-number">Номер заказа</div>
                  <div className="col-person">
                    {user?.role === 'freelancer' ? 'Заказчик' : 'Фрилансер'}
                  </div>
                  <div className="col-service">Услуга</div>
                  <div className="col-status">Статус</div>
                  <div className="col-price">Сумма</div>
                </div>
                {filteredOrders.map(order => (
                  <Link
                    to={`/orders/${order.id}`}
                    key={order.id}
                    className="order-row"
                  >
                    <div className="col-date">{formatDate(order.createdAt)}</div>
                    <div className="col-number">{order.orderNumber}</div>
                    <div className="col-person">
                      {user?.role === 'freelancer' 
                        ? order.customerName 
                        : order.freelancerName}
                    </div>
                    <div className="col-service">{order.serviceName}</div>
                    <div className="col-status">
                      <span className={`status-badge ${STATUS_CLASS[order.status]}`}>
                        {STATUS_MAP[order.status]}
                      </span>
                    </div>
                    <div className="col-price">{formatPrice(order.budget)}</div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;