import mongoose from 'mongoose';
import { ProjectModel } from '../models/Project.js';
import { TaskModel } from '../models/Task.js';
import { OrganisationModel } from '../models/Organisation.js';
import { WorkspaceModel } from '../models/Workspace.js';
import { OrganisationMembershipModel } from '../models/OrganisationMembership.js';
import { WorkspaceMembershipModel } from '../models/WorkspaceMembership.js';
import { InvitationModel } from '../models/Invitation.js';
import { AuditLogModel } from '../models/AuditLog.js';
import {
  DashboardOverviewQuery,
  MyTasksQuery,
  DashboardActivityQuery,
  DashboardAnalyticsQuery
} from '../../shared/validation/dashboard.js';
import { TASK_STATUS, PROJECT_STATUS } from '../../shared/constants/status.js';

export interface DashboardOverviewResult {
  metrics: {
    projects: {
      total: number;
      active: number;
      completed: number;
      archived: number;
    };
    tasks: {
      total: number;
      completed: number;
      inProgress: number;
      review: number;
      todo: number;
      overdue: number;
      dueToday: number;
      completionRate: number;
    };
    team: {
      activeMembers: number;
      workspaceMembers: number;
      pendingInvitations: number;
    };
  };
  projects: Array<{
    id: string;
    key: string;
    name: string;
    status: string;
    priority: string;
    color: string;
    totalTasks: number;
    completedTasks: number;
    progressPercentage: number;
    targetDate?: Date;
  }>;
  upcomingDeadlines: Array<{
    id: string;
    taskNumber: number;
    title: string;
    status: string;
    priority: string;
    dueDate: Date;
    isOverdue: boolean;
    isDueToday: boolean;
    projectName?: string;
    projectKey?: string;
  }>;
  context: {
    organisationId: string;
    organisationName: string;
    workspaceId?: string;
    workspaceName?: string;
  };
}

