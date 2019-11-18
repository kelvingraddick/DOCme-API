const Sequelize = require('sequelize');

const Database = new Sequelize('database', 'username', 'password', {
  host: 'host',
  dialect: 'mysql',
  port: 3306,
  timestamps: false
});

module.exports = Database;