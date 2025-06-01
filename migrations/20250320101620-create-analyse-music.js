"use strict";


/** @type {import('sequelize-cli').Migration} */
export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable("AnalyseMusic", {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER,
    },
    title: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    music_file_path: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    youtube_link: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    analyse_result: {
      type: Sequelize.JSON,
      allowNull: true,
    },
    analyse_status: {
      type: Sequelize.ENUM("pending", "completed"),
      allowNull: false,
      defaultValue: "pending",
    }, user_id: {
      type: Sequelize.INTEGER,
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
  await queryInterface.dropTable("AnalyseMusic");
}