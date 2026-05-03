const express = require('express');
const { Op } = require('sequelize');
const { Category, Service, Freelancer, User, Review } = require('../models');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// GET /api/categories
router.get('/', async (req, res, next) => {
  try {
    const categories = await Category.findAll();
    res.json(categories);
  } catch (error) {
    next(error);
  }
});

// GET /api/categories/:id
router.get('/:id', async (req, res, next) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Категория не найдена' });
    }
    res.json(category);
  } catch (error) {
    next(error);
  }
});

// GET /api/categories/:id/freelancers
router.get('/:id/freelancers', async (req, res, next) => {
  try {
    const { sortBy, query } = req.query;
    const categoryId = req.params.id;

    // Сначала получаем ВСЕ услуги в категории с фрилансерами
    const services = await Service.findAll({
      where: { categoryId },
      include: [
        {
          model: Freelancer,
          include: [{
            model: User,
            attributes: ['id', 'login', 'avatar'],
          }],
        },
      ],
    });

    // Группируем по фрилансерам
    let freelancers = [];

    services.forEach(service => {
      if (service.Freelancer && service.Freelancer.User) {
        const existing = freelancers.find(f => f.id === service.Freelancer.id);
        if (!existing) {
          freelancers.push({
            id: service.Freelancer.id,
            login: service.Freelancer.User.login,
            avatar: service.Freelancer.User.avatar,
            rating: service.Freelancer.rating,
            description: service.Freelancer.description,
            minPrice: Number(service.price),
            services: [{
              id: service.id,
              name: service.name,
              description: service.description,
              price: service.price,
            }],
          });
        } else {
          existing.services.push({
            id: service.id,
            name: service.name,
            description: service.description,
            price: service.price,
          });
          if (Number(service.price) < existing.minPrice) {
            existing.minPrice = Number(service.price);
          }
        }
      }
    });

    // Фильтрация по поисковому запросу (после группировки)
    if (query) {
      const q = query.toLowerCase();
      freelancers = freelancers.filter(f =>
        f.login.toLowerCase().includes(q) ||
        (f.description && f.description.toLowerCase().includes(q))
      );
    }

    // Сортировка
    if (sortBy === 'price_asc') {
      freelancers.sort((a, b) => a.minPrice - b.minPrice);
    } else if (sortBy === 'price_desc') {
      freelancers.sort((a, b) => b.minPrice - a.minPrice);
    } else {
      freelancers.sort((a, b) => b.rating - a.rating);
    }

    res.json({ freelancers, total: freelancers.length });
  } catch (error) {
    next(error);
  }
});

module.exports = router;