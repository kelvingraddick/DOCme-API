const Sequelize = require('sequelize');

module.exports = (database) => {
  const Patient = database.define('patient',
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      is_active: {
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
      gender: {
        type: Sequelize.STRING,
        allowNull: true
      },
      race: {
        type: Sequelize.STRING,
        allowNull: true
      },
      image_url: {
        type: Sequelize.STRING,
        allowNull: true
      },
      reset_password_code: {
        type: Sequelize.STRING,
        allowNull: true
      },
      reset_password_timestamp: {
        type: Sequelize.DATE,
        allowNull: true
      }
    }, {
      timestamps: false
    }
  );
  return Patient;
}