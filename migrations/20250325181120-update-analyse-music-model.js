"use strict";


/** @type {import('sequelize-cli').Migration} */
export async function up(queryInterface, Sequelize) {
    // Transaction for safety
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // Remove old columns
      await queryInterface.removeColumn('AnalyseMusic', 'analyse_result', { transaction });
      await queryInterface.removeColumn('AnalyseMusic', 'analyse_status', { transaction });

      // Add new column
      await queryInterface.addColumn('AnalyseMusic', 'request_id', {
        type: Sequelize.STRING,
        allowNull: false,
      }, { transaction });

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
}


export async function down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // Revert changes - add back old columns
      await queryInterface.addColumn('AnalyseMusic', 'analyse_result', {
        type: Sequelize.JSON,
        allowNull: true,
      }, { transaction });

      await queryInterface.addColumn('AnalyseMusic', 'analyse_status', {
        type: Sequelize.ENUM('pending', 'completed'),
        allowNull: false,
        defaultValue: 'pending',
      }, { transaction });

      // Remove the new column
      await queryInterface.removeColumn('AnalyseMusic', 'request_id', { transaction });

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }
