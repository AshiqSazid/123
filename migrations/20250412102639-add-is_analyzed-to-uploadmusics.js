'use strict';

/** @type {import('sequelize-cli').Migration} */

export async function up(queryInterface, Sequelize) {
  await queryInterface.addColumn('UploadMusics', 'is_analyzed', {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false
  });
}
export async function down(queryInterface, Sequelize) {
  await queryInterface.removeColumn('UploadMusics', 'is_analyzed');
}