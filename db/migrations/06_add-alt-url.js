const { STRING } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if column already exists
    const tableDesc = await queryInterface.describeTable('apps');

    if (!tableDesc.urlAlt) {
      await queryInterface.addColumn('apps', 'urlAlt', {
        type: STRING,
        allowNull: true,
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    const tableDesc = await queryInterface.describeTable('apps');

    if (tableDesc.urlAlt) {
      await queryInterface.removeColumn('apps', 'urlAlt');
    }
  },
};
