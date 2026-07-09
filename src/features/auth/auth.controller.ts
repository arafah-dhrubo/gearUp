import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../types/index.js';
import { sendSuccess, sendError } from '../../utils/response.js';
import { registerSchema, loginSchema, updateProfileSchema, updatePasswordSchema } from './auth.validation.js';
import * as authService from './auth.service.js';

export const register = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) return sendError(res, 'Validation failed', 400, parsed.error.flatten().fieldErrors);
    const result = await authService.registerUser(parsed.data);
    sendSuccess(res, result, 'Registration successful', 201);
  } catch (err) { next(err); }
};

export const login = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) return sendError(res, 'Validation failed', 400, parsed.error.flatten().fieldErrors);
    const result = await authService.loginUser(parsed.data);
    sendSuccess(res, result, 'Login successful');
  } catch (err) { next(err); }
};

export const getMe = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await authService.getCurrentUser(req.user!.userId);
    sendSuccess(res, user);
  } catch (err) { next(err); }
};

export const updateProfileHandler = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const parsed = updateProfileSchema.safeParse(req.body);
    if (!parsed.success) return sendError(res, 'Validation failed', 400, parsed.error.flatten().fieldErrors);
    const user = await authService.updateProfile(req.user!.userId, parsed.data);
    sendSuccess(res, user, 'Profile updated');
  } catch (err) { next(err); }
};

export const updatePasswordHandler = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const parsed = updatePasswordSchema.safeParse(req.body);
    if (!parsed.success) return sendError(res, 'Validation failed', 400, parsed.error.flatten().fieldErrors);
    await authService.updatePassword(req.user!.userId, parsed.data.currentPassword, parsed.data.newPassword);
    sendSuccess(res, null, 'Password updated');
  } catch (err) { next(err); }
};
