const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { User, Customer, Freelancer, Admin } = require('../models');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// POST /api/auth/register
router.post('/register', [
  body('login').trim().isLength({ min: 3 }).withMessage('Логин должен быть не менее 3 символов'),
  body('email').isEmail().withMessage('Некорректный email'),
  body('password').isLength({ min: 6 }).withMessage('Пароль должен быть не менее 6 символов'),
  body('role').isIn(['customer', 'freelancer']).withMessage('Неверная роль'),
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const { login, email, password, role } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Пользователь с таким email уже зарегистрирован' });
    }

    const existingLogin = await User.findOne({ where: { login } });
    if (existingLogin) {
      return res.status(400).json({ message: 'Пользователь с таким логином уже существует' });
    }

    const user = await User.create({ login, email, password, role });

    if (role === 'customer') {
      await Customer.create({ userId: user.id });
    } else if (role === 'freelancer') {
      await Freelancer.create({ userId: user.id });
    }

    const token = generateToken(user.id);

    res.status(201).json({
      user: user.toSafeObject(),
      token,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/login
router.post('/login', [
  body('login').notEmpty().withMessage('Введите логин или email'),
  body('password').notEmpty().withMessage('Введите пароль'),
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const { login, password } = req.body;

    const user = await User.findOne({
      where: {
        ...(login.includes('@') ? { email: login } : { login }),
      },
    });

    if (!user) {
      return res.status(401).json({ message: 'Неверный логин или пароль' });
    }

    if (user.status === 'blocked') {
      return res.status(403).json({ message: 'Ваш аккаунт заблокирован' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Неверный логин или пароль' });
    }

    const token = generateToken(user.id);

    res.json({
      user: user.toSafeObject(),
      token,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/auth/me
router.get('/me', protect, async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, {
      include: [
        { model: Customer },
        { model: Freelancer },
        { model: Admin },
      ],
    });

    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    res.json({ user: user.toSafeObject() });
  } catch (error) {
    next(error);
  }
});

// PUT /api/auth/profile
router.put('/profile', protect, async (req, res, next) => {
  try {
    const { login, email, description, avatar } = req.body;
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    if (login && login !== user.login) {
      const existingLogin = await User.findOne({ where: { login } });
      if (existingLogin) {
        return res.status(400).json({ message: 'Пользователь с таким логином уже существует' });
      }
      user.login = login;
    }

    if (email && email !== user.email) {
      const existingEmail = await User.findOne({ where: { email } });
      if (existingEmail) {
        return res.status(400).json({ message: 'Пользователь с таким email уже зарегистрирован' });
      }
      user.email = email;
    }

    if (avatar !== undefined) {
      user.avatar = avatar;
    }

    await user.save();

    if (user.role === 'freelancer' && description !== undefined) {
      const freelancer = await Freelancer.findOne({ where: { userId: user.id } });
      if (freelancer) {
        freelancer.description = description;
        await freelancer.save();
      }
    }

    const updatedUser = await User.findByPk(user.id, {
      include: [
        { model: Customer },
        { model: Freelancer },
        { model: Admin },
      ],
    });

    res.json({
      message: 'Профиль обновлен',
      user: updatedUser.toSafeObject(),
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/auth/password
router.put('/password', protect, [
  body('currentPassword').notEmpty().withMessage('Введите текущий пароль'),
  body('newPassword').isLength({ min: 6 }).withMessage('Новый пароль должен быть не менее 6 символов'),
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const { currentPassword, newPassword } = req.body;
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Неверный текущий пароль' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Пароль успешно изменен' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;