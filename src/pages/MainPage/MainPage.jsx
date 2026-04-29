import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCategories } from '../../store/slices/categoriesSlice';
import './MainPage.css';

const MainPage = () => {
  const dispatch = useDispatch();
  const { items: categories, loading, error } = useSelector(state => state.categories);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  return (
    <div className="main-page">
      <div className="container">
        <section className="hero-section">
          <h1 className="hero-title">Добро пожаловать на Фриланс Платформу</h1>
          <p className="hero-subtitle">
            Найдите идеального исполнителя для вашего проекта или начните зарабатывать на своих навыках
          </p>
          <div className="hero-actions">
            <Link to="/register" className="btn btn-primary btn-lg">
              Присоединиться
            </Link>
            <Link to="/services" className="btn btn-outline btn-lg">
              Смотреть услуги
            </Link>
          </div>
        </section>

        <section className="categories-section">
          <h2 className="section-title">Категории услуг</h2>
          
          {loading && (
            <div className="loading-container">
              <div className="spinner"></div>
              <p>Загрузка категорий...</p>
            </div>
          )}
          
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          
          {!loading && !error && (
            <>
              {categories.length === 0 ? (
                <div className="empty-state">
                  <p>Категории пока не добавлены</p>
                </div>
              ) : (
                <div className="categories-grid">
                  {categories.map(category => (
                    <Link 
                      to={`/categories/${category.id}`} 
                      key={category.id}
                      className="category-card"
                    >
                      <div className="category-icon">
                        {category.icon || '📁'}
                      </div>
                      <h3 className="category-name">{category.name}</h3>
                      {category.description && (
                        <p className="category-description">{category.description}</p>
                      )}
                      <span className="category-link">
                        Смотреть фрилансеров →
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </>
          )}
        </section>

        <section className="how-it-works">
          <h2 className="section-title">Как это работает</h2>
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">1</div>
              <h3>Создайте заказ</h3>
              <p>Опишите задачу и выберите категорию</p>
            </div>
            <div className="step-card">
              <div className="step-number">2</div>
              <h3>Найдите исполнителя</h3>
              <p>Выберите фрилансера по рейтингу и отзывам</p>
            </div>
            <div className="step-card">
              <div className="step-number">3</div>
              <h3>Безопасная оплата</h3>
              <p>Средства замораживаются до выполнения заказа</p>
            </div>
            <div className="step-card">
              <div className="step-number">4</div>
              <h3>Получите результат</h3>
              <p>Примите работу и оставьте отзыв</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default MainPage;