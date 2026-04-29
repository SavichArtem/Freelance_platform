const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Dispute = sequelize.define('Dispute', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  orderId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    field: 'order_id',
    references: {
      model: 'Orders',
      key: 'id',
    },
  },
  reason: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  comment: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  resolution: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  adminComment: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'admin_comment',
  },
  status: {
    type: DataTypes.STRING(10),
    allowNull: false,
    defaultValue: 'open',
    validate: {
      isIn: [['open', 'resolved']],
    },
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'created_at',
  },
  resolvedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'resolved_at',
  },
}, {
  tableName: 'Disputes',
  timestamps: false,
});

module.exports = Dispute;