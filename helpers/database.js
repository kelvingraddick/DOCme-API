const Sequelize = require('sequelize');

const Database = new Sequelize(process.env.DATABASE_NAME, process.env.DATABASE_USERNAME, process.env.DATABASE_PASSWORD, {
  host: process.env.DATABASE_HOST,
  dialect: 'mysql',
  port: 3306,
  timestamps: false
});

Database.Patient = require('../models/patient')(Database);
Database.Doctor = require('../models/doctor')(Database);
Database.Image = require('../models/image')(Database);
Database.Practice = require('../models/practice')(Database);
Database.Schedule = require('../models/schedule')(Database);

Database.Image.belongsTo(Database.Doctor, { foreignKey: 'doctor_id' });
Database.Doctor.hasMany(Database.Image, { foreignKey: 'doctor_id' });

Database.Doctor.belongsTo(Database.Practice, { foreignKey: 'practice_id' });
Database.Practice.hasMany(Database.Doctor, { foreignKey: 'practice_id' });

Database.Schedule.belongsTo(Database.Doctor, { foreignKey: 'doctor_id' });
Database.Doctor.hasOne(Database.Schedule, { foreignKey: 'doctor_id' });

module.exports = Database;