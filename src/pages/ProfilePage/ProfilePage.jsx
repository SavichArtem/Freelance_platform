import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { updateProfile, changePassword } from '../../store/slices/authSlice';
import './ProfilePage.css';

const ProfilePage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isAuthenticated, loading } = useSelector(state => state.auth);
  const fileInputRef = useRef(null);

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
  const [messageType, setMessageType] = useState('success');
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarBase64, setAvatarBase64] = useState('');
  const [errors, setErrors] = useState({});
  const [passwordErrors, setPasswordErrors] = useState({});

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
      setAvatarBase64(user.avatar || '');
    }
  }, [user, isAuthenticated, navigate]);

  const showMessage = (text, type = 'success') => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => setMessage(''), 5000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
    if (passwordErrors[name]) {
      setPasswordErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  if (!['image/jpeg', 'image/png'].includes(file.type)) {
    showMessage('Доступны только форматы jpg и png', 'error');
    return;
  }

  if (file.size > 20 * 1024 * 1024) {
    showMessage('Файл не должен превышать 20 МБ', 'error');
    return;
  }

  // Сжимаем изображение перед конвертацией в base64
  const reader = new FileReader();
  reader.onload = (event) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const maxWidth = 300;
      const maxHeight = 300;
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > maxWidth) {
          height *= maxWidth / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width *= maxHeight / height;
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
      setAvatarPreview(compressedBase64);
      setAvatarBase64(compressedBase64);
    };
    img.src = event.target.result;
  };
  reader.readAsDataURL(file);
};

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setErrors({});
    setMessage('');

    const newErrors = {};
    if (!formData.login.trim()) {
      newErrors.login = 'Логин обязателен';
    } else if (formData.login.trim().length < 3) {
      newErrors.login = 'Логин должен быть не менее 3 символов';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email обязателен';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Некорректный email';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    dispatch(updateProfile({
      login: formData.login,
      email: formData.email,
      description: formData.description,
      avatar: avatarBase64,
    }))
      .unwrap()
      .then(() => {
        showMessage('Профиль успешно обновлен', 'success');
        setAvatarPreview(null);
      })
      .catch((err) => {
        showMessage(err, 'error');
      });
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    setPasswordErrors({});
    setMessage('');

    const newErrors = {};
    if (!passwordData.currentPassword) {
      newErrors.currentPassword = 'Введите текущий пароль';
    }
    if (!passwordData.newPassword) {
      newErrors.newPassword = 'Введите новый пароль';
    } else if (passwordData.newPassword.length < 6) {
      newErrors.newPassword = 'Пароль должен быть не менее 6 символов';
    }
    if (!passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Подтвердите новый пароль';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Пароли не совпадают';
    }

    if (Object.keys(newErrors).length > 0) {
      setPasswordErrors(newErrors);
      return;
    }

    dispatch(changePassword({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword,
    }))
      .unwrap()
      .then(() => {
        showMessage('Пароль успешно изменен', 'success');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      })
      .catch((err) => {
        showMessage(err, 'error');
      });
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

  const avatarSrc = avatarPreview || user.avatar;

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
          <div className={`message-alert ${messageType === 'success' ? 'message-success' : 'message-error'}`}>
            {message}
          </div>
        )}

        <div className="profile-card">
          <div className="profile-avatar-section">
            <div
              className="profile-avatar avatar-clickable"
              onClick={handleAvatarClick}
              title="Нажмите, чтобы изменить аватар"
            >
              {avatarSrc ? (
                <img src={avatarSrc} alt={formData.login} />
              ) : (
                <div className="avatar-placeholder">
                  {formData.login?.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="avatar-overlay">📷</div>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleAvatarChange}
              accept=".jpg,.jpeg,.png"
              style={{ display: 'none' }}
            />
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
              onClick={() => { setShowPasswordForm(false); setMessage(''); }}
              type="button"
            >
              Личные данные
            </button>
            <button
              className={`tab-btn ${showPasswordForm ? 'tab-btn-active' : ''}`}
              onClick={() => { setShowPasswordForm(true); setMessage(''); }}
              type="button"
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
                  className={`form-input ${errors.login ? 'form-input-error' : ''}`}
                  placeholder="Введите логин"
                />
                {errors.login && <span className="form-error">{errors.login}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`form-input ${errors.email ? 'form-input-error' : ''}`}
                  placeholder="Введите email"
                />
                {errors.email && <span className="form-error">{errors.email}</span>}
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
                    placeholder="Расскажите о себе и своих навыках"
                  />
                </div>
              )}

              <div className="form-actions">
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Сохранение...' : 'Сохранить'}
                </button>
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
                  className={`form-input ${passwordErrors.currentPassword ? 'form-input-error' : ''}`}
                  placeholder="Введите текущий пароль"
                />
                {passwordErrors.currentPassword && (
                  <span className="form-error">{passwordErrors.currentPassword}</span>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Новый пароль</label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className={`form-input ${passwordErrors.newPassword ? 'form-input-error' : ''}`}
                  placeholder="Введите новый пароль"
                />
                {passwordErrors.newPassword && (
                  <span className="form-error">{passwordErrors.newPassword}</span>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Подтверждение пароля</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  className={`form-input ${passwordErrors.confirmPassword ? 'form-input-error' : ''}`}
                  placeholder="Повторите новый пароль"
                />
                {passwordErrors.confirmPassword && (
                  <span className="form-error">{passwordErrors.confirmPassword}</span>
                )}
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Сохранение...' : 'Изменить пароль'}
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