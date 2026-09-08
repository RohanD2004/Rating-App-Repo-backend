import { DataTypes } from 'sequelize';
import { sequelize } from '../db/db-utils.js';

const Rating = sequelize.define('Rating', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: { min: 1, max: 5 }
  },
  // Explicitly define these to match the index below
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'userId' // Ensures the DB column name matches
  },
  storeId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'storeId'
  }
}, {
  timestamps: true,
  tableName: 'ratings',
  indexes: [
    {
      unique: true,
      fields: ['userId', 'storeId'], // These MUST match the keys above
      name: 'unique_user_store_rating'
    }
  ]
});

export default Rating;