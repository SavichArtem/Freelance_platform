const express = require('express');
const { Op } = require('sequelize');
const { Message, Order, User, Freelancer } = require('../models');
const { protect } = require('../middleware/authMiddleware');
const { createNotification } = require('./notifications');

const router = express.Router();

router.use(protect);

// GET /api/messages/chats
router.get('/chats', async (req, res, next) => {
  try {
    const userId = req.user.id;

    const messages = await Message.findAll({
      where: {
        [Op.or]: [
          { senderId: userId },
          { receiverId: userId },
        ],
      },
      include: [
        { model: User, as: 'Sender', attributes: ['id', 'login', 'avatar'] },
        { model: User, as: 'Receiver', attributes: ['id', 'login', 'avatar'] },
      ],
      order: [['createdAt', 'DESC']],
    });

    const chatMap = new Map();

    for (const msg of messages) {
      const partner = msg.senderId === userId ? msg.Receiver : msg.Sender;
      const partnerId = msg.senderId === userId ? msg.receiverId : msg.senderId;

      if (!partner || !partnerId) continue;
      if (partnerId === userId) continue;

      if (!chatMap.has(partnerId)) {
        chatMap.set(partnerId, {
          id: partnerId,
          chatId: `user_${Math.min(userId, partnerId)}_${Math.max(userId, partnerId)}`,
          participantId: partnerId,
          participantName: partner.login || 'Пользователь',
          participantAvatar: partner.avatar || null,
          lastMessage: msg.text || 'Файл',
          lastMessageTime: msg.createdAt,
          unread: 0,
          orderId: msg.orderId,
        });
      }
    }

    res.json(Array.from(chatMap.values()));
  } catch (error) {
    next(error);
  }
});

// GET /api/messages/user/:userId
router.get('/user/:userId', async (req, res, next) => {
  try {
    const currentUserId = req.user.id;
    const partnerId = Number(req.params.userId);

    const partner = await User.findByPk(partnerId, { attributes: ['id', 'login', 'avatar'] });

    const messages = await Message.findAll({
      where: {
        [Op.or]: [
          { senderId: currentUserId, receiverId: partnerId },
          { senderId: partnerId, receiverId: currentUserId },
        ],
      },
      include: [{ model: User, as: 'Sender', attributes: ['id', 'login'] }],
      order: [['createdAt', 'ASC']],
    });

    res.json({
      partner: partner ? { id: partner.id, login: partner.login, avatar: partner.avatar } : null,
      messages: messages.map(m => ({
        id: m.id,
        text: m.text,
        file: m.file ? JSON.parse(m.file) : null,
        senderId: m.senderId,
        senderName: m.Sender?.login || 'Неизвестно',
        timestamp: m.createdAt,
      })),
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/messages/order/:orderId
router.get('/order/:orderId', async (req, res, next) => {
  try {
    const orderId = req.params.orderId;

    const order = await Order.findByPk(orderId, {
      include: [
        { model: User, attributes: ['id', 'login', 'avatar'] },
        { model: Freelancer, include: [{ model: User, attributes: ['id', 'login', 'avatar'] }] },
      ],
    });

    if (!order) {
      return res.status(404).json({ message: 'Заказ не найден' });
    }

    const customerUserId = order.userId;
    const freelancerUserId = order.Freelancer?.User?.id;

    // Показываем ВСЕ сообщения между заказчиком и фрилансером
    const messages = await Message.findAll({
      where: {
        [Op.or]: [
          { senderId: customerUserId, receiverId: freelancerUserId },
          { senderId: freelancerUserId, receiverId: customerUserId },
        ],
      },
      include: [{ model: User, as: 'Sender', attributes: ['id', 'login'] }],
      order: [['createdAt', 'ASC']],
    });

    const partner = req.user.id === customerUserId
      ? order.Freelancer?.User
      : order.User;

    res.json({
      partner: partner ? { id: partner.id, login: partner.login, avatar: partner.avatar } : null,
      messages: messages.map(m => ({
        id: m.id,
        text: m.text,
        file: m.file ? JSON.parse(m.file) : null,
        senderId: m.senderId,
        senderName: m.Sender?.login || 'Неизвестно',
        timestamp: m.createdAt,
      })),
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/messages/user/:userId
router.post('/user/:userId', async (req, res, next) => {
  try {
    const receiverId = Number(req.params.userId);
    const { text, file } = req.body;

    if (req.user.id === receiverId) {
      return res.status(400).json({ message: 'Нельзя отправить сообщение самому себе' });
    }
    if (!text && !file) {
      return res.status(400).json({ message: 'Введите сообщение' });
    }

    // Ищем активный заказ между пользователями
    let activeOrderId = null;

    const freelancer = await Freelancer.findOne({ where: { userId: receiverId } });
    if (freelancer) {
      const order = await Order.findOne({
        where: {
          userId: req.user.id,
          freelancerId: freelancer.id,
          status: { [Op.in]: ['in_progress', 'dispute'] },
        },
      });
      if (order) activeOrderId = order.id;
    }

    if (!activeOrderId) {
      const myFreelancer = await Freelancer.findOne({ where: { userId: req.user.id } });
      if (myFreelancer) {
        const order = await Order.findOne({
          where: {
            userId: receiverId,
            freelancerId: myFreelancer.id,
            status: { [Op.in]: ['in_progress', 'dispute'] },
          },
        });
        if (order) activeOrderId = order.id;
      }
    }

    const message = await Message.create({
      senderId: req.user.id,
      receiverId,
      orderId: activeOrderId,
      text: text || '',
      file: file ? JSON.stringify(file) : null,
    });

    const user = await User.findByPk(req.user.id);

    await createNotification(receiverId, 'new_message', 'Новое сообщение', `${user.login} отправил вам сообщение.`);

    res.status(201).json({
      id: message.id,
      text: message.text,
      file: file || null,
      senderId: message.senderId,
      senderName: user.login,
      timestamp: message.createdAt,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/messages/order/:orderId
router.post('/order/:orderId', async (req, res, next) => {
  try {
    const orderId = req.params.orderId;
    const { text, file } = req.body;

    if (!text && !file) {
      return res.status(400).json({ message: 'Введите сообщение' });
    }

    const order = await Order.findByPk(orderId, {
      include: [
        { model: User },
        { model: Freelancer, include: [{ model: User }] },
      ],
    });

    const orderReceiverId = order && order.userId === req.user.id
      ? order.Freelancer?.User?.id
      : order?.userId;

    const message = await Message.create({
      senderId: req.user.id,
      receiverId: orderReceiverId || null,
      orderId,
      text: text || '',
      file: file ? JSON.stringify(file) : null,
    });

    const user = await User.findByPk(req.user.id);

    if (orderReceiverId) {
      await createNotification(
        orderReceiverId,
        'new_message',
        'Новое сообщение',
        `${user.login} отправил сообщение в заказ ${`ORD-${String(orderId).padStart(6, '0')}`}.`
      );
    }

    res.status(201).json({
      id: message.id,
      text: message.text,
      file: file || null,
      senderId: message.senderId,
      senderName: user.login,
      timestamp: message.createdAt,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;