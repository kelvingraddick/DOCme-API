const Sequelize = require('sequelize');

module.exports = (database) => {
  const Doctor = database.define('doctor',
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      practice_id: {
        type: Sequelize.INTEGER,
        allowNull: true
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
      race: {
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
      },
      stripe_customer_id: {
        type: Sequelize.STRING,
        allowNull: true
      },
      stripe_plan_id: {
        type: Sequelize.STRING,
        allowNull: true
      },
      stripe_subscription_status: {
        type: Sequelize.STRING,
        allowNull: true
      }
    }, {
      timestamps: false,
      underscored: true
    }
  );
  return Doctor;
};