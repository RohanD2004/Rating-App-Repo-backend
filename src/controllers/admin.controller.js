import bcrypt from 'bcryptjs';
import { Op, fn, col } from 'sequelize';
import { Rating, Store, User } from '../models/index.js';
import { catchAsync } from '../utils/catchAsync.js';

const safeUser = (user) => { const value = user.toJSON(); delete value.password; return value; };

export const dashboard = catchAsync(async (req, res) => {
    const [users, stores, ratings] = await Promise.all([User.count(), Store.count(), Rating.count()]);
    return res.json({ success: true, data: { totalUsers: users, totalStores: stores, totalRatings: ratings } });
});

export const listUsers = catchAsync(async (req, res) => {
    const { name, email, address, role, sortBy = 'name', sortOrder = 'ASC' } = req.query;
    const where = {};
    if (name) where.name = { [Op.iLike]: `%${name}%` };
    if (email) where.email = { [Op.iLike]: `%${email}%` };
    if (address) where.address = { [Op.iLike]: `%${address}%` };
    if (role) where.role = role;
    const allowed = ['name', 'email', 'address', 'role', 'createdAt'];
    const field = allowed.includes(sortBy) ? sortBy : 'name';
    const direction = String(sortOrder).toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    const users = await User.findAll({ where, order: [[field, direction]], attributes: { exclude: ['password'] }, include: [{ model: Store, as: 'managedStore', attributes: ['id', 'name'], required: false }] });
    return res.json({ success: true, data: users });
});

export const listStores = catchAsync(async (req, res) => {
    const { name, email, address, sortBy = 'name', sortOrder = 'ASC' } = req.query;
    const where = {};
    if (name) where.name = { [Op.iLike]: `%${name}%` };
    if (email) where.email = { [Op.iLike]: `%${email}%` };
    if (address) where.address = { [Op.iLike]: `%${address}%` };
    const allowed = ['name', 'email', 'address', 'createdAt'];
    const field = allowed.includes(sortBy) ? sortBy : 'name';
    const direction = String(sortOrder).toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    const stores = await Store.findAll({ where, order: [[field, direction]], attributes: ['id', 'name', 'email', 'address', 'ownerId', 'createdAt', [fn('ROUND', fn('COALESCE', fn('AVG', col('Ratings.rating')), 0), 1), 'overallRating']], include: [{ model: Rating, attributes: [], required: false }], group: ['Store.id', 'Store.createdAt'] });
    return res.json({ success: true, data: stores });
});

export const createUser = catchAsync(async (req, res) => {
    const { name, email, password, address, role = 'User' } = req.body;
    if (!['Admin', 'User', 'StoreOwner'].includes(role)) return res.status(400).json({ success: false, message: 'Invalid role' });
    if (!name || name.length < 20 || name.length > 60) return res.status(400).json({ success: false, message: 'Name must be between 20 and 60 characters' });
    if (address && address.length > 400) return res.status(400).json({ success: false, message: 'Address must be at most 400 characters' });
    const user = await User.create({ name, email, address, role, password: await bcrypt.hash(password, 10) });
    return res.status(201).json({ success: true, data: safeUser(user) });
});

export const createStore = catchAsync(async (req, res) => {
    const owner = await User.findOne({ where: { id: req.body.ownerId, role: 'StoreOwner' } });
    if (!owner) return res.status(400).json({ success: false, message: 'ownerId must belong to a store owner' });
    const store = await Store.create(req.body);
    return res.status(201).json({ success: true, data: store });
});

export const getUser = catchAsync(async (req, res) => {
    const user = await User.findByPk(req.params.userId, { attributes: { exclude: ['password'] }, include: [{ model: Store, as: 'managedStore', attributes: ['id', 'name'], required: false }] });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    const data = user.toJSON();
    if (data.role === 'StoreOwner' && data.managedStore) {
        const result = await Rating.findOne({ where: { storeId: data.managedStore.id }, attributes: [[fn('COALESCE', fn('AVG', col('rating')), 0), 'averageRating']], raw: true });
        data.managedStore.averageRating = Number(result.averageRating);
    }
    return res.json({ success: true, data });
});