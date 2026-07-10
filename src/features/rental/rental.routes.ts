import { Router } from 'express';
import { createRental, getUserRentals, getRentalById, cancelRental } from './rental.controller.js';
import { authenticate } from '../../middleware/auth.js';

const router = Router();

router.post('/', authenticate, createRental);
router.get('/', authenticate, getUserRentals);
router.get('/:id', authenticate, getRentalById);
router.post('/:id/cancel', authenticate, cancelRental);

export default router;
