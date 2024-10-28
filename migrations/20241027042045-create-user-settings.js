'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('user_settings', {
      user_id: {
        type: Sequelize.UUID,
        primaryKey: true,
        references: {
          model: 'user_table',
          key: 'user_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      selected_pet_id: {
        type: Sequelize.INTEGER
      },
      theme_preference: {
        type: Sequelize.STRING(50),
        defaultValue: 'default'
      },
      notification_enabled: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      language_preference: {
        type: Sequelize.STRING(10),
        defaultValue: 'en'
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('user_settings');
  }
};
