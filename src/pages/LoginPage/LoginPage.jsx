import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  loginStart,
  loginSuccess,
  loginFailure,
  clearError,
} from "../../store/slices/authSlice";
import { authApi } from "../../api/authApi";
import "./LoginPage.css";

const LoginPage = () => {
  const [formData, setFormData] = useState({ login: "", password: "" });
  const [validationError, setValidationError] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated } = useSelector(
    (state) => state.auth,
  );

  useEffect(() => {
    if (isAuthenticated) navigate("/", { replace: true });
  }, [isAuthenticated, navigate]);
  useEffect(() => {
    return () => dispatch(clearError());
  }, [dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (validationError) setValidationError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.login.trim() || !formData.password.trim()) {
      setValidationError("Все поля обязательны для заполнения");
      return;
    }
    localStorage.removeItem("token");
    dispatch(loginStart());
    try {
      const res = await authApi.login(formData);
      dispatch(loginSuccess(res.data));
      navigate("/");
    } catch (err) {
      dispatch(
        loginFailure(
          err.response?.data?.message || "Неверный логин или пароль",
        ),
      );
    }
  };

  return (
    <div className="auth-page">
      <div className="container">
        <div className="auth-form-container">
          <h1 className="auth-title">Вход в систему</h1>
          {(validationError || error) && (
            <div className="auth-error">{validationError || error}</div>
          )}
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label">Email или логин</label>
              <input
                type="text"
                name="login"
                value={formData.login}
                onChange={handleChange}
                className="form-input"
                placeholder="Введите email или логин"
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Пароль</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="form-input"
                placeholder="Введите пароль"
                disabled={loading}
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary btn-block"
              disabled={loading}
            >
              {loading ? "Вход..." : "Войти"}
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
