import { DataTypes } from "@sequelize/core";
import { sequelize } from "../../../config/db.config.js";

const FeatureSettings = sequelize.define('FeatureSettings', {
    settings: {
        type: DataTypes.TEXT,
        allowNull: false,
        defaultValue: JSON.stringify({
            EmotionAnalysis: false,
            EmotionTagging: false,
            TargetAudience: false,
            PlaylistRecommendations: false,
            MusicImprovementRecommendation: false,
            CollaborationMatching: false,
            TrendAnalysis: false
        }),
        get() {
            const rawValue = this.getDataValue('settings');
            return rawValue ? JSON.parse(rawValue) : null;
        },
        set(value) {
            this.setDataValue('settings', JSON.stringify(value));
        }
    }
}, {
    tableName: 'FeatureSettings',
    timestamps: true
});

export default FeatureSettings;