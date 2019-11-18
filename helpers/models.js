const Sequelize = require('sequelize');
var Database = require('./database');

const User = Database.define('user',
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      allowNull: false
    },
    first_name: {
      type: Sequelize.STRING,
      allowNull: false
    },
    last_name: {
      type: Sequelize.STRING,
      allowNull: false
    },
    email_address: {
      type: Sequelize.STRING,
      allowNull: false
    },
    password: {
      type: Sequelize.STRING,
      allowNull: false
    }
  }, {
    timestamps: false
  }
);

module.exports = User;