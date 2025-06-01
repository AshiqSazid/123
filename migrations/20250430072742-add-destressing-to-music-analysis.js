'use strict';

/** @type {import('sequelize-cli').Migration} */

export async function up(queryInterface, Sequelize) {
  await queryInterface.addColumn('MusicAnalysis', 'destressing', {
    type: Sequelize.FLOAT,
    allowNull: false,
    defaultValue: 0
  });
}
export async function down(queryInterface) {
  await queryInterface.removeColumn('MusicAnalysis', 'destressing');
}