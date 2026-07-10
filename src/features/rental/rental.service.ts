import { prisma } from '../../utils/prisma.js';
import { AppError } from '../../middleware/errorHandler.js';

export const createRental = async (customerId: string, data: { startDate: string; endDate: string; note?: string; items: { gearItemId: string; quantity: number }[] }) => {
  const start = new Date(data.startDate);
  const end = new Date(data.endDate);
  if (end <= start) throw new AppError('End date must be after start date', 400);

  let totalAmount = 0;
  const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

  const rentalItems: { gearItemId: string; quantity: number }[] = [];

  for (const item of data.items) {
    const gear = await prisma.gearItem.findUnique({ where: { id: item.gearItemId } });
    if (!gear) throw new AppError(`Gear ${item.gearItemId} not found`, 404);
    if (!gear.available || gear.quantity < item.quantity) throw new AppError(`Insufficient stock: ${gear.name}`, 400);

    totalAmount += gear.pricePerDay * days * item.quantity;
    rentalItems.push({ gearItemId: item.gearItemId, quantity: item.quantity });
  }

  const rental = await prisma.$transaction(async (tx) => {
    for (const item of data.items) {
      await tx.gearItem.update({
        where: { id: item.gearItemId },
        data: { quantity: { decrement: item.quantity }, available: true },
      });
    }

    return tx.rentalOrder.create({
      data: {
        customerId,
        startDate: start,
        endDate: end,
        totalAmount,
        note: data.note,
        rentalItems: { create: rentalItems },
      },
      include: { rentalItems: { include: { gearItem: true } } },
    });
  });

  return rental;
};

export const getUserRentals = (userId: string) =>
  prisma.rentalOrder.findMany({
    where: { customerId: userId },
    include: { rentalItems: { include: { gearItem: true } }, payments: true },
    orderBy: { createdAt: 'desc' },
  });

export const getRentalById = async (rentalId: string, userId: string, userRole: string) => {
  const rental = await prisma.rentalOrder.findUnique({
    where: { id: rentalId },
    include: { rentalItems: { include: { gearItem: true } }, payments: true, customer: { select: { id: true, name: true, email: true, phone: true } } },
  });
  if (!rental) throw new AppError('Rental order not found', 404);
  if (userRole === 'CUSTOMER' && rental.customerId !== userId) throw new AppError('Not authorized', 403);
  return rental;
};

export const cancelRental = async (rentalId: string, customerId: string) => {
  const rental = await prisma.rentalOrder.findUnique({ where: { id: rentalId } });
  if (!rental) throw new AppError('Rental order not found', 404);
  if (rental.customerId !== customerId) throw new AppError('Not authorized', 403);
  if (rental.status !== 'PLACED') throw new AppError('Can only cancel PLACED orders', 400);

  const items = await prisma.rentalItem.findMany({ where: { rentalOrderId: rentalId } });

  return prisma.$transaction(async (tx) => {
    for (const item of items) {
      await tx.gearItem.update({
        where: { id: item.gearItemId },
        data: { quantity: { increment: item.quantity }, available: true },
      });
    }

    await tx.payment.updateMany({
      where: { rentalOrderId: rentalId },
      data: { status: 'FAILED' },
    });

    return tx.rentalOrder.update({
      where: { id: rentalId },
      data: { status: 'CANCELLED' },
      include: { rentalItems: { include: { gearItem: true } } },
    });
  });
};
