const Sequelize = require('sequelize');
var Database = require('../helpers/database');

const InsurancePlan = Database.define('insurance_plan',
  {
    id: {
      type: Sequelize.INTEGER,
			primaryKey: true,
			autoIncrement: true,
      allowNull: false
    },
    insurance_carrier_id: {
			type: Sequelize.INTEGER,
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

module.exports = InsurancePlan;