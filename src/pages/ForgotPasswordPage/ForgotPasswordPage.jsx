import { useState } from 'react';
import { Link } from 'react-router-dom';
import './ForgotPasswordPage.css';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setMessage('Введите email');
      setMessageType('error');
      return;
    }

    setLoading(true);
    
    // Здесь будет API запрос на восстановление пароля
    setTimeout(() => {
      setMessage('Инструкция по восстановлению пароля отправлена на ваш email');
      setMessageType('success');
      setLoading(false);
      setEmail('');
    }, 1000);
  };

  return (
    <div className="auth-page">
      <div className="container">
        <div className="auth-form-container">
          <h1 className="auth-title">Восстановление пароля</h1>
          
          {message && (
            <div className={`auth-message ${messageType === 'success' ? 'message-success' : 'message-error'}`}>
              {message}
            </div>
          )}
          
          <p className="forgot-description">
            Введите email, указанный при регистрации. Мы отправим вам инструкцию по восстановлению пароля.
          </p>
          
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="email" className="form-label">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
                placeholder="Введите email"
                disabled={loading}
              />
            </div>

            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? 'Отправка...' : 'Восстановить пароль'}
            </button>
          </form>

          <div className="auth-links-bottom">
            <Link to="/login" className="auth-link-secondary">
              ← Вернуться ко входу
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;