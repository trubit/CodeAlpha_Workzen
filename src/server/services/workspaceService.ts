import mongoose from 'mongoose';
import { WorkspaceModel, IWorkspaceDocument } from '../models/Workspace.js';
import { OrganisationModel } from '../models/Organisation.js';
import { ProjectModel } from '../models/Project.js';
import { TaskModel } from '../models/Task.js';
import { AuditLogModel } from '../models/AuditLog.js';
import {
  CreateWorkspaceInput,
  UpdateWorkspaceInput,
  UpdateWorkspaceSettingsInput,
  ArchiveWorkspaceInput,
  createWorkspaceSchema,
  updateWorkspaceSchema,
  updateWorkspaceSettingsSchema,
  archiveWorkspaceSchema
} from '../../shared/validation/workspace.js';

export class WorkspaceService {
  /**
   * Generates a clean URL-friendly slug unique within an organization
   */
  public static async generateUniqueSlug(organisationId: string, name: string): Promise<string> {
    const baseSlug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    let slug = baseSlug || 'workspace';
    let counter = 1;

    while (
      await WorkspaceModel.findOne({
        organisationId: new mongoose.Types.ObjectId(organisationId),
        slug
      })
    ) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return slug;
  }

  /**
   * Creates a new workspace within an active organization
   */
  public static async createWorkspace(
    organisationId: string,
    userId: string,
    input: CreateWorkspaceInput
  ): Promise<IWorkspaceDocument> {
    const parsed = createWorkspaceSchema.parse(input);

    const organisation = await OrganisationModel.findById(organisationId);
    if (!organisation) {
      throw { statusCode: 404, code: 'ORGANISATION_NOT_FOUND', message: 'Parent organization not found' };
    }

    if (organisation.status === 'archived') {
      throw { statusCode: 403, code: 'ORGANISATION_ARCHIVED', message: 'Cannot create workspaces in an archived organization' };
    }

    // Slug calculation with collision prevention
    let slug = parsed.slug;
    if (!slug) {
      slug = await this.generateUniqueSlug(organisationId, parsed.name);
    } else {
      const existing = await WorkspaceModel.findOne({
        organisationId: new mongoose.Types.ObjectId(organisationId),
        slug
      });
      if (existing) {
        throw { statusCode: 409, code: 'WORKSPACE_SLUG_CONFLICT', message: `A workspace with slug '${slug}' already exists in this organization` };
      }
    }

    const workspace = await WorkspaceModel.create({
      organisationId: new mongoose.Types.ObjectId(organisationId),
      name: parsed.name,
      slug,
      description: parsed.description,
      type: parsed.type || 'general',
      icon: parsed.icon || '📁',
      themeColor: parsed.themeColor || '#6366F1',
      isPrivate: parsed.isPrivate || false,
      status: 'active',
      settings: parsed.settings || {
        defaultTaskView: 'kanban',
        allowGuestAccess: false,
        requireApprovalForProjects: false
      },
      createdBy: new mongoose.Types.ObjectId(userId)
    });

    await AuditLogModel.create({
      organisationId: new mongoose.Types.ObjectId(organisationId),
      userId: new mongoose.Types.ObjectId(userId),
      action: 'WORKSPACE_CREATED',
      entityType: 'workspace',
      entityId: workspace._id,
      changes: { name: workspace.name, slug: workspace.slug }
    });

    return workspace;
  }

  /**
   * Lists all active workspaces within an organization accessible to the user
   */
  public static async listWorkspaces(
    organisationId: string,
    userId: string,
    userRole: string
  ): Promise<any[]> {
    const query: any = {
      organisationId: new mongoose.Types.ObjectId(organisationId),
      status: 'active'
    };

    // If not org owner/admin, exclude private workspaces unless created by this user
    if (userRole !== 'owner' && userRole !== 'admin') {
      query.$or = [
        { isPrivate: false },
        { isPrivate: true, createdBy: new mongoose.Types.ObjectId(userId) }
      ];
    }

    const workspaces = await WorkspaceModel.find(query).sort({ createdAt: -1 });

    // Enhance with project telemetry counts
    const enhanced = await Promise.all(
      workspaces.map(async (ws) => {
        const projectCount = await ProjectModel.countDocuments({
          workspaceId: ws._id
        });
        return {
          ...ws.toObject(),
          projectCount
        };
      })
    );

    return enhanced;
  }

  /**
   * Retrieves full workspace details and telemetry
   */
  public static async getWorkspaceById(workspaceId: string): Promise<any> {
    const workspace = await WorkspaceModel.findById(workspaceId)
      .populate('organisationId', 'name slug status')
      .populate('createdBy', 'firstName lastName email');

    if (!workspace) {
      throw { statusCode: 404, code: 'WORKSPACE_NOT_FOUND', message: 'Workspace not found' };
    }

    const projectCount = await ProjectModel.countDocuments({ workspaceId: workspace._id });
    const taskCount = await TaskModel.countDocuments({ workspaceId: workspace._id });

    return {
      ...workspace.toObject(),
      projectCount,
      taskCount
    };
  }

