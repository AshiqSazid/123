"use strict";

/** @type {import('sequelize-cli').Migration} */
export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable("FeatureSettings", {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER,
    },
    settings: {
      type: Sequelize.TEXT,
      allowNull: false,
      defaultValue: JSON.stringify({
        EmotionAnalysis: false,
        EmotionTagging: false,
        TargetAudience: false,
        PlaylistRecommendations: false,
        MusicImprovementRecommendation: false,
        CollaborationMatching: false,
        TrendAnalysis: false
      })
    },
    createdAt: {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    },
    updatedAt: {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
    }
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.dropTable("FeatureSettings");
}