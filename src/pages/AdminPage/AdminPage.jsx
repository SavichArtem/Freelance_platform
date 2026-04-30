import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchAdminStats, fetchAdminUsers, blockUser, unblockUser,
  fetchAdminCategories, createCategory, updateCategory, deleteCategory,
  fetchAdminReviews, blockReview, approveReview,
  fetchAdminDisputes, resolveDispute,
  clearAdminError, clearAdminMessage
} from '../../store/slices/adminSlice';
import './AdminPage.css';

const AdminPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector(state => state.auth);
  const { stats, users, categories, reviews, disputes, loading, error, message } = useSelector(state => state.admin);

  const [activeTab, setActiveTab] = useState('stats');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDesc, setNewCategoryDesc] = useState('');
  const [editingCategory, setEditingCategory] = useState(null);
  const [disputeDecision, setDisputeDecision] = useState({});
  const [disputeComment, setDisputeComment] = useState({});

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      navigate('/');
      return;
    }
    dispatch(fetchAdminStats());
  }, [isAuthenticated, user, navigate, dispatch]);

  useEffect(() => {
    if (message) {
      setTimeout(() => dispatch(clearAdminMessage()), 3000);
    }
    if (error) {
      setTimeout(() => dispatch(clearAdminError()), 5000);
    }
  }, [message, error, dispatch]);

  const loadTab = (tab) => {
    setActiveTab(tab);
    switch (tab) {
      case 'stats': dispatch(fetchAdminStats()); break;
      case 'users': dispatch(fetchAdminUsers({})); break;
      case 'categories': dispatch(fetchAdminCategories()); break;
      case 'reviews': dispatch(fetchAdminReviews()); break;
      case 'disputes': dispatch(fetchAdminDisputes()); break;
    }
  };

  const handleBlockUser = (id) => dispatch(blockUser(id)).then(() => dispatch(fetchAdminUsers({})));
  const handleUnblockUser = (id) => dispatch(unblockUser(id)).then(() => dispatch(fetchAdminUsers({})));

  const handleCreateCategory = () => {
    if (!newCategoryName.trim()) return;
    dispatch(createCategory({ name: newCategoryName, description: newCategoryDesc }))
      .then(() => {
        setNewCategoryName('');
        setNewCategoryDesc('');
        dispatch(fetchAdminCategories());
      });
  };

  const handleUpdateCategory = (id) => {
    dispatch(updateCategory({ id, data: editingCategory }))
      .then(() => {
        setEditingCategory(null);
        dispatch(fetchAdminCategories());
      });
  };

  const handleDeleteCategory = (id) => dispatch(deleteCategory(id)).then(() => dispatch(fetchAdminCategories()));

  const handleBlockReview = (id) => dispatch(blockReview(id)).then(() => dispatch(fetchAdminReviews()));
  const handleApproveReview = (id) => dispatch(approveReview(id)).then(() => dispatch(fetchAdminReviews()));

  const handleResolveDispute = (id) => {
    dispatch(resolveDispute({
      id,
      data: {
        decision: disputeDecision[id],
        adminComment: disputeComment[id] || '',
      },
    })).then(() => dispatch(fetchAdminDisputes()));
  };

  const tabs = [
    { key: 'stats', label: 'Статистика' },
    { key: 'users', label: 'Пользователи' },
    { key: 'categories', label: 'Категории' },
    { key: 'reviews', label: 'Отзывы' },
    { key: 'disputes', label: 'Споры' },
  ];

  return (
    <div className="admin-page">
      <div className="container">
        <h1 className="admin-title">Административная панель</h1>

        {message && <div className="message-alert message-success">{message}</div>}
        {error && <div className="message-alert message-error">{error}</div>}

        <div className="admin-tabs">
          {tabs.map(tab => (
            <button
              key={tab.key}
              className={`tab-btn ${activeTab === tab.key ? 'tab-btn-active' : ''}`}
              onClick={() => loadTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Статистика */}
        {activeTab === 'stats' && stats && (
          <div className="stats-grid">
            <div className="stat-card"><h3>{stats.totalUsers}</h3><p>Пользователей</p></div>
            <div className="stat-card"><h3>{stats.totalFreelancers}</h3><p>Фрилансеров</p></div>
            <div className="stat-card"><h3>{stats.totalCustomers}</h3><p>Заказчиков</p></div>
            <div className="stat-card"><h3>{stats.totalOrders}</h3><p>Заказов</p></div>
            <div className="stat-card"><h3>{stats.totalDisputes}</h3><p>Открытых споров</p></div>
          </div>
        )}

        {/* Пользователи */}
        {activeTab === 'users' && (
          <table className="admin-table">
            <thead>
              <tr><th>ID</th><th>Логин</th><th>Email</th><th>Роль</th><th>Статус</th><th>Действия</th></tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td>{u.id}</td><td>{u.login}</td><td>{u.email}</td><td>{u.role}</td>
                  <td>{u.status === 'blocked' ? 'Заблокирован' : 'Активен'}</td>
                  <td>
                    {u.status === 'blocked' ? (
                      <button onClick={() => handleUnblockUser(u.id)} className="btn btn-success btn-sm">Разблокировать</button>
                    ) : (
                      <button onClick={() => handleBlockUser(u.id)} className="btn btn-danger btn-sm">Заблокировать</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Категории */}
        {activeTab === 'categories' && (
          <div>
            <div className="add-category-form">
              <input value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} placeholder="Название категории" className="form-input" />
              <input value={newCategoryDesc} onChange={e => setNewCategoryDesc(e.target.value)} placeholder="Описание" className="form-input" />
              <button onClick={handleCreateCategory} className="btn btn-primary">Добавить</button>
            </div>
            <table className="admin-table">
              <thead><tr><th>ID</th><th>Название</th><th>Описание</th><th>Услуг</th><th>Действия</th></tr></thead>
              <tbody>
                {categories.map(c => (
                  <tr key={c.id}>
                    <td>{c.id}</td>
                    <td>{c.name}</td><td>{c.description || '—'}</td><td>{c.servicesCount}</td>
                    <td>
                      <button onClick={() => setEditingCategory({ id: c.id, name: c.name, description: c.description })} className="btn btn-sm btn-primary">✏️</button>
                      <button onClick={() => handleDeleteCategory(c.id)} className="btn btn-sm btn-danger">🗑️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {editingCategory && (
              <div className="modal-overlay">
                <div className="modal">
                  <h3>Редактировать категорию</h3>
                  <input value={editingCategory.name} onChange={e => setEditingCategory({ ...editingCategory, name: e.target.value })} className="form-input" />
                  <input value={editingCategory.description || ''} onChange={e => setEditingCategory({ ...editingCategory, description: e.target.value })} className="form-input" />
                  <button onClick={() => handleUpdateCategory(editingCategory.id)} className="btn btn-primary">Сохранить</button>
                  <button onClick={() => setEditingCategory(null)} className="btn btn-secondary">Отмена</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Отзывы */}
        {activeTab === 'reviews' && (
          <table className="admin-table">
            <thead><tr><th>ID</th><th>Оценка</th><th>Текст</th><th>Автор</th><th>Статус</th><th>Действия</th></tr></thead>
            <tbody>
              {reviews.map(r => (
                <tr key={r.id}>
                  <td>{r.id}</td><td>{'⭐'.repeat(r.rating)}</td><td>{r.text}</td><td>{r.author}</td>
                  <td>{r.status === 'blocked' ? 'Нет' : 'Да'}</td>
                  <td>
                    {r.status === 'blocked' ? (
                      <button onClick={() => handleApproveReview(r.id)} className="btn btn-success btn-sm">Одобрить</button>
                    ) : (
                      <button onClick={() => handleBlockReview(r.id)} className="btn btn-danger btn-sm">Заблокировать</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Споры */}
        {activeTab === 'disputes' && (
          <table className="admin-table">
            <thead><tr><th>ID</th><th>Заказ</th><th>Заказчик</th><th>Фрилансер</th><th>Причина</th><th>Решение</th></tr></thead>
            <tbody>
              {disputes.map(d => (
                <tr key={d.id}>
                  <td>{d.id}</td><td>{d.orderNumber}</td><td>{d.customer}</td><td>{d.freelancer}</td>
                  <td>{d.reason}</td>
                  <td>
                    <select value={disputeDecision[d.id] || ''} onChange={e => setDisputeDecision({ ...disputeDecision, [d.id]: e.target.value })} className="form-input">
                      <option value="">Выберите</option>
                      <option value="customer">Вернуть заказчику</option>
                      <option value="freelancer">Оплатить фрилансеру</option>
                    </select>
                    <input value={disputeComment[d.id] || ''} onChange={e => setDisputeComment({ ...disputeComment, [d.id]: e.target.value })} placeholder="Комментарий" className="form-input" />
                    <button onClick={() => handleResolveDispute(d.id)} className="btn btn-primary btn-sm">Решить</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminPage;