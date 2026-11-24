import { Request, Response } from 'express';
import { TeamService } from '../services/teamService.js';
import { ResponseEnvelope } from '../../shared/types/index.js';
import {
  inviteMemberSchema,
  updateMemberRoleSchema,
  updateMemberStatusSchema,
  updateMemberWorkspacesSchema,
  acceptInvitationSchema
} from '../../shared/validation/team.js';

export class TeamController {
  public static async listMembers(req: Request, res: Response<ResponseEnvelope>): Promise<void> {
    try {
      const organisationId = req.params.organizationId;
      const result = await TeamService.listMembers(organisationId, {
        search: req.query.search as string,
        role: req.query.role as string,
        status: req.query.status as string,
        workspaceId: req.query.workspaceId as string,
        page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 50
      });

      res.status(200).json({
        success: true,
        data: result.members,
        meta: result.meta
      });
    } catch (err: any) {
      res.status(err.statusCode || 500).json({
        success: false,
        error: {
          code: err.code || 'TEAM_MEMBERS_ERROR',
          message: err.message || 'Failed to list team members'
        }
      });
    }
  }

  public static async getMember(req: Request, res: Response<ResponseEnvelope>): Promise<void> {
    try {
      const { organizationId, memberId } = req.params;
      const member = await TeamService.getMemberDetails(organizationId, memberId);

      res.status(200).json({
        success: true,
        data: member
      });
    } catch (err: any) {
      res.status(err.statusCode || 500).json({
        success: false,
        error: {
          code: err.code || 'MEMBER_DETAILS_ERROR',
          message: err.message || 'Failed to retrieve member details'
        }
      });
    }
  }

  public static async updateRole(req: Request, res: Response<ResponseEnvelope>): Promise<void> {
    try {
      const { organizationId, memberId } = req.params;
      const parsed = updateMemberRoleSchema.parse(req.body);
      const actorUserId = req.user!.userId;

      const updated = await TeamService.updateMemberRole(
        organizationId,
        actorUserId,
        memberId,
        parsed.role as any
      );

      res.status(200).json({
        success: true,
        data: updated
      });
    } catch (err: any) {
      res.status(err.statusCode || 400).json({
        success: false,
        error: {
          code: err.code || 'ROLE_UPDATE_ERROR',
          message: err.message || 'Failed to update member role'
        }
      });
    }
  }

  public static async updateStatus(req: Request, res: Response<ResponseEnvelope>): Promise<void> {
    try {
      const { organizationId, memberId } = req.params;
      const parsed = updateMemberStatusSchema.parse(req.body);
      const actorUserId = req.user!.userId;

      const updated = await TeamService.updateMemberStatus(
        organizationId,
        actorUserId,
        memberId,
        parsed.status
      );

      res.status(200).json({
        success: true,
        data: updated
      });
    } catch (err: any) {
      res.status(err.statusCode || 400).json({
        success: false,
        error: {
          code: err.code || 'STATUS_UPDATE_ERROR',
          message: err.message || 'Failed to update member status'
        }
      });
    }
  }

