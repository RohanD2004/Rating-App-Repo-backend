import { Router } from 'express';
import { authorize, authenticateJWT } from '../../middlewares/auth.middleware.js';
import { createStore, createUser, dashboard, getUser, listStores, listUsers } from '../../controllers/admin.controller.js';

const router = Router();
router.use(authenticateJWT, authorize('Admin'));
router.get('/dashboard', dashboard);
router.get('/users', listUsers);
router.get('/users/:userId', getUser);
router.post('/users', createUser);
router.get('/stores', listStores);
router.post('/stores', createStore);

export default router;