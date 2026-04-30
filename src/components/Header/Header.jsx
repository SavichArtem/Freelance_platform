import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import './Header.css';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector(state => state.auth);

  const isActive = (path) => location.pathname === path ? 'active' : '';

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <header className="header">
      <div className="container">
        <div className="header-inner">
          <Link to="/" className="logo">
            Фриланс Платформа
          </Link>

          <nav className="nav">
            <ul className="nav-menu">
              <li><Link to="/services" className={isActive('/services')}>Услуги</Link></li>
              {isAuthenticated && (
                <>
                  <li><Link to="/orders" className={isActive('/orders')}>Мои заказы</Link></li>
                  <li><Link to="/messages" className={isActive('/messages')}>Сообщения</Link></li>
                  {user?.role === 'admin' && (
                    <li><Link to="/admin" className={isActive('/admin')}>Админ-панель</Link></li>
                  )}
                </>
              )}
            </ul>
          </nav>

          <div className="auth-links">
            {isAuthenticated ? (
              <>
                <Link to="/profile" className="auth-link">
                  {user?.login || 'Профиль'}
                </Link>
                <button onClick={handleLogout} className="auth-link logout-btn">
                  Выход
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="auth-link">Вход</Link>
                <Link to="/register" className="auth-link">Регистрация</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;