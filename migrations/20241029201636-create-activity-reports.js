'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('activity_reports', {
      report_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
        primaryKey: true,
        allowNull: false,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'user_table',
          key: 'user_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      selected_files: {
        type: Sequelize.JSON, // ใช้ JSON เพื่อเก็บไฟล์ที่เลือก
        allowNull: false,
      },
      total_time: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },
      word_count: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },
      coins_earned: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },
      timestamp: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },
      code_references: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },
      paste_count: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('activity_reports'); // ลบตารางเมื่อไม่ต้องการ
  }
};
