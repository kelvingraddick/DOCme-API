const Sequelize = require('sequelize');

module.exports = (database) => {
  const Image = database.define('image',
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false
      },
      doctor_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      image_url: {
        type: Sequelize.STRING,
        allowNull: false
      },
      description: {
        type: Sequelize.STRING,
        allowNull: true
      }
    }, {
      timestamps: false,
      underscored: true
    }
  );
  return Image;
};