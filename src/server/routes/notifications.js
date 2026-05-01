const express = require('express');
const { Notification } = require('../models');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

// GET /api/notifications
router.get('/', async (req, res, next) => {
  try {
    const notifications = await Notification.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']],
      limit: 30,
    });

    res.json({
      notifications: notifications.map(n => ({
        id: n.id,
        type: n.type,
        title: n.title,
        text: n.text,
        isRead: n.isRead,
        createdAt: n.createdAt,
      })),
      unreadCount: notifications.filter(n => !n.isRead).length,
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/notifications/:id/read
router.put('/:id/read', async (req, res, next) => {
  try {
    const notification = await Notification.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!notification) {
      return res.status(404).json({ message: 'Уведомление не найдено' });
    }

    notification.isRead = true;
    await notification.save();

    res.json({ message: 'ok' });
  } catch (error) {
    next(error);
  }
});

// PUT /api/notifications/read-all
router.put('/read-all', async (req, res, next) => {
  try {
    await Notification.update(
      { isRead: true },
      { where: { userId: req.user.id, isRead: false } }
    );

    res.json({ message: 'ok' });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/notifications
router.delete('/', async (req, res, next) => {
  try {
    await Notification.destroy({
      where: { userId: req.user.id },
    });

    res.json({ message: 'ok' });
  } catch (error) {
    next(error);
  }
});

// Функция для создания уведомления
const createNotification = async (userId, type, title, text) => {
  try {
    await Notification.create({ userId, type, title, text });
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};

module.exports = { router, createNotification };