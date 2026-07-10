import { Router } from 'express';
import { getStripeConfig, createPaymentIntent, confirmPayment, getUserPayments, getPaymentById, handleStripeWebhook } from './payment.controller.js';
import { authenticate } from '../../middleware/auth.js';

const router = Router();

router.get('/config', getStripeConfig);
router.post('/create', authenticate, createPaymentIntent);
router.post('/confirm', authenticate, confirmPayment);
router.post('/webhook', handleStripeWebhook);
router.get('/', authenticate, getUserPayments);
router.get('/:id', authenticate, getPaymentById);

export default router;
