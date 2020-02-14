const Sequelize = require('sequelize');
var Database = require('../helpers/database');

const Doctor = Database.define('doctor',
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      allowNull: false
    },
    is_approved: {
      type: Sequelize.BOOLEAN,
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
    },
    phone_number: {
      type: Sequelize.STRING,
      allowNull: true
    },
    image_url: {
      type: Sequelize.STRING,
      allowNull: true
    },
    description: {
      type: Sequelize.STRING,
      allowNull: true
    },
    gender: {
      type: Sequelize.STRING,
      allowNull: true
    },
    birth_date: {
      type: Sequelize.DATE,
      allowNull: true
    },
    npi_number: {
      type: Sequelize.STRING,
      allowNull: true
    }
  }, {
    timestamps: false
  }
);

module.exports = Doctor;