const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  if (err.name === 'SequelizeValidationError') {
    const messages = err.errors.map(e => e.message);
    return res.status(400).json({ message: messages.join(', ') });
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(400).json({ message: 'Такая запись уже существует' });
  }

  res.status(err.statusCode || 500).json({
    message: err.message || 'Внутренняя ошибка сервера',
  });
};

module.exports = { errorHandler };