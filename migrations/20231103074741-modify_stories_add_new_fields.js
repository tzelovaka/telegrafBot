'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.addColumn(
        'story', // table name
        'spam', // new field name
        {
          type: Sequelize.DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
        },
      ),
      queryInterface.addColumn(
        'story',
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
      queryInterface.removeColumn('story', 'spam'),
      queryInterface.removeColumn('story', 'verification'),
    ]);
  }
};
