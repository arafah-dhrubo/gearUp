import { prisma } from '../../utils/prisma.js';
import { AppError } from '../../middleware/errorHandler.js';

export const createReview = async (userId: string, data: { gearItemId: string; rating: number; comment?: string }) => {
  const gear = await prisma.gearItem.findUnique({ where: { id: data.gearItemId } });
  if (!gear) throw new AppError('Gear not found', 404);

  const rental = await prisma.rentalOrder.findFirst({
    where: { customerId: userId, rentalItems: { some: { gearItemId: data.gearItemId } }, status: 'RETURNED' },
  });
  if (!rental) throw new AppError('You must rent and return this gear before reviewing', 400);

  const existing = await prisma.review.findUnique({
    where: { userId_gearItemId: { userId, gearItemId: data.gearItemId } },
  });
  if (existing) throw new AppError('You already reviewed this gear', 409);

  return prisma.review.create({
    data: { ...data, userId },
    include: { user: { select: { id: true, name: true } } },
  });
};
