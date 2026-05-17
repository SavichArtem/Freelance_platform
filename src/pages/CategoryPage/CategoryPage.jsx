import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchStart,
  fetchSuccess,
  fetchFailure,
} from "../../store/slices/freelancersSlice";
import {
  fetchStart as catStart,
  fetchSuccess as catSuccess,
} from "../../store/slices/categoriesSlice";
import {
  setSortBy,
  setCategoryIdFilter,
} from "../../store/slices/filtersSlice";
import { freelancersApi } from "../../api/freelancersApi";
import { categoriesApi } from "../../api/categoriesApi";
import "./CategoryPage.css";

const CategoryPage = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const {
    items: freelancers,
    loading,
    error,
  } = useSelector((state) => state.freelancers);
  const { sortBy, categoryIdFilter } = useSelector((state) => state.filters);
  const { items: categories } = useSelector((state) => state.categories);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const isAllServices = !categoryId;

  useEffect(() => {
    categoriesApi
      .getAll()
      .then((res) => dispatch(catSuccess(res.data)))
      .catch(() => {});
  }, [dispatch]);

  const categoryName =
    categoryId && categories.length > 0
      ? categories.find((c) => c.id === Number(categoryId))?.name || "Категория"
      : "Все услуги";

  useEffect(() => {
    const timer = setTimeout(() => setSearchQuery(searchInput), 500);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    dispatch(fetchStart());
    const params = {
      sortBy,
      query: searchQuery || undefined,
      categoryId: categoryIdFilter || undefined,
    };
    const req = isAllServices
      ? freelancersApi.search(params)
      : freelancersApi.getByCategory(categoryId, {
          sortBy,
          query: searchQuery || undefined,
        });
    req
      .then((res) => dispatch(fetchSuccess(res.data)))
      .catch((err) =>
        dispatch(fetchFailure(err.response?.data?.message || "Ошибка")),
      );
  }, [
    categoryId,
    sortBy,
    searchQuery,
    categoryIdFilter,
    dispatch,
    isAllServices,
  ]);

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

  return (
    <div className="category-page">
      <div className="container">
        <div className="category-header">
          {!isAllServices && (
            <button onClick={() => navigate(-1)} className="btn-back">
              ← Назад
            </button>
          )}
          <h1 className="category-title">{categoryName}</h1>
        </div>
        <div className="filters-bar">
          <div className="search-control">
            <svg
              className="search-icon"
              viewBox="0 0 24 24"
              width="18"
              height="18"
              fill="#6c757d"
            >
              <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
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
                value={categoryIdFilter || ""}
                onChange={(e) =>
                  dispatch(setCategoryIdFilter(e.target.value || null))
                }
                className="filter-select"
              >
                <option value="">Все категории</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="sort-control">
            <label>Сортировка:</label>
            <select
              value={sortBy}
              onChange={(e) => dispatch(setSortBy(e.target.value))}
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
            <p>Загрузка...</p>
          </div>
        )}
        {error && <div className="error-message">{error}</div>}
        {!loading &&
          !error &&
          (freelancers.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🔍</div>
              <p>Фрилансеры не найдены</p>
            </div>
          ) : (
            <div className="freelancers-grid">
              {freelancers.map((f) => (
                <Link
                  to={`/freelancer/${f.id}`}
                  key={f.id}
                  className="freelancer-card"
                >
                  <div className="freelancer-avatar">
                    {f.avatar ? (
                      <img src={f.avatar} alt={f.login} />
                    ) : (
                      <div className="avatar-placeholder">
                        {f.login?.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="freelancer-info">
                    <h3 className="freelancer-name">{f.login}</h3>
                    <div className="freelancer-rating">
                      <span className="stars">
                        {renderStars(f.rating || 0)}
                      </span>
                      <span className="rating-value">
                        {Number(f.rating || 0).toFixed(1)}
                      </span>
                    </div>
                    {f.description && (
                      <p className="freelancer-bio">
                        {f.description.length > 80
                          ? f.description.substring(0, 80) + "..."
                          : f.description}
                      </p>
                    )}
                    <div className="freelancer-price">
                      от {f.minPrice ? f.minPrice.toLocaleString() : 0} ₽
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ))}
      </div>
    </div>
  );
};

export default CategoryPage;
