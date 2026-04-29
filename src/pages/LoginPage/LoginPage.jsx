import { useState } from 'react';
import { Link } from 'react-router-dom';
import './LoginPage.css';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    login: '',
    password: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.login.trim() || !formData.password.trim()) {
      setError('Все поля обязательны для заполнения');
      return;
    }

    // Здесь будет вызов API
    console.log('Login attempt:', formData);
  };

  return (
    <div className="auth-page">
      <div className="container">
        <div className="auth-form-container">
          <h1 className="auth-title">Вход в систему</h1>
          
          {error && <div className="auth-error">{error}</div>}
          
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="login" className="form-label">
                Email или логин
              </label>
              <input
                type="text"
                id="login"
                name="login"
                value={formData.login}
                onChange={handleChange}
                className="form-input"
                placeholder="Введите email или логин"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Пароль
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="form-input"
                placeholder="Введите пароль"
              />
            </div>

            <button type="submit" className="btn btn-primary btn-block">
              Войти
            </button>
          </form>

          <div className="auth-links-bottom">
            <Link to="/forgot-password" className="auth-link-secondary">
              Забыли пароль?
            </Link>
            <Link to="/register" className="auth-link-secondary">
              Зарегистрироваться
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;