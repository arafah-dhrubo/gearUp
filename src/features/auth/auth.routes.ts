import { Router } from 'express';
import { register, login, getMe, updateProfileHandler, updatePasswordHandler } from './auth.controller.js';
import { authenticate } from '../../middleware/auth.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticate, getMe);
router.put('/profile', authenticate, updateProfileHandler);
router.put('/password', authenticate, updatePasswordHandler);

export default router;