  /**
   * Updates workspace profile, identity, and access rules
   */
  public static async updateWorkspace(
    workspaceId: string,
    userId: string,
    input: UpdateWorkspaceInput
  ): Promise<IWorkspaceDocument> {
    const parsed = updateWorkspaceSchema.parse(input);

    const workspace = await WorkspaceModel.findById(workspaceId);
    if (!workspace) {
      throw { statusCode: 404, code: 'WORKSPACE_NOT_FOUND', message: 'Workspace not found' };
    }

    if (workspace.status === 'archived') {
      throw { statusCode: 403, code: 'WORKSPACE_ARCHIVED', message: 'Cannot update an archived workspace' };
    }

    if (parsed.name) workspace.name = parsed.name;
    if (parsed.description !== undefined) workspace.description = parsed.description;
    if (parsed.type) workspace.type = parsed.type;
    if (parsed.icon) workspace.icon = parsed.icon;
    if (parsed.themeColor) workspace.themeColor = parsed.themeColor;
    if (parsed.isPrivate !== undefined) workspace.isPrivate = parsed.isPrivate;

    await workspace.save();

    await AuditLogModel.create({
      organisationId: workspace.organisationId,
      userId: new mongoose.Types.ObjectId(userId),
      action: 'WORKSPACE_UPDATED',
      entityType: 'workspace',
      entityId: workspace._id,
      changes: { updatedFields: Object.keys(parsed) }
    });

    return workspace;
  }

  /**
   * Updates workspace settings and policies
   */
  public static async updateSettings(
    workspaceId: string,
    userId: string,
    input: UpdateWorkspaceSettingsInput
  ): Promise<IWorkspaceDocument> {
    const parsed = updateWorkspaceSettingsSchema.parse(input);

    const workspace = await WorkspaceModel.findById(workspaceId);
    if (!workspace) {
      throw { statusCode: 404, code: 'WORKSPACE_NOT_FOUND', message: 'Workspace not found' };
    }

    if (workspace.status === 'archived') {
      throw { statusCode: 403, code: 'WORKSPACE_ARCHIVED', message: 'Cannot update settings on an archived workspace' };
    }

    workspace.settings = {
      ...workspace.settings,
      ...parsed
    };

    await workspace.save();

    await AuditLogModel.create({
      organisationId: workspace.organisationId,
      userId: new mongoose.Types.ObjectId(userId),
      action: 'WORKSPACE_SETTINGS_UPDATED',
      entityType: 'workspace',
      entityId: workspace._id,
      changes: { settings: parsed }
    });

    return workspace;
  }

  /**
   * Safely soft-archives a workspace with explicit name confirmation
   */
  public static async archiveWorkspace(
    workspaceId: string,
    userId: string,
    input: ArchiveWorkspaceInput
  ): Promise<IWorkspaceDocument> {
    const parsed = archiveWorkspaceSchema.parse(input);

    const workspace = await WorkspaceModel.findById(workspaceId);
    if (!workspace) {
      throw { statusCode: 404, code: 'WORKSPACE_NOT_FOUND', message: 'Workspace not found' };
    }

    if (workspace.status === 'archived') {
      throw { statusCode: 400, code: 'ALREADY_ARCHIVED', message: 'Workspace is already archived' };
    }

    // Require exact match on workspace name
    if (parsed.confirmationName.trim() !== workspace.name.trim()) {
      throw {
        statusCode: 400,
        code: 'CONFIRMATION_MISMATCH',
        message: `Confirmation name does not match exact workspace name '${workspace.name}'`
      };
    }

    workspace.status = 'archived';
    workspace.archivedAt = new Date();
    workspace.archivedBy = new mongoose.Types.ObjectId(userId);

    await workspace.save();

    await AuditLogModel.create({
      organisationId: workspace.organisationId,
      userId: new mongoose.Types.ObjectId(userId),
      action: 'WORKSPACE_ARCHIVED',
      entityType: 'workspace',
      entityId: workspace._id,
      changes: { workspaceName: workspace.name, archivedAt: workspace.archivedAt }
    });

    return workspace;
  }

  /**
   * Restores an archived workspace back to active status
   */
  public static async restoreWorkspace(
    workspaceId: string,
    userId: string
  ): Promise<IWorkspaceDocument> {
    const workspace = await WorkspaceModel.findById(workspaceId);
    if (!workspace) {
      throw { statusCode: 404, code: 'WORKSPACE_NOT_FOUND', message: 'Workspace not found' };
    }

    if (workspace.status !== 'archived') {
      throw { statusCode: 400, code: 'WORKSPACE_NOT_ARCHIVED', message: 'Workspace is not archived' };
    }

    workspace.status = 'active';
    workspace.archivedAt = undefined;
    workspace.archivedBy = undefined;

    await workspace.save();

    await AuditLogModel.create({
      organisationId: workspace.organisationId,
      userId: new mongoose.Types.ObjectId(userId),
      action: 'WORKSPACE_RESTORED',
      entityType: 'workspace',
      entityId: workspace._id
    });

    return workspace;
  }
}
