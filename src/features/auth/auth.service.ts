import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../utils/prisma.js';
import { config } from '../../config/index.js';
import { AppError } from '../../middleware/errorHandler.js';

export const registerUser = async (data: { email: string; password: string; name: string; phone?: string; role: string }) => {
  const exists = await prisma.user.findUnique({ where: { email: data.email } });
  if (exists) throw new AppError('Email already registered', 409);

  const hashed = await bcrypt.hash(data.password, 12);
  const user = await prisma.user.create({
    data: { email: data.email, password: hashed, name: data.name, phone: data.phone, role: data.role as any },
    select: { id: true, email: true, name: true, phone: true, role: true, createdAt: true },
  });

  const token = jwt.sign({ userId: user.id, role: user.role }, config.jwtSecret, { expiresIn: config.jwtExpiresIn } as any);
  return { user, token };
};

export const loginUser = async (data: { email: string; password: string }) => {
  const user = await prisma.user.findUnique({ where: { email: data.email } });
  if (!user) throw new AppError('Invalid email or password', 401);
  if (!user.isActive) throw new AppError('Account is suspended', 403);

  const isValid = await bcrypt.compare(data.password, user.password);
  if (!isValid) throw new AppError('Invalid email or password', 401);

  const token = jwt.sign({ userId: user.id, role: user.role }, config.jwtSecret, { expiresIn: config.jwtExpiresIn } as any);
  return {
    user: { id: user.id, email: user.email, name: user.name, phone: user.phone, role: user.role, createdAt: user.createdAt },
    token,
  };
};

export const getCurrentUser = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true, phone: true, role: true, isActive: true, createdAt: true },
  });
  if (!user) throw new AppError('User not found', 404);
  return user;
};

export const updateProfile = async (userId: string, data: { name?: string; phone?: string }) => {
  return prisma.user.update({
    where: { id: userId },
    data,
    select: { id: true, email: true, name: true, phone: true, role: true, isActive: true, createdAt: true },
  });
};

export const updatePassword = async (userId: string, currentPassword: string, newPassword: string) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError('User not found', 404);

  const isValid = await bcrypt.compare(currentPassword, user.password);
  if (!isValid) throw new AppError('Current password is incorrect', 400);

  const hashed = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({ where: { id: userId }, data: { password: hashed } });
};
