import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { updateProfile } from '../../store/slices/authSlice';
import './ProfilePage.css';

const ProfilePage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector(state => state.auth);

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    login: '',
    email: '',
    description: '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (user) {
      setFormData({
        login: user.login || '',
        email: user.email || '',
        description: user.Freelancer?.description || '',
      });
    }
  }, [user, isAuthenticated, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    // Здесь будет вызов API для обновления профиля
    console.log('Save profile:', formData);
    setMessage('Профиль успешно обновлен');
    setIsEditing(false);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage('Пароли не совпадают');
      return;
    }
    // Здесь будет вызов API для смены пароля
    console.log('Change password:', passwordData);
    setMessage('Пароль успешно изменен');
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setShowPasswordForm(false);
    setTimeout(() => setMessage(''), 3000);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Не указана';
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (!user) return null;

  return (
    <div className="profile-page">
      <div className="container">
        <div className="profile-page-header">
          <button onClick={() => navigate(-1)} className="btn-back">
            ← Назад
          </button>
          <h1 className="profile-page-title">Мой профиль</h1>
        </div>

        {message && (
          <div className="message-alert">{message}</div>
        )}

        <div className="profile-card">
          <div className="profile-avatar-section">
            <div className="profile-avatar">
              {user.avatar ? (
                <img src={user.avatar} alt={user.login} />
              ) : (
                <div className="avatar-placeholder">
                  {user.login?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="profile-info-basic">
              <h2>{user.login}</h2>
              <span className="profile-role">
                {user.role === 'freelancer' ? 'Фрилансер' : 
                 user.role === 'customer' ? 'Заказчик' : 'Администратор'}
              </span>
              <span className="profile-date">
                Дата регистрации: {formatDate(user.registrationDate)}
              </span>
            </div>
          </div>

          <div className="profile-tabs">
            <button 
              className={`tab-btn ${!showPasswordForm ? 'tab-btn-active' : ''}`}
              onClick={() => setShowPasswordForm(false)}
            >
              Личные данные
            </button>
            <button 
              className={`tab-btn ${showPasswordForm ? 'tab-btn-active' : ''}`}
              onClick={() => setShowPasswordForm(true)}
            >
              Безопасность
            </button>
          </div>

          {!showPasswordForm ? (
            <form onSubmit={handleSaveProfile} className="profile-form">
              <div className="form-group">
                <label className="form-label">Логин</label>
                <input
                  type="text"
                  name="login"
                  value={formData.login}
                  onChange={handleChange}
                  className="form-input"
                  disabled={!isEditing}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="form-input"
                  disabled={!isEditing}
                />
              </div>

              {user.role === 'freelancer' && (
                <div className="form-group">
                  <label className="form-label">Описание</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="form-input form-textarea"
                    rows="4"
                    disabled={!isEditing}
                    placeholder="Расскажите о себе и своих навыках"
                  />
                </div>
              )}

              <div className="form-actions">
                {!isEditing ? (
                  <button 
                    type="button" 
                    className="btn btn-primary"
                    onClick={() => setIsEditing(true)}
                  >
                    Редактировать
                  </button>
                ) : (
                  <>
                    <button type="submit" className="btn btn-primary">
                      Сохранить
                    </button>
                    <button 
                      type="button" 
                      className="btn btn-secondary"
                      onClick={() => {
                        setIsEditing(false);
                        setFormData({
                          login: user.login || '',
                          email: user.email || '',
                          description: user.Freelancer?.description || '',
                        });
                      }}
                    >
                      Отмена
                    </button>
                  </>
                )}
              </div>
            </form>
          ) : (
            <form onSubmit={handleChangePassword} className="profile-form">
              <div className="form-group">
                <label className="form-label">Текущий пароль</label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  className="form-input"
                  placeholder="Введите текущий пароль"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Новый пароль</label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className="form-input"
                  placeholder="Введите новый пароль"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Подтверждение пароля</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  className="form-input"
                  placeholder="Повторите новый пароль"
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  Изменить пароль
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;