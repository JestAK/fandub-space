const dotenv = require('dotenv');
dotenv.config();
const sequelize = require("../config/database");
const {DataTypes} = require("sequelize");
const User = require("./User");

const RefreshToken = sequelize.define('RefreshToken', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    token: {
        type: DataTypes.STRING,
        allowNull: false
    },
    expiresAt: {
        type: DataTypes.DATE,
        allowNull: false
    }
});

User.hasMany(RefreshToken, { onDelete: 'CASCADE' });
RefreshToken.belongsTo(User);

module.exports = RefreshToken;