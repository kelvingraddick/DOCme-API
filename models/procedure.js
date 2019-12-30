const Sequelize = require('sequelize');
var Database = require('../helpers/database');

const Procedure = Database.define('procedure',
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

module.exports = Procedure;