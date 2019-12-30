const Sequelize = require('sequelize');
var Database = require('../helpers/database');

const Specialty = Database.define('specialty',
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

module.exports = Specialty;