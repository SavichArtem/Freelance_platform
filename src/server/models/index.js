const sequelize = require('../config/database');
const User = require('./User');
const Customer = require('./Customer');
const Freelancer = require('./Freelancer');
const Admin = require('./Admin');
const Category = require('./Category');
const Service = require('./Service');
const Order = require('./Order');
const Review = require('./Review');
const Dispute = require('./Dispute');
const Portfolio = require('./Portfolio');
const Notification = require('./Notification');
const Message = require('./Message');

// Определение связей
User.hasOne(Customer, { foreignKey: 'userId' });
Customer.belongsTo(User, { foreignKey: 'userId' });

User.hasOne(Freelancer, { foreignKey: 'userId' });
Freelancer.belongsTo(User, { foreignKey: 'userId' });

User.hasOne(Admin, { foreignKey: 'userId' });
Admin.belongsTo(User, { foreignKey: 'userId' });

Category.hasMany(Service, { foreignKey: 'categoryId' });
Service.belongsTo(Category, { foreignKey: 'categoryId' });

Freelancer.hasMany(Service, { foreignKey: 'freelancerId' });
Service.belongsTo(Freelancer, { foreignKey: 'freelancerId' });

Freelancer.hasMany(Portfolio, { foreignKey: 'freelancerId' });
Portfolio.belongsTo(Freelancer, { foreignKey: 'freelancerId' });

User.hasMany(Order, { foreignKey: 'userId' });
Order.belongsTo(User, { foreignKey: 'userId' });

Freelancer.hasMany(Order, { foreignKey: 'freelancerId' });
Order.belongsTo(Freelancer, { foreignKey: 'freelancerId' });

Service.hasMany(Order, { foreignKey: 'serviceId' });
Order.belongsTo(Service, { foreignKey: 'serviceId' });

Order.hasOne(Review, { foreignKey: 'orderId' });
Review.belongsTo(Order, { foreignKey: 'orderId' });

Order.hasOne(Dispute, { foreignKey: 'orderId' });
Dispute.belongsTo(Order, { foreignKey: 'orderId' });

User.hasMany(Notification, { foreignKey: 'userId' });
Notification.belongsTo(User, { foreignKey: 'userId' });

Order.hasMany(Message, { foreignKey: 'orderId' });
Message.belongsTo(Order, { foreignKey: 'orderId' });

User.hasMany(Message, { foreignKey: 'senderId' });
Message.belongsTo(User, { foreignKey: 'senderId' });

module.exports = {
  sequelize,
  User,
  Customer,
  Freelancer,
  Admin,
  Category,
  Service,
  Order,
  Review,
  Dispute,
  Portfolio,
  Notification,
  Message,
};