const Sequelize = require('sequelize');
var Database = require('../helpers/database');

const InsuranceCarrier = Database.define('insurance_carrier',
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    external_id: {
      type: Sequelize.STRING,
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

module.exports = InsuranceCarrier;