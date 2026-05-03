import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFreelancerById } from '../../store/slices/freelancerSlice';
import { ordersApi } from '../../api/ordersApi';
import './FreelancerProfilePage.css';

const FreelancerProfilePage = () => {
  const { freelancerId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { profile, loading, error } = useSelector(state => state.freelancer);
  const { user, isAuthenticated } = useSelector(state => state.auth);
  const [ordering, setOrdering] = useState(null);

  useEffect(() => {
    if (freelancerId) {
      dispatch(fetchFreelancerById(freelancerId));
    }
  }, [freelancerId, dispatch]);

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= Math.round(rating)) {
        stars.push(<span key={i} className="star star-full">★</span>);
      } else {
        stars.push(<span key={i} className="star star-empty">★</span>);
      }
    }
    return stars;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleMessageClick = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    const partnerId = profile?.userId || profile?.id;
    navigate(`/messages/user/${partnerId}`);
  };

  const handleOrderService = async (service) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setOrdering(service.id);
    try {
      const response = await ordersApi.create({
        serviceId: service.id,
        freelancerId: profile.id,
      });
      navigate(`/orders/${response.data.id}`);
    } catch (error) {
      alert(error.response?.data?.message || 'Ошибка при создании заказа');
    } finally {
      setOrdering(null);
    }
  };

  const canOrder = isAuthenticated && user?.role !== 'admin' && user?.id !== (profile?.userId || profile?.id);

  if (loading) {
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
  }

  if (error) {
    return (
      <div className="freelancer-profile-page">
        <div className="container">
          <div className="error-message">{error}</div>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="freelancer-profile-page">
      <div className="container">
        <button onClick={() => navigate(-1)} className="btn-back">← Назад</button>

        <div className="profile-header">
          <div className="profile-avatar">
            {profile.avatar ? (
              <img src={profile.avatar} alt={profile.login} />
            ) : (
              <div className="avatar-placeholder">{profile.login?.charAt(0).toUpperCase()}</div>
            )}
          </div>
          <div className="profile-main-info">
            <h1 className="profile-name">{profile.login}</h1>
            <div className="profile-rating">
              <span className="stars">{renderStars(profile.rating || 0)}</span>
              <span className="rating-value">{Number(profile.rating || 0).toFixed(1)} / 5</span>
            </div>
            {profile.description && <p className="profile-description">{profile.description}</p>}
          </div>
          {canOrder && (
            <button onClick={handleMessageClick} className="btn btn-primary btn-message">Написать сообщение</button>
          )}
        </div>

        {profile.services && profile.services.length > 0 && (
          <section className="profile-section">
            <h2 className="section-title">Услуги</h2>
            <div className="services-grid">
              {profile.services.map(service => (
                <div key={service.id} className="service-card">
                  <h3 className="service-name">{service.name}</h3>
                  <p className="service-description">{service.description}</p>
                  <div className="service-price">{Number(service.price).toLocaleString()} ₽</div>
                  {canOrder && (
                    <button
                      onClick={() => handleOrderService(service)}
                      className="btn btn-primary"
                      disabled={ordering === service.id}
                      style={{ marginTop: '12px', width: '100%' }}
                    >
                      {ordering === service.id ? 'Создание заказа...' : 'Заказать'}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {profile.portfolioItems && profile.portfolioItems.length > 0 && (
          <section className="profile-section">
            <h2 className="section-title">Портфолио</h2>
            <div className="portfolio-grid">
              {profile.portfolioItems.map(item => (
                <div key={item.id} className="portfolio-card">
                  <div className="portfolio-image">
                    {item.image ? <img src={item.image} alt={item.title} /> : <div className="portfolio-placeholder">📁</div>}
                  </div>
                  <h3 className="portfolio-title">{item.title}</h3>
                  <p className="portfolio-description">{item.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="profile-section">
          <h2 className="section-title">Отзывы ({profile.reviews?.length || 0})</h2>
          {profile.reviews && profile.reviews.length > 0 ? (
            <div className="reviews-list">
              {profile.reviews.map(review => (
                <div key={review.id} className="review-card">
                  <div className="review-header">
                    <div className="review-author">{review.author}</div>
                    <div className="review-rating">{renderStars(review.rating)}</div>
                    <div className="review-date">{formatDate(review.createdAt)}</div>
                  </div>
                  <div className="review-order-info">
                    Заказ {review.orderNumber} — {review.serviceName}
                  </div>
                  <p className="review-text">{review.text}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state"><p>Отзывы отсутствуют</p></div>
          )}
        </section>
      </div>
    </div>
  );
};

export default FreelancerProfilePage;