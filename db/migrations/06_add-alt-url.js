const { STRING } = require('sequelize'); // import DataTypes

module.exports = {
  up: async (query) => {
    await query.addColumn('apps', 'urlAlt', {
      type: STRING,
      allowNull: true,
    });
  },

  down: async (query) => {
    await query.removeColumn('apps', 'urlAlt');
  },
};
