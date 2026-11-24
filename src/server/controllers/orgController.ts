import { Request, Response, NextFunction } from 'express';
import { ResponseEnvelope } from '../../shared/types/index.js';
import { OrganisationService } from '../services/orgService.js';
import {
  createOrgSchema,
  updateOrgSchema,
  updateOrgSettingsSchema,
  transferOwnershipSchema,
  deleteOrgSchema
} from '../../shared/validation/organization.js';

export class OrganisationController {
  /**
   * POST /api/v1/organizations
   * Create a new organization and assign creator as owner
   */
  static async create(
    req: Request,
    res: Response<ResponseEnvelope>,
    next: NextFunction
  ): Promise<void> {
    try {
      const validatedInput = createOrgSchema.parse(req.body);
      const userId = req.user!.userId;

      const result = await OrganisationService.createOrganisation(userId, validatedInput, {
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });

      res.status(201).json({
        success: true,
        data: {
          organisation: result.organisation,
          membership: result.membership
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/organizations
   * List all active organizations the user belongs to
   */
  static async list(
    req: Request,
    res: Response<ResponseEnvelope>,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user!.userId;
      const organisations = await OrganisationService.getUserOrganisations(userId);

      res.status(200).json({
        success: true,
        data: {
          organisations,
          count: organisations.length
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/organizations/:organizationId
   * Retrieve organization details
   */
  static async getById(
    req: Request,
    res: Response<ResponseEnvelope>,
    next: NextFunction
  ): Promise<void> {
    try {
      const orgId = req.params.organizationId;
      const userId = req.user!.userId;

      const details = await OrganisationService.getOrganisationById(orgId, userId);

      res.status(200).json({
        success: true,
        data: details
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/v1/organizations/:organizationId
   * Update organization details (restricted to owner)
   */
  static async update(
    req: Request,
    res: Response<ResponseEnvelope>,
    next: NextFunction
  ): Promise<void> {
    try {
      const orgId = req.params.organizationId;
      const userId = req.user!.userId;
      const validatedInput = updateOrgSchema.parse(req.body);

      const updatedOrg = await OrganisationService.updateOrganisation(
        orgId,
        userId,
        validatedInput,
        {
          ipAddress: req.ip,
          userAgent: req.get('user-agent')
        }
      );

      res.status(200).json({
        success: true,
        data: updatedOrg
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/v1/organizations/:organizationId/settings
   * Update organization security and regional settings (restricted to owner)
   */
  static async updateSettings(
    req: Request,
    res: Response<ResponseEnvelope>,
    next: NextFunction
  ): Promise<void> {
    try {
      const orgId = req.params.organizationId;
      const userId = req.user!.userId;
      const validatedInput = updateOrgSettingsSchema.parse(req.body);

      const updatedOrg = await OrganisationService.updateSettings(
        orgId,
        userId,
        validatedInput,
        {
          ipAddress: req.ip,
          userAgent: req.get('user-agent')
        }
      );

      res.status(200).json({
        success: true,
        data: updatedOrg
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/v1/organizations/:organizationId/logo
   * Update organization logo URL (restricted to owner)
   */
  static async updateLogo(
    req: Request,
    res: Response<ResponseEnvelope>,
    next: NextFunction
  ): Promise<void> {
    try {
      const orgId = req.params.organizationId;
      const userId = req.user!.userId;
      const { logoUrl } = req.body;

      if (!logoUrl || typeof logoUrl !== 'string') {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_LOGO_URL',
            message: 'Valid logoUrl string is required'
          }
        });
        return;
      }

      const updatedOrg = await OrganisationService.updateLogo(orgId, userId, logoUrl);

      res.status(200).json({
        success: true,
        data: updatedOrg
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/organizations/:organizationId/select
   * Verifies and confirms organization context selection
   */
  static async select(
    req: Request,
    res: Response<ResponseEnvelope>,
    next: NextFunction
  ): Promise<void> {
    try {
      const orgId = req.params.organizationId;
      const userId = req.user!.userId;

      // Verification via service
      const orgDetails = await OrganisationService.getOrganisationById(orgId, userId);

      res.status(200).json({
        success: true,
        data: {
          selectedOrganisation: orgDetails,
          message: `Active organization switched to '${orgDetails.name}'`
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/organizations/:organizationId/transfer-ownership
   * Transfers ownership to another active member (restricted to owner)
   */
  static async transferOwnership(
    req: Request,
    res: Response<ResponseEnvelope>,
    next: NextFunction
  ): Promise<void> {
    try {
      const orgId = req.params.organizationId;
      const userId = req.user!.userId;
      const { newOwnerId } = transferOwnershipSchema.parse(req.body);

      const result = await OrganisationService.transferOwnership(orgId, userId, newOwnerId, {
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/v1/organizations/:organizationId
   * Safe archival and soft-deletion of organization (restricted to owner)
   */
  static async archive(
    req: Request,
    res: Response<ResponseEnvelope>,
    next: NextFunction
  ): Promise<void> {
    try {
      const orgId = req.params.organizationId;
      const userId = req.user!.userId;
      const { orgNameConfirmation } = deleteOrgSchema.parse(req.body);

      const result = await OrganisationService.archiveOrganisation(
        orgId,
        userId,
        orgNameConfirmation,
        {
          ipAddress: req.ip,
          userAgent: req.get('user-agent')
        }
      );

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/organizations/:organizationId/members
   * List active organization members
   */
  static async listMembers(
    req: Request,
    res: Response<ResponseEnvelope>,
    next: NextFunction
  ): Promise<void> {
    try {
      const orgId = req.params.organizationId;
      const members = await OrganisationService.getOrganisationMembers(orgId);

      res.status(200).json({
        success: true,
        data: {
          members,
          count: members.length
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

