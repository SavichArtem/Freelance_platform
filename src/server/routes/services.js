const express = require('express');
const { Service, Freelancer } = require('../models');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

// POST /api/services
router.post('/', async (req, res, next) => {
  try {
    const freelancer = await Freelancer.findOne({ where: { userId: req.user.id } });
    if (!freelancer) {
      return res.status(403).json({ message: 'Только фрилансер может добавлять услуги' });
    }

    const { name, description, price, categoryId } = req.body;
    if (!name || !price || !categoryId) {
      return res.status(400).json({ message: 'Название, цена и категория обязательны' });
    }

    if (name.length > 60) {
      return res.status(400).json({ message: 'Название услуги не должно превышать 60 символов' });
    }

    if (description && description.length > 500) {
      return res.status(400).json({ message: 'Описание услуги не должно превышать 500 символов' });
    }

    const service = await Service.create({
      freelancerId: freelancer.id,
      categoryId,
      name,
      description: description || '',
      price,
    });

    res.status(201).json(service);
  } catch (error) {
    console.error('Service create error:', error);
    next(error);
  }
});

// PUT /api/services/:id
router.put('/:id', async (req, res, next) => {
  try {
    const freelancer = await Freelancer.findOne({ where: { userId: req.user.id } });
    if (!freelancer) return res.status(403).json({ message: 'Нет доступа' });

    const service = await Service.findOne({ where: { id: req.params.id, freelancerId: freelancer.id } });
    if (!service) return res.status(404).json({ message: 'Не найдено' });

    const { name, description, price, categoryId } = req.body;

    if (name && name.length > 60) {
      return res.status(400).json({ message: 'Название услуги не должно превышать 60 символов' });
    }

    if (description && description.length > 500) {
      return res.status(400).json({ message: 'Описание услуги не должно превышать 500 символов' });
    }

    if (name) service.name = name;
    if (description !== undefined) service.description = description;
    if (price) service.price = price;
    if (categoryId) service.categoryId = categoryId;

    await service.save();
    res.json(service);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/services/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const freelancer = await Freelancer.findOne({ where: { userId: req.user.id } });
    if (!freelancer) return res.status(403).json({ message: 'Нет доступа' });

    const service = await Service.findOne({ where: { id: req.params.id, freelancerId: freelancer.id } });
    if (!service) return res.status(404).json({ message: 'Не найдено' });

    await service.destroy();
    res.json({ message: 'Удалено' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;