const express = require('express');
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
    const { sortBy } = req.query;
    const categoryId = req.params.id;

    const services = await Service.findAll({
      where: { categoryId },
      include: [{
        model: Freelancer,
        include: [{
          model: User,
          attributes: ['id', 'login', 'avatar'],
        }],
      }],
    });

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
            minPrice: service.price,
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
          if (service.price < existing.minPrice) {
            existing.minPrice = service.price;
          }
        }
      }
    });

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