import { z } from 'zod';

export const createProjectSchema = z.object({
  name: z.string().min(2, 'Project name must be at least 2 characters').max(120, 'Project name cannot exceed 120 characters').trim(),
  key: z
    .string()
    .min(2, 'Project key must be at least 2 characters')
    .max(10, 'Project key cannot exceed 10 characters')
    .toUpperCase()
    .trim()
    .regex(/^[A-Z0-9]+$/, 'Project key must contain only uppercase letters and numbers'),
  workspaceId: z.string().min(1, 'Workspace is required'),
  description: z.string().max(2000, 'Description cannot exceed 2000 characters').optional().default(''),
  status: z.enum(['planning', 'active', 'on_hold', 'completed', 'cancelled']).optional().default('planning'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional().default('medium'),
  color: z
    .string()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Must be a valid hex color code')
    .optional()
    .default('#4F46E5'),
  startDate: z.coerce.date().optional(),
  targetDate: z.coerce.date().optional(),
  ownerId: z.string().optional(),
  leadId: z.string().optional(),
  memberIds: z.array(z.string()).optional().default([]),
  visibility: z.enum(['workspace', 'restricted']).optional().default('workspace'),
  tags: z.array(z.string().trim()).optional().default([])
});

export type CreateProjectInput = z.input<typeof createProjectSchema>;
export type CreateProjectOutput = z.output<typeof createProjectSchema>;

export const updateProjectSchema = z.object({
  name: z.string().min(2, 'Project name must be at least 2 characters').max(120).trim().optional(),
  description: z.string().max(2000).optional(),
  status: z.enum(['planning', 'active', 'on_hold', 'completed', 'cancelled']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/).optional(),
  startDate: z.coerce.date().optional().nullable(),
  targetDate: z.coerce.date().optional().nullable(),
  ownerId: z.string().optional(),
  leadId: z.string().optional(),
  visibility: z.enum(['workspace', 'restricted']).optional(),
  tags: z.array(z.string().trim()).optional()
});

export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;

export const updateProjectStatusSchema = z.object({
  status: z.enum(['planning', 'active', 'on_hold', 'completed', 'cancelled', 'archived'])
});

export type UpdateProjectStatusInput = z.infer<typeof updateProjectStatusSchema>;

export const updateProjectPrioritySchema = z.object({
  priority: z.enum(['low', 'medium', 'high', 'urgent'])
});

export type UpdateProjectPriorityInput = z.infer<typeof updateProjectPrioritySchema>;

export const transferProjectOwnerSchema = z.object({
  newOwnerId: z.string().min(1, 'Target new owner user ID is required')
});

export type TransferProjectOwnerInput = z.infer<typeof transferProjectOwnerSchema>;

export const projectMembersSchema = z.object({
  memberIds: z.array(z.string().min(1)).min(1, 'At least one member ID is required'),
  role: z.enum(['lead', 'contributor', 'observer']).optional().default('contributor')
});

export type ProjectMembersInput = z.infer<typeof projectMembersSchema>;

export const addProjectMembersSchema = projectMembersSchema;
export type AddProjectMembersInput = ProjectMembersInput;

export const updateProjectMemberRoleSchema = z.object({
  role: z.enum(['lead', 'contributor', 'observer'], {
    required_error: 'Role is required (lead, contributor, or observer)'
  })
});

export type UpdateProjectMemberRoleInput = z.infer<typeof updateProjectMemberRoleSchema>;

export const listProjectMembersQuerySchema = z.object({
  search: z.string().optional(),
  role: z.enum(['lead', 'contributor', 'observer']).optional(),
  page: z.coerce.number().min(1).optional().default(1),
  limit: z.coerce.number().min(1).max(100).optional().default(50)
});

export type ListProjectMembersQuery = z.infer<typeof listProjectMembersQuerySchema>;

export const archiveProjectSchema = z.object({
  confirmationName: z.string().min(1, 'Project confirmation name is required')
});

export type ArchiveProjectInput = z.infer<typeof archiveProjectSchema>;

export const listProjectsQuerySchema = z.object({
  workspaceId: z.string().optional(),
  status: z.string().optional(),
  priority: z.string().optional(),
  search: z.string().optional(),
  visibility: z.string().optional(),
  sortBy: z.enum(['updatedAt', 'name', 'targetDate', 'createdAt']).optional().default('updatedAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  page: z.coerce.number().min(1).optional().default(1),
  limit: z.coerce.number().min(1).max(100).optional().default(20),
  isArchived: z
    .preprocess((val) => {
      if (val === 'true') return true;
      if (val === 'false') return false;
      return val;
    }, z.boolean())
    .optional()
    .default(false)
});

export type ListProjectsQuery = z.infer<typeof listProjectsQuerySchema>;

