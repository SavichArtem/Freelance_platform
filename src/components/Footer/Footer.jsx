import React from 'react';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="copyright">
            {currentYear} Фриланс Платформа. Все права защищены.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;