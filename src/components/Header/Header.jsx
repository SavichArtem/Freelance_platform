import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { toggleTheme } from '../../store/slices/themeSlice';
import { fetchNotifications, markAsRead, markAllAsRead, deleteAllNotifications } from '../../store/slices/notificationsSlice';
import './Header.css';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector(state => state.auth);
  const { items: notifications, unreadCount } = useSelector(state => state.notifications);
  const { dark } = useSelector(state => state.theme);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const notifRef = useRef(null);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchNotifications());
      const interval = setInterval(() => dispatch(fetchNotifications()), 15000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, dispatch]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isActive = (path) => location.pathname === path ? 'active' : '';

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const handleNotificationClick = (notif) => {
    if (!notif.isRead) dispatch(markAsRead(notif.id));
    setShowNotifications(false);

    switch (notif.type) {
      case 'new_message':
        navigate('/messages');
        break;
      case 'new_order':
      case 'order_completed':
      case 'order_returned':
        navigate('/orders');
        break;
      case 'dispute_opened':
      case 'dispute_resolved':
        if (user?.role === 'admin') {
          navigate('/admin?tab=disputes');
        } else {
          navigate('/orders');
        }
        break;
      default:
        break;
    }
  };

  const handleClearAll = () => {
    dispatch(deleteAllNotifications());
  };

  const formatNotifTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now - date) / 60000);
    if (diff < 1) return 'только что';
    if (diff < 60) return `${diff} мин. назад`;
    const hours = Math.floor(diff / 60);
    if (hours < 24) return `${hours} ч. назад`;
    return date.toLocaleDateString('ru-RU', { month: 'short', day: 'numeric' });
  };

  return (
    <header className="header">
      <div className="container">
        <div className="header-inner">
          <Link to="/" className="logo">Фриланс Платформа</Link>

          <button className="mobile-menu-btn" onClick={() => setShowMobileMenu(!showMobileMenu)}>
            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
              <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
            </svg>
          </button>

          <nav className={`nav ${showMobileMenu ? 'nav-open' : ''}`}>
            <ul className="nav-menu">
              <li><Link to="/services" className={isActive('/services')} onClick={() => setShowMobileMenu(false)}>Услуги</Link></li>
              {isAuthenticated && (
                <>
                  <li><Link to="/messages" className={isActive('/messages')} onClick={() => setShowMobileMenu(false)}>Сообщения</Link></li>
                  <li><Link to="/orders" className={isActive('/orders')} onClick={() => setShowMobileMenu(false)}>Мои заказы</Link></li>
                  {user?.role === 'admin' && (
                    <li><Link to="/admin" className={isActive('/admin')} onClick={() => setShowMobileMenu(false)}>Админ-панель</Link></li>
                  )}
                </>
              )}
            </ul>
          </nav>

          <div className="auth-links">
            <button onClick={() => dispatch(toggleTheme())} className="theme-toggle" title="Сменить тему">
              {dark ? '☀️' : '🌙'}
            </button>

            {isAuthenticated ? (
              <>
                <div className="notifications-wrapper" ref={notifRef}>
                  <button className="notif-bell" onClick={() => setShowNotifications(!showNotifications)}>
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                      <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
                    </svg>
                    {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
                  </button>

                  {showNotifications && (
                    <div className="notif-dropdown">
                      <div className="notif-header">
                        <span>Уведомления</span>
                        <div className="notif-header-actions">
                          {unreadCount > 0 && (
                            <button onClick={() => dispatch(markAllAsRead())} className="notif-read-all">Прочитать все</button>
                          )}
                          {notifications.length > 0 && (
                            <button onClick={handleClearAll} className="notif-clear-all">Очистить</button>
                          )}
                        </div>
                      </div>
                      <div className="notif-list">
                        {notifications.length === 0 ? (
                          <div className="notif-empty">Нет уведомлений</div>
                        ) : (
                          notifications.map(n => (
                            <div
                              key={n.id}
                              className={`notif-item ${!n.isRead ? 'notif-unread' : ''}`}
                              onClick={() => handleNotificationClick(n)}
                            >
                              <div className="notif-title">{n.title}</div>
                              <div className="notif-text">{n.text}</div>
                              <div className="notif-time">{formatNotifTime(n.createdAt)}</div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <Link to="/profile" className="auth-link desktop-only">{user?.login || 'Профиль'}</Link>
                <button onClick={handleLogout} className="auth-link logout-btn">Выход</button>
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