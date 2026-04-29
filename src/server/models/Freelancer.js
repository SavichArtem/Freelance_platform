const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Freelancer = sequelize.define('Freelancer', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    field: 'user_id',
    references: {
      model: 'Users',
      key: 'id',
    },
  },
  rating: {
    type: DataTypes.DECIMAL(3, 2),
    allowNull: true,
    defaultValue: 0,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'Freelancers',
  timestamps: false,
});

module.exports = Freelancer;