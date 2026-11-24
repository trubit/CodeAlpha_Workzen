import mongoose from 'mongoose';
import { ProjectModel, IProjectDocument } from '../models/Project.js';
import { WorkspaceModel } from '../models/Workspace.js';
import { OrganisationModel } from '../models/Organisation.js';
import { OrganisationMembershipModel } from '../models/OrganisationMembership.js';
import { UserModel } from '../models/User.js';
import { TaskModel } from '../models/Task.js';
import { AuditLogModel } from '../models/AuditLog.js';
import {
  CreateProjectInput,
  UpdateProjectInput,
  ListProjectsQuery
} from '../../shared/validation/project.js';
import { PROJECT_STATUS, TASK_STATUS } from '../../shared/constants/status.js';

export interface ProjectWithTelemetry {
  id: string;
  name: string;
  key: string;
  description: string;
  status: string;
  priority: string;
  color: string;
  startDate?: Date;
  targetDate?: Date;
  visibility: string;
  isArchived: boolean;
  archivedAt?: Date;
  tags: string[];
  workspace: {
    id: string;
    name: string;
    slug: string;
  };
  owner: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
  } | null;
  members: Array<{
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
  }>;
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  reviewTasks: number;
  todoTasks: number;
  progressPercentage: number;
  createdAt: Date;
  updatedAt: Date;
}

export class ProjectService {
  /**
   * Creates a new project in an active organization and workspace
   */
  public static async createProject(
    userId: string,
    organisationId: string,
    input: CreateProjectInput
  ): Promise<any> {
    const orgObjId = new mongoose.Types.ObjectId(organisationId);
    const userObjId = new mongoose.Types.ObjectId(userId);
    const wsObjId = new mongoose.Types.ObjectId(input.workspaceId);

    // 1. Verify organization exists and is active
    const org = await OrganisationModel.findOne({ _id: orgObjId, status: 'active' }).lean();
    if (!org) {
      const err: any = new Error('Active organization not found');
      err.statusCode = 404;
      err.code = 'ORGANISATION_NOT_FOUND';
      throw err;
    }

    // 2. Verify workspace belongs to organization and is active
    const ws = await WorkspaceModel.findOne({ _id: wsObjId, organisationId: orgObjId, status: 'active' }).lean();
    if (!ws) {
      const err: any = new Error('Specified workspace does not exist in this organization');
      err.statusCode = 404;
      err.code = 'WORKSPACE_NOT_FOUND';
      throw err;
    }

    // 3. Verify key uniqueness in organization
    const cleanKey = input.key.trim().toUpperCase();
    const existingKey = await ProjectModel.findOne({ organisationId: orgObjId, key: cleanKey }).lean();
    if (existingKey) {
      const err: any = new Error(`A project with key '${cleanKey}' already exists in this organization`);
      err.statusCode = 409;
      err.code = 'PROJECT_KEY_CONFLICT';
      throw err;
    }

    // 4. Validate owner
    const rawOwnerId = input.ownerId || input.leadId || userId;
    const ownerObjId = new mongoose.Types.ObjectId(rawOwnerId);
    const isOwnerMember = await OrganisationMembershipModel.findOne({
      organisationId: orgObjId,
      userId: ownerObjId,
      status: 'active'
    }).lean();

    if (!isOwnerMember) {
      const err: any = new Error('Project lead must be an active member of this organization');
      err.statusCode = 400;
      err.code = 'INVALID_PROJECT_OWNER';
      throw err;
    }

    // 5. Validate members
    const memberObjIds: mongoose.Types.ObjectId[] = [ownerObjId];
    const initialMembers: any[] = [
      {
        userId: ownerObjId,
        role: 'lead',
        status: 'active',
        joinedAt: new Date()
      }
    ];

    if (input.memberIds && input.memberIds.length > 0) {
      for (const mId of input.memberIds) {
        if (mongoose.Types.ObjectId.isValid(mId)) {
          const mObjId = new mongoose.Types.ObjectId(mId);
          const isMember = await OrganisationMembershipModel.findOne({
            organisationId: orgObjId,
            userId: mObjId,
            status: 'active'
          }).lean();
          if (isMember && !memberObjIds.some((id) => id.equals(mObjId))) {
            memberObjIds.push(mObjId);
            initialMembers.push({
              userId: mObjId,
              role: 'contributor',
              status: 'active',
              joinedAt: new Date()
            });
          }
        }
      }
    }

    // 6. Create Project
    const project = await ProjectModel.create({
      organisationId: orgObjId,
      workspaceId: wsObjId,
      name: input.name.trim(),
      key: cleanKey,
      description: input.description?.trim() || '',
      status: input.status || PROJECT_STATUS.PLANNING,
      priority: input.priority || 'medium',
      color: input.color || '#4F46E5',
      startDate: input.startDate,
      targetDate: input.targetDate,
      leadId: ownerObjId,
      ownerId: ownerObjId,
      memberIds: memberObjIds,
      members: initialMembers,
      visibility: input.visibility || 'workspace',
      tags: input.tags || [],
      isArchived: false,
      createdBy: userObjId,
      updatedBy: userObjId
    });

    // 7. Audit Log
    await AuditLogModel.create({
      organisationId: orgObjId,
      userId: userObjId,
      action: 'PROJECT_CREATED',
      entityType: 'project',
      entityId: project._id,
      changes: {
        name: project.name,
        key: project.key,
        workspaceId: project.workspaceId.toString(),
        leadId: ownerObjId.toString()
      }
    });

    return ProjectService.getProjectById(userId, organisationId, project._id.toString());
  }