  public static async removeMember(req: Request, res: Response<ResponseEnvelope>): Promise<void> {
    try {
      const { organizationId, memberId } = req.params;
      const actorUserId = req.user!.userId;

      const result = await TeamService.removeMember(organizationId, actorUserId, memberId);

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (err: any) {
      res.status(err.statusCode || 400).json({
        success: false,
        error: {
          code: err.code || 'REMOVE_MEMBER_ERROR',
          message: err.message || 'Failed to remove member from organization'
        }
      });
    }
  }

  public static async updateMemberWorkspaces(req: Request, res: Response<ResponseEnvelope>): Promise<void> {
    try {
      const { organizationId, memberId } = req.params;
      const parsed = updateMemberWorkspacesSchema.parse(req.body);
      const actorUserId = req.user!.userId;

      const result = await TeamService.updateMemberWorkspaces(
        organizationId,
        actorUserId,
        memberId,
        parsed.workspaces as any
      );

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (err: any) {
      res.status(err.statusCode || 400).json({
        success: false,
        error: {
          code: err.code || 'WORKSPACE_MEMBERSHIP_ERROR',
          message: err.message || 'Failed to update member workspace memberships'
        }
      });
    }
  }

  public static async createInvitation(req: Request, res: Response<ResponseEnvelope>): Promise<void> {
    try {
      const organisationId = req.params.organizationId;
      const parsed = inviteMemberSchema.parse(req.body);
      const actorUserId = req.user!.userId;

      const invitation = await TeamService.createInvitation(organisationId, actorUserId, parsed as any);

      res.status(201).json({
        success: true,
        data: invitation
      });
    } catch (err: any) {
      res.status(err.statusCode || 400).json({
        success: false,
        error: {
          code: err.code || 'INVITATION_CREATE_ERROR',
          message: err.message || 'Failed to dispatch team invitation'
        }
      });
    }
  }

  public static async listInvitations(req: Request, res: Response<ResponseEnvelope>): Promise<void> {
    try {
      const organisationId = req.params.organizationId;
      const statusFilter = req.query.status as string;

      const invitations = await TeamService.listInvitations(organisationId, statusFilter);

      res.status(200).json({
        success: true,
        data: invitations
      });
    } catch (err: any) {
      res.status(err.statusCode || 500).json({
        success: false,
        error: {
          code: err.code || 'INVITATION_LIST_ERROR',
          message: err.message || 'Failed to list organization invitations'
        }
      });
    }
  }

  public static async resendInvitation(req: Request, res: Response<ResponseEnvelope>): Promise<void> {
    try {
      const { organizationId, invitationId } = req.params;
      const actorUserId = req.user!.userId;

      const invitation = await TeamService.resendInvitation(organizationId, actorUserId, invitationId);

      res.status(200).json({
        success: true,
        data: invitation
      });
    } catch (err: any) {
      res.status(err.statusCode || 400).json({
        success: false,
        error: {
          code: err.code || 'INVITATION_RESEND_ERROR',
          message: err.message || 'Failed to resend invitation'
        }
      });
    }
  }

  public static async cancelInvitation(req: Request, res: Response<ResponseEnvelope>): Promise<void> {
    try {
      const { organizationId, invitationId } = req.params;
      const actorUserId = req.user!.userId;

      const result = await TeamService.cancelInvitation(organizationId, actorUserId, invitationId);

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (err: any) {
      res.status(err.statusCode || 400).json({
        success: false,
        error: {
          code: err.code || 'INVITATION_CANCEL_ERROR',
          message: err.message || 'Failed to cancel invitation'
        }
      });
    }
  }

  public static async getInvitationByToken(req: Request, res: Response<ResponseEnvelope>): Promise<void> {
    try {
      const token = req.query.token as string || req.params.token;
      if (!token) {
        res.status(400).json({
          success: false,
          error: { code: 'TOKEN_REQUIRED', message: 'Invitation token is required' }
        });
        return;
      }

      const invitation = await TeamService.getInvitationByToken(token);

      res.status(200).json({
        success: true,
        data: invitation
      });
    } catch (err: any) {
      res.status(err.statusCode || 400).json({
        success: false,
        error: {
          code: err.code || 'INVITATION_LOOKUP_ERROR',
          message: err.message || 'Failed to look up invitation'
        }
      });
    }
  }

  public static async acceptInvitation(req: Request, res: Response<ResponseEnvelope>): Promise<void> {
    try {
      const parsed = acceptInvitationSchema.parse(req.body);
      const userId = req.user!.userId;

      const result = await TeamService.acceptInvitation(userId, parsed.token);

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (err: any) {
      res.status(err.statusCode || 400).json({
        success: false,
        error: {
          code: err.code || 'INVITATION_ACCEPT_ERROR',
          message: err.message || 'Failed to accept invitation'
        }
      });
    }
  }

  public static async getAuditHistory(req: Request, res: Response<ResponseEnvelope>): Promise<void> {
    try {
      const organisationId = req.params.organizationId;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;

      const logs = await TeamService.getTeamAuditHistory(organisationId, limit);

      res.status(200).json({
        success: true,
        data: logs
      });
    } catch (err: any) {
      res.status(err.statusCode || 500).json({
        success: false,
        error: {
          code: err.code || 'AUDIT_HISTORY_ERROR',
          message: err.message || 'Failed to retrieve team audit history'
        }
      });
    }
  }
}

