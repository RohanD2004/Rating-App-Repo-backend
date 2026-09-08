import express from 'express';
import { listStores } from '../../controllers/store.controller.js';
import { submitRating } from '../../controllers/rating.controller.js';
import { authenticateJWT } from '../../middlewares/auth.middleware.js';
import { validate } from '../../middlewares/validate.js';
import { storeQuerySchema, submitRatingSchema } from '../../validator/storeValidator.js';

const router = express.Router();

router.get('/', authenticateJWT, validate(storeQuerySchema), listStores);

router.post('/:storeId/ratings', authenticateJWT, validate(submitRatingSchema), submitRating);
export default router;