  /**
   * Lists projects with filtering, sorting, pagination, and calculated telemetry
   */
  public static async listProjects(
    userId: string,
    organisationId: string,
    query: ListProjectsQuery
  ): Promise<{ projects: ProjectWithTelemetry[]; total: number; page: number; totalPages: number }> {
    const orgObjId = new mongoose.Types.ObjectId(organisationId);

    const filter: any = {
      organisationId: orgObjId,
      isArchived: query.isArchived === true
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

    if (query.visibility && query.visibility !== 'all') {
      filter.visibility = query.visibility;
    }

    if (query.search && query.search.trim()) {
      const searchRegex = new RegExp(query.search.trim(), 'i');
      filter.$or = [{ name: searchRegex }, { key: searchRegex }, { description: searchRegex }];
    }

    // Sorting
    const sortField = query.sortBy || 'updatedAt';
    const sortDir = query.sortOrder === 'asc' ? 1 : -1;
    const sort: any = { [sortField]: sortDir };

    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 20));
    const skip = (page - 1) * limit;

    const [total, rawProjects] = await Promise.all([
      ProjectModel.countDocuments(filter),
      ProjectModel.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('workspaceId', 'name slug themeColor')
        .populate('ownerId', 'firstName lastName email avatarUrl')
        .populate('leadId', 'firstName lastName email avatarUrl')
        .populate('memberIds', 'firstName lastName email avatarUrl')
        .lean()
    ]);

    const projects: ProjectWithTelemetry[] = await Promise.all(
      rawProjects.map(async (p: any) => {
        const [totalTasks, doneTasks, inProgressTasks, reviewTasks, todoTasks] = await Promise.all([
          TaskModel.countDocuments({ projectId: p._id }),
          TaskModel.countDocuments({ projectId: p._id, status: TASK_STATUS.DONE }),
          TaskModel.countDocuments({ projectId: p._id, status: TASK_STATUS.IN_PROGRESS }),
          TaskModel.countDocuments({ projectId: p._id, status: TASK_STATUS.REVIEW }),
          TaskModel.countDocuments({ projectId: p._id, status: TASK_STATUS.TODO })
        ]);

        const progress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;
        const ownerUser = p.ownerId || p.leadId;

        return {
          id: p._id.toString(),
          name: p.name,
          key: p.key,
          description: p.description || '',
          status: p.status,
          priority: p.priority,
          color: p.color || '#4F46E5',
          startDate: p.startDate,
          targetDate: p.targetDate,
          visibility: p.visibility || 'workspace',
          isArchived: Boolean(p.isArchived),
          archivedAt: p.archivedAt,
          tags: p.tags || [],
          workspace: p.workspaceId
            ? {
                id: p.workspaceId._id.toString(),
                name: p.workspaceId.name,
                slug: p.workspaceId.slug
              }
            : { id: '', name: 'Workspace', slug: '' },
          owner: ownerUser
            ? {
                id: ownerUser._id.toString(),
                name: `${ownerUser.firstName || ''} ${ownerUser.lastName || ''}`.trim() || ownerUser.email,
                email: ownerUser.email,
                avatarUrl: ownerUser.avatarUrl
              }
            : null,
          members: (p.memberIds || []).map((m: any) => ({
            id: m._id.toString(),
            name: `${m.firstName || ''} ${m.lastName || ''}`.trim() || m.email,
            email: m.email,
            avatarUrl: m.avatarUrl
          })),
          totalTasks,
          completedTasks: doneTasks,
          inProgressTasks,
          reviewTasks,
          todoTasks,
          progressPercentage: progress,
          createdAt: p.createdAt,
          updatedAt: p.updatedAt
        };
      })
    );

