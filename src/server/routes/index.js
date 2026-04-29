const express = require('express');
const authRoutes = require('./auth');
const categoriesRoutes = require('./categories');
const freelancersRoutes = require('./freelancers');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/categories', categoriesRoutes);
router.use('/freelancers', freelancersRoutes);

module.exports = router;