export class DashboardService {
  /**
   * Retrieves high-level operational overview, KPI counts, and active projects
   */
  static async getOverview(
    userId: string,
    organisationId: string,
    query: DashboardOverviewQuery
  ): Promise<DashboardOverviewResult> {
    const orgObjId = new mongoose.Types.ObjectId(organisationId);
    const org: any = await OrganisationModel.findById(orgObjId).lean();
    if (!org) {
      const err: any = new Error('Organization not found');
      err.statusCode = 404;
      err.code = 'ORGANISATION_NOT_FOUND';
      throw err;
    }

    // Build workspace scope filter if specified
    const taskFilter: any = { organisationId: orgObjId };
    const projectFilter: any = { organisationId: orgObjId };
    let workspaceName: string | undefined;

    if (query.workspaceId && mongoose.Types.ObjectId.isValid(query.workspaceId)) {
      const wsObjId = new mongoose.Types.ObjectId(query.workspaceId);
      const ws: any = await WorkspaceModel.findOne({ _id: wsObjId, organisationId: orgObjId }).lean();
      if (ws) {
        taskFilter.workspaceId = wsObjId;
        projectFilter.workspaceId = wsObjId;
        workspaceName = ws.name;
      }
    }

    if (query.projectId && mongoose.Types.ObjectId.isValid(query.projectId)) {
      taskFilter.projectId = new mongoose.Types.ObjectId(query.projectId);
    }

    // 1. Projects aggregation
    const rawProjects = await ProjectModel.find(projectFilter).sort({ updatedAt: -1 }).limit(10).lean();

    const projectCounts = await ProjectModel.aggregate([
      { $match: projectFilter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    let totalProjects = 0;
    let activeProjects = 0;
    let completedProjects = 0;
    let archivedProjects = 0;

    projectCounts.forEach((p) => {
      totalProjects += p.count;
      if (p._id === PROJECT_STATUS.COMPLETED) {
        completedProjects += p.count;
      } else if (p._id === PROJECT_STATUS.ARCHIVED) {
        archivedProjects += p.count;
      } else {
        activeProjects += p.count;
      }
    });

    // 2. Tasks Aggregation
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    const taskCounts = await TaskModel.aggregate([
      { $match: taskFilter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    let totalTasks = 0;
    let completedTasks = 0;
    let inProgressTasks = 0;
    let reviewTasks = 0;
    let todoTasks = 0;

    taskCounts.forEach((t) => {
      totalTasks += t.count;
      if (t._id === TASK_STATUS.DONE) {
        completedTasks += t.count;
      } else if (t._id === TASK_STATUS.IN_PROGRESS) {
        inProgressTasks += t.count;
      } else if (t._id === TASK_STATUS.REVIEW) {
        reviewTasks += t.count;
      } else {
        todoTasks += t.count;
      }
    });

    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Overdue tasks: dueDate < startOfToday and status !== 'done'
    const overdueCount = await TaskModel.countDocuments({
      ...taskFilter,
      dueDate: { $lt: startOfToday },
      status: { $ne: TASK_STATUS.DONE }
    });

    // Due today tasks: dueDate between start and end of today and status !== 'done'
    const dueTodayCount = await TaskModel.countDocuments({
      ...taskFilter,
      dueDate: { $gte: startOfToday, $lte: endOfToday },
      status: { $ne: TASK_STATUS.DONE }
    });

    // 3. Team Counts
    const activeMembersCount = await OrganisationMembershipModel.countDocuments({
      organisationId: orgObjId,
      status: 'active'
    });

    let workspaceMembersCount = activeMembersCount;
    if (query.workspaceId && mongoose.Types.ObjectId.isValid(query.workspaceId)) {
      workspaceMembersCount = await WorkspaceMembershipModel.countDocuments({
        workspaceId: new mongoose.Types.ObjectId(query.workspaceId),
        status: 'active'
      });
    }

    const pendingInvitationsCount = await InvitationModel.countDocuments({
      organisationId: orgObjId,
      status: 'pending'
    });

    // 4. Detailed Project Summaries with Calculated Task Progress
    const projectSummaries = await Promise.all(
      rawProjects.map(async (proj: any) => {
        const projTasksTotal = await TaskModel.countDocuments({ projectId: proj._id });
        const projTasksDone = await TaskModel.countDocuments({ projectId: proj._id, status: TASK_STATUS.DONE });
        const progress = projTasksTotal > 0 ? Math.round((projTasksDone / projTasksTotal) * 100) : 0;

        return {
          id: proj._id.toString(),
          key: proj.key,
          name: proj.name,
          status: proj.status,
          priority: proj.priority,
          color: proj.color || '#4F46E5',
          totalTasks: projTasksTotal,
          completedTasks: projTasksDone,
          progressPercentage: progress,
          targetDate: proj.targetDate
        };
      })
    );

    // 5. Upcoming Deadlines (Limit 6)
    const deadlineTasks = await TaskModel.find({
      ...taskFilter,
      dueDate: { $exists: true, $ne: null },
      status: { $ne: TASK_STATUS.DONE }
    })
      .sort({ dueDate: 1 })
      .limit(6)
      .populate('projectId', 'name key')
      .lean();

    const upcomingDeadlines = deadlineTasks.map((t: any) => {
      const dDate = new Date(t.dueDate);
      const isOverdue = dDate < startOfToday;
      const isDueToday = dDate >= startOfToday && dDate <= endOfToday;

      return {
        id: t._id.toString(),
        taskNumber: t.taskNumber,
        title: t.title,
        status: t.status,
        priority: t.priority,
        dueDate: dDate,
        isOverdue,
        isDueToday,
        projectName: t.projectId?.name,
        projectKey: t.projectId?.key
      };
    });

    return {
      metrics: {
        projects: {
          total: totalProjects,
          active: activeProjects,
          completed: completedProjects,
          archived: archivedProjects
        },
        tasks: {
          total: totalTasks,
          completed: completedTasks,
          inProgress: inProgressTasks,
          review: reviewTasks,
          todo: todoTasks,
          overdue: overdueCount,
          dueToday: dueTodayCount,
          completionRate
        },
        team: {
          activeMembers: activeMembersCount,
          workspaceMembers: workspaceMembersCount,
          pendingInvitations: pendingInvitationsCount
        }
      },
      projects: projectSummaries,
      upcomingDeadlines,
      context: {
        organisationId: org._id.toString(),
        organisationName: org.name,
        workspaceId: query.workspaceId,
        workspaceName
      }
    };
  }

  /**
   * Retrieves tasks assigned to the authenticated user within the organization
   */
  static async getMyTasks(
    userId: string,
    organisationId: string,
    query: MyTasksQuery
  ): Promise<any[]> {
    const userObjId = new mongoose.Types.ObjectId(userId);
    const orgObjId = new mongoose.Types.ObjectId(organisationId);

    const filter: any = {
      organisationId: orgObjId,
      assigneeIds: userObjId
    };

    if (query.workspaceId && mongoose.Types.ObjectId.isValid(query.workspaceId)) {
      filter.workspaceId = new mongoose.Types.ObjectId(query.workspaceId);
    }

    if (query.status && query.status !== 'all') {
      filter.status = query.status;
    }

    if (query.priority && query.priority !== 'all') {
      filter.priority = query.priority;
    }

    const tasks = await TaskModel.find(filter)
      .sort({ dueDate: 1, updatedAt: -1 })
      .limit(query.limit || 20)
      .populate('projectId', 'name key color')
      .populate('workspaceId', 'name slug')
      .lean();

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    return tasks.map((t: any) => {
      let isOverdue = false;
      let isDueToday = false;
      if (t.dueDate) {
        const d = new Date(t.dueDate);
        isOverdue = d < startOfToday && t.status !== TASK_STATUS.DONE;
        isDueToday = d >= startOfToday && d <= endOfToday && t.status !== TASK_STATUS.DONE;
      }

      return {
        id: t._id.toString(),
        taskNumber: t.taskNumber,
        title: t.title,
        status: t.status,
        priority: t.priority,
        dueDate: t.dueDate,
        isOverdue,
        isDueToday,
        project: t.projectId
          ? {
              id: t.projectId._id.toString(),
              name: t.projectId.name,
              key: t.projectId.key,
              color: t.projectId.color || '#4F46E5'
            }
          : null,
        workspace: t.workspaceId
          ? {
              id: t.workspaceId._id.toString(),
              name: t.workspaceId.name,
              slug: t.workspaceId.slug
            }
          : null,
        updatedAt: t.updatedAt
      };
    });
  }

  /**
   * Retrieves genuine recent audit trail activity for the organization
   */
  static async getActivity(
    organisationId: string,
    query: DashboardActivityQuery
  ): Promise<any[]> {
    const orgObjId = new mongoose.Types.ObjectId(organisationId);

    const logs = await AuditLogModel.find({ organisationId: orgObjId })
      .sort({ createdAt: -1 })
      .limit(query.limit || 20)
      .populate('userId', 'firstName lastName email avatarUrl')
      .lean();

    return logs.map((log: any) => {
      const user = log.userId;
      const actorName = user
        ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || 'Team Member'
        : 'System';

      return {
        id: log._id.toString(),
        actor: {
          id: user?._id?.toString(),
          name: actorName,
          email: user?.email,
          avatarUrl: user?.avatarUrl
        },
        action: log.action,
        entityType: log.entityType,
        entityId: log.entityId?.toString(),
        changes: log.changes,
        createdAt: log.createdAt
      };
    });
  }

  /**
   * Calculates genuine analytics, status distribution, and workload breakdown
   */
  static async getAnalytics(
    organisationId: string,
    query: DashboardAnalyticsQuery
  ): Promise<any> {
    const orgObjId = new mongoose.Types.ObjectId(organisationId);

    const match: any = { organisationId: orgObjId };
    if (query.workspaceId && mongoose.Types.ObjectId.isValid(query.workspaceId)) {
      match.workspaceId = new mongoose.Types.ObjectId(query.workspaceId);
    }

    // 1. Task Status Distribution
    const statusAgg = await TaskModel.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const statusDistribution: Record<string, number> = {
      [TASK_STATUS.BACKLOG]: 0,
      [TASK_STATUS.TODO]: 0,
      [TASK_STATUS.IN_PROGRESS]: 0,
      [TASK_STATUS.REVIEW]: 0,
      [TASK_STATUS.DONE]: 0
    };

    let totalStatusTasks = 0;
    statusAgg.forEach((s) => {
      statusDistribution[s._id] = s.count;
      totalStatusTasks += s.count;
    });

    // 2. Priority Distribution
    const priorityAgg = await TaskModel.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]);

    const priorityDistribution: Record<string, number> = {
      low: 0,
      medium: 0,
      high: 0,
      urgent: 0
    };

    priorityAgg.forEach((p) => {
      if (priorityDistribution[p._id] !== undefined) {
        priorityDistribution[p._id] = p.count;
      }
    });

    // 3. Project Progress Matrix
    const projects = await ProjectModel.find(match).lean();
    const projectProgress = await Promise.all(
      projects.map(async (proj: any) => {
        const total = await TaskModel.countDocuments({ projectId: proj._id });
        const done = await TaskModel.countDocuments({ projectId: proj._id, status: TASK_STATUS.DONE });
        return {
          id: proj._id.toString(),
          name: proj.name,
          key: proj.key,
          total,
          completed: done,
          percentage: total > 0 ? Math.round((done / total) * 100) : 0
        };
      })
    );

    return {
      statusDistribution,
      priorityDistribution,
      totalTasks: totalStatusTasks,
      projectProgress
    };
  }
}
