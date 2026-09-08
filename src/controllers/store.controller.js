import { Op, fn, col } from 'sequelize';
import { Rating, Store } from '../models/index.js';
import { catchAsync } from '../utils/catchAsync.js';

const sortableFields = new Set(['name', 'email', 'address', 'createdAt']);

export const listStores = catchAsync(async (req, res) => {
  const { search, page = 1, limit = 20, sortBy = 'name', sortOrder = 'ASC' } = req.query;
  const safePage = Math.max(Number(page), 1);
  const safeLimit = Math.min(Math.max(Number(limit), 1), 100);
  const where = search ? { [Op.or]: [{ name: { [Op.iLike]: `%${search}%` } }, { address: { [Op.iLike]: `%${search}%` } }] } : {};
  const orderField = sortableFields.has(sortBy) ? sortBy : 'name';
  const direction = String(sortOrder).toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
  const rows = await Store.findAll({
    where,
    offset: (safePage - 1) * safeLimit,
    limit: safeLimit,
    order: [[orderField, direction]],
    attributes: ['id', 'name', 'email', 'address', 'ownerId', [fn('ROUND', fn('COALESCE', fn('AVG', col('Ratings.rating')), 0), 1), 'overallRating']],
    include: [{ model: Rating, attributes: [], required: false }],
    group: ['Store.id'],
    subQuery: false
  });
  const total = await Store.count({ where });
  const userRatings = await Rating.findAll({ where: { userId: req.user.userId }, attributes: ['storeId', 'rating'], raw: true });
  const ratingMap = new Map(userRatings.map((item) => [item.storeId, item.rating]));
  return res.json({
    success: true,
    data: {
      items: rows.map((store) => ({ ...store.toJSON(), userRating: ratingMap.get(store.id) || null })),
      pagination: { page: safePage, limit: safeLimit, totalItems: total, totalPages: Math.ceil(total / safeLimit) }
    }
  });
});

export const createStore = catchAsync(async (req, res) => {
  const store = await Store.create(req.body);
  return res.status(201).json({ success: true, data: store });
});
