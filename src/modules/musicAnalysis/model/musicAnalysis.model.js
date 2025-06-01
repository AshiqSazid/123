import { DataTypes } from "@sequelize/core";
import { sequelize } from "../../../config/db.config.js";

const MusicAnalysis = sequelize.define(
  "MusicAnalysis",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    uplifting: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0
    },
    distracting: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0
    },
    reappraisal: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0
    },
    motivating: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0
    },
    relaxing: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0
    },
    suppressing: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0
    },
    destressing: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0
    },
    request_id: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: 'UploadMusics',
        key: 'request_id'
      }
    }, user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'User',
        key: 'id'
      }
    }
  },
  {
    tableName: "MusicAnalysis",
    timestamps: true
  }
);



export default MusicAnalysis;