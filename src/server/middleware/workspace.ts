import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { ResponseEnvelope } from '../../shared/types/index.js';
import { WorkspaceModel, IWorkspaceDocument } from '../models/Workspace.js';
import { OrganisationModel, IOrganisationDocument } from '../models/Organisation.js';
import { OrganisationMembershipModel, IOrganisationMembershipDocument } from '../models/OrganisationMembership.js';

export interface WorkspaceContext {
  workspaceId: string;
  workspace: IWorkspaceDocument;
  organisation: IOrganisationDocument;
  membership: IOrganisationMembershipDocument;
}

declare global {
  namespace Express {
    interface Request {
      workspaceContext?: WorkspaceContext;
    }
  }
}

export const extractWorkspaceId = (req: Request): string | undefined => {
  return (
    req.params.workspaceId ||
    req.params.wsId ||
    (req.headers['x-workspace-id'] as string) ||
    req.body?.workspaceId
  );
};

/**
 * Enforces strict multi-tenant authorization (Anti-IDOR):
 * Verifies that the workspace exists, is active, and the caller is an active member
 * of the workspace's parent organization.
 */
export const requireWorkspaceAccess = async (
  req: Request,
  res: Response<ResponseEnvelope>,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required'
        }
      });
      return;
    }

    const workspaceId = extractWorkspaceId(req);
    if (!workspaceId || !mongoose.Types.ObjectId.isValid(workspaceId)) {
      res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_WORKSPACE_ID',
          message: 'Valid workspace identifier is required'
        }
      });
      return;
    }

    const workspace = await WorkspaceModel.findById(workspaceId);
    if (!workspace) {
      res.status(404).json({
        success: false,
        error: {
          code: 'WORKSPACE_NOT_FOUND',
          message: 'Workspace not found'
        }
      });
      return;
    }

    // Check workspace status (cannot operate on archived workspace via normal routes)
    if (workspace.status === 'archived' && !req.path.endsWith('/restore')) {
      res.status(403).json({
        success: false,
        error: {
          code: 'WORKSPACE_ARCHIVED',
          message: 'Workspace is archived and cannot be accessed'
        }
      });
      return;
    }

    // Check parent organization
    const organisation = await OrganisationModel.findById(workspace.organisationId);
    if (!organisation) {
      res.status(404).json({
        success: false,
        error: {
          code: 'ORGANISATION_NOT_FOUND',
          message: 'Parent organization not found'
        }
      });
      return;
    }

    if (organisation.status === 'archived') {
      res.status(403).json({
        success: false,
        error: {
          code: 'ORGANISATION_ARCHIVED',
          message: 'Parent organization is archived'
        }
      });
      return;
    }

    // Anti-IDOR: verify caller holds active membership in parent organization
    const membership = await OrganisationMembershipModel.findOne({
      organisationId: organisation._id,
      userId: new mongoose.Types.ObjectId(userId),
      status: 'active'
    });

    if (!membership) {
      res.status(403).json({
        success: false,
        error: {
          code: 'TENANT_ACCESS_DENIED',
          message: 'You do not have access to this workspace'
        }
      });
      return;
    }

    // If workspace is private, verify user is creator or org owner/admin
    if (workspace.isPrivate) {
      const isCreator = workspace.createdBy.toString() === userId;
      const isOrgAdminOrOwner = membership.role === 'owner' || membership.role === 'admin';
      if (!isCreator && !isOrgAdminOrOwner) {
        res.status(403).json({
          success: false,
          error: {
            code: 'PRIVATE_WORKSPACE_ACCESS_DENIED',
            message: 'This is a private workspace. Access is restricted.'
          }
        });
        return;
      }
    }

    req.workspaceContext = {
      workspaceId: workspace._id.toString(),
      workspace,
      organisation,
      membership
    };

    next();
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: {
        code: 'WORKSPACE_AUTH_ERROR',
        message: 'Failed to verify workspace access authorization',
        details: err.message
      }
    });
  }
};

/**
 * Enforces administrative authority over workspace lifecycle (creator or parent org owner/admin)
 */
export const requireWorkspaceAdminOrOwner = async (
  req: Request,
  res: Response<ResponseEnvelope>,
  next: NextFunction
): Promise<void> => {
  const context = req.workspaceContext;
  const userId = req.user?.userId;

  if (!context || !userId) {
    res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication and workspace context required'
      }
    });
    return;
  }

  const isCreator = context.workspace.createdBy.toString() === userId;
  const isOrgAdminOrOwner = context.membership.role === 'owner' || context.membership.role === 'admin';

  if (!isCreator && !isOrgAdminOrOwner) {
    res.status(403).json({
      success: false,
      error: {
        code: 'FORBIDDEN_WORKSPACE_MUTATION',
        message: 'Only workspace creators or organization administrators can perform this action'
      }
    });
    return;
  }

  next();
};

