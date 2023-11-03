'use strict';
const { Sequelize, DataTypes } = require('sequelize');
module.exports = {
  /**
   * @description Up.
   * @param {QueryInterface} queryInterface
   * @return Promise<void>
   */
  up: async (queryInterface) => {
    const tableDefinition =  await queryInterface.describeTable("public.stories");
    const promises = [];

    return queryInterface.sequelize.transaction((transaction) => {
      if (!tableDefinition.column1) {
        promises.push(queryInterface.addColumn(
          "public.stories",
          'spam',
          {
            type: queryInterface.sequelize.Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false,
            allowNull: true,
          },
          {transaction},
        ));
      }

      if (!tableDefinition.oauth2_token_expire_at) {
        promises.push(queryInterface.addColumn(
          "public.stories",
          'verification',
          {
            type: queryInterface.sequelize.Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false,
          },
          {transaction},
        ));
      }

      return Promise.all(promises);
    });
  },
  /**
   * @description Down.
   * @param {QueryInterface} queryInterface
   * @return Promise<void>
   */
  down: (queryInterface) => {
    return Promise.all([
      queryInterface.removeColumn('stories', 'spam'),
      queryInterface.removeColumn('stories', 'verification'),
    ]);
  },
};
