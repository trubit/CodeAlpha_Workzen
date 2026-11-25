import { z } from 'zod';

export const createWorkspaceSchema = z.object({
  name: z
    .string()
    .min(2, { message: 'Workspace name must be at least 2 characters long' })
    .max(60, { message: 'Workspace name cannot exceed 60 characters' })
    .trim(),
  slug: z
    .string()
    .min(2)
    .max(60)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
      message: 'Slug must contain only lowercase letters, numbers, and hyphens'
    })
    .optional(),
  description: z
    .string()
    .max(500, { message: 'Description cannot exceed 500 characters' })
    .optional(),
  type: z
    .enum(['engineering', 'product', 'marketing', 'operations', 'general'])
    .default('general'),
  icon: z.string().max(30).optional(),
  themeColor: z
    .string()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, { message: 'Invalid hex color' })
    .optional(),
  isPrivate: z.boolean().default(false),
  settings: z
    .object({
      defaultTaskView: z.enum(['kanban', 'list', 'calendar', 'timeline']).default('kanban'),
      allowGuestAccess: z.boolean().default(false),
      requireApprovalForProjects: z.boolean().default(false)
    })
    .optional()
});

export const updateWorkspaceSchema = z.object({
  name: z
    .string()
    .min(2, { message: 'Workspace name must be at least 2 characters long' })
    .max(60, { message: 'Workspace name cannot exceed 60 characters' })
    .trim()
    .optional(),
  description: z.string().max(500).optional(),
  type: z
    .enum(['engineering', 'product', 'marketing', 'operations', 'general'])
    .optional(),
  icon: z.string().max(30).optional(),
  themeColor: z
    .string()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, { message: 'Invalid hex color' })
    .optional(),
  isPrivate: z.boolean().optional()
});

export const updateWorkspaceSettingsSchema = z.object({
  defaultTaskView: z.enum(['kanban', 'list', 'calendar', 'timeline']).optional(),
  allowGuestAccess: z.boolean().optional(),
  requireApprovalForProjects: z.boolean().optional()
});

export const archiveWorkspaceSchema = z.object({
  confirmationName: z
    .string()
    .min(1, { message: 'Confirmation workspace name is required' })
    .trim()
});

export type CreateWorkspaceInput = z.input<typeof createWorkspaceSchema>;
export type CreateWorkspaceOutput = z.output<typeof createWorkspaceSchema>;
export type UpdateWorkspaceInput = z.infer<typeof updateWorkspaceSchema>;
export type UpdateWorkspaceSettingsInput = z.infer<typeof updateWorkspaceSettingsSchema>;
export type ArchiveWorkspaceInput = z.infer<typeof archiveWorkspaceSchema>;

