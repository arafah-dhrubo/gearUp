import { Router } from 'express';
import { getUsers, updateUserStatus, getAllGear, getAllRentals, adminUpdateRentalStatus, createCategory, updateCategory, deleteCategory } from './admin.controller.js';
import { authenticate, authorize } from '../../middleware/auth.js';

const router = Router();

router.get('/users', authenticate, authorize('ADMIN'), getUsers);
router.patch('/users/:id', authenticate, authorize('ADMIN'), updateUserStatus);
router.get('/gear', authenticate, authorize('ADMIN'), getAllGear);
router.get('/rentals', authenticate, authorize('ADMIN'), getAllRentals);
router.patch('/rentals/:id', authenticate, authorize('ADMIN'), adminUpdateRentalStatus);
router.post('/categories', authenticate, authorize('ADMIN'), createCategory);
router.put('/categories/:id', authenticate, authorize('ADMIN'), updateCategory);
router.delete('/categories/:id', authenticate, authorize('ADMIN'), deleteCategory);

export default router;
