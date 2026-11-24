import { z } from 'zod';

export const createOrgSchema = z.object({
  name: z
    .string()
    .min(2, 'Organization name must be at least 2 characters')
    .max(100, 'Organization name cannot exceed 100 characters')
    .trim(),
  slug: z
    .string()
    .min(2, 'Slug must be at least 2 characters')
    .max(50, 'Slug cannot exceed 50 characters')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must contain only lowercase alphanumeric characters and hyphens')
    .optional(),
  description: z.string().max(500, 'Description cannot exceed 500 characters').optional(),
  industry: z.string().max(100).optional().default('Technology & Software'),
  organizationSize: z
    .enum(['1-10', '11-50', '51-200', '201-500', '500+'])
    .optional()
    .default('11-50'),
  website: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  country: z.string().max(100).optional().default('United States'),
  timezone: z.string().max(100).optional().default('UTC-05:00 Eastern Time'),
  logoUrl: z.string().url('Logo must be a valid URL').optional().or(z.literal(''))
});

export const updateOrgSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100).trim().optional(),
  description: z.string().max(500).optional(),
  industry: z.string().max(100).optional(),
  organizationSize: z.enum(['1-10', '11-50', '51-200', '201-500', '500+']).optional(),
  website: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  country: z.string().max(100).optional(),
  timezone: z.string().max(100).optional(),
  billingEmail: z.string().email('Invalid billing email').optional().or(z.literal('')),
  logoUrl: z.string().url().optional().or(z.literal(''))
});

export const updateOrgSettingsSchema = z.object({
  allowedDomains: z.array(z.string().trim().toLowerCase()).optional(),
  enforce2FA: z.boolean().optional(),
  defaultMemberRole: z.enum(['admin', 'member', 'guest']).optional(),
  timezone: z.string().max(100).optional()
});

export const transferOwnershipSchema = z.object({
  newOwnerId: z.string().min(1, 'Target new owner user ID is required'),
  confirmation: z.literal('TRANSFER', {
    errorMap: () => ({ message: "You must type 'TRANSFER' to confirm ownership transfer" })
  })
});

export const deleteOrgSchema = z.object({
  orgNameConfirmation: z.string().min(1, 'Organization name confirmation is required')
});

export type CreateOrgInput = z.infer<typeof createOrgSchema>;
export type UpdateOrgInput = z.infer<typeof updateOrgSchema>;
export type UpdateOrgSettingsInput = z.infer<typeof updateOrgSettingsSchema>;
export type TransferOwnershipInput = z.infer<typeof transferOwnershipSchema>;
export type DeleteOrgInput = z.infer<typeof deleteOrgSchema>;

