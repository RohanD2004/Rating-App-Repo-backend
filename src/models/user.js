import { DataTypes } from 'sequelize';
import { sequelize } from '../db/db-utils.js';

const User = sequelize.define('User', {
    // ID is created automatically by Sequelize
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { len: [20, 60] } 
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: { isEmail: true }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    address: {
        type: DataTypes.STRING,
        validate: { len: [0, 400] }
    },
    role: {
        type: DataTypes.ENUM('Admin', 'User', 'StoreOwner'),
        allowNull: false,
        defaultValue: 'User'
    }
});

export default User;