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
Database.Specialty = require('../models/specialty')(Database);
Database.Schedule = require('../models/schedule')(Database);
Database.Appointment = require('../models/appointment')(Database);

Database.Image.belongsTo(Database.Doctor, { foreignKey: 'doctor_id' });
Database.Doctor.hasMany(Database.Image, { foreignKey: 'doctor_id' });

Database.Doctor.belongsTo(Database.Practice, { foreignKey: 'practice_id' });
Database.Practice.hasMany(Database.Doctor, { foreignKey: 'practice_id' });

Database.Schedule.belongsTo(Database.Doctor, { foreignKey: 'doctor_id' });
Database.Doctor.hasOne(Database.Schedule, { foreignKey: 'doctor_id' });

Database.Appointment.belongsTo(Database.Patient, { foreignKey: 'patient_id' });
Database.Patient.hasMany(Database.Appointment, { foreignKey: 'patient_id' });

Database.Appointment.belongsTo(Database.Doctor, { foreignKey: 'doctor_id' });
Database.Doctor.hasMany(Database.Appointment, { foreignKey: 'doctor_id' });

Database.Appointment.belongsTo(Database.Specialty, { foreignKey: 'specialty_id' });
Database.Specialty.hasMany(Database.Appointment, { foreignKey: 'specialty_id' });

module.exports = Database;