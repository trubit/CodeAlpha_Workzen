import { z } from 'zod';

export const createCommentSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, 'Comment content cannot be empty')
    .max(5000, 'Comment content cannot exceed 5000 characters'),
  parentId: z.string().optional().nullable(),
  mentions: z.array(z.string().trim()).optional().default([])
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;

export const updateCommentSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, 'Comment content cannot be empty')
    .max(5000, 'Comment content cannot exceed 5000 characters')
});

export type UpdateCommentInput = z.infer<typeof updateCommentSchema>;

export const listCommentsQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(50),
  parentId: z.string().optional().nullable()
});

export type ListCommentsQuery = z.infer<typeof listCommentsQuerySchema>;
