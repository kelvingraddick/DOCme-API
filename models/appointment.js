const Sequelize = require('sequelize');

module.exports = (database) => {
  const Appointment = database.define('appointment',
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      patient_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      doctor_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      specialty_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      timestamp: {
        type: Sequelize.DATE,
        allowNull: false
      },
      is_new_patient: {
        type: Sequelize.BOOLEAN,
        allowNull: false
      },
      notes: {
        type: Sequelize.STRING,
        allowNull: true
      }
    }, {
      timestamps: false,
      underscored: true
    }
  );
  return Appointment;
};