import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchStatsSuccess, fetchUsersSuccess, blockUserSuccess, unblockUserSuccess,
  fetchCategoriesSuccess, createCategorySuccess, updateCategorySuccess, deleteCategorySuccess,
  fetchReviewsSuccess, blockReviewSuccess, approveReviewSuccess,
  fetchDisputesSuccess, resolveDisputeSuccess,
  setError, clearMessage, clearError
} from '../../store/slices/adminSlice';
import { adminApi } from '../../api/adminApi';
import { messagesApi } from '../../api/messagesApi';
import Chat from '../../components/Chat/Chat';
import { generateReviewsPDF, generateCategoriesDOCX } from '../../utils/reports';
import './AdminPage.css';

const AdminPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const { user, isAuthenticated } = useSelector(state => state.auth);
  const { stats, users, categories, reviews, disputes, error, message } = useSelector(state => state.admin);

  const [activeTab, setActiveTab] = useState('stats');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDesc, setNewCategoryDesc] = useState('');
  const [editingCategory, setEditingCategory] = useState(null);
  const [disputeDecision, setDisputeDecision] = useState({});
  const [disputeComment, setDisputeComment] = useState({});
  const [disputeResolved, setDisputeResolved] = useState({});
  const [viewDispute, setViewDispute] = useState(null);
  const [disputeMessages, setDisputeMessages] = useState({});
  const [disputePartner, setDisputePartner] = useState({});
  const [resolveError, setResolveError] = useState({});

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') { navigate('/'); return; }
    loadStats();
    const tab = searchParams.get('tab');
    if (tab) { setActiveTab(tab); if (tab === 'disputes') loadDisputes(); }
  }, [isAuthenticated, user, navigate, searchParams]);

  useEffect(() => { if (message) setTimeout(() => dispatch(clearMessage()), 3000); if (error) setTimeout(() => dispatch(clearError()), 5000); }, [message, error]);

  const loadStats = () => adminApi.getStats().then(res => dispatch(fetchStatsSuccess(res.data))).catch(() => {});
  const loadUsers = () => adminApi.getUsers({}).then(res => dispatch(fetchUsersSuccess(res.data))).catch(() => {});
  const loadCategories = () => adminApi.getCategories().then(res => dispatch(fetchCategoriesSuccess(res.data))).catch(() => {});
  const loadReviews = () => adminApi.getReviews().then(res => dispatch(fetchReviewsSuccess(res.data))).catch(() => {});
  const loadDisputes = () => adminApi.getDisputes().then(res => {
    dispatch(fetchDisputesSuccess(res.data));
    const resolved = {};
    (res.data.disputes || []).forEach(d => { if (d.status !== 'open') resolved[d.id] = true; });
    setDisputeResolved(resolved);
  }).catch(() => {});

  const loadTab = (tab) => {
    setActiveTab(tab);
    switch (tab) {
      case 'stats': loadStats(); break;
      case 'users': loadUsers(); break;
      case 'categories': loadCategories(); break;
      case 'reviews': loadReviews(); break;
      case 'disputes': loadDisputes(); break;
    }
  };

  const handleBlockUser = async (id) => { try { await adminApi.blockUser(id); dispatch(blockUserSuccess({ message: 'Заблокирован' })); loadUsers(); } catch (err) { dispatch(setError(err.response?.data?.message)); } };
  const handleUnblockUser = async (id) => { try { await adminApi.unblockUser(id); dispatch(unblockUserSuccess({ message: 'Разблокирован' })); loadUsers(); } catch (err) { dispatch(setError(err.response?.data?.message)); } };
  const handleCreateCategory = async () => { if (!newCategoryName.trim()) return; try { await adminApi.createCategory({ name: newCategoryName, description: newCategoryDesc }); dispatch(createCategorySuccess({})); setNewCategoryName(''); setNewCategoryDesc(''); loadCategories(); } catch (err) { dispatch(setError(err.response?.data?.message)); } };
  const handleUpdateCategory = async (id) => { try { await adminApi.updateCategory(id, editingCategory); dispatch(updateCategorySuccess({})); setEditingCategory(null); loadCategories(); } catch (err) { dispatch(setError(err.response?.data?.message)); } };
  const handleDeleteCategory = async (id) => { try { await adminApi.deleteCategory(id); dispatch(deleteCategorySuccess({})); loadCategories(); } catch (err) { dispatch(setError(err.response?.data?.message)); } };
  const handleBlockReview = async (id) => { try { await adminApi.blockReview(id); dispatch(blockReviewSuccess({})); loadReviews(); } catch (err) { dispatch(setError(err.response?.data?.message)); } };
  const handleApproveReview = async (id) => { try { await adminApi.approveReview(id); dispatch(approveReviewSuccess({})); loadReviews(); } catch (err) { dispatch(setError(err.response?.data?.message)); } };
  const handleViewDispute = async (d) => { if (viewDispute === d.id) { setViewDispute(null); return; } setViewDispute(d.id); try { const res = await messagesApi.getOrderMessages(d.orderId); setDisputeMessages(prev => ({ ...prev, [d.id]: res.data.messages })); setDisputePartner(prev => ({ ...prev, [d.id]: res.data.partner || { login: d.customer } })); } catch (err) { console.error(err); } };
  const handleResolveDispute = async (id) => { if (!disputeDecision[id]) { setResolveError(prev => ({ ...prev, [id]: 'Выберите сторону' })); return; } if (!disputeComment[id]?.trim()) { setResolveError(prev => ({ ...prev, [id]: 'Добавьте комментарий' })); return; } try { const res = await adminApi.resolveDispute(id, { decision: disputeDecision[id], adminComment: disputeComment[id] }); dispatch(resolveDisputeSuccess(res.data)); setDisputeResolved(prev => ({ ...prev, [id]: true })); loadDisputes(); } catch (err) { dispatch(setError(err.response?.data?.message)); } };

  const tabs = [
    { key: 'stats', label: 'Статистика' }, { key: 'users', label: 'Пользователи' },
    { key: 'categories', label: 'Категории' }, { key: 'reviews', label: 'Отзывы' }, { key: 'disputes', label: 'Споры' },
  ];

  return (
    <div className="admin-page">
      <div className="container">
        <h1 className="admin-title">Административная панель</h1>
        {message && <div className="message-alert message-success">{message}</div>}
        {error && <div className="message-alert message-error">{error}</div>}
        <div className="admin-tabs">
          {tabs.map(tab => (
            <button key={tab.key} className={`tab-btn ${activeTab === tab.key ? 'tab-btn-active' : ''}`} onClick={() => loadTab(tab.key)}>{tab.label}</button>
          ))}
        </div>

        {activeTab === 'stats' && stats && (
          <div className="stats-grid">
            <div className="stat-card"><h3>{stats.totalUsers}</h3><p>Пользователей</p></div>
            <div className="stat-card"><h3>{stats.totalFreelancers}</h3><p>Фрилансеров</p></div>
            <div className="stat-card"><h3>{stats.totalCustomers}</h3><p>Заказчиков</p></div>
            <div className="stat-card"><h3>{stats.totalOrders}</h3><p>Заказов</p></div>
            <div className="stat-card"><h3>{stats.totalDisputes}</h3><p>Споров</p></div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="responsive-table">
            <table className="admin-table">
              <thead><tr><th>ID</th><th>Логин</th><th>Email</th><th>Роль</th><th>Статус</th><th>Действия</th></tr></thead>
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
          </div>
        )}

        {activeTab === 'categories' && (
          <div>
            <div className="add-category-form">
              <input value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} placeholder="Название категории" className="form-input" />
              <input value={newCategoryDesc} onChange={e => setNewCategoryDesc(e.target.value)} placeholder="Описание" className="form-input" />
              <button onClick={handleCreateCategory} className="btn btn-primary">Добавить</button>
            </div>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', marginTop: '16px' }}>
              <button onClick={() => generateCategoriesDOCX(categories)} className="btn btn-sm btn-primary">Экспорт в DOCX</button>
            </div>
            <div className="responsive-table">
              <table className="admin-table">
                <thead><tr><th>ID</th><th>Название</th><th>Описание</th><th>Услуг</th><th>Действия</th></tr></thead>
                <tbody>
                  {categories.map(c => (
                    <tr key={c.id}>
                      <td>{c.id}</td><td>{c.name}</td><td>{c.description || '—'}</td><td>{c.servicesCount}</td>
                      <td>
                        <button onClick={() => setEditingCategory({ id: c.id, name: c.name, description: c.description })} className="btn btn-sm btn-primary">Редактировать</button>
                        <button onClick={() => handleDeleteCategory(c.id)} className="btn btn-sm btn-danger">Удалить</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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

        {activeTab === 'reviews' && (
          <div>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
              <button onClick={() => generateReviewsPDF(reviews)} className="btn btn-sm btn-primary">Экспорт в PDF</button>
            </div>
            <div className="responsive-table">
              <table className="admin-table">
                <thead><tr><th>ID</th><th>Оценка</th><th>Текст</th><th>Автор</th><th>Статус</th><th>Действия</th></tr></thead>
                <tbody>
                  {reviews.map(r => (
                    <tr key={r.id}>
                      <td>{r.id}</td><td>{r.rating}/5</td><td>{r.text.length > 50 ? r.text.substring(0, 50) + '...' : r.text}</td><td>{r.author}</td>
                      <td>{r.status === 'blocked' ? 'Заблокирован' : 'Активен'}</td>
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
            </div>
          </div>
        )}

        {activeTab === 'disputes' && (
          <div className="disputes-section">
            {disputes.length === 0 ? (
              <div className="empty-state"><p>Нет активных споров</p></div>
            ) : (
              disputes.map(d => (
                <div key={d.id} className="dispute-card">
                  <div className="dispute-card-header">
                    <div><strong>Заказ {d.orderNumber}</strong><span className="dispute-status">{d.status === 'open' ? 'Открыт' : 'Решен'}</span></div>
                    <button onClick={() => handleViewDispute(d)} className="btn btn-sm btn-primary">{viewDispute === d.id ? 'Скрыть' : 'Подробнее'}</button>
                  </div>
                  {viewDispute === d.id && (
                    <div className="dispute-details">
                      <div className="dispute-info-row"><span>Заказчик:</span><span>{d.customer}</span></div>
                      <div className="dispute-info-row"><span>Фрилансер:</span><span>{d.freelancer}</span></div>
                      <div className="dispute-info-row"><span>Услуга:</span><span>{d.service}</span></div>
                      <div className="dispute-info-row"><span>Бюджет:</span><span>{Number(d.budget).toLocaleString()} руб.</span></div>
                      <div className="dispute-info-row"><span>Причина:</span><span className="dispute-reason">{d.reason}</span></div>
                      <div className="dispute-comment-box"><strong>Комментарий заказчика:</strong><p>{d.comment}</p></div>
                      {disputeMessages[d.id]?.length > 0 && (
                        <div className="dispute-chat-history">
                          <strong>История переписки:</strong>
                          <div style={{ height: '300px', marginTop: '8px', border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden' }}>
                            <Chat messages={disputeMessages[d.id]} partnerName={disputePartner[d.id]?.login || ''} readOnly={true} />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  {!disputeResolved[d.id] && d.status === 'open' ? (
                    <div className="dispute-resolution">
                      {resolveError[d.id] && <div className="form-error-message">{resolveError[d.id]}</div>}
                      <div className="dispute-resolution-row">
                        <label>Решение:</label>
                        <select value={disputeDecision[d.id] || ''} onChange={e => setDisputeDecision({ ...disputeDecision, [d.id]: e.target.value })} className="form-input">
                          <option value="">Выберите сторону</option>
                          <option value="customer">Вернуть заказчику</option>
                          <option value="freelancer">Оплатить фрилансеру</option>
                        </select>
                      </div>
                      <div className="dispute-resolution-row">
                        <label>Комментарий:</label>
                        <textarea value={disputeComment[d.id] || ''} onChange={e => setDisputeComment({ ...disputeComment, [d.id]: e.target.value })} className="form-input form-textarea" rows="2" placeholder="Обоснование решения..." />
                      </div>
                      <button onClick={() => handleResolveDispute(d.id)} className="btn btn-primary">Принять решение</button>
                    </div>
                  ) : (
                    <div className="dispute-resolved-message"><p>Решение принято</p></div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;