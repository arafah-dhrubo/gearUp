import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../types/index.js';
import { sendSuccess, sendError } from '../../utils/response.js';
import { createGearSchema, updateGearSchema } from '../gear/gear.validation.js';
import * as providerService from './provider.service.js';

export const addGear = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const parsed = createGearSchema.safeParse(req.body);
    if (!parsed.success) return sendError(res, 'Validation failed', 400, parsed.error.flatten().fieldErrors);
    const gear = await providerService.addGear(req.user!.userId, parsed.data);
    sendSuccess(res, gear, 'Gear added', 201);
  } catch (err) { next(err); }
};

export const updateGear = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const parsed = updateGearSchema.safeParse(req.body);
    if (!parsed.success) return sendError(res, 'Validation failed', 400, parsed.error.flatten().fieldErrors);
    const gear = await providerService.updateGear(req.params.id as string, req.user!.userId, parsed.data);
    sendSuccess(res, gear, 'Gear updated');
  } catch (err) { next(err); }
};

export const deleteGear = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await providerService.deleteGear(req.params.id as string, req.user!.userId);
    sendSuccess(res, null, 'Gear deleted');
  } catch (err) { next(err); }
};

export const getProviderOrders = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const orders = await providerService.getProviderOrders(req.user!.userId);
    sendSuccess(res, orders);
  } catch (err) { next(err); }
};

export const updateRentalStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body;
    if (!status) return sendError(res, 'Status is required', 400);
    const rental = await providerService.updateRentalStatus(req.params.id as string, status, req.user!.userId, req.user!.role);
    sendSuccess(res, rental, 'Status updated');
  } catch (err) { next(err); }
};
