'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('user_table', {
      email: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      password: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      user_verify: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      username: {
        type: Sequelize.STRING,
        allowNull: false
      },
      user_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
        primaryKey: true
      },
      role: {
        type: Sequelize.STRING(255),
        defaultValue: 'user'
      },
      ban: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      create_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      first_login: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('user_table');
  }
};
