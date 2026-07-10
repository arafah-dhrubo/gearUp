import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../types/index.js';
import { sendSuccess, sendError } from '../../utils/response.js';
import { createRentalSchema } from './rental.validation.js';
import * as rentalService from './rental.service.js';

export const createRental = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const parsed = createRentalSchema.safeParse(req.body);
    if (!parsed.success) return sendError(res, 'Validation failed', 400, parsed.error.flatten().fieldErrors);
    const rental = await rentalService.createRental(req.user!.userId, parsed.data);
    sendSuccess(res, rental, 'Rental order created', 201);
  } catch (err) { next(err); }
};

export const getUserRentals = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const rentals = await rentalService.getUserRentals(req.user!.userId);
    sendSuccess(res, rentals);
  } catch (err) { next(err); }
};

export const getRentalById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const rental = await rentalService.getRentalById(req.params.id as string, req.user!.userId, req.user!.role);
    sendSuccess(res, rental);
  } catch (err) { next(err); }
};

export const cancelRental = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const rental = await rentalService.cancelRental(req.params.id as string, req.user!.userId);
    sendSuccess(res, rental, 'Rental cancelled');
  } catch (err) { next(err); }
};
