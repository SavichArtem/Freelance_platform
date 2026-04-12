import { Link, useLocation } from 'react-router-dom';
import './Header.css';

const Header = () => {
  const location = useLocation();

  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <header className="header">
      <div className="container">
        <div className="header-inner">
          {/* Логотип — ссылка на главную */}
          <Link to="/" className="logo">
            Фриланс Платформа
          </Link>

          {/* Навигация */}
          <nav className="nav">
            <ul className="nav-menu">
              <li><Link to="/services" className={isActive('/services')}>Услуги</Link></li>
            </ul>
          </nav>

          <div className="auth-links">
            <Link to="/login" className="auth-link">Вход</Link>
            <Link to="/register" className="auth-link">Регистрация</Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;