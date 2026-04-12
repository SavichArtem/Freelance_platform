import { Link } from 'react-router-dom';
import './NotFoundPage.css';

const NotFoundPage = () => {
  return (
    <div className="not-found-page">
      <div className="container">
        <h1 className="error-code">404</h1>
        <h2 className="error-title">Страница не найдена</h2>
        <p className="error-text">
          К сожалению, запрашиваемая страница не существует или была перемещена.
        </p>
        <Link to="/" className="home-button">
          Вернуться на главную
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;