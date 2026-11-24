export const TASK_STATUS = {
  BACKLOG: 'backlog',
  TODO: 'todo',
  IN_PROGRESS: 'in_progress',
  REVIEW: 'review',
  DONE: 'done',
  CANCELLED: 'cancelled'
} as const;

export type TaskStatus = typeof TASK_STATUS[keyof typeof TASK_STATUS];

export const TASK_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent'
} as const;

export type TaskPriority = typeof TASK_PRIORITY[keyof typeof TASK_PRIORITY];

export const PROJECT_STATUS = {
  PLANNING: 'planning',
  ACTIVE: 'active',
  ON_HOLD: 'on_hold',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  ARCHIVED: 'archived'
} as const;

export type ProjectStatus = typeof PROJECT_STATUS[keyof typeof PROJECT_STATUS];

export const SUBSCRIPTION_PLAN = {
  STARTER: 'starter',
  PROFESSIONAL: 'professional',
  ENTERPRISE: 'enterprise'
} as const;

export type SubscriptionPlan = typeof SUBSCRIPTION_PLAN[keyof typeof SUBSCRIPTION_PLAN];

