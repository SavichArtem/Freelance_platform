import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFreelancersByCategory, searchFreelancers } from '../../store/slices/freelancersSlice';
import { fetchCategories } from '../../store/slices/categoriesSlice';
import { setSortBy, setCategoryIdFilter } from '../../store/slices/filtersSlice';
import './CategoryPage.css';

const CategoryPage = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { items: freelancers, loading, error } = useSelector(state => state.freelancers);
  const { sortBy, categoryIdFilter } = useSelector(state => state.filters);
  const { items: categories } = useSelector(state => state.categories);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const isAllServices = !categoryId;

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const categoryName = categoryId && categories.length > 0
    ? categories.find(c => c.id === Number(categoryId))?.name || 'Категория'
    : 'Все услуги';

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    if (isAllServices) {
      dispatch(searchFreelancers({ sortBy, query: searchQuery || undefined, categoryId: categoryIdFilter || undefined }));
    } else if (categoryId) {
      dispatch(fetchFreelancersByCategory({ 
        categoryId, 
        params: { sortBy, query: searchQuery || undefined } 
      }));
    }
  }, [categoryId, sortBy, searchQuery, categoryIdFilter, dispatch, isAllServices]);

  const handleSortChange = (e) => {
    dispatch(setSortBy(e.target.value));
  };

  const handleCategoryFilterChange = (e) => {
    dispatch(setCategoryIdFilter(e.target.value || null));
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
          {!isAllServices && (
            <button onClick={() => navigate(-1)} className="btn-back">← Назад</button>
          )}
          <h1 className="category-title">{categoryName}</h1>
        </div>

        <div className="filters-bar">
          <div className="search-control">
            <svg className="search-icon" viewBox="0 0 24 24" width="18" height="18" fill="#6c757d">
              <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
            </svg>
            <input
              type="text"
              placeholder="Поиск по ключевым словам..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="search-input"
            />
          </div>
          {isAllServices && (
            <div className="filter-control">
              <select
                value={categoryIdFilter || ''}
                onChange={handleCategoryFilterChange}
                className="filter-select"
              >
                <option value="">Все категории</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          )}
          <div className="sort-control">
            <label>Сортировка:</label>
            <select value={sortBy} onChange={handleSortChange} className="sort-select">
              <option value="rating">По рейтингу</option>
              <option value="price_asc">По цене (дешевле)</option>
              <option value="price_desc">По цене (дороже)</option>
            </select>
          </div>
        </div>

        {loading && (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Загрузка...</p>
          </div>
        )}

        {error && (
          <div className="error-message">{error}</div>
        )}

        {!loading && !error && (
          <>
            {freelancers.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🔍</div>
                <p>Фрилансеры не найдены</p>
                <span>Попробуйте изменить параметры поиска</span>
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
                        <span className="rating-value">{Number(freelancer.rating || 0).toFixed(1)}</span>
                      </div>
                      {freelancer.description && (
                        <p className="freelancer-bio">
                          {freelancer.description.length > 80 
                            ? freelancer.description.substring(0, 80) + '...' 
                            : freelancer.description}
                        </p>
                      )}
                      <div className="freelancer-price">
                        от {freelancer.minPrice ? freelancer.minPrice.toLocaleString() : 0} ₽
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