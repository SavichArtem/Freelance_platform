import { useEffect } from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCurrentUser } from './store/slices/authSlice';
import { initTheme } from './store/slices/themeSlice';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import PrivateRoute from './components/PrivateRoute/PrivateRoute';
import AdminRoute from './components/PrivateRoute/AdminRoute';
import MainPage from './pages/MainPage/MainPage';
import LoginPage from './pages/LoginPage/LoginPage';
import RegisterPage from './pages/RegisterPage/RegisterPage';
import CategoryPage from './pages/CategoryPage/CategoryPage';
import FreelancerProfilePage from './pages/FreelancerProfilePage/FreelancerProfilePage';
import ProfilePage from './pages/ProfilePage/ProfilePage';
import OrdersPage from './pages/OrdersPage/OrdersPage';
import OrderDetailPage from './pages/OrderDetailPage/OrderDetailPage';
import MessagesPage from './pages/MessagesPage/MessagesPage';
import ChatPage from './pages/ChatPage/ChatPage';
import AdminPage from './pages/AdminPage/AdminPage';
import NotFoundPage from './pages/NotFoundPage/NotFoundPage';
import './App.css';

function AppContent() {
  const dispatch = useDispatch();
  const { token } = useSelector(state => state.auth);
  const location = useLocation();

  useEffect(() => {
    dispatch(initTheme());
  }, [dispatch]);

  useEffect(() => {
    if (token) {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch, token]);

  const hideFooter = location.pathname.startsWith('/messages');

  return (
    <div className="app">
      <Header />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/categories/:categoryId" element={<CategoryPage />} />
          <Route path="/services" element={<CategoryPage />} />
          <Route path="/freelancer/:freelancerId" element={<FreelancerProfilePage />} />
          <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
          <Route path="/orders" element={<PrivateRoute><OrdersPage /></PrivateRoute>} />
          <Route path="/orders/:orderId" element={<PrivateRoute><OrderDetailPage /></PrivateRoute>} />
          <Route path="/messages" element={<PrivateRoute><MessagesPage /></PrivateRoute>} />
          <Route path="/messages/user/:userId" element={<PrivateRoute><ChatPage /></PrivateRoute>} />
          <Route path="/messages/order/:orderId" element={<PrivateRoute><ChatPage /></PrivateRoute>} />
          <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      {!hideFooter && <Footer />}
    </div>
  );
}

function App() {
  return (
    <HashRouter>
      <AppContent />
    </HashRouter>
  );
}

export default App;