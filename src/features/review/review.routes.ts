import { Router } from 'express';
import { createReview } from './review.controller.js';
import { authenticate } from '../../middleware/auth.js';

const router = Router();

router.post('/', authenticate, createReview);

export default router;
