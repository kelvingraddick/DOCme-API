const Sequelize = require('sequelize');

module.exports = (database) => {
  const DoctorSpecialty = database.define('doctor_specialty',
    {
      doctor_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false
      },
      specialty_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false
      }
    }, {
      timestamps: false,
      underscored: true
    }
  );
  return DoctorSpecialty;
};