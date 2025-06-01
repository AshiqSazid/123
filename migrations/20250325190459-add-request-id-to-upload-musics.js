"use strict";


/** @type {import('sequelize-cli').Migration} */
export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable("MusicAnalysis", {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER,
    },
    uplifting: {
      type: Sequelize.FLOAT,
      allowNull: false,
      defaultValue: 0
    },
    distracting: {
      type: Sequelize.FLOAT,
      allowNull: false,
      defaultValue: 0
    },
    reappraisal: {
      type: Sequelize.FLOAT,
      allowNull: false,
      defaultValue: 0
    },
    motivating: {
      type: Sequelize.FLOAT,
      allowNull: false,
      defaultValue: 0
    },relaxing: {
      type: Sequelize.FLOAT,
      allowNull: false,
      defaultValue: 0
    },suppressing:{
      type: Sequelize.FLOAT,
      allowNull: false,
      defaultValue: 0
    },
    user_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    request_id: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    createdAt: {
      allowNull: false,
      type: Sequelize.DATE,
    },
    updatedAt: {
      allowNull: false,
      type: Sequelize.DATE,
    },
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.dropTable("MusicAnalysis");
}
