import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFreelancerById } from '../../store/slices/freelancerSlice';
import './FreelancerProfilePage.css';

const FreelancerProfilePage = () => {
  const { freelancerId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { profile, loading, error } = useSelector(state => state.freelancer);

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
              <span className="rating-value">{profile.rating || 0} / 5</span>
            </div>
            {profile.Freelancer?.description && (
              <p className="profile-description">{profile.Freelancer.description}</p>
            )}
          </div>
          <button className="btn btn-primary btn-message">
            Написать сообщение
          </button>
        </div>

        {profile.Freelancer?.services && profile.Freelancer.services.length > 0 && (
          <section className="profile-section">
            <h2 className="section-title">Услуги</h2>
            <div className="services-grid">
              {profile.Freelancer.services.map(service => (
                <div key={service.id} className="service-card">
                  <h3 className="service-name">{service.name}</h3>
                  <p className="service-description">{service.description}</p>
                  <div className="service-price">{service.price.toLocaleString()} ₽</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {profile.Freelancer?.portfolioItems && profile.Freelancer.portfolioItems.length > 0 && (
          <section className="profile-section">
            <h2 className="section-title">Портфолио</h2>
            <div className="portfolio-grid">
              {profile.Freelancer.portfolioItems.map(item => (
                <div key={item.id} className="portfolio-card">
                  <div className="portfolio-image">
                    {item.image ? (
                      <img src={item.image} alt={item.title} />
                    ) : (
                      <div className="portfolio-placeholder">📁</div>
                    )}
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
                    <div className="review-rating">
                      {renderStars(review.rating)}
                    </div>
                    <div className="review-date">{formatDate(review.createdAt)}</div>
                  </div>
                  <p className="review-text">{review.text}</p>
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