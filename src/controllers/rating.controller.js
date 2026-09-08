import { Rating, Store, User } from '../models/index.js';
import { catchAsync } from '../utils/catchAsync.js';

export const submitRating = catchAsync(async (req, res) => {
  const { rating } = req.body;
  const store = await Store.findByPk(req.params.storeId);
  if (!store) return res.status(404).json({ success: false, message: 'Store not found' });
  const [entry, created] = await Rating.findOrCreate({ where: { userId: req.user.userId, storeId: store.id }, defaults: { rating } });
  if (!created) { entry.rating = rating; await entry.save(); }
  return res.status(created ? 201 : 200).json({ success: true, message: created ? 'Rating submitted' : 'Rating updated', data: entry });
});

export const listStoreRatings = catchAsync(async (req, res) => {
  const store = await Store.findOne({ where: { id: req.params.storeId, ownerId: req.user.userId } });
  if (!store) return res.status(404).json({ success: false, message: 'Store not found' });
  const ratings = await Rating.findAll({ where: { storeId: store.id }, include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email', 'address'] }], order: [['createdAt', 'DESC']] });
  const average = ratings.length ? ratings.reduce((sum, item) => sum + item.rating, 0) / ratings.length : 0;
  return res.json({ success: true, data: { store, averageRating: Number(average.toFixed(2)), ratings } });
});
