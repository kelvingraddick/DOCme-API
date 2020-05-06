const Sequelize = require('sequelize');

module.exports = (database) => {
  const Specialty = database.define('specialty',
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      }
    }, {
      timestamps: false
    }
  );
  return Specialty;
};