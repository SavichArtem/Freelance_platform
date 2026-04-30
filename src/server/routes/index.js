const express = require('express');
const authRoutes = require('./auth');
const categoriesRoutes = require('./categories');
const freelancersRoutes = require('./freelancers');
const ordersRoutes = require('./orders');
const adminRoutes = require('./admin');
const messagesRoutes = require('./messages');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/categories', categoriesRoutes);
router.use('/freelancers', freelancersRoutes);
router.use('/orders', ordersRoutes);
router.use('/admin', adminRoutes);
router.use('/messages', messagesRoutes);

module.exports = router;