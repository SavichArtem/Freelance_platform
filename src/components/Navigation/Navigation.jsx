import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navigation.css';

const Navigation = () => {
  const location = useLocation();

  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <nav className="navigation">
      <div className="container">
        <ul className="nav-menu">
          <li><Link to="/" className={isActive('/')}>Главная</Link></li>
          <li><Link to="/profile" className={isActive('/profile')}>Профиль</Link></li>
          <li><Link to="/my-orders" className={isActive('/my-orders')}>Мои заказы</Link></li>
          <li><Link to="/recommendation" className={isActive('/recommendation')}>Подобрать фрилансера</Link></li>
          <li><Link to="/my-services" className={isActive('/my-services')}>Мои услуги</Link></li>
          <li><Link to="/portfolio" className={isActive('/portfolio')}>Портфолио</Link></li>
          <li><Link to="/my-sales" className={isActive('/my-sales')}>Продажи</Link></li>
          <li><Link to="/messages" className={isActive('/messages')}>Сообщения</Link></li>
          <li><Link to="/admin/reviews" className={isActive('/admin/reviews')}>Модерация отзывов</Link></li>
          <li><Link to="/admin/categories" className={isActive('/admin/categories')}>Специализации</Link></li>
          <li><Link to="/admin/disputes" className={isActive('/admin/disputes')}>Споры</Link></li>
          <li><Link to="/logout" className={isActive('/logout')}>Выход</Link></li>
        </ul>
      </div>
    </nav>
  );
};

export default Navigation;