import User from './user.js';
import Store from './Store.js';
import Rating from './Rating.js';

// 1. Store Owner Relationship
User.hasOne(Store, { foreignKey: 'ownerId', as: 'managedStore' });
Store.belongsTo(User, { foreignKey: 'ownerId', as: 'owner' });

// 2. User to Rating Relationship
User.hasMany(Rating, { foreignKey: 'userId' });
Rating.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// 3. Store to Rating Relationship
Store.hasMany(Rating, { foreignKey: 'storeId' });
Rating.belongsTo(Store, { foreignKey: 'storeId', as: 'store' });

export { User, Store, Rating };