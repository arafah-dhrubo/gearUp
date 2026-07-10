import { prisma } from '../../utils/prisma.js';
import { AppError } from '../../middleware/errorHandler.js';
import { RentalStatus } from '../../generated/prisma/enums.js';

export const addGear = async (providerId: string, data: { name: string; description: string; brand?: string; pricePerDay: number; quantity: number; categoryId: string }) => {
  return prisma.gearItem.create({
    data: { ...data, providerId },
    include: { category: true },
  });
};

export const updateGear = async (gearId: string, providerId: string, data: any) => {
  const gear = await prisma.gearItem.findUnique({ where: { id: gearId } });
  if (!gear) throw new AppError('Gear not found', 404);
  if (gear.providerId !== providerId) throw new AppError('Not authorized', 403);

  if (data.quantity !== undefined) {
    data.available = data.quantity > 0;
  }

  return prisma.gearItem.update({
    where: { id: gearId },
    data,
    include: { category: true },
  });
};

export const deleteGear = async (gearId: string, providerId: string) => {
  const gear = await prisma.gearItem.findUnique({ where: { id: gearId } });
  if (!gear) throw new AppError('Gear not found', 404);
  if (gear.providerId !== providerId) throw new AppError('Not authorized', 403);
  await prisma.gearItem.delete({ where: { id: gearId } });
};

export const getProviderOrders = async (providerId: string) => {
  const gearItems = await prisma.gearItem.findMany({ where: { providerId }, select: { id: true } });
  const gearIds = gearItems.map(g => g.id);
  return prisma.rentalOrder.findMany({
    where: { rentalItems: { some: { gearItemId: { in: gearIds } } } },
    include: {
      rentalItems: { include: { gearItem: true } },
      customer: { select: { id: true, name: true, email: true, phone: true } },
      payments: true,
    },
    orderBy: { createdAt: 'desc' },
  });
};

export const updateRentalStatus = async (rentalId: string, status: string, userId: string, userRole: string) => {
  const rental = await prisma.rentalOrder.findUnique({ where: { id: rentalId } });
  if (!rental) throw new AppError('Rental order not found', 404);

  if (userRole === 'PROVIDER') {
    const providerGear = await prisma.gearItem.findMany({ where: { providerId: userId }, select: { id: true } });
    const gearIds = providerGear.map(g => g.id);
    const itemCheck = await prisma.rentalItem.findFirst({ where: { rentalOrderId: rentalId, gearItemId: { in: gearIds } } });
    if (!itemCheck) throw new AppError('Not authorized to update this order', 403);
  }

  if (status === 'RETURNED') {
    const items = await prisma.rentalItem.findMany({ where: { rentalOrderId: rentalId } });

    return prisma.$transaction(async (tx) => {
      for (const item of items) {
        await tx.gearItem.update({
          where: { id: item.gearItemId },
          data: { quantity: { increment: item.quantity }, available: true },
        });
      }

      return tx.rentalOrder.update({
        where: { id: rentalId },
        data: { status: status as RentalStatus },
        include: { rentalItems: { include: { gearItem: true } }, customer: { select: { id: true, name: true, email: true } } },
      });
    });
  }

  return prisma.rentalOrder.update({
    where: { id: rentalId },
    data: { status: status as RentalStatus },
    include: { rentalItems: { include: { gearItem: true } }, customer: { select: { id: true, name: true, email: true } } },
  });
};
