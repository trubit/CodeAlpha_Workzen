import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { ResponseEnvelope } from '../../shared/types/index.js';
import { OrganisationModel, IOrganisationDocument } from '../models/Organisation.js';
import { OrganisationMembershipModel, IOrganisationMembershipDocument } from '../models/OrganisationMembership.js';

export interface TenantContext {
  organisationId: string;
  organisation: IOrganisationDocument;
  membership: IOrganisationMembershipDocument;
}

declare global {
  namespace Express {
    interface Request {
      tenant?: TenantContext;
    }
  }
}

/**
 * Resolves the target organisation ID from route params, headers, or body
 */
export const extractOrgId = (req: Request): string | undefined => {
  return (
    req.params.organizationId ||
    req.params.orgId ||
    (req.headers['x-organisation-id'] as string) ||
    req.body?.organisationId
  );
};

/**
 * Enforces strict multi-tenant authorization (IDOR Prevention):
 * Verifies that the authenticated user holds an active membership in the requested organisation.
 */
export const requireOrgMember = async (
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

    const orgId = extractOrgId(req);
    if (!orgId || !mongoose.Types.ObjectId.isValid(orgId)) {
      res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_ORG_ID',
          message: 'Valid organization identifier is required'
        }
      });
      return;
    }

    // Check organization existence and status
    const organisation = await OrganisationModel.findById(orgId);
    if (!organisation) {
      res.status(404).json({
        success: false,
        error: {
          code: 'ORGANISATION_NOT_FOUND',
          message: 'Organization not found'
        }
      });
      return;
    }

    if (organisation.status === 'archived') {
      res.status(403).json({
        success: false,
        error: {
          code: 'ORGANISATION_ARCHIVED',
          message: 'This organization has been archived and is no longer accessible'
        }
      });
      return;
    }

    // Verify active membership in this tenant
    const membership = await OrganisationMembershipModel.findOne({
      organisationId: organisation._id,
      userId: new mongoose.Types.ObjectId(userId),
      status: 'active'
    });

    if (!membership) {
      // Cross-tenant access strictly blocked (anti-IDOR)
      res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN_CROSS_TENANT',
          message: 'Access forbidden: You do not have active membership in this organization tenant'
        }
      });
      return;
    }

    // Attach verified tenant context to request
    req.tenant = {
      organisationId: organisation._id.toString(),
      organisation,
      membership
    };

    next();
  } catch (error: any) {
    next(error);
  }
};

/**
 * Enforces owner-only authorization:
 * Caller must be the registered owner (ownerId) of the organization.
 */
export const requireOrgOwner = async (
  req: Request,
  res: Response<ResponseEnvelope>,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.tenant) {
      await requireOrgMember(req, res, () => {});
      if (!req.tenant) return; // Response already sent if check failed
    }

    const userId = req.user?.userId;
    const isOwner = req.tenant.organisation.ownerId.toString() === userId;

    if (!isOwner) {
      res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN_NOT_OWNER',
          message: 'Operation restricted: Only the organization owner can perform this administrative action'
        }
      });
      return;
    }

    next();
  } catch (error: any) {
    next(error);
  }
};
