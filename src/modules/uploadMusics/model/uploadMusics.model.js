import { DataTypes } from "@sequelize/core";
import { sequelize } from "../../../config/db.config.js";


const UploadMusics = sequelize.define(
    "UploadMusics",
    {
        title: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        music_file_path: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        youtube_link: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        request_id: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        is_analyzed: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
    },
    {
        tableName: "UploadMusics",
        timestamps: true,
    },
);

export default UploadMusics;