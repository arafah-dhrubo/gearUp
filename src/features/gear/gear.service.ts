import { prisma } from '../../utils/prisma.js';

export const getGear = async (filters: {
  category?: string; brand?: string; search?: string;
  minPrice?: number; maxPrice?: number; available?: string;
}) => {
  const where: any = {};
  if (filters.category) where.categoryId = filters.category;
  if (filters.brand) where.brand = { contains: filters.brand, mode: 'insensitive' };
  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: 'insensitive' } },
      { description: { contains: filters.search, mode: 'insensitive' } },
    ];
  }
  if (filters.minPrice || filters.maxPrice) {
    where.pricePerDay = {};
    if (filters.minPrice) where.pricePerDay.gte = filters.minPrice;
    if (filters.maxPrice) where.pricePerDay.lte = filters.maxPrice;
  }
  if (filters.available === 'true') where.available = true;

  return prisma.gearItem.findMany({
    where,
    include: { category: true, provider: { select: { id: true, name: true } } },
    orderBy: { createdAt: 'desc' },
  });
};

export const getGearById = (id: string) =>
  prisma.gearItem.findUnique({
    where: { id },
    include: {
      category: true,
      provider: { select: { id: true, name: true, email: true } },
      reviews: { include: { user: { select: { id: true, name: true } } }, orderBy: { createdAt: 'desc' } },
    },
  });

export const getCategories = () => prisma.category.findMany({ orderBy: { name: 'asc' } });
