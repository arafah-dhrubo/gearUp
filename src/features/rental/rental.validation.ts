import { z } from 'zod';

export const createRentalSchema = z.object({
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  note: z.string().optional(),
  items: z.array(z.object({
    gearItemId: z.string().min(1),
    quantity: z.number().int().positive(),
  })).min(1),
});
