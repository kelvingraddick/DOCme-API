const Sequelize = require('sequelize');

module.exports = (database) => {
  const Schedule = database.define('schedule',
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      doctor_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      sunday_availability_start_time: {
        type: Sequelize.TIME,
        allowNull: true
      },
      sunday_availability_end_time: {
        type: Sequelize.TIME,
        allowNull: true
      },
      sunday_break_start_time: {
        type: Sequelize.TIME,
        allowNull: true
      },
      sunday_break_end_time: {
        type: Sequelize.TIME,
        allowNull: true
      },
      monday_availability_start_time: {
        type: Sequelize.TIME,
        allowNull: true
      },
      monday_availability_end_time: {
        type: Sequelize.TIME,
        allowNull: true
      },
      monday_break_start_time: {
        type: Sequelize.TIME,
        allowNull: true
      },
      monday_break_end_time: {
        type: Sequelize.TIME,
        allowNull: true
      },
      tuesday_availability_start_time: {
        type: Sequelize.TIME,
        allowNull: true
      },
      tuesday_availability_end_time: {
        type: Sequelize.TIME,
        allowNull: true
      },
      tuesday_break_start_time: {
        type: Sequelize.TIME,
        allowNull: true
      },
      tuesday_break_end_time: {
        type: Sequelize.TIME,
        allowNull: true
      },
      wednesday_availability_start_time: {
        type: Sequelize.TIME,
        allowNull: true
      },
      wednesday_availability_end_time: {
        type: Sequelize.TIME,
        allowNull: true
      },
      wednesday_break_start_time: {
        type: Sequelize.TIME,
        allowNull: true
      },
      wednesday_break_end_time: {
        type: Sequelize.TIME,
        allowNull: true
      },
      thursday_availability_start_time: {
        type: Sequelize.TIME,
        allowNull: true
      },
      thursday_availability_end_time: {
        type: Sequelize.TIME,
        allowNull: true
      },
      thursday_break_start_time: {
        type: Sequelize.TIME,
        allowNull: true
      },
      thursday_break_end_time: {
        type: Sequelize.TIME,
        allowNull: true
      },
      friday_availability_start_time: {
        type: Sequelize.TIME,
        allowNull: true
      },
      friday_availability_end_time: {
        type: Sequelize.TIME,
        allowNull: true
      },
      friday_break_start_time: {
        type: Sequelize.TIME,
        allowNull: true
      },
      friday_break_end_time: {
        type: Sequelize.TIME,
        allowNull: true
      },
      saturday_availability_start_time: {
        type: Sequelize.TIME,
        allowNull: true
      },
      saturday_availability_end_time: {
        type: Sequelize.TIME,
        allowNull: true
      },
      saturday_break_start_time: {
        type: Sequelize.TIME,
        allowNull: true
      },
      saturday_break_end_time: {
        type: Sequelize.TIME,
        allowNull: true
      }
    }, {
      timestamps: false,
      underscored: true
    }
  );
  return Schedule;
};