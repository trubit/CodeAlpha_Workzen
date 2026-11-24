import { z } from 'zod';
import { ORG_ROLES, WORKSPACE_ROLES } from '../constants/roles.js';

export const inviteMemberSchema = z.object({
  email: z
    .string()
    .email('Please enter a valid corporate email address')
    .max(255, 'Email cannot exceed 255 characters')
    .toLowerCase()
    .trim(),
  role: z
    .enum(Object.values(ORG_ROLES) as [string, ...string[]])
    .default(ORG_ROLES.MEMBER),
  workspaceIds: z
    .array(z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid workspace ID format'))
    .optional()
    .default([])
});

export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;

export const updateMemberRoleSchema = z.object({
  role: z.enum(Object.values(ORG_ROLES) as [string, ...string[]])
});

export type UpdateMemberRoleInput = z.infer<typeof updateMemberRoleSchema>;

export const updateMemberStatusSchema = z.object({
  status: z.enum(['active', 'suspended', 'deactivated'])
});

export type UpdateMemberStatusInput = z.infer<typeof updateMemberStatusSchema>;

export const updateMemberWorkspacesSchema = z.object({
  workspaces: z.array(
    z.object({
      workspaceId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid workspace ID format'),
      role: z.enum(Object.values(WORKSPACE_ROLES) as [string, ...string[]]).optional().default(WORKSPACE_ROLES.MEMBER)
    })
  )
});

export type UpdateMemberWorkspacesInput = z.infer<typeof updateMemberWorkspacesSchema>;

export const acceptInvitationSchema = z.object({
  token: z.string().min(10, 'Invitation token is required')
});

export type AcceptInvitationInput = z.infer<typeof acceptInvitationSchema>;

