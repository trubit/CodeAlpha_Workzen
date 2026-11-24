import { z } from 'zod';
import { PERMISSION_CATALOGUE } from '../constants/roles.js';

const VALID_PERMISSION_KEYS = new Set(PERMISSION_CATALOGUE.map((p) => p.key));

export const createRoleSchema = z.object({
  name: z
    .string()
    .min(2, 'Role name must be at least 2 characters')
    .max(60, 'Role name cannot exceed 60 characters')
    .trim(),
  slug: z
    .string()
    .min(2, 'Role slug must be at least 2 characters')
    .max(60, 'Role slug cannot exceed 60 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug may only contain lowercase letters, numbers, and hyphens')
    .optional(),
  description: z
    .string()
    .max(500, 'Description cannot exceed 500 characters')
    .optional()
    .default(''),
  scope: z.enum(['organization', 'workspace']).default('organization'),
  workspaceId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid workspace ID format').optional(),
  permissions: z
    .array(z.string())
    .min(1, 'A role must be assigned at least one permission')
    .refine(
      (keys) => keys.every((k) => VALID_PERMISSION_KEYS.has(k)),
      'One or more assigned permissions are invalid or unrecognized in the capability catalogue'
    )
});

export const updateRoleSchema = z.object({
  name: z
    .string()
    .min(2, 'Role name must be at least 2 characters')
    .max(60, 'Role name cannot exceed 60 characters')
    .trim()
    .optional(),
  description: z
    .string()
    .max(500, 'Description cannot exceed 500 characters')
    .optional(),
  permissions: z
    .array(z.string())
    .min(1, 'A role must be assigned at least one permission')
    .refine(
      (keys) => keys.every((k) => VALID_PERMISSION_KEYS.has(k)),
      'One or more assigned permissions are invalid or unrecognized in the capability catalogue'
    )
    .optional()
});

export const assignRoleSchema = z.object({
  roleId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Valid Role identifier is required'),
  workspaceId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid workspace ID format').optional()
});

export const deleteRoleSchema = z.object({
  confirmName: z.string().min(1, 'Confirmation role name is required')
});

export type CreateRoleInput = z.infer<typeof createRoleSchema>;
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;
export type AssignRoleInput = z.infer<typeof assignRoleSchema>;
export type DeleteRoleInput = z.infer<typeof deleteRoleSchema>;

