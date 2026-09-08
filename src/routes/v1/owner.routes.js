import { Router } from 'express';
import { listStoreRatings } from '../../controllers/rating.controller.js';
import { authenticateJWT, authorize } from '../../middlewares/auth.middleware.js';

const router = Router();
router.use(authenticateJWT, authorize('StoreOwner'));
router.get('/stores/:storeId/ratings', listStoreRatings);

export default router;