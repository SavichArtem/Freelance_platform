const express = require('express');
const { User, Customer, Freelancer, Category, Service, Review, Dispute, Order } = require('../models');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { Op } = require('sequelize');

const router = express.Router();

// Все маршруты требуют админа
router.use(protect, adminOnly);

// GET /api/admin/stats - статистика
router.get('/stats', async (req, res, next) => {
  try {
    const totalUsers = await User.count();
    const totalFreelancers = await Freelancer.count();
    const totalCustomers = await Customer.count();
    const totalOrders = await Order.count();
    const totalDisputes = await Dispute.count({ where: { status: 'open' } });

    res.json({
      totalUsers,
      totalFreelancers,
      totalCustomers,
      totalOrders,
      totalDisputes,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/admin/users - список пользователей
router.get('/users', async (req, res, next) => {
  try {
    const { search, role, status } = req.query;
    const whereClause = {};

    if (search) {
      whereClause[Op.or] = [
        { login: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
      ];
    }

    if (role) whereClause.role = role;
    if (status) whereClause.status = status;

    const users = await User.findAll({
      where: whereClause,
      attributes: ['id', 'login', 'email', 'role', 'status', 'registrationDate'],
      order: [['registrationDate', 'DESC']],
    });

    res.json({ users });
  } catch (error) {
    next(error);
  }
});

// PUT /api/admin/users/:id/block - блокировка пользователя
router.put('/users/:id/block', async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Нельзя заблокировать администратора' });
    }

    if (user.status === 'blocked') {
      return res.status(400).json({ message: 'Пользователь уже заблокирован' });
    }

    user.status = 'blocked';
    await user.save();

    res.json({ message: 'Пользователь заблокирован' });
  } catch (error) {
    next(error);
  }
});

// PUT /api/admin/users/:id/unblock - разблокировка пользователя
router.put('/users/:id/unblock', async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    if (user.status !== 'blocked') {
      return res.status(400).json({ message: 'Пользователь не заблокирован' });
    }

    user.status = 'active';
    await user.save();

    res.json({ message: 'Пользователь разблокирован' });
  } catch (error) {
    next(error);
  }
});

// GET /api/admin/categories - список категорий
router.get('/categories', async (req, res, next) => {
  try {
    const categories = await Category.findAll({
      include: [{ model: Service }],
      order: [['name', 'ASC']],
    });

    res.json({
      categories: categories.map(c => ({
        id: c.id,
        name: c.name,
        description: c.description,
        servicesCount: c.Services.length,
      })),
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/admin/categories - создать категорию
router.post('/categories', async (req, res, next) => {
  try {
    const { name, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Название категории обязательно' });
    }

    const existing = await Category.findOne({ where: { name } });
    if (existing) {
      return res.status(400).json({ message: 'Такая категория уже существует' });
    }

    const category = await Category.create({ name, description });
    res.status(201).json({ category });
  } catch (error) {
    next(error);
  }
});

// PUT /api/admin/categories/:id - обновить категорию
router.put('/categories/:id', async (req, res, next) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Категория не найдена' });
    }

    const { name, description } = req.body;

    if (name && name !== category.name) {
      const existing = await Category.findOne({ where: { name } });
      if (existing) {
        return res.status(400).json({ message: 'Такая категория уже существует' });
      }
      category.name = name;
    }

    if (description !== undefined) {
      category.description = description;
    }

    await category.save();
    res.json({ category });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/admin/categories/:id - удалить категорию
router.delete('/categories/:id', async (req, res, next) => {
  try {
    const category = await Category.findByPk(req.params.id, {
      include: [{ model: Service }],
    });

    if (!category) {
      return res.status(404).json({ message: 'Категория не найдена' });
    }

    if (category.Services.length > 0) {
      return res.status(400).json({ message: 'Нельзя удалить категорию с услугами' });
    }

    await category.destroy();
    res.json({ message: 'Категория удалена' });
  } catch (error) {
    next(error);
  }
});

// GET /api/admin/reviews - модерация отзывов
router.get('/reviews', async (req, res, next) => {
  try {
    const reviews = await Review.findAll({
      include: [{
        model: Order,
        include: [
          { model: User, attributes: ['login'] },
          {
            model: Freelancer,
            include: [{ model: User, attributes: ['login'] }],
          },
        ],
      }],
      order: [['createdAt', 'DESC']],
    });

    res.json({
      reviews: reviews.map(r => ({
        id: r.id,
        rating: r.rating,
        text: r.text,
        status: r.status,
        createdAt: r.createdAt,
        author: r.Order?.User?.login || 'Неизвестно',
        freelancer: r.Order?.Freelancer?.User?.login || 'Неизвестно',
        orderId: r.orderId,
      })),
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/admin/reviews/:id/block - заблокировать отзыв
router.put('/reviews/:id/block', async (req, res, next) => {
  try {
    const review = await Review.findByPk(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Отзыв не найден' });
    }

    review.status = 'blocked';
    await review.save();

    res.json({ message: 'Отзыв заблокирован' });
  } catch (error) {
    next(error);
  }
});

// PUT /api/admin/reviews/:id/approve - одобрить отзыв
router.put('/reviews/:id/approve', async (req, res, next) => {
  try {
    const review = await Review.findByPk(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Отзыв не найден' });
    }

    review.status = 'active';
    await review.save();

    res.json({ message: 'Отзыв одобрен' });
  } catch (error) {
    next(error);
  }
});

// GET /api/admin/disputes - список споров
router.get('/disputes', async (req, res, next) => {
  try {
    const disputes = await Dispute.findAll({
      include: [{
        model: Order,
        include: [
          { model: User, attributes: ['login'] },
          {
            model: Freelancer,
            include: [{ model: User, attributes: ['login'] }],
          },
          { model: Service, attributes: ['name'] },
        ],
      }],
      order: [['createdAt', 'DESC']],
    });

    res.json({
      disputes: disputes.map(d => ({
        id: d.id,
        orderId: d.orderId,
        orderNumber: `ORD-${String(d.orderId).padStart(6, '0')}`,
        reason: d.reason,
        comment: d.comment,
        status: d.status,
        createdAt: d.createdAt,
        customer: d.Order?.User?.login || 'Неизвестно',
        freelancer: d.Order?.Freelancer?.User?.login || 'Неизвестно',
        service: d.Order?.Service?.name || 'Неизвестно',
        budget: d.Order?.budget,
      })),
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/admin/disputes/:id/resolve - решить спор
router.put('/disputes/:id/resolve', async (req, res, next) => {
  try {
    const { decision, adminComment } = req.body;
    const dispute = await Dispute.findByPk(req.params.id, {
      include: [{ model: Order }],
    });

    if (!dispute) {
      return res.status(404).json({ message: 'Спор не найден' });
    }

    if (dispute.status !== 'open') {
      return res.status(400).json({ message: 'Спор уже решен' });
    }

    if (!decision || !['customer', 'freelancer'].includes(decision)) {
      return res.status(400).json({ message: 'Укажите решение: customer или freelancer' });
    }

    if (!adminComment || !adminComment.trim()) {
      return res.status(400).json({ message: 'Добавьте комментарий' });
    }

    dispute.status = 'resolved';
    dispute.resolution = decision;
    dispute.adminComment = adminComment;
    dispute.resolvedAt = new Date();
    await dispute.save();

    // Меняем статус заказа
    const order = dispute.Order;
    order.status = decision === 'customer' ? 'returned' : 'completed';
    if (decision === 'freelancer') {
      order.completedAt = new Date();
    }
    await order.save();

    res.json({ message: 'Решение по спору принято' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;