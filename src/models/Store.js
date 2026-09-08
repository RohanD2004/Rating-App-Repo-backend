import { DataTypes } from 'sequelize';
import { sequelize } from '../db/db-utils.js';

/**
 * Store Model
 * Requirements: Name (20-60 chars), Address (Max 400 chars)
 */
const Store = sequelize.define('Store', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    readOnly: true
  },
  name: {
    type: DataTypes.STRING(60),
    allowNull: false,
    validate: {
      len: {
        args: [20, 60],
        msg: "Store name must be between 20 and 60 characters"
      }
    }
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  address: {
    type: DataTypes.STRING(400),
    allowNull: false,
    validate: {
      len: [0, 400]
    }
  },
  ownerId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
}, {
  timestamps: true,
  tableName: 'stores'
});

export default Store;