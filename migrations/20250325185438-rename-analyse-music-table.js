"use strict";


/** @type {import('sequelize-cli').Migration} */
export async function up(queryInterface, Sequelize) {
  // Transaction for safety
  const transaction = await queryInterface.sequelize.transaction();
  try {
    // Remove old columns
    await queryInterface.renameTable('AnalyseMusic', 'UploadMusics', { transaction });
  } catch (err) {
    await transaction.rollback();
    throw err;
  }
}


export async function down(queryInterface, Sequelize) {
  try {
    // Remove old columns
    await queryInterface.renameTable('UploadMusics', 'AnalyseMusic');
  } catch (err) {
    await transaction.rollback();
    throw err;
  }
}
