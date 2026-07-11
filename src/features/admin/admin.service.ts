import { prisma } from '../../utils/prisma.js';
import { AppError } from '../../middleware/errorHandler.js';
import { RentalStatus } from '../../generated/prisma/enums.js';

export const getUsers = (role?: string) =>
  prisma.user.findMany({
    where: role ? { role: role as any } : {},
    select: { id: true, email: true, name: true, phone: true, role: true, isActive: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  });

export const updateUserStatus = async (userId: string, isActive: boolean) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError('User not found', 404);
  return prisma.user.update({ where: { id: userId }, data: { isActive }, select: { id: true, email: true, name: true, role: true, isActive: true } });
};

export const getAllGear = () =>
  prisma.gearItem.findMany({
    include: { category: true, provider: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: 'desc' },
  });

export const getAllRentals = () =>
  prisma.rentalOrder.findMany({
    include: { rentalItems: { include: { gearItem: true } }, customer: { select: { id: true, name: true, email: true } }, payments: true },
    orderBy: { createdAt: 'desc' },
  });

export const adminUpdateRentalStatus = async (rentalId: string, status: string) => {
  const rental = await prisma.rentalOrder.findUnique({ where: { id: rentalId } });
  if (!rental) throw new AppError('Rental order not found', 404);

  if (status === 'RETURNED') {
    const items = await prisma.rentalItem.findMany({ where: { rentalOrderId: rentalId } });
    for (const item of items) {
      await prisma.gearItem.update({
        where: { id: item.gearItemId },
        data: { quantity: { increment: item.quantity }, available: true },
      });
    }
  }

  return prisma.rentalOrder.update({
    where: { id: rentalId },
    data: { status: status as RentalStatus },
    include: { rentalItems: { include: { gearItem: true } }, customer: { select: { id: true, name: true, email: true } } },
  });
};

export const createCategory = (data: { name: string; description?: string }) =>
  prisma.category.create({ data });

export const updateCategory = async (id: string, data: { name?: string; description?: string }) => {
  const cat = await prisma.category.findUnique({ where: { id } });
  if (!cat) throw new AppError('Category not found', 404);
  return prisma.category.update({ where: { id }, data });
};

export const deleteCategory = async (id: string) => {
  const cat = await prisma.category.findUnique({ where: { id } });
  if (!cat) throw new AppError('Category not found', 404);
  await prisma.category.delete({ where: { id } });
};
