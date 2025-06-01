'use strict';

/** @type {import('sequelize-cli').Migration} */

export async function up(queryInterface, Sequelize) {

  await queryInterface.addColumn('Users', 'googleId', {
    type: Sequelize.STRING,
    unique: true,
    allowNull: true,
  });
  await queryInterface.addColumn('Users', 'authProvider', {
    type: Sequelize.ENUM('local', 'google'),
    defaultValue: 'local',
  });
  await queryInterface.addColumn('Users', 'isVerified', {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
  });
  await queryInterface.addColumn('Users', 'accessToken', {
    type: Sequelize.STRING,
    allowNull: true,
  });
};
export async function down(queryInterface) {
  await queryInterface.removeColumn('Users', 'googleId');
  await queryInterface.removeColumn('Users', 'authProvider');
  await queryInterface.removeColumn('Users', 'isVerified');
  await queryInterface.removeColumn('Users', 'accessToken');
}