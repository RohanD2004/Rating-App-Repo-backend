import { Router } from 'express';
import { login, register, getProfile, updatePassword } from '../../controllers/auth.controller.js';
import { authenticateJWT } from '../../middlewares/auth.middleware.js';

const router = Router();

router.post('/register', register);

router.post('/login', login);

router.get('/profile', authenticateJWT, getProfile);
router.patch('/password', authenticateJWT, updatePassword);

export default router;