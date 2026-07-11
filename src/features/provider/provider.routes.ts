import { Router } from 'express';
import { addGear, updateGear, deleteGear, getProviderOrders, updateRentalStatus } from './provider.controller.js';
import { authenticate, authorize } from '../../middleware/auth.js';

const router = Router();

router.post('/gear', authenticate, authorize('PROVIDER'), addGear);
router.put('/gear/:id', authenticate, authorize('PROVIDER'), updateGear);
router.delete('/gear/:id', authenticate, authorize('PROVIDER'), deleteGear);
router.get('/orders', authenticate, authorize('PROVIDER'), getProviderOrders);
router.patch('/orders/:id', authenticate, authorize('PROVIDER'), updateRentalStatus);

export default router;
