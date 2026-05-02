const express = require('express');
const { Op } = require('sequelize');
const { Order, User, Freelancer, Service, Dispute } = require('../models');
const { protect } = require('../middleware/authMiddleware');
const { createNotification } = require('./notifications');

const router = express.Router();

router.get('/', protect, async (req, res, next) => {
  try {
    const { status, search } = req.query;
    const userId = req.user.id;
    const userRole = req.user.role;
    const whereClause = {};

    if (userRole === 'customer') {
      whereClause.userId = userId;
    } else if (userRole === 'freelancer') {
      const freelancer = await Freelancer.findOne({ where: { userId } });
      if (freelancer) {
        whereClause.freelancerId = freelancer.id;
      } else {
        return res.json({ orders: [], total: 0 });
      }
    }

    if (status && status !== 'all') whereClause.status = status;

    const orders = await Order.findAll({
      where: whereClause,
      include: [
        { model: User, attributes: ['id', 'login'] },
        { model: Freelancer, include: [{ model: User, attributes: ['id', 'login'] }] },
        { model: Service, attributes: ['id', 'name', 'price'] },
      ],
      order: [['createdAt', 'DESC']],
    });

    let result = orders.map(order => ({
      id: order.id,
      orderNumber: `ORD-${String(order.id).padStart(6, '0')}`,
      customerName: order.User.login,
      freelancerName: order.Freelancer?.User?.login || 'Неизвестно',
      serviceName: order.Service?.name || 'Услуга удалена',
      status: order.status,
      budget: order.budget,
      createdAt: order.createdAt,
      completedAt: order.completedAt,
    }));

    if (search) {
      const s = search.toLowerCase();
      result = result.filter(o =>
        o.orderNumber.toLowerCase().includes(s) ||
        o.customerName.toLowerCase().includes(s) ||
        o.freelancerName.toLowerCase().includes(s) ||
        o.serviceName.toLowerCase().includes(s)
      );
    }

    res.json({ orders: result, total: result.length });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', protect, async (req, res, next) => {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [
        { model: User, attributes: ['id', 'login'] },
        { model: Freelancer, include: [{ model: User, attributes: ['id', 'login'] }] },
        { model: Service, attributes: ['id', 'name', 'description', 'price'] },
        { model: Dispute },
      ],
    });

    if (!order) return res.status(404).json({ message: 'Заказ не найден' });

    const dispute = order.Dispute ? {
      reason: order.Dispute.reason,
      comment: order.Dispute.comment,
      status: order.Dispute.status,
      resolution: order.Dispute.resolution,
      adminComment: order.Dispute.adminComment,
      createdAt: order.Dispute.createdAt,
      resolvedAt: order.Dispute.resolvedAt,
    } : null;

    res.json({
      id: order.id,
      orderNumber: `ORD-${String(order.id).padStart(6, '0')}`,
      customerId: order.userId,
      customerName: order.User.login,
      customerUserId: order.User.id,
      freelancerId: order.freelancerId,
      freelancerName: order.Freelancer?.User?.login || 'Неизвестно',
      freelancerUserId: order.Freelancer?.User?.id,
      serviceId: order.serviceId,
      serviceName: order.Service?.name || 'Услуга удалена',
      serviceDescription: order.Service?.description || '',
      status: order.status,
      budget: order.budget,
      description: order.Service?.description || '',
      createdAt: order.createdAt,
      completedAt: order.completedAt,
      dispute,
    });
  } catch (error) {
    next(error);
  }
});

router.post('/', protect, async (req, res, next) => {
  try {
    const { serviceId, freelancerId } = req.body;
    if (!serviceId || !freelancerId) return res.status(400).json({ message: 'Укажите услугу и фрилансера' });

    const service = await Service.findByPk(serviceId);
    if (!service) return res.status(404).json({ message: 'Услуга не найдена' });

    const order = await Order.create({
      userId: req.user.id,
      freelancerId,
      serviceId,
      status: 'in_progress',
      budget: service.price,
    });

    const freelancer = await Freelancer.findByPk(freelancerId);
    if (freelancer) {
      await createNotification(freelancer.userId, 'new_order', 'Новый заказ', `${req.user.login} заказал услугу "${service.name}".`);
    }

    res.status(201).json({ id: order.id, orderNumber: `ORD-${String(order.id).padStart(6, '0')}`, message: 'Заказ успешно создан' });
  } catch (error) {
    next(error);
  }
});

router.put('/:id/complete', protect, async (req, res, next) => {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [{ model: Freelancer, include: [{ model: User }] }],
    });

    if (!order) return res.status(404).json({ message: 'Заказ не найден' });
    if (order.userId !== req.user.id) return res.status(403).json({ message: 'Только заказчик может подтвердить' });
    if (order.status !== 'in_progress') return res.status(400).json({ message: 'Заказ уже завершен или в споре' });

    order.status = 'completed';
    order.completedAt = new Date();
    await order.save();

    if (order.Freelancer?.User) {
      await createNotification(order.Freelancer.User.id, 'order_completed', 'Заказ выполнен', `Заказ ${`ORD-${String(order.id).padStart(6, '0')}`} подтвержден.`);
    }

    res.json({ message: 'Работа принята, деньги переведены фрилансеру', order });
  } catch (error) {
    next(error);
  }
});

router.put('/:id/return', protect, async (req, res, next) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ message: 'Заказ не найден' });

    const freelancer = await Freelancer.findOne({ where: { userId: req.user.id } });
    if (!freelancer || order.freelancerId !== freelancer.id) return res.status(403).json({ message: 'Только фрилансер может вернуть' });
    if (order.status !== 'in_progress') return res.status(400).json({ message: 'Заказ уже завершен или в споре' });

    order.status = 'returned';
    await order.save();

    await createNotification(order.userId, 'order_returned', 'Возврат средств', `Фрилансер вернул деньги по заказу ${`ORD-${String(order.id).padStart(6, '0')}`}.`);

    res.json({ message: 'Средства возвращены заказчику', order });
  } catch (error) {
    next(error);
  }
});

router.put('/:id/dispute', protect, async (req, res, next) => {
  try {
    const { reason, comment } = req.body;
    const order = await Order.findByPk(req.params.id, {
      include: [{ model: Freelancer, include: [{ model: User }] }],
    });

    if (!order) return res.status(404).json({ message: 'Заказ не найден' });
    if (order.userId !== req.user.id) return res.status(403).json({ message: 'Только заказчик может открыть спор' });
    if (order.status !== 'in_progress') return res.status(400).json({ message: 'Спор можно открыть только для активного заказа' });
    if (!reason || !comment) return res.status(400).json({ message: 'Укажите причину и комментарий' });

    order.status = 'dispute';
    await order.save();

    await Dispute.create({ orderId: order.id, reason, comment, status: 'open' });

    if (order.Freelancer?.User) {
      await createNotification(order.Freelancer.User.id, 'dispute_opened', 'Открыт спор', `Заказчик открыл спор по заказу ${`ORD-${String(order.id).padStart(6, '0')}`}.`);
    }

    const admins = await User.findAll({ where: { role: 'admin' } });
    for (const admin of admins) {
      await createNotification(admin.id, 'dispute_opened', 'Новый спор', `Открыт спор по заказу ${`ORD-${String(order.id).padStart(6, '0')}`}.`);
    }

    res.json({ message: 'Спор открыт, ожидайте решения администратора', order });
  } catch (error) {
    next(error);
  }
});

module.exports = router;