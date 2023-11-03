'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.addColumn(
        'stories', // table name
        'spam', // new field name
        {
          type: Sequelize.DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
        },
      ),
      queryInterface.addColumn(
        'stories',
        'verification',
        {
          type: Sequelize.DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
        },
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
