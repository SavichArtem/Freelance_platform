import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { updateProfile, changePassword } from '../../store/slices/authSlice';
import { portfolioApi } from '../../api/portfolioApi';
import { categoriesApi } from '../../api/categoriesApi';
import axiosInstance from '../../api/axiosConfig';
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

  const [portfolioItems, setPortfolioItems] = useState([]);
  const [showPortfolioForm, setShowPortfolioForm] = useState(false);
  const [editingPortfolioId, setEditingPortfolioId] = useState(null);
  const [portfolioForm, setPortfolioForm] = useState({ title: '', description: '', image: '' });
  const [portfolioErrors, setPortfolioErrors] = useState({});

  const [services, setServices] = useState([]);
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState(null);
  const [serviceForm, setServiceForm] = useState({ name: '', description: '', price: '', categoryId: '' });
  const [serviceErrors, setServiceErrors] = useState({});
  const [categoriesList, setCategoriesList] = useState([]);

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
      setPortfolioItems(user.Freelancer?.Portfolios || []);
      setServices(user.Freelancer?.Services || []);
    }
  }, [user, isAuthenticated, navigate]);

  useEffect(() => {
    if (user?.role === 'freelancer') {
      categoriesApi.getAll().then(res => setCategoriesList(res.data || [])).catch(() => {});
      loadFreelancerData();
    }
  }, [user]);

  const loadFreelancerData = async () => {
    try {
      const res = await axiosInstance.get(`/freelancers/${user.Freelancer?.id}`);
      if (res.data) {
        setPortfolioItems(res.data.portfolioItems || []);
        setServices(res.data.services || []);
      }
    } catch (error) {
      console.error('Error loading freelancer data:', error);
    }
  };

  const showMessage = (text, type = 'success') => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => setMessage(''), 5000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
    if (passwordErrors[name]) setPasswordErrors(prev => ({ ...prev, [name]: '' }));
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

    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result);
      setAvatarBase64(reader.result);
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
      .catch((err) => showMessage(err, 'error'));
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    setPasswordErrors({});
    setMessage('');

    const newErrors = {};
    if (!passwordData.currentPassword) newErrors.currentPassword = 'Введите текущий пароль';
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
      .catch((err) => showMessage(err, 'error'));
  };

  const handlePortfolioChange = (e) => {
    const { name, value } = e.target;
    setPortfolioForm(prev => ({ ...prev, [name]: value }));
    if (portfolioErrors[name]) setPortfolioErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handlePortfolioImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      setPortfolioErrors(prev => ({ ...prev, image: 'Доступны только jpg и png' }));
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => setPortfolioForm(prev => ({ ...prev, image: reader.result }));
    reader.readAsDataURL(file);
    setPortfolioErrors(prev => ({ ...prev, image: '' }));
  };

  const validatePortfolioForm = () => {
    const newErrors = {};
    if (!portfolioForm.title.trim()) newErrors.title = 'Название обязательно';
    if (!portfolioForm.image) newErrors.image = 'Изображение обязательно';
    setPortfolioErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddPortfolio = async (e) => {
    e.preventDefault();
    if (!validatePortfolioForm()) return;
    try {
      if (editingPortfolioId) {
        await portfolioApi.update(editingPortfolioId, portfolioForm);
        showMessage('Работа обновлена', 'success');
      } else {
        await portfolioApi.add(portfolioForm);
        showMessage('Работа добавлена', 'success');
      }
      setPortfolioForm({ title: '', description: '', image: '' });
      setShowPortfolioForm(false);
      setEditingPortfolioId(null);
      loadFreelancerData();
    } catch (error) {
      showMessage(error.response?.data?.message || 'Ошибка', 'error');
    }
  };

  const handleEditPortfolio = (item) => {
    setPortfolioForm({ title: item.title, description: item.description || '', image: item.image });
    setEditingPortfolioId(item.id);
    setShowPortfolioForm(true);
  };

  const handleDeletePortfolio = async (id) => {
    if (!window.confirm('Удалить работу из портфолио?')) return;
    try {
      await portfolioApi.delete(id);
      showMessage('Работа удалена', 'success');
      loadFreelancerData();
    } catch (error) {
      showMessage(error.response?.data?.message || 'Ошибка', 'error');
    }
  };

  const cancelPortfolioForm = () => {
    setShowPortfolioForm(false);
    setEditingPortfolioId(null);
    setPortfolioForm({ title: '', description: '', image: '' });
    setPortfolioErrors({});
  };

  const handleServiceChange = (e) => {
    const { name, value } = e.target;
    setServiceForm(prev => ({ ...prev, [name]: value }));
    if (serviceErrors[name]) setServiceErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateServiceForm = () => {
    const newErrors = {};
    if (!serviceForm.name.trim()) newErrors.name = 'Название обязательно';
    if (!serviceForm.price || Number(serviceForm.price) <= 0) newErrors.price = 'Укажите цену';
    if (!serviceForm.categoryId) newErrors.categoryId = 'Выберите категорию';
    setServiceErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddService = async (e) => {
    e.preventDefault();
    if (!validateServiceForm()) return;
    try {
      if (editingServiceId) {
        await axiosInstance.put(`/services/${editingServiceId}`, {
          name: serviceForm.name,
          description: serviceForm.description,
          price: serviceForm.price,
          categoryId: serviceForm.categoryId,
        });
        showMessage('Услуга обновлена', 'success');
      } else {
        await axiosInstance.post('/services', {
          name: serviceForm.name,
          description: serviceForm.description,
          price: serviceForm.price,
          categoryId: serviceForm.categoryId,
        });
        showMessage('Услуга добавлена', 'success');
      }
      setServiceForm({ name: '', description: '', price: '', categoryId: '' });
      setShowServiceForm(false);
      setEditingServiceId(null);
      loadFreelancerData();
    } catch (error) {
      showMessage(error.response?.data?.message || 'Ошибка', 'error');
    }
  };

  const handleEditService = (service) => {
    setServiceForm({
      name: service.name,
      description: service.description || '',
      price: service.price,
      categoryId: service.categoryId || '',
    });
    setEditingServiceId(service.id);
    setShowServiceForm(true);
  };

  const handleDeleteService = async (id) => {
    if (!window.confirm('Удалить услугу?')) return;
    try {
      await axiosInstance.delete(`/services/${id}`);
      showMessage('Услуга удалена', 'success');
      loadFreelancerData();
    } catch (error) {
      showMessage(error.response?.data?.message || 'Ошибка', 'error');
    }
  };

  const cancelServiceForm = () => {
    setShowServiceForm(false);
    setEditingServiceId(null);
    setServiceForm({ name: '', description: '', price: '', categoryId: '' });
    setServiceErrors({});
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Не указана';
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  if (!user) return null;

  const avatarSrc = avatarPreview || user.avatar;

  return (
    <div className="profile-page">
      <div className="container">
        <div className="profile-page-header">
          <button onClick={() => navigate(-1)} className="btn-back">← Назад</button>
          <h1 className="profile-page-title">Мой профиль</h1>
        </div>

        {message && (
          <div className={`message-alert ${messageType === 'success' ? 'message-success' : 'message-error'}`}>
            {message}
          </div>
        )}

        <div className="profile-card">
          <div className="profile-avatar-section">
            <div className="profile-avatar avatar-clickable" onClick={handleAvatarClick} title="Нажмите, чтобы изменить аватар">
              {avatarSrc ? (
                <img src={avatarSrc} alt={formData.login} />
              ) : (
                <div className="avatar-placeholder">{formData.login?.charAt(0).toUpperCase()}</div>
              )}
              <div className="avatar-overlay">📷</div>
            </div>
            <input type="file" ref={fileInputRef} onChange={handleAvatarChange} accept=".jpg,.jpeg,.png" style={{ display: 'none' }} />
            <div className="profile-info-basic">
              <h2>{user.login}</h2>
              <span className="profile-role">
                {user.role === 'freelancer' ? 'Фрилансер' : user.role === 'customer' ? 'Заказчик' : 'Администратор'}
              </span>
              <span className="profile-date">Дата регистрации: {formatDate(user.registrationDate)}</span>
            </div>
          </div>

          <div className="profile-tabs">
            <button className={`tab-btn ${!showPasswordForm ? 'tab-btn-active' : ''}`} onClick={() => { setShowPasswordForm(false); setMessage(''); }} type="button">Личные данные</button>
            <button className={`tab-btn ${showPasswordForm ? 'tab-btn-active' : ''}`} onClick={() => { setShowPasswordForm(true); setMessage(''); }} type="button">Безопасность</button>
          </div>

          {!showPasswordForm ? (
            <form onSubmit={handleSaveProfile} className="profile-form">
              <div className="form-group">
                <label className="form-label">Логин</label>
                <input type="text" name="login" value={formData.login} onChange={handleChange} className={`form-input ${errors.login ? 'form-input-error' : ''}`} />
                {errors.login && <span className="form-error">{errors.login}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} className={`form-input ${errors.email ? 'form-input-error' : ''}`} />
                {errors.email && <span className="form-error">{errors.email}</span>}
              </div>
              {user.role === 'freelancer' && (
                <div className="form-group">
                  <label className="form-label">Описание</label>
                  <textarea name="description" value={formData.description} onChange={handleChange} className="form-input form-textarea" rows="4" placeholder="Расскажите о себе и своих навыках" />
                </div>
              )}
              <div className="form-actions">
                <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Сохранение...' : 'Сохранить'}</button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleChangePassword} className="profile-form">
              <div className="form-group">
                <label className="form-label">Текущий пароль</label>
                <input type="password" name="currentPassword" value={passwordData.currentPassword} onChange={handlePasswordChange} className={`form-input ${passwordErrors.currentPassword ? 'form-input-error' : ''}`} placeholder="Введите текущий пароль" />
                {passwordErrors.currentPassword && <span className="form-error">{passwordErrors.currentPassword}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Новый пароль</label>
                <input type="password" name="newPassword" value={passwordData.newPassword} onChange={handlePasswordChange} className={`form-input ${passwordErrors.newPassword ? 'form-input-error' : ''}`} placeholder="Введите новый пароль" />
                {passwordErrors.newPassword && <span className="form-error">{passwordErrors.newPassword}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Подтверждение пароля</label>
                <input type="password" name="confirmPassword" value={passwordData.confirmPassword} onChange={handlePasswordChange} className={`form-input ${passwordErrors.confirmPassword ? 'form-input-error' : ''}`} placeholder="Повторите новый пароль" />
                {passwordErrors.confirmPassword && <span className="form-error">{passwordErrors.confirmPassword}</span>}
              </div>
              <div className="form-actions">
                <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Сохранение...' : 'Изменить пароль'}</button>
              </div>
            </form>
          )}
        </div>

        {user.role === 'freelancer' && (
          <>
            <div className="profile-card" style={{ marginTop: '24px' }}>
              <div className="profile-form">
                <h3 style={{ marginBottom: '16px', color: 'var(--text-primary)' }}>Мои услуги</h3>
                
                {services.length > 0 && (
                  <div style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {services.map(service => (
                      <div key={service.id} style={{ padding: '12px', background: 'var(--bg-secondary)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <strong style={{ color: 'var(--text-primary)' }}>{service.name}</strong>
                          <div style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{service.description}</div>
                          <div style={{ color: 'var(--blue)', fontWeight: 600 }}>{Number(service.price).toLocaleString()} ₽</div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button onClick={() => handleEditService(service)} className="btn btn-sm btn-primary">Редактировать</button>
                          <button onClick={() => handleDeleteService(service.id)} className="btn btn-sm btn-danger">Удалить</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {showServiceForm ? (
                  <form onSubmit={handleAddService}>
                    <div className="form-group">
                      <label className="form-label">Название услуги</label>
                      <input type="text" name="name" value={serviceForm.name} onChange={handleServiceChange} className={`form-input ${serviceErrors.name ? 'form-input-error' : ''}`} />
                      {serviceErrors.name && <span className="form-error">{serviceErrors.name}</span>}
                    </div>
                    <div className="form-group">
                      <label className="form-label">Описание</label>
                      <textarea name="description" value={serviceForm.description} onChange={handleServiceChange} className="form-input form-textarea" rows="2" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Цена (₽)</label>
                      <input type="number" name="price" value={serviceForm.price} onChange={handleServiceChange} className={`form-input ${serviceErrors.price ? 'form-input-error' : ''}`} min="0" />
                      {serviceErrors.price && <span className="form-error">{serviceErrors.price}</span>}
                    </div>
                    <div className="form-group">
                      <label className="form-label">Категория</label>
                      <select name="categoryId" value={serviceForm.categoryId} onChange={handleServiceChange} className={`form-input ${serviceErrors.categoryId ? 'form-input-error' : ''}`}>
                        <option value="">Выберите категорию</option>
                        {categoriesList.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                      {serviceErrors.categoryId && <span className="form-error">{serviceErrors.categoryId}</span>}
                    </div>
                    <div className="form-actions">
                      <button type="submit" className="btn btn-primary">{editingServiceId ? 'Сохранить' : 'Добавить'}</button>
                      <button type="button" className="btn btn-secondary" onClick={cancelServiceForm}>Отмена</button>
                    </div>
                  </form>
                ) : (
                  <button onClick={() => setShowServiceForm(true)} className="btn btn-primary">Добавить услугу</button>
                )}
              </div>
            </div>

            <div className="profile-card" style={{ marginTop: '24px' }}>
              <div className="profile-form">
                <h3 style={{ marginBottom: '16px', color: 'var(--text-primary)' }}>Мое портфолио</h3>
                
                {portfolioItems.length > 0 && (
                  <div className="portfolio-grid" style={{ marginBottom: '20px' }}>
                    {portfolioItems.map(item => (
                      <div key={item.id} className="portfolio-card">
                        <div className="portfolio-image">
                          {item.image ? (
                            <img src={item.image} alt={item.title} />
                          ) : (
                            <div className="portfolio-placeholder">📁</div>
                          )}
                        </div>
                        <h4 className="portfolio-title">{item.title}</h4>
                        <p className="portfolio-description">{item.description}</p>
                        <div style={{ display: 'flex', gap: '8px', padding: '0 12px 12px' }}>
                          <button onClick={() => handleEditPortfolio(item)} className="btn btn-sm btn-primary">Редактировать</button>
                          <button onClick={() => handleDeletePortfolio(item.id)} className="btn btn-sm btn-danger">Удалить</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {showPortfolioForm ? (
                  <form onSubmit={handleAddPortfolio}>
                    <div className="form-group">
                      <label className="form-label">Название работы</label>
                      <input type="text" name="title" value={portfolioForm.title} onChange={handlePortfolioChange} className={`form-input ${portfolioErrors.title ? 'form-input-error' : ''}`} />
                      {portfolioErrors.title && <span className="form-error">{portfolioErrors.title}</span>}
                    </div>
                    <div className="form-group">
                      <label className="form-label">Описание</label>
                      <textarea name="description" value={portfolioForm.description} onChange={handlePortfolioChange} className="form-input form-textarea" rows="3" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Изображение</label>
                      <input type="file" onChange={handlePortfolioImageChange} accept=".jpg,.jpeg,.png" />
                      {portfolioErrors.image && <span className="form-error" style={{ display: 'block' }}>{portfolioErrors.image}</span>}
                      {portfolioForm.image && <img src={portfolioForm.image} alt="preview" style={{ maxWidth: '200px', marginTop: '8px', borderRadius: '8px', display: 'block' }} />}
                    </div>
                    <div className="form-actions">
                      <button type="submit" className="btn btn-primary">{editingPortfolioId ? 'Сохранить' : 'Добавить'}</button>
                      <button type="button" className="btn btn-secondary" onClick={cancelPortfolioForm}>Отмена</button>
                    </div>
                  </form>
                ) : (
                  <button onClick={() => setShowPortfolioForm(true)} className="btn btn-primary">Добавить работу</button>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;