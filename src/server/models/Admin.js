const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Admin = sequelize.define('Admin', {
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
  accessLevel: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'full',
    field: 'access_level',
  },
}, {
  tableName: 'Admins',
  timestamps: false,
});

module.exports = Admin;