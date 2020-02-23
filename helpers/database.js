const Sequelize = require('sequelize');

const Database = new Sequelize(process.env.DATABASE_NAME, process.env.DATABASE_USERNAME, process.env.DATABASE_PASSWORD, {
  host: process.env.DATABASE_HOST,
  dialect: 'mysql',
  port: 3306,
  timestamps: false
});

Database.Doctor = require('../models/doctor')(Database);
Database.Practice = require('../models/practice')(Database);

Database.Doctor.belongsTo(Database.Practice, { foreignKey: 'practice_id' });
Database.Practice.hasMany(Database.Doctor, { foreignKey: 'id' });

module.exports = Database;