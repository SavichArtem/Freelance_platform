const express = require('express');
const authRoutes = require('./auth');
const categoriesRoutes = require('./categories');
const freelancersRoutes = require('./freelancers');
const ordersRoutes = require('./orders');
const adminRoutes = require('./admin');
const messagesRoutes = require('./messages');
const notificationsRoutes = require('./notifications');
const reviewsRoutes = require('./reviews');
const portfolioRoutes = require('./portfolio');
const servicesRoutes = require('./services');


const router = express.Router();

router.use('/auth', authRoutes);
router.use('/categories', categoriesRoutes);
router.use('/freelancers', freelancersRoutes);
router.use('/orders', ordersRoutes);
router.use('/admin', adminRoutes);
router.use('/messages', messagesRoutes);
router.use('/notifications', notificationsRoutes.router);
router.use('/reviews', reviewsRoutes);
router.use('/portfolio', portfolioRoutes);
router.use('/services', servicesRoutes);



module.exports = router;