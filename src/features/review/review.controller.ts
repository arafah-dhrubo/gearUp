import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../types/index.js';
import { sendSuccess, sendError } from '../../utils/response.js';
import { createReviewSchema } from './review.validation.js';
import * as reviewService from './review.service.js';

export const createReview = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const parsed = createReviewSchema.safeParse(req.body);
    if (!parsed.success) return sendError(res, 'Validation failed', 400, parsed.error.flatten().fieldErrors);
    const review = await reviewService.createReview(req.user!.userId, parsed.data);
    sendSuccess(res, review, 'Review created', 201);
  } catch (err) { next(err); }
};
