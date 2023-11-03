'use strict';
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize(process.env.HEROKU_POSTGRESQL_OLIVE_URL, {
  dialect: 'postgres',
  protocol: 'postgres',
  dialectOptions: {
      ssl: {
          require: true,
          rejectUnauthorized: false
      }
  }
});
const queryInterface = sequelize.getQueryInterface();
module.exports = {
  async up (queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.addColumn(
        "Story", // table name
        "spam", // new field name
        {
          type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false,
        },{
          freezeTableName: true
        }
      ),
      queryInterface.addColumn(
        "Story",
        "verification",
        {
          type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false,
        },{
          freezeTableName: true
        }
      ),
    ]);
  },

  async down (queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.removeColumn('stories', 'spam'),
      queryInterface.removeColumn('stories', 'verification'),
    ]);
  }
};
