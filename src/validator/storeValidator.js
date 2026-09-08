import { z } from 'zod';

export const createStoreSchema = z.object({
  body: z.object({
    name: z.string().min(20).max(60),
    email: z.string().email(),
    address: z.string().max(400),
    ownerId: z.number().int().positive()
  })
});

export const submitRatingSchema = z.object({
  params: z.object({ storeId: z.coerce.number().int().positive() }),
  body: z.object({
    rating: z.coerce.number().int().min(1).max(5)
  })
});

export const storeQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().optional(),
    search: z.string().optional(),
    sortBy: z.enum(['name', 'address']).optional(),
    sortOrder: z.enum(['ASC', 'DESC']).optional(),
  })
});