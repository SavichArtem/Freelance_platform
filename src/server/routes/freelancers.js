const express = require('express');
const { Op } = require('sequelize');
const { Freelancer, User, Service, Portfolio, Review, Order } = require('../models');

const router = express.Router();

// GET /api/freelancers/search
router.get('/search', async (req, res, next) => {
  try {
    const { query, sortBy } = req.query;

    const whereClause = {};
    if (query) {
      whereClause.login = { [Op.iLike]: `%${query}%` };
    }

    const freelancers = await Freelancer.findAll({
      include: [
        {
          model: User,
          attributes: ['id', 'login', 'avatar'],
          where: query ? whereClause : undefined,
        },
        {
          model: Service,
        },
      ],
    });

    let results = freelancers
      .filter(f => f.User)
      .map(f => ({
        id: f.id,
        userId: f.User.id,
        login: f.User.login,
        avatar: f.User.avatar,
        rating: f.rating,
        description: f.description,
        minPrice: f.Services.length > 0
          ? Math.min(...f.Services.map(s => Number(s.price)))
          : 0,
      }));

    if (sortBy === 'price_asc') {
      results.sort((a, b) => a.minPrice - b.minPrice);
    } else if (sortBy === 'price_desc') {
      results.sort((a, b) => b.minPrice - a.minPrice);
    } else {
      results.sort((a, b) => b.rating - a.rating);
    }

    res.json({ freelancers: results, total: results.length });
  } catch (error) {
    next(error);
  }
});

// GET /api/freelancers/:id
router.get('/:id', async (req, res, next) => {
  try {
    const freelancer = await Freelancer.findByPk(req.params.id, {
      include: [
        {
          model: User,
          attributes: ['id', 'login', 'avatar', 'registrationDate'],
        },
        {
          model: Service,
        },
        {
          model: Portfolio,
        },
      ],
    });

    if (!freelancer) {
      return res.status(404).json({ message: 'Фрилансер не найден' });
    }

    const reviews = await Review.findAll({
      include: [{
        model: Order,
        where: { freelancerId: freelancer.id },
        include: [{
          model: User,
          attributes: ['login'],
        }],
      }],
      where: { status: 'active' },
    });

    res.json({
      id: freelancer.id,
      userId: freelancer.User.id,
      login: freelancer.User.login,
      avatar: freelancer.User.avatar,
      registrationDate: freelancer.User.registrationDate,
      rating: freelancer.rating,
      description: freelancer.description,
      services: freelancer.Services,
      portfolioItems: freelancer.Portfolios,
      reviews: reviews.map(r => ({
        id: r.id,
        rating: r.rating,
        text: r.text,
        author: r.Order.User.login,
        createdAt: r.createdAt,
      })),
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;