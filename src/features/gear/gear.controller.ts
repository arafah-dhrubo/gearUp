import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../../types/index.js';
import { sendSuccess, sendError } from '../../utils/response.js';
import * as gearService from './gear.service.js';
import { getCategories } from './gear.service.js';

export const browseGear = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const gear = await gearService.getGear(req.query as any);
    sendSuccess(res, gear);
  } catch (err) { next(err); }
};

export const getGearDetails = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const gear = await gearService.getGearById(req.params.id as string);
    if (!gear) return sendError(res, 'Gear not found', 404);
    sendSuccess(res, gear);
  } catch (err) { next(err); }
};

export const listCategories = async (_req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const categories = await getCategories();
    sendSuccess(res, categories);
  } catch (err) { next(err); }
};
