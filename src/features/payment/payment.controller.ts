import { Request, Response, NextFunction } from 'express';
import { AuthRequest, RawBodyRequest } from '../../types/index.js';
import { sendSuccess, sendError } from '../../utils/response.js';
import { config } from '../../config/index.js';
import * as paymentService from './payment.service.js';

export const getStripeConfig = (_req: AuthRequest, res: Response) => {
  sendSuccess(res, { publishableKey: config.stripePublishableKey || null });
};

export const getUserPayments = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const payments = await paymentService.getUserPayments(req.user!.userId);
    sendSuccess(res, payments);
  } catch (err) { next(err); }
};

export const getPaymentById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const payment = await paymentService.getPaymentById(req.params.id as string, req.user!.userId, req.user!.role);
    sendSuccess(res, payment);
  } catch (err) { next(err); }
};

export const createPaymentIntent = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { rentalOrderId } = req.body;
    if (!rentalOrderId) return sendError(res, 'rentalOrderId is required', 400);
    const result = await paymentService.createPaymentIntent(req.user!.userId, rentalOrderId);
    sendSuccess(res, result, 'Payment intent created');
  } catch (err) { next(err); }
};

export const confirmPayment = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { paymentIntentId } = req.body;
    if (!paymentIntentId) return sendError(res, 'paymentIntentId is required', 400);
    const result = await paymentService.confirmPayment(req.user!.userId, paymentIntentId);
    sendSuccess(res, result, 'Payment confirmed');
  } catch (err) { next(err); }
};

export const handleStripeWebhook = async (req: RawBodyRequest, res: Response, next: NextFunction) => {
  try {
    const sig = req.headers['stripe-signature'] as string;
    if (!sig) return sendError(res, 'Webhook signature missing', 400);
    if (!req.rawBody) return sendError(res, 'Raw body not available', 400);
    const result = await paymentService.handleStripeWebhook(req.rawBody, sig);
    res.json(result);
  } catch (err) { next(err); }
};
