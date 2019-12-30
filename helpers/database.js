const Sequelize = require('sequelize');

const Database = new Sequelize(process.env.DATABASE_NAME, process.env.DATABASE_USERNAME, process.env.DATABASE_PASSWORD, {
  host: process.env.DATABASE_HOST,
  dialect: 'mysql',
  port: 3306,
  timestamps: false
});

module.exports = Database;