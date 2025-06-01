import bcrypt from "bcryptjs";
import { sequelize } from "../../../config/db.config.js";
import { DataTypes } from "@sequelize/core";

// Define the User model
const User = sequelize.define(
  "User",
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true, // Changed to allow null for Google auth users
    },
    avatar: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    googleId: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: true,
    },
    authProvider: {
      type: DataTypes.ENUM('local', 'google'),
      defaultValue: 'local',
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    accessToken: {
      type: DataTypes.STRING,
      allowNull: true,
    }
  },
  {
    defaultScope: {
      attributes: { exclude: ["password"] },
    },
    scopes: {
      withPassword: {
        attributes: {
          include: ["password"]
        }
      },
    },
    tableName: "Users",
    timestamps: true,
  }
);

// Hash the password only if it's provided (for local auth)
User.beforeCreate(async (user) => {
  if (user.password && user.authProvider === 'local') {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
  }
});

User.beforeUpdate(async (user) => {
  if (user.changed('password') && user.authProvider === 'local') {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
  }
});

// Custom method to validate password (for local auth)
User.prototype.isValidPassword = async function (enteredPassword) {
  if (this.authProvider !== 'local') {
    throw new Error('This account uses social login');
  }
  return bcrypt.compare(enteredPassword, this.password);
};

// Remove sensitive data from responses
User.prototype.toJSON = function () {
  const values = { ...this.get() };
  delete values.password;
  return values;
};

export default User;