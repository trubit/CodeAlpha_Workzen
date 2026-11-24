import { z } from 'zod';

export const dashboardOverviewQuerySchema = z.object({
  workspaceId: z.string().optional(),
  dateRange: z.enum(['today', '7d', '30d', '90d', 'all']).optional().default('30d'),
  projectId: z.string().optional()
});

export type DashboardOverviewQuery = z.infer<typeof dashboardOverviewQuerySchema>;

export const myTasksQuerySchema = z.object({
  workspaceId: z.string().optional(),
  status: z.enum(['all', 'backlog', 'todo', 'in_progress', 'review', 'done']).optional().default('all'),
  priority: z.enum(['all', 'low', 'medium', 'high', 'urgent']).optional().default('all'),
  limit: z.coerce.number().min(1).max(100).optional().default(20)
});

export type MyTasksQuery = z.infer<typeof myTasksQuerySchema>;

export const dashboardActivityQuerySchema = z.object({
  workspaceId: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).optional().default(20)
});

export type DashboardActivityQuery = z.infer<typeof dashboardActivityQuerySchema>;

export const dashboardAnalyticsQuerySchema = z.object({
  workspaceId: z.string().optional(),
  dateRange: z.enum(['today', '7d', '30d', '90d', 'all']).optional().default('30d')
});

export type DashboardAnalyticsQuery = z.infer<typeof dashboardAnalyticsQuerySchema>;

