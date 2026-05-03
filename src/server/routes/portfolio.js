const express = require('express');
const { Portfolio, Freelancer } = require('../models');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

// POST /api/portfolio
router.post('/', async (req, res, next) => {
  try {
    const freelancer = await Freelancer.findOne({ where: { userId: req.user.id } });
    if (!freelancer) {
      return res.status(403).json({ message: 'Только фрилансер может добавлять портфолио' });
    }

    const { title, description, image } = req.body;
    if (!title || !image) {
      return res.status(400).json({ message: 'Название и изображение обязательны' });
    }

    if (title.length > 60) {
      return res.status(400).json({ message: 'Название работы не должно превышать 60 символов' });
    }

    if (description && description.length > 500) {
      return res.status(400).json({ message: 'Описание работы не должно превышать 500 символов' });
    }

    const item = await Portfolio.create({
      freelancerId: freelancer.id,
      title,
      description: description || '',
      image,
    });

    res.status(201).json(item);
  } catch (error) {
    console.error('Portfolio create error:', error);
    next(error);
  }
});

// PUT /api/portfolio/:id
router.put('/:id', async (req, res, next) => {
  try {
    const freelancer = await Freelancer.findOne({ where: { userId: req.user.id } });
    if (!freelancer) return res.status(403).json({ message: 'Нет доступа' });

    const item = await Portfolio.findOne({ where: { id: req.params.id, freelancerId: freelancer.id } });
    if (!item) return res.status(404).json({ message: 'Не найдено' });

    const { title, description, image } = req.body;

    if (title && title.length > 60) {
      return res.status(400).json({ message: 'Название работы не должно превышать 60 символов' });
    }

    if (description && description.length > 500) {
      return res.status(400).json({ message: 'Описание работы не должно превышать 500 символов' });
    }

    if (title) item.title = title;
    if (description !== undefined) item.description = description;
    if (image) item.image = image;

    await item.save();
    res.json(item);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/portfolio/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const freelancer = await Freelancer.findOne({ where: { userId: req.user.id } });
    if (!freelancer) return res.status(403).json({ message: 'Нет доступа' });

    const item = await Portfolio.findOne({ where: { id: req.params.id, freelancerId: freelancer.id } });
    if (!item) return res.status(404).json({ message: 'Не найдено' });

    await item.destroy();
    res.json({ message: 'Удалено' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;