    return {
      projects,
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1
    };
  }

  /**
   * Retrieves single project details with complete task telemetry
   */
  public static async getProjectById(
    userId: string,
    organisationId: string,
    projectId: string
  ): Promise<ProjectWithTelemetry> {
    const orgObjId = new mongoose.Types.ObjectId(organisationId);
    const projObjId = new mongoose.Types.ObjectId(projectId);

    const p: any = await ProjectModel.findOne({ _id: projObjId, organisationId: orgObjId })
      .populate('workspaceId', 'name slug themeColor')
      .populate('ownerId', 'firstName lastName email avatarUrl')
      .populate('leadId', 'firstName lastName email avatarUrl')
      .populate('memberIds', 'firstName lastName email avatarUrl')
      .lean();

    if (!p) {
      const err: any = new Error('Project not found in this organization');
      err.statusCode = 404;
      err.code = 'PROJECT_NOT_FOUND';
      throw err;
    }

    const [totalTasks, doneTasks, inProgressTasks, reviewTasks, todoTasks] = await Promise.all([
      TaskModel.countDocuments({ projectId: p._id }),
      TaskModel.countDocuments({ projectId: p._id, status: TASK_STATUS.DONE }),
      TaskModel.countDocuments({ projectId: p._id, status: TASK_STATUS.IN_PROGRESS }),
      TaskModel.countDocuments({ projectId: p._id, status: TASK_STATUS.REVIEW }),
      TaskModel.countDocuments({ projectId: p._id, status: TASK_STATUS.TODO })
    ]);

    const progress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;
    const ownerUser = p.ownerId || p.leadId;

    return {
      id: p._id.toString(),
      name: p.name,
      key: p.key,
      description: p.description || '',
      status: p.status,
      priority: p.priority,
      color: p.color || '#4F46E5',
      startDate: p.startDate,
      targetDate: p.targetDate,
      visibility: p.visibility || 'workspace',
      isArchived: Boolean(p.isArchived),
      archivedAt: p.archivedAt,
      tags: p.tags || [],
      workspace: p.workspaceId
        ? {
            id: p.workspaceId._id.toString(),
            name: p.workspaceId.name,
            slug: p.workspaceId.slug
          }
        : { id: '', name: 'Workspace', slug: '' },
      owner: ownerUser
        ? {
            id: ownerUser._id.toString(),
            name: `${ownerUser.firstName || ''} ${ownerUser.lastName || ''}`.trim() || ownerUser.email,
            email: ownerUser.email,
            avatarUrl: ownerUser.avatarUrl
          }
        : null,
      members: (p.memberIds || []).map((m: any) => ({
        id: m._id.toString(),
        name: `${m.firstName || ''} ${m.lastName || ''}`.trim() || m.email,
        email: m.email,
        avatarUrl: m.avatarUrl
      })),
      totalTasks,
      completedTasks: doneTasks,
      inProgressTasks,
      reviewTasks,
      todoTasks,
      progressPercentage: progress,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt
    };
  }

  /**
   * Updates project properties and metadata
   */
  public static async updateProject(
    userId: string,
    organisationId: string,
    projectId: string,
    input: UpdateProjectInput
  ): Promise<ProjectWithTelemetry> {
    const orgObjId = new mongoose.Types.ObjectId(organisationId);
    const userObjId = new mongoose.Types.ObjectId(userId);
    const projObjId = new mongoose.Types.ObjectId(projectId);

    const project = await ProjectModel.findOne({ _id: projObjId, organisationId: orgObjId });
    if (!project) {
      const err: any = new Error('Project not found');
      err.statusCode = 404;
      err.code = 'PROJECT_NOT_FOUND';
      throw err;
    }

    if (project.isArchived) {
      const err: any = new Error('Cannot update an archived project. Please restore it first.');
      err.statusCode = 400;
      err.code = 'PROJECT_ARCHIVED';
      throw err;
    }

    const changes: Record<string, any> = {};

    if (input.name && input.name.trim() !== project.name) {
      changes.name = { from: project.name, to: input.name.trim() };
      project.name = input.name.trim();
    }

    if (input.description !== undefined && input.description !== project.description) {
      changes.description = { from: project.description, to: input.description.trim() };
      project.description = input.description.trim();
    }

    if (input.status && input.status !== project.status) {
      changes.status = { from: project.status, to: input.status };
      project.status = input.status;
    }

    if (input.priority && input.priority !== project.priority) {
      changes.priority = { from: project.priority, to: input.priority };
      project.priority = input.priority;
    }

    if (input.color && input.color !== project.color) {
      changes.color = { from: project.color, to: input.color };
      project.color = input.color;
    }

    if (input.startDate !== undefined) {
      project.startDate = input.startDate || undefined;
    }

    if (input.targetDate !== undefined) {
      project.targetDate = input.targetDate || undefined;
    }

    if (input.visibility && input.visibility !== project.visibility) {
      changes.visibility = { from: project.visibility, to: input.visibility };
      project.visibility = input.visibility;
    }

    if (input.tags) {
      project.tags = input.tags;
    }

    if (input.ownerId || input.leadId) {
      const newOwner = input.ownerId || input.leadId;
      if (newOwner && mongoose.Types.ObjectId.isValid(newOwner)) {
        const newOwnerObjId = new mongoose.Types.ObjectId(newOwner);
        project.ownerId = newOwnerObjId;
        project.leadId = newOwnerObjId;
        if (!project.memberIds.some((id: any) => id.equals(newOwnerObjId))) {
          project.memberIds.push(newOwnerObjId);
        }
      }
    }

    project.updatedBy = userObjId;
    await project.save();

    if (Object.keys(changes).length > 0) {
      await AuditLogModel.create({
        organisationId: orgObjId,
        userId: userObjId,
        action: 'PROJECT_UPDATED',
        entityType: 'project',
        entityId: project._id,
        changes
      });
    }

    return ProjectService.getProjectById(userId, organisationId, projectId);
  }

  /**
   * Updates project status directly
   */
  public static async updateStatus(
    userId: string,
    organisationId: string,
    projectId: string,
    newStatus: string
  ): Promise<ProjectWithTelemetry> {
    return ProjectService.updateProject(userId, organisationId, projectId, { status: newStatus as any });
  }

  /**
   * Updates project priority directly
   */
  public static async updatePriority(
    userId: string,
    organisationId: string,
    projectId: string,
    newPriority: string
  ): Promise<ProjectWithTelemetry> {
    return ProjectService.updateProject(userId, organisationId, projectId, { priority: newPriority as any });
  }

  /**
   * Transfers project ownership to an active organization member
   */
  public static async transferOwnership(
    userId: string,
    organisationId: string,
    projectId: string,
    newOwnerId: string
  ): Promise<ProjectWithTelemetry> {
    const orgObjId = new mongoose.Types.ObjectId(organisationId);
    const newOwnerObjId = new mongoose.Types.ObjectId(newOwnerId);

    const isMember = await OrganisationMembershipModel.findOne({
      organisationId: orgObjId,
      userId: newOwnerObjId,
      status: 'active'
    }).lean();

    if (!isMember) {
      const err: any = new Error('New project owner must be an active member of the organization');
      err.statusCode = 400;
      err.code = 'INVALID_PROJECT_OWNER';
      throw err;
    }

    return ProjectService.updateProject(userId, organisationId, projectId, {
      ownerId: newOwnerId,
      leadId: newOwnerId
    });
  }

  /**
   * Retrieves full details of all project members with their roles and profile information
   */
  public static async listProjectMembers(
    userId: string,
    organisationId: string,
    projectId: string,
    query?: { search?: string; role?: string; page?: number; limit?: number }
  ): Promise<{
    members: Array<{
      id: string;
      name: string;
      email: string;
      avatarUrl?: string;
      role: 'lead' | 'contributor' | 'observer';
      isOwner: boolean;
      status: string;
      joinedAt: Date;
    }>;
    total: number;
    project: {
      id: string;
      name: string;
      key: string;
      ownerId?: string;
      leadId?: string;
    };
  }> {
    const orgObjId = new mongoose.Types.ObjectId(organisationId);
    const projObjId = new mongoose.Types.ObjectId(projectId);

    const project: any = await ProjectModel.findOne({ _id: projObjId, organisationId: orgObjId }).lean();
    if (!project) {
      const err: any = new Error('Project not found');
      err.statusCode = 404;
      err.code = 'PROJECT_NOT_FOUND';
      throw err;
    }

    // Collect all member IDs (from members array and memberIds)
    const memberRoleMap = new Map<string, { role: 'lead' | 'contributor' | 'observer'; status: string; joinedAt: Date }>();

    if (project.members && project.members.length > 0) {
      for (const m of project.members) {
        const uId = m.userId?.toString();
        if (uId) {
          memberRoleMap.set(uId, {
            role: m.role || 'contributor',
            status: m.status || 'active',
            joinedAt: m.joinedAt || project.createdAt
          });
        }
      }
    }

    // Ensure all memberIds have an entry
    const allUserObjIds: mongoose.Types.ObjectId[] = [];
    for (const mId of project.memberIds || []) {
      const uId = mId.toString();
      allUserObjIds.push(mId);
      if (!memberRoleMap.has(uId)) {
        const isOwner = project.ownerId && project.ownerId.toString() === uId;
        memberRoleMap.set(uId, {
          role: isOwner ? 'lead' : 'contributor',
          status: 'active',
          joinedAt: project.createdAt
        });
      }
    }

    // If owner is not in map, add owner
    if (project.ownerId) {
      const ownerStr = project.ownerId.toString();
      if (!memberRoleMap.has(ownerStr)) {
        allUserObjIds.push(project.ownerId);
        memberRoleMap.set(ownerStr, {
          role: 'lead',
          status: 'active',
          joinedAt: project.createdAt
        });
      }
    }

    const users = await UserModel.find({ _id: { $in: allUserObjIds } })
      .select('firstName lastName name email avatarUrl')
      .lean();

    let formatted = users.map((u: any) => {
      const uId = u._id.toString();
      const meta = memberRoleMap.get(uId) || {
        role: 'contributor' as const,
        status: 'active',
        joinedAt: project.createdAt
      };
      const isOwner = !!(project.ownerId && project.ownerId.toString() === uId);
      const displayName = u.name || `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email;

      return {
        id: uId,
        name: displayName,
        email: u.email,
        avatarUrl: u.avatarUrl,
        role: isOwner ? ('lead' as const) : meta.role,
        isOwner,
        status: meta.status,
        joinedAt: meta.joinedAt
      };
    });

    // Apply role filter if requested
    if (query?.role) {
      formatted = formatted.filter((m) => m.role === query.role);
    }

    // Apply search filter if requested
    if (query?.search && query.search.trim()) {
      const q = query.search.trim().toLowerCase();
      formatted = formatted.filter(
        (m) => m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q)
      );
    }

    // Sort: Owner/Lead first, then alphabetically by name
    formatted.sort((a, b) => {
      if (a.isOwner) return -1;
      if (b.isOwner) return 1;
      if (a.role === 'lead' && b.role !== 'lead') return -1;
      if (b.role === 'lead' && a.role !== 'lead') return 1;
      return a.name.localeCompare(b.name);
    });

    const total = formatted.length;
    const page = query?.page || 1;
    const limit = query?.limit || 50;
    const pagedMembers = formatted.slice((page - 1) * limit, page * limit);

    return {
      members: pagedMembers,
      total,
      project: {
        id: project._id.toString(),
        name: project.name,
        key: project.key,
        ownerId: project.ownerId?.toString(),
        leadId: project.leadId?.toString()
      }
    };
  }

  /**
   * Retrieves active organization members who are eligible to be added to the project roster
   */
  public static async getEligibleOrganisationMembers(
    userId: string,
    organisationId: string,
    projectId: string,
    search?: string
  ): Promise<
    Array<{
      id: string;
      name: string;
      email: string;
      avatarUrl?: string;
      orgRole: string;
    }>
  > {
    const orgObjId = new mongoose.Types.ObjectId(organisationId);
    const projObjId = new mongoose.Types.ObjectId(projectId);

    const project: any = await ProjectModel.findOne({ _id: projObjId, organisationId: orgObjId }).lean();
    if (!project) {
      const err: any = new Error('Project not found');
      err.statusCode = 404;
      err.code = 'PROJECT_NOT_FOUND';
      throw err;
    }

    // Exclude users already in the project
    const existingMemberUserIds = (project.memberIds || []).map((id: any) => id.toString());
    if (project.ownerId) {
      existingMemberUserIds.push(project.ownerId.toString());
    }

    // Find active memberships in organization
    const orgMemberships = await OrganisationMembershipModel.find({
      organisationId: orgObjId,
      status: 'active',
      userId: { $nin: existingMemberUserIds.map((id: string) => new mongoose.Types.ObjectId(id)) }
    })
      .populate('userId', 'firstName lastName name email avatarUrl')
      .lean();

    let eligible = orgMemberships
      .filter((m: any) => m.userId)
      .map((m: any) => {
        const u = m.userId;
        const displayName = u.name || `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email;
        return {
          id: u._id.toString(),
          name: displayName,
          email: u.email,
          avatarUrl: u.avatarUrl,
          orgRole: m.role || 'member'
        };
      });

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      eligible = eligible.filter(
        (e) => e.name.toLowerCase().includes(q) || e.email.toLowerCase().includes(q)
      );
    }

    eligible.sort((a, b) => a.name.localeCompare(b.name));
    return eligible;
  }

  /**
   * Adds members to project roster
   */
  public static async addMembers(
    userId: string,
    organisationId: string,
    projectId: string,
    memberIds: string[],
    role: 'lead' | 'contributor' | 'observer' = 'contributor'
  ): Promise<ProjectWithTelemetry> {
    const orgObjId = new mongoose.Types.ObjectId(organisationId);
    const userObjId = new mongoose.Types.ObjectId(userId);
    const projObjId = new mongoose.Types.ObjectId(projectId);

    const project = await ProjectModel.findOne({ _id: projObjId, organisationId: orgObjId });
    if (!project) {
      const err: any = new Error('Project not found');
      err.statusCode = 404;
      err.code = 'PROJECT_NOT_FOUND';
      throw err;
    }

    if (!project.members) {
      project.members = [];
    }

    const added: string[] = [];
    for (const mId of memberIds) {
      if (mongoose.Types.ObjectId.isValid(mId)) {
        const mObjId = new mongoose.Types.ObjectId(mId);
        const isMember = await OrganisationMembershipModel.findOne({
          organisationId: orgObjId,
          userId: mObjId,
          status: 'active'
        }).lean();

        if (isMember) {
          const alreadyInIds = project.memberIds.some((id: any) => id.equals(mObjId));
          if (!alreadyInIds) {
            project.memberIds.push(mObjId);
          }

          const existingMemberObj = project.members.find((m: any) => m.userId.equals(mObjId));
          if (!existingMemberObj) {
            project.members.push({
              userId: mObjId,
              role: role || 'contributor',
              status: 'active',
              joinedAt: new Date()
            });
            added.push(mId);
          }
        }
      }
    }

    if (added.length > 0) {
      project.updatedBy = userObjId;
      await project.save();

      await AuditLogModel.create({
        organisationId: orgObjId,
        userId: userObjId,
        action: 'PROJECT_MEMBERS_ADDED',
        entityType: 'project',
        entityId: project._id,
        changes: { addedMemberIds: added, role }
      });
    }

    return ProjectService.getProjectById(userId, organisationId, projectId);
  }

  /**
   * Updates project member role (lead, contributor, observer)
   */
  public static async updateMemberRole(
    userId: string,
    organisationId: string,
    projectId: string,
    memberId: string,
    newRole: 'lead' | 'contributor' | 'observer'
  ): Promise<any> {
    const orgObjId = new mongoose.Types.ObjectId(organisationId);
    const userObjId = new mongoose.Types.ObjectId(userId);
    const projObjId = new mongoose.Types.ObjectId(projectId);
    const memberObjId = new mongoose.Types.ObjectId(memberId);

    const project = await ProjectModel.findOne({ _id: projObjId, organisationId: orgObjId });
    if (!project) {
      const err: any = new Error('Project not found');
      err.statusCode = 404;
      err.code = 'PROJECT_NOT_FOUND';
      throw err;
    }

    // Owner protection: cannot change owner's role away from lead
    if (project.ownerId && project.ownerId.equals(memberObjId)) {
      if (newRole !== 'lead') {
        const err: any = new Error('Cannot change the role of the project owner. Transfer ownership first.');
        err.statusCode = 400;
        err.code = 'CANNOT_DEMOTE_PROJECT_OWNER';
        throw err;
      }
    }

    if (!project.members) {
      project.members = [];
    }

    let memberEntry = project.members.find((m: any) => m.userId.equals(memberObjId));
    if (!memberEntry) {
      // Check if user is in memberIds
      if (project.memberIds.some((id: any) => id.equals(memberObjId))) {
        project.members.push({
          userId: memberObjId,
          role: newRole,
          status: 'active',
          joinedAt: project.createdAt
        });
      } else {
        const err: any = new Error('User is not a member of this project');
        err.statusCode = 404;
        err.code = 'MEMBER_NOT_IN_PROJECT';
        throw err;
      }
    } else {
      memberEntry.role = newRole;
    }

    project.updatedBy = userObjId;
    await project.save();

    await AuditLogModel.create({
      organisationId: orgObjId,
      userId: userObjId,
      action: 'PROJECT_MEMBER_ROLE_UPDATED',
      entityType: 'project',
      entityId: project._id,
      changes: { memberId, newRole }
    });

    return ProjectService.listProjectMembers(userId, organisationId, projectId);
  }

  /**
   * Removes member from project roster
   */
  public static async removeMember(
    userId: string,
    organisationId: string,
    projectId: string,
    memberId: string
  ): Promise<ProjectWithTelemetry> {
    const orgObjId = new mongoose.Types.ObjectId(organisationId);
    const userObjId = new mongoose.Types.ObjectId(userId);
    const projObjId = new mongoose.Types.ObjectId(projectId);
    const memberObjId = new mongoose.Types.ObjectId(memberId);

    const project = await ProjectModel.findOne({ _id: projObjId, organisationId: orgObjId });
    if (!project) {
      const err: any = new Error('Project not found');
      err.statusCode = 404;
      err.code = 'PROJECT_NOT_FOUND';
      throw err;
    }

    // Owner protection: cannot remove project owner from membership
    if (project.ownerId && project.ownerId.equals(memberObjId)) {
      const err: any = new Error('Cannot remove the project lead from the roster. Transfer ownership first.');
      err.statusCode = 400;
      err.code = 'CANNOT_REMOVE_PROJECT_OWNER';
      throw err;
    }

    project.memberIds = project.memberIds.filter((id: any) => !id.equals(memberObjId));
    if (project.members) {
      project.members = project.members.filter((m: any) => !m.userId.equals(memberObjId));
    }

    project.updatedBy = userObjId;
    await project.save();

    await AuditLogModel.create({
      organisationId: orgObjId,
      userId: userObjId,
      action: 'PROJECT_MEMBER_REMOVED',
      entityType: 'project',
      entityId: project._id,
      changes: { removedMemberId: memberId }
    });

    return ProjectService.getProjectById(userId, organisationId, projectId);
  }

  /**
   * Retrieves audit trail specifically for project membership events
   */
  public static async getProjectMemberActivity(
    userId: string,
    organisationId: string,
    projectId: string,
    limit: number = 50
  ): Promise<any[]> {
    const orgObjId = new mongoose.Types.ObjectId(organisationId);
    const projObjId = new mongoose.Types.ObjectId(projectId);

    const project: any = await ProjectModel.findOne({ _id: projObjId, organisationId: orgObjId }).lean();
    if (!project) {
      const err: any = new Error('Project not found');
      err.statusCode = 404;
      err.code = 'PROJECT_NOT_FOUND';
      throw err;
    }

    const membershipActions = [
      'PROJECT_MEMBERS_ADDED',
      'PROJECT_MEMBER_REMOVED',
      'PROJECT_MEMBER_ROLE_UPDATED',
      'PROJECT_OWNERSHIP_TRANSFERRED',
      'PROJECT_CREATED'
    ];

    const logs = await AuditLogModel.find({
      organisationId: orgObjId,
      entityId: projObjId,
      action: { $in: membershipActions }
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('userId', 'name email avatarUrl')
      .lean();

    return logs.map((log: any) => ({
      id: log._id.toString(),
      action: log.action,
      actor: log.userId
        ? {
            id: log.userId._id.toString(),
            name: log.userId.name,
            email: log.userId.email,
            avatarUrl: log.userId.avatarUrl
          }
        : null,
      changes: log.changes,
      timestamp: log.createdAt
    }));
  }

  /**
   * Archives a project safely after name confirmation
   */
  public static async archiveProject(
    userId: string,
    organisationId: string,
    projectId: string,
    confirmationName: string
  ): Promise<ProjectWithTelemetry> {
    const orgObjId = new mongoose.Types.ObjectId(organisationId);
    const userObjId = new mongoose.Types.ObjectId(userId);
    const projObjId = new mongoose.Types.ObjectId(projectId);

    const project = await ProjectModel.findOne({ _id: projObjId, organisationId: orgObjId });
    if (!project) {
      const err: any = new Error('Project not found');
      err.statusCode = 404;
      err.code = 'PROJECT_NOT_FOUND';
      throw err;
    }

    if (confirmationName.trim().toLowerCase() !== project.name.trim().toLowerCase()) {
      const err: any = new Error(`Confirmation name '${confirmationName}' does not match project name '${project.name}'`);
      err.statusCode = 400;
      err.code = 'CONFIRMATION_MISMATCH';
      throw err;
    }

    project.isArchived = true;
    project.status = PROJECT_STATUS.ARCHIVED;
    project.archivedAt = new Date();
    project.archivedBy = userObjId;
    project.updatedBy = userObjId;
    await project.save();

    await AuditLogModel.create({
      organisationId: orgObjId,
      userId: userObjId,
      action: 'PROJECT_ARCHIVED',
      entityType: 'project',
      entityId: project._id,
      changes: { isArchived: true, status: 'archived' }
    });

    return ProjectService.getProjectById(userId, organisationId, projectId);
  }

  /**
   * Restores an archived project
   */
  public static async restoreProject(
    userId: string,
    organisationId: string,
    projectId: string
  ): Promise<ProjectWithTelemetry> {
    const orgObjId = new mongoose.Types.ObjectId(organisationId);
    const userObjId = new mongoose.Types.ObjectId(userId);
    const projObjId = new mongoose.Types.ObjectId(projectId);

    const project = await ProjectModel.findOne({ _id: projObjId, organisationId: orgObjId });
    if (!project) {
      const err: any = new Error('Project not found');
      err.statusCode = 404;
      err.code = 'PROJECT_NOT_FOUND';
      throw err;
    }

    project.isArchived = false;
    project.status = PROJECT_STATUS.ACTIVE;
    project.archivedAt = undefined;
    project.archivedBy = undefined;
    project.updatedBy = userObjId;
    await project.save();

    await AuditLogModel.create({
      organisationId: orgObjId,
      userId: userObjId,
      action: 'PROJECT_RESTORED',
      entityType: 'project',
      entityId: project._id,
      changes: { isArchived: false, status: 'active' }
    });

    return ProjectService.getProjectById(userId, organisationId, projectId);
  }

  /**
   * Safely deletes a project if confirmed and protected
   */
  public static async deleteProject(
    userId: string,
    organisationId: string,
    projectId: string,
    confirmationName: string
  ): Promise<void> {
    const orgObjId = new mongoose.Types.ObjectId(organisationId);
    const userObjId = new mongoose.Types.ObjectId(userId);
    const projObjId = new mongoose.Types.ObjectId(projectId);

    const project = await ProjectModel.findOne({ _id: projObjId, organisationId: orgObjId });
    if (!project) {
      const err: any = new Error('Project not found');
      err.statusCode = 404;
      err.code = 'PROJECT_NOT_FOUND';
      throw err;
    }

    if (confirmationName.trim().toLowerCase() !== project.name.trim().toLowerCase()) {
      const err: any = new Error(`Confirmation name '${confirmationName}' does not match project name '${project.name}'`);
      err.statusCode = 400;
      err.code = 'CONFIRMATION_MISMATCH';
      throw err;
    }

    // Cascade delete associated tasks or clean up
    await TaskModel.deleteMany({ projectId: projObjId });
    await ProjectModel.deleteOne({ _id: projObjId });

    await AuditLogModel.create({
      organisationId: orgObjId,
      userId: userObjId,
      action: 'PROJECT_DELETED',
      entityType: 'project',
      entityId: projObjId,
      changes: { name: project.name, key: project.key }
    });
  }

  /**
   * Retrieves recent audit logs for a project
   */
  public static async getProjectActivity(
    organisationId: string,
    projectId: string,
    limit = 20
  ): Promise<any[]> {
    const orgObjId = new mongoose.Types.ObjectId(organisationId);
    const projObjId = new mongoose.Types.ObjectId(projectId);

    const logs = await AuditLogModel.find({
      organisationId: orgObjId,
      entityId: projObjId
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('userId', 'firstName lastName email avatarUrl')
      .lean();

    return logs.map((l: any) => {
      const user = l.userId;
      const actorName = user
        ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email
        : 'System';

      return {
        id: l._id.toString(),
        actor: {
          id: user?._id?.toString(),
          name: actorName,
          email: user?.email,
          avatarUrl: user?.avatarUrl
        },
        action: l.action,
        changes: l.changes,
        createdAt: l.createdAt
      };
    });
  }
}

