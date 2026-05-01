const express = require('express');
const { Review, Order, Freelancer, User } = require('../models');
const { protect } = require('../middleware/authMiddleware');
const { createNotification } = require('./notifications');

const router = express.Router();

router.use(protect);

// POST /api/reviews
router.post('/', async (req, res, next) => {
  try {
    const { orderId, rating, text } = req.body;

    if (!orderId || !rating || !text) {
      return res.status(400).json({ message: 'Все поля обязательны' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Оценка должна быть от 1 до 5' });
    }

    if (text.length > 1000) {
      return res.status(400).json({ message: 'Отзыв не должен превышать 1000 символов' });
    }

    const order = await Order.findByPk(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Заказ не найден' });
    }

    if (order.userId !== req.user.id) {
      return res.status(403).json({ message: 'Только заказчик может оставить отзыв' });
    }

    if (order.status !== 'completed') {
      return res.status(400).json({ message: 'Отзыв можно оставить только на выполненный заказ' });
    }

    const existingReview = await Review.findOne({ where: { orderId } });
    if (existingReview) {
      return res.status(400).json({ message: 'Вы уже оставили отзыв на этот заказ' });
    }

    const review = await Review.create({
      orderId,
      rating,
      text,
      status: 'active',
    });

    // Пересчет рейтинга фрилансера
    const freelancer = await Freelancer.findByPk(order.freelancerId);
    if (freelancer) {
      const allReviews = await Review.findAll({
        include: [{
          model: Order,
          where: { freelancerId: freelancer.id },
        }],
        where: { status: 'active' },
      });

      const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
      freelancer.rating = totalRating / allReviews.length;
      await freelancer.save();

      await createNotification(
        freelancer.userId,
        'new_review',
        'Новый отзыв',
        `${req.user.login} оставил отзыв с оценкой ${rating}/5.`
      );
    }

    res.status(201).json({
      id: review.id,
      rating: review.rating,
      text: review.text,
      createdAt: review.createdAt,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/reviews/check/:orderId
router.get('/check/:orderId', async (req, res, next) => {
  try {
    const order = await Order.findByPk(req.params.orderId);

    if (!order || order.userId !== req.user.id) {
      return res.json({ canReview: false, alreadyReviewed: true });
    }

    if (order.status !== 'completed') {
      return res.json({ canReview: false, alreadyReviewed: false });
    }

    const existingReview = await Review.findOne({ where: { orderId: order.id } });
    res.json({
      canReview: !existingReview,
      alreadyReviewed: !!existingReview,
      review: existingReview || null,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;