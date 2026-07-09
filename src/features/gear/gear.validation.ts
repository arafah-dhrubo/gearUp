import { z } from 'zod';

export const createGearSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  brand: z.string().optional(),
  pricePerDay: z.number().positive(),
  quantity: z.number().int().positive(),
  categoryId: z.string().min(1),
});

export const updateGearSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  brand: z.string().optional(),
  pricePerDay: z.number().positive().optional(),
  quantity: z.number().int().positive().optional(),
  available: z.boolean().optional(),
});
