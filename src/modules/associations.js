import UploadMusics from "./uploadMusics/model/uploadMusics.model.js";
import User from "./user/model/user.model.js";


// User to UploadMusics (one-to-many)
User.hasMany(UploadMusics, {
    foreignKey: {
        name: 'user_id',
        allowNull: false,
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    },
    sourceKey: 'id',
    as: 'uploadMusics',
    hooks: false,
});

// UploadMusics to User (many-to-one)
UploadMusics.belongsTo(User, {
    foreignKey: {
        name: 'user_id', // Matches the foreignKey exactly
        allowNull: false, // These configurations must be the same
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    },
    targetKey: 'id',
    as: 'user', // Matches the alias defined in hasMany
    hooks: false,
});








export {
    UploadMusics, User
};
