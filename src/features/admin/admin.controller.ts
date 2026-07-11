import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../types/index.js';
import { sendSuccess, sendError } from '../../utils/response.js';
import * as adminService from './admin.service.js';

export const getUsers = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const users = await adminService.getUsers(req.query.role as string);
    sendSuccess(res, users);
  } catch (err) { next(err); }
};

export const updateUserStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { isActive } = req.body;
    if (typeof isActive !== 'boolean') return sendError(res, 'isActive (boolean) is required', 400);
    const user = await adminService.updateUserStatus(req.params.id as string, isActive);
    sendSuccess(res, user, `User ${isActive ? 'activated' : 'suspended'}`);
  } catch (err) { next(err); }
};

export const getAllGear = async (_req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const gear = await adminService.getAllGear();
    sendSuccess(res, gear);
  } catch (err) { next(err); }
};

export const getAllRentals = async (_req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const rentals = await adminService.getAllRentals();
    sendSuccess(res, rentals);
  } catch (err) { next(err); }
};

export const adminUpdateRentalStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body;
    if (!status) return sendError(res, 'Status is required', 400);
    const rental = await adminService.adminUpdateRentalStatus(req.params.id as string, status);
    sendSuccess(res, rental, 'Status updated');
  } catch (err) { next(err); }
};

export const createCategory = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { name, description } = req.body;
    if (!name) return sendError(res, 'Name is required', 400);
    const cat = await adminService.createCategory({ name, description });
    sendSuccess(res, cat, 'Category created', 201);
  } catch (err) { next(err); }
};

export const updateCategory = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const cat = await adminService.updateCategory(req.params.id as string, req.body);
    sendSuccess(res, cat, 'Category updated');
  } catch (err) { next(err); }
};

export const deleteCategory = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await adminService.deleteCategory(req.params.id as string);
    sendSuccess(res, null, 'Category deleted');
  } catch (err) { next(err); }
};
