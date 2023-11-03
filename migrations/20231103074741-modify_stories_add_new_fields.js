module.exports = {
  up: async (queryInterface, DataTypes) => {
    await queryInterface.addColumn('story', 'spam', {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('story', 'spam');
  },
};