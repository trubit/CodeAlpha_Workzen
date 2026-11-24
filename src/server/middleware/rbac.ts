import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { ResponseEnvelope } from '../../shared/types/index.js';
import { rbacService } from '../services/rbacService.js';
import { extractOrgId } from './tenant.js';
import { extractWorkspaceId } from './workspace.js';
import { AuditLogModel } from '../models/AuditLog.js';
import { PermissionKey } from '../../shared/constants/roles.js';

export interface RequirePermissionOptions {
  scope?: 'organization' | 'workspace';
}

/**
 * Enforces granular server-side capability authorization
 */
export const requirePermission = (
  requiredPermission: PermissionKey | string,
  options?: RequirePermissionOptions
) => {
  return async (
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

      const orgId = req.tenant?.organisationId || extractOrgId(req);
      if (!orgId || !mongoose.Types.ObjectId.isValid(orgId)) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_ORG_ID',
            message: 'A valid organization identifier is required for permission evaluation'
          }
        });
        return;
      }

      const wsId =
        options?.scope === 'workspace'
          ? req.workspaceContext?.workspaceId || extractWorkspaceId(req)
          : undefined;

      const hasGrant = await rbacService.hasPermission(userId, orgId, requiredPermission, wsId);

      if (!hasGrant) {
        // Record security incident in immutable audit log
        try {
          await AuditLogModel.create({
            organisationId: new mongoose.Types.ObjectId(orgId),
            userId: new mongoose.Types.ObjectId(userId),
            userEmail: req.user?.email || 'unknown@workzen.io',
            action: 'ACCESS_DENIED',
            entityType: 'permission',
            entityId: requiredPermission,
            ipAddress: req.ip || '127.0.0.1'
          });
        } catch (e) {
          // Fail open for logging error, but continue denying access
        }

        res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN_PERMISSION_DENIED',
            message: `Access denied: Insufficient privileges. Required capability: '${requiredPermission}'`,
            details: {
              requiredPermission,
              scope: options?.scope || 'organization',
              organisationId: orgId,
              workspaceId: wsId
            }
          }
        });
        return;
      }

      next();
    } catch (error: any) {
      next(error);
    }
  };
};

/**
 * Enforces role-based checks (for high-level operational gates)
 */
export const requireRole = (allowedRoles: string[]) => {
  return async (
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

      const orgId = req.tenant?.organisationId || extractOrgId(req);
      if (!orgId || !mongoose.Types.ObjectId.isValid(orgId)) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_ORG_ID',
            message: 'A valid organization identifier is required'
          }
        });
        return;
      }

      const effective = await rbacService.getUserEffectivePermissions(userId, orgId);

      if (effective.isOwner) {
        return next();
      }

      const hasAllowedRole =
        allowedRoles.includes(effective.primaryRole) ||
        effective.roles.some((r) => allowedRoles.includes(r.slug));

      if (!hasAllowedRole) {
        res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN_ROLE_REQUIRED',
            message: `Access denied: One of the following roles is required: [${allowedRoles.join(', ')}]`
          }
        });
        return;
      }

      next();
    } catch (error: any) {
      next(error);
    }
  };
};

