import { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFreelancersByCategory } from '../../store/slices/freelancersSlice';
import { setSortBy } from '../../store/slices/filtersSlice';
import './CategoryPage.css';

const CategoryPage = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { items: freelancers, loading, error } = useSelector(state => state.freelancers);
  const { sortBy } = useSelector(state => state.filters);

  useEffect(() => {
    if (categoryId) {
      dispatch(fetchFreelancersByCategory({ 
        categoryId, 
        params: { sortBy } 
      }));
    }
  }, [categoryId, sortBy, dispatch]);

  const handleSortChange = (e) => {
    dispatch(setSortBy(e.target.value));
  };

  const renderStars = (rating) => {
    const stars = [];
    const roundedRating = Math.round(rating * 2) / 2;
    
    for (let i = 1; i <= 5; i++) {
      if (i <= roundedRating) {
        stars.push(<span key={i} className="star star-full">★</span>);
      } else if (i - 0.5 === roundedRating) {
        stars.push(<span key={i} className="star star-half">★</span>);
      } else {
        stars.push(<span key={i} className="star star-empty">★</span>);
      }
    }
    return stars;
  };

  return (
    <div className="category-page">
      <div className="container">
        <div className="category-header">
          <button onClick={() => navigate(-1)} className="btn-back">
            ← Назад
          </button>
          <h1 className="category-title">Фрилансеры</h1>
        </div>

        <div className="filters-bar">
          <div className="sort-control">
            <label htmlFor="sort-select">Сортировка:</label>
            <select 
              id="sort-select"
              value={sortBy}
              onChange={handleSortChange}
              className="sort-select"
            >
              <option value="rating">По рейтингу</option>
              <option value="price_asc">По цене (дешевле)</option>
              <option value="price_desc">По цене (дороже)</option>
            </select>
          </div>
        </div>

        {loading && (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Загрузка фрилансеров...</p>
          </div>
        )}

        {error && (
          <div className="error-message">{error}</div>
        )}

        {!loading && !error && (
          <>
            {freelancers.length === 0 ? (
              <div className="empty-state">
                <p>В данной категории пока нет фрилансеров</p>
              </div>
            ) : (
              <div className="freelancers-grid">
                {freelancers.map(freelancer => (
                  <Link
                    to={`/freelancer/${freelancer.id}`}
                    key={freelancer.id}
                    className="freelancer-card"
                  >
                    <div className="freelancer-avatar">
                      {freelancer.avatar ? (
                        <img src={freelancer.avatar} alt={freelancer.login} />
                      ) : (
                        <div className="avatar-placeholder">
                          {freelancer.login?.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="freelancer-info">
                      <h3 className="freelancer-name">{freelancer.login}</h3>
                      <div className="freelancer-rating">
                        <span className="stars">{renderStars(freelancer.rating || 0)}</span>
                        <span className="rating-value">{freelancer.rating || 0}</span>
                      </div>
                      {freelancer.Freelancer?.description && (
                        <p className="freelancer-bio">
                          {freelancer.Freelancer.description.length > 100 
                            ? freelancer.Freelancer.description.substring(0, 100) + '...' 
                            : freelancer.Freelancer.description}
                        </p>
                      )}
                      <div className="freelancer-price">
                        от {freelancer.minPrice || 1000} ₽
                      </div>
                    </div>
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

export default CategoryPage;