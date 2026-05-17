import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchStart,
  fetchSuccess,
  fetchFailure,
} from "../../store/slices/freelancerSlice";
import { freelancersApi } from "../../api/freelancersApi";
import { ordersApi } from "../../api/ordersApi";
import "./FreelancerProfilePage.css";

const FreelancerProfilePage = () => {
  const { freelancerId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { profile, loading, error } = useSelector((state) => state.freelancer);
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const [ordering, setOrdering] = useState(null);

  useEffect(() => {
    if (freelancerId) {
      dispatch(fetchStart());
      freelancersApi
        .getById(freelancerId)
        .then((res) => dispatch(fetchSuccess(res.data)))
        .catch((err) =>
          dispatch(fetchFailure(err.response?.data?.message || "Ошибка")),
        );
    }
  }, [freelancerId, dispatch]);

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++)
      stars.push(
        <span
          key={i}
          className={`star ${i <= Math.round(rating) ? "star-full" : "star-empty"}`}
        >
          ★
        </span>,
      );
    return stars;
  };
  const formatDate = (d) =>
    d
      ? new Date(d).toLocaleDateString("ru-RU", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "";

  const handleMessageClick = () => {
    if (!isAuthenticated) navigate("/login");
    else navigate(`/messages/user/${profile?.userId || profile?.id}`);
  };

  const handleOrderService = async (service) => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    setOrdering(service.id);
    try {
      const res = await ordersApi.create({
        serviceId: service.id,
        freelancerId: profile.id,
      });
      navigate(`/orders/${res.data.id}`);
    } catch (err) {
      alert(err.response?.data?.message || "Ошибка");
    } finally {
      setOrdering(null);
    }
  };

  const canOrder =
    isAuthenticated &&
    user?.role !== "admin" &&
    user?.id !== (profile?.userId || profile?.id);
  const canMessage =
    isAuthenticated && user?.id !== (profile?.userId || profile?.id);

  if (loading)
    return (
      <div className="freelancer-profile-page">
        <div className="container">
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Загрузка профиля...</p>
          </div>
        </div>
      </div>
    );
  if (error)
    return (
      <div className="freelancer-profile-page">
        <div className="container">
          <div className="error-message">{error}</div>
        </div>
      </div>
    );
  if (!profile) return null;

  return (
    <div className="freelancer-profile-page">
      <div className="container">
        <button onClick={() => navigate(-1)} className="btn-back">
          ← Назад
        </button>
        <div className="profile-header">
          <div className="profile-avatar">
            {profile.avatar ? (
              <img src={profile.avatar} alt={profile.login} />
            ) : (
              <div className="avatar-placeholder">
                {profile.login?.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="profile-main-info">
            <h1 className="profile-name">{profile.login}</h1>
            <div className="profile-rating">
              <span className="stars">{renderStars(profile.rating || 0)}</span>
              <span className="rating-value">
                {Number(profile.rating || 0).toFixed(1)} / 5
              </span>
            </div>
            {profile.description && (
              <p className="profile-description">{profile.description}</p>
            )}
          </div>
          {canMessage && (
            <button
              onClick={handleMessageClick}
              className="btn btn-primary btn-message"
            >
              Написать сообщение
            </button>
          )}
        </div>
        {profile.services?.length > 0 && (
          <section className="profile-section">
            <h2 className="section-title">Услуги</h2>
            <div className="services-grid">
              {profile.services.map((s) => (
                <div key={s.id} className="service-card">
                  <h3 className="service-name">{s.name}</h3>
                  <p className="service-description">{s.description}</p>
                  <div className="service-price">
                    {Number(s.price).toLocaleString()} ₽
                  </div>
                  {canOrder && (
                    <button
                      onClick={() => handleOrderService(s)}
                      className="btn btn-primary"
                      disabled={ordering === s.id}
                      style={{ marginTop: 12, width: "100%" }}
                    >
                      {ordering === s.id ? "Создание..." : "Заказать"}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
        {profile.portfolioItems?.length > 0 && (
          <section className="profile-section">
            <h2 className="section-title">Портфолио</h2>
            <div className="portfolio-grid">
              {profile.portfolioItems.map((p) => (
                <div key={p.id} className="portfolio-card">
                  <div className="portfolio-image">
                    {p.image ? (
                      <img src={p.image} alt={p.title} />
                    ) : (
                      <div className="portfolio-placeholder">📁</div>
                    )}
                  </div>
                  <h3 className="portfolio-title">{p.title}</h3>
                  <p className="portfolio-description">{p.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}
        <section className="profile-section">
          <h2 className="section-title">
            Отзывы ({profile.reviews?.length || 0})
          </h2>
          {profile.reviews?.length > 0 ? (
            <div className="reviews-list">
              {profile.reviews.map((r) => (
                <div key={r.id} className="review-card">
                  <div className="review-header">
                    <div className="review-author">{r.author}</div>
                    <div className="review-rating">{renderStars(r.rating)}</div>
                    <div className="review-date">{formatDate(r.createdAt)}</div>
                  </div>
                  <div className="review-order-info">
                    Заказ {r.orderNumber} — {r.serviceName}
                  </div>
                  <p className="review-text">{r.text}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>Отзывы отсутствуют</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default FreelancerProfilePage;
