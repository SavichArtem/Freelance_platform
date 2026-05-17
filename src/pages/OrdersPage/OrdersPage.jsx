import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchOrdersStart,
  fetchOrdersSuccess,
  fetchOrdersFailure,
} from "../../store/slices/ordersSlice";
import { ordersApi } from "../../api/ordersApi";
import "./OrdersPage.css";

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

const OrdersPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const {
    items: orders,
    loading,
    error,
  } = useSelector((state) => state.orders);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    dispatch(fetchOrdersStart());
    ordersApi
      .getAll({
        status: statusFilter !== "all" ? statusFilter : undefined,
        search: searchQuery || undefined,
      })
      .then((res) => dispatch(fetchOrdersSuccess(res.data)))
      .catch((err) =>
        dispatch(fetchOrdersFailure(err.response?.data?.message || "Ошибка")),
      );
  }, [dispatch, isAuthenticated, navigate, statusFilter, searchQuery]);

  useEffect(() => {
    const timer = setTimeout(() => setSearchQuery(searchInput), 500);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const formatDate = (d) =>
    d
      ? new Date(d).toLocaleDateString("ru-RU", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : "—";
  const formatPrice = (p) => `${Number(p).toLocaleString()} ₽`;
  const title = user?.role === "freelancer" ? "Продажи" : "Покупки";

  return (
    <div className="orders-page">
      <div className="container">
        <h1 className="orders-title">{title}</h1>
        <div className="orders-filters">
          <div className="search-box">
            <input
              type="text"
              placeholder="Поиск по номеру, имени, услуге..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
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
            <p>Загрузка...</p>
          </div>
        )}
        {error && <div className="error-message">{error}</div>}
        {!loading &&
          !error &&
          (orders.length === 0 ? (
            <div className="empty-state">
              <p>У вас пока нет заказов</p>
            </div>
          ) : (
            <div className="orders-list">
              <div className="orders-table-header">
                <div className="col-date">Дата</div>
                <div className="col-number">Номер</div>
                <div className="col-person">
                  {user?.role === "freelancer" ? "Заказчик" : "Фрилансер"}
                </div>
                <div className="col-service">Услуга</div>
                <div className="col-status">Статус</div>
                <div className="col-price">Сумма</div>
              </div>
              {orders.map((o) => (
                <Link to={`/orders/${o.id}`} key={o.id} className="order-row">
                  <div className="col-date" data-label="Дата">
                    {formatDate(o.createdAt)}
                  </div>
                  <div className="col-number" data-label="Номер">
                    {o.orderNumber}
                  </div>
                  <div className="col-person" data-label="Собеседник">
                    {user?.role === "freelancer"
                      ? o.customerName
                      : o.freelancerName}
                  </div>
                  <div className="col-service" data-label="Услуга">
                    {o.serviceName}
                  </div>
                  <div className="col-status" data-label="Статус">
                    <span className={`status-badge ${STATUS_CLASS[o.status]}`}>
                      {STATUS_MAP[o.status] || o.status}
                    </span>
                  </div>
                  <div className="col-price" data-label="Сумма">
                    {formatPrice(o.budget)}
                  </div>
                </Link>
              ))}
            </div>
          ))}
      </div>
    </div>
  );
};

export default OrdersPage;
