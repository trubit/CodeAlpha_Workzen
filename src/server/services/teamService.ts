import mongoose from 'mongoose';
import crypto from 'crypto';
import { OrganisationModel } from '../models/Organisation.js';
import { OrganisationMembershipModel, IOrganisationMembershipDocument } from '../models/OrganisationMembership.js';
import { WorkspaceModel } from '../models/Workspace.js';
import { WorkspaceMembershipModel } from '../models/WorkspaceMembership.js';
import { InvitationModel, IInvitationDocument } from '../models/Invitation.js';
import { RoleAssignmentModel } from '../models/RoleAssignment.js';
import { UserModel } from '../models/User.js';
import { AuditLogModel } from '../models/AuditLog.js';
import { SessionModel } from '../models/Session.js';
import { hashToken } from '../utils/crypto.js';
import { sendInvitationEmail } from '../utils/mailer.js';
import { ENV } from '../config/env.js';
import { ORG_ROLES, OrgRole, WORKSPACE_ROLES, WorkspaceRole } from '../../shared/constants/roles.js';

export class TeamService {
  /**
   * List members of an organization with search, filters and pagination
   */
  public static async listMembers(
    organisationId: string,
    query: {
      search?: string;
      role?: string;
      status?: string;
      workspaceId?: string;
      page?: number;
      limit?: number;
    } = {}
  ) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.max(1, Math.min(100, query.limit || 50));
    const skip = (page - 1) * limit;

    const orgObjectId = new mongoose.Types.ObjectId(organisationId);
    const filter: any = { organisationId: orgObjectId };

    if (query.role) {
      filter.role = query.role;
    }
    if (query.status) {
      filter.status = query.status;
    }

    // If filtered by workspace, find users who belong to that workspace
    if (query.workspaceId && mongoose.Types.ObjectId.isValid(query.workspaceId)) {
      const wsMembers = await WorkspaceMembershipModel.find({
        workspaceId: new mongoose.Types.ObjectId(query.workspaceId),
        status: 'active'
      }).select('userId');
      const wsUserIds = wsMembers.map((m) => m.userId);
      filter.userId = { $in: wsUserIds };
    }

    // Retrieve memberships and populate user
    let memberships = await OrganisationMembershipModel.find(filter)
      .populate({
        path: 'userId',
        select: 'firstName lastName email avatarUrl isEmailVerified status lastLoginAt createdAt'
      })
      .sort({ createdAt: 1 });

    // Client/server fuzzy search filter on populated user fields
    if (query.search && query.search.trim()) {
      const q = query.search.toLowerCase().trim();
      memberships = memberships.filter((m: any) => {
        const u = m.userId;
        if (!u) return false;
        const fullName = `${u.firstName || ''} ${u.lastName || ''}`.toLowerCase();
        const email = (u.email || '').toLowerCase();
        return fullName.includes(q) || email.includes(q);
      });
    }

    const total = memberships.length;
    const paginated = memberships.slice(skip, skip + limit);

    // Populate workspaces for each member in this organization
    const memberProfiles = await Promise.all(
      paginated.map(async (m: any) => {
        const userObj = m.userId;
        if (!userObj) return null;

        const wsMemberships = await WorkspaceMembershipModel.find({
          organisationId: orgObjectId,
          userId: userObj._id,
          status: 'active'
        }).populate({
          path: 'workspaceId',
          select: 'name slug themeColor isPrivate'
        });

        const customRoles = await RoleAssignmentModel.find({
          organisationId: orgObjectId,
          userId: userObj._id
        }).populate('roleId');

        return {
          _id: userObj._id.toString(),
          membershipId: m._id.toString(),
          organisationId: organisationId,
          user: userObj,
          role: m.role,
          status: m.status,
          joinedAt: m.joinedAt || m.createdAt,
          workspaces: wsMemberships
            .filter((wm: any) => wm.workspaceId)
            .map((wm: any) => ({
              _id: wm._id.toString(),
              workspaceId: wm.workspaceId._id.toString(),
              name: wm.workspaceId.name,
              slug: wm.workspaceId.slug,
              role: wm.role,
              status: wm.status
            })),
          customRoles: customRoles.map((cr: any) => cr.roleId).filter(Boolean)
        };
      })
    );

    return {
      members: memberProfiles.filter(Boolean),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Retrieve single member details with memberships, roles and activity
   */
  public static async getMemberDetails(organisationId: string, targetUserId: string) {
    const orgObjectId = new mongoose.Types.ObjectId(organisationId);
    const userObjectId = new mongoose.Types.ObjectId(targetUserId);

    const membership = await OrganisationMembershipModel.findOne({
      organisationId: orgObjectId,
      userId: userObjectId
    }).populate({
      path: 'userId',
      select: 'firstName lastName email avatarUrl isEmailVerified status lastLoginAt createdAt'
    });

    if (!membership || !membership.userId) {
      throw { statusCode: 404, code: 'MEMBER_NOT_FOUND', message: 'Team member not found in this organization' };
    }

    const wsMemberships = await WorkspaceMembershipModel.find({
      organisationId: orgObjectId,
      userId: userObjectId
    }).populate({
      path: 'workspaceId',
      select: 'name slug themeColor isPrivate status'
    });

    const customRoles = await RoleAssignmentModel.find({
      organisationId: orgObjectId,
      userId: userObjectId
    }).populate('roleId');

    return {
      _id: targetUserId,
      membershipId: membership._id.toString(),
      organisationId,
      user: membership.userId,
      role: membership.role,
      status: membership.status,
      joinedAt: membership.joinedAt,
      workspaces: wsMemberships
        .filter((wm: any) => wm.workspaceId)
        .map((wm: any) => ({
          _id: wm._id.toString(),
          workspaceId: wm.workspaceId._id.toString(),
          name: wm.workspaceId.name,
          slug: wm.workspaceId.slug,
          role: wm.role,
          status: wm.status
        })),
      customRoles: customRoles.map((cr: any) => cr.roleId).filter(Boolean)
    };
  }

  /**
   * Update member organization role
   */
  public static async updateMemberRole(
    organisationId: string,
    actorUserId: string,
    targetUserId: string,
    newRole: OrgRole
  ) {
    const org = await OrganisationModel.findById(organisationId);
    if (!org) {
      throw { statusCode: 404, code: 'ORGANISATION_NOT_FOUND', message: 'Organization not found' };
    }

    // Protection invariant: Cannot change role of Organization Owner via normal update
    if (org.ownerId.toString() === targetUserId) {
      throw {
        statusCode: 403,
        code: 'CANNOT_MUTATE_OWNER_ROLE',
        message: 'Organization Owner role cannot be modified. Transfer organization ownership instead.'
      };
    }

    // Protection: Caller cannot assign the 'owner' role directly
    if (newRole === ORG_ROLES.OWNER) {
      throw {
        statusCode: 403,
        code: 'OWNER_ROLE_FORBIDDEN',
        message: 'Owner role can only be assigned through ownership transfer.'
      };
    }

    const membership = await OrganisationMembershipModel.findOne({
      organisationId: new mongoose.Types.ObjectId(organisationId),
      userId: new mongoose.Types.ObjectId(targetUserId)
    });

    if (!membership) {
      throw { statusCode: 404, code: 'MEMBER_NOT_FOUND', message: 'Member not found in this organization' };
    }

    const oldRole = membership.role;
    membership.role = newRole;
    await membership.save();

    await AuditLogModel.create({
      organisationId: new mongoose.Types.ObjectId(organisationId),
      userId: new mongoose.Types.ObjectId(actorUserId),
      action: 'MEMBER_ROLE_CHANGED',
      entityType: 'OrganisationMembership',
      entityId: membership._id,
      changes: { targetUserId, oldRole, newRole }
    });

    return membership;
  }

  /**
   * Update member status (active, suspended, deactivated)
   */
  public static async updateMemberStatus(
    organisationId: string,
    actorUserId: string,
    targetUserId: string,
    newStatus: 'active' | 'suspended' | 'deactivated'
  ) {
    const org = await OrganisationModel.findById(organisationId);
    if (!org) {
      throw { statusCode: 404, code: 'ORGANISATION_NOT_FOUND', message: 'Organization not found' };
    }

    // Protection invariant: Cannot deactivate or suspend the Organization Owner
    if (org.ownerId.toString() === targetUserId) {
      throw {
        statusCode: 403,
        code: 'CANNOT_DEACTIVATE_OWNER',
        message: 'The Organization Owner cannot be suspended or deactivated. Transfer ownership first.'
      };
    }

    const membership = await OrganisationMembershipModel.findOne({
      organisationId: new mongoose.Types.ObjectId(organisationId),
      userId: new mongoose.Types.ObjectId(targetUserId)
    });

    if (!membership) {
      throw { statusCode: 404, code: 'MEMBER_NOT_FOUND', message: 'Member not found in this organization' };
    }

    const oldStatus = membership.status;
    membership.status = newStatus;
    await membership.save();

    // If deactivated or suspended, revoke active user sessions for security
    if (newStatus === 'suspended' || newStatus === 'deactivated') {
      await SessionModel.deleteMany({ userId: new mongoose.Types.ObjectId(targetUserId) });
      // Also suspend workspace memberships
      await WorkspaceMembershipModel.updateMany(
        {
          organisationId: new mongoose.Types.ObjectId(organisationId),
          userId: new mongoose.Types.ObjectId(targetUserId)
        },
        { status: 'suspended' }
      );
    } else if (newStatus === 'active') {
      // Restore workspace memberships
      await WorkspaceMembershipModel.updateMany(
        {
          organisationId: new mongoose.Types.ObjectId(organisationId),
          userId: new mongoose.Types.ObjectId(targetUserId)
        },
        { status: 'active' }
      );
    }

    const action =
      newStatus === 'active'
        ? 'MEMBER_REACTIVATED'
        : newStatus === 'deactivated'
        ? 'MEMBER_DEACTIVATED'
        : 'MEMBER_SUSPENDED';

    await AuditLogModel.create({
      organisationId: new mongoose.Types.ObjectId(organisationId),
      userId: new mongoose.Types.ObjectId(actorUserId),
      action,
      entityType: 'OrganisationMembership',
      entityId: membership._id,
      changes: { targetUserId, oldStatus, newStatus }
    });

    return membership;
  }

  /**
   * Safely remove member from organization
   */
  public static async removeMember(organisationId: string, actorUserId: string, targetUserId: string) {
    const org = await OrganisationModel.findById(organisationId);
    if (!org) {
      throw { statusCode: 404, code: 'ORGANISATION_NOT_FOUND', message: 'Organization not found' };
    }

    // Protection invariant: Cannot remove Organization Owner
    if (org.ownerId.toString() === targetUserId) {
      throw {
        statusCode: 403,
        code: 'CANNOT_REMOVE_OWNER',
        message: 'The Organization Owner cannot be removed. Transfer ownership before leaving.'
      };
    }

    const orgObjectId = new mongoose.Types.ObjectId(organisationId);
    const userObjectId = new mongoose.Types.ObjectId(targetUserId);

    const membership = await OrganisationMembershipModel.findOne({
      organisationId: orgObjectId,
      userId: userObjectId
    });

    if (!membership) {
      throw { statusCode: 404, code: 'MEMBER_NOT_FOUND', message: 'Member not found in this organization' };
    }

    // Remove organization membership
    await OrganisationMembershipModel.deleteOne({ _id: membership._id });

    // Remove workspace memberships in this organization
    await WorkspaceMembershipModel.deleteMany({
      organisationId: orgObjectId,
      userId: userObjectId
    });

    // Remove role assignments in this organization
    await RoleAssignmentModel.deleteMany({
      organisationId: orgObjectId,
      userId: userObjectId
    });

    await AuditLogModel.create({
      organisationId: orgObjectId,
      userId: new mongoose.Types.ObjectId(actorUserId),
      action: 'MEMBER_REMOVED',
      entityType: 'OrganisationMembership',
      entityId: membership._id,
      changes: { targetUserId, previousRole: membership.role }
    });

    return { removed: true, targetUserId };
  }

  /**
   * Update member workspace memberships
   */
  public static async updateMemberWorkspaces(
    organisationId: string,
    actorUserId: string,
    targetUserId: string,
    workspaces: { workspaceId: string; role?: WorkspaceRole }[]
  ) {
    const orgObjectId = new mongoose.Types.ObjectId(organisationId);
    const userObjectId = new mongoose.Types.ObjectId(targetUserId);

    // Verify member exists in organization
    const orgMembership = await OrganisationMembershipModel.findOne({
      organisationId: orgObjectId,
      userId: userObjectId
    });

    if (!orgMembership) {
      throw { statusCode: 404, code: 'MEMBER_NOT_FOUND', message: 'User is not a member of this organization' };
    }

    // Validate that all assigned workspaces belong to this organization
    const workspaceObjectIds = workspaces.map((w) => new mongoose.Types.ObjectId(w.workspaceId));
    const validWorkspaces = await WorkspaceModel.find({
      _id: { $in: workspaceObjectIds },
      organisationId: orgObjectId,
      status: 'active'
    });

    if (validWorkspaces.length !== workspaceObjectIds.length) {
      throw {
        statusCode: 400,
        code: 'INVALID_WORKSPACE_SELECTION',
        message: 'One or more selected workspaces do not belong to this organization or are archived'
      };
    }

    // Delete existing workspace memberships not in the new selection
    await WorkspaceMembershipModel.deleteMany({
      organisationId: orgObjectId,
      userId: userObjectId,
      workspaceId: { $nin: workspaceObjectIds }
    });

    // Upsert memberships for selected workspaces
    const updated = await Promise.all(
      workspaces.map(async (ws) => {
        const wsId = new mongoose.Types.ObjectId(ws.workspaceId);
        return WorkspaceMembershipModel.findOneAndUpdate(
          {
            workspaceId: wsId,
            userId: userObjectId
          },
          {
            $set: {
              organisationId: orgObjectId,
              role: ws.role || WORKSPACE_ROLES.MEMBER,
              status: orgMembership.status === 'suspended' ? 'suspended' : 'active'
            },
            $setOnInsert: {
              joinedAt: new Date()
            }
          },
          { upsert: true, new: true }
        );
      })
    );

    await AuditLogModel.create({
      organisationId: orgObjectId,
      userId: new mongoose.Types.ObjectId(actorUserId),
      action: 'WORKSPACE_MEMBERSHIP_CHANGED',
      entityType: 'WorkspaceMembership',
      changes: { targetUserId, assignedWorkspaceCount: workspaces.length }
    });

    return updated;
  }

  /**
   * Create and send team member invitation
   */
  public static async createInvitation(
    organisationId: string,
    actorUserId: string,
    input: { email: string; role?: OrgRole; workspaceIds?: string[] }
  ) {
    const orgObjectId = new mongoose.Types.ObjectId(organisationId);
    const email = input.email.toLowerCase().trim();
    const role = input.role || ORG_ROLES.MEMBER;
    const workspaceIds = (input.workspaceIds || []).map((id) => new mongoose.Types.ObjectId(id));

    // Verify organization
    const org = await OrganisationModel.findById(orgObjectId);
    if (!org) {
      throw { statusCode: 404, code: 'ORGANISATION_NOT_FOUND', message: 'Organization not found' };
    }

    // Check if user is already an active member of this organization
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      const existingMembership = await OrganisationMembershipModel.findOne({
        organisationId: orgObjectId,
        userId: existingUser._id
      });
      if (existingMembership) {
        throw {
          statusCode: 409,
          code: 'MEMBER_ALREADY_EXISTS',
          message: `User ${email} is already a member of ${org.name}`
        };
      }
    }

    // Check for existing pending invitation
    const existingInvite = await InvitationModel.findOne({
      organisationId: orgObjectId,
      email,
      status: 'pending',
      expiresAt: { $gt: new Date() }
    });

    if (existingInvite) {
      throw {
        statusCode: 409,
        code: 'INVITATION_ALREADY_PENDING',
        message: `An active invitation has already been dispatched to ${email}`
      };
    }

    // Generate cryptographic token
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = hashToken(rawToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // Create invitation record (store token and tokenHash)
    const invitation = await InvitationModel.create({
      organisationId: orgObjectId,
      email,
      role,
      workspaceIds,
      invitedBy: new mongoose.Types.ObjectId(actorUserId),
      token: rawToken,
      tokenHash,
      expiresAt,
      status: 'pending'
    });

    // Fetch inviter user info for email
    const inviter = await UserModel.findById(actorUserId);
    const inviterName = inviter ? `${inviter.firstName} ${inviter.lastName}` : 'An administrator';

    const inviteUrl = `${ENV.CLIENT_URL}/accept-invitation?token=${rawToken}&email=${encodeURIComponent(email)}`;

    await sendInvitationEmail({
      email,
      inviterName,
      orgName: org.name,
      roleName: role.charAt(0).toUpperCase() + role.slice(1),
      inviteUrl,
      expiresAt
    });

    await AuditLogModel.create({
      organisationId: orgObjectId,
      userId: new mongoose.Types.ObjectId(actorUserId),
      action: 'INVITATION_CREATED',
      entityType: 'Invitation',
      entityId: invitation._id,
      changes: { email, role, workspaceCount: workspaceIds.length }
    });

    return invitation;
  }

  /**
   * List pending / all invitations for an organization
   */
  public static async listInvitations(organisationId: string, statusFilter?: string) {
    const orgObjectId = new mongoose.Types.ObjectId(organisationId);

    // Auto-expire outdated pending invitations
    await InvitationModel.updateMany(
      {
        organisationId: orgObjectId,
        status: 'pending',
        expiresAt: { $lt: new Date() }
      },
      { status: 'expired' }
    );

    const filter: any = { organisationId: orgObjectId };
    if (statusFilter) {
      filter.status = statusFilter;
    }

    const invitations = await InvitationModel.find(filter)
      .populate({
        path: 'invitedBy',
        select: 'firstName lastName email'
      })
      .populate({
        path: 'workspaceIds',
        select: 'name slug themeColor'
      })
      .sort({ createdAt: -1 });

    return invitations;
  }

  /**
   * Resend an existing invitation with refreshed token & 7-day expiration
   */
  public static async resendInvitation(organisationId: string, actorUserId: string, invitationId: string) {
    const orgObjectId = new mongoose.Types.ObjectId(organisationId);
    const org = await OrganisationModel.findById(orgObjectId);
    if (!org) {
      throw { statusCode: 404, code: 'ORGANISATION_NOT_FOUND', message: 'Organization not found' };
    }

    const invitation = await InvitationModel.findOne({
      _id: new mongoose.Types.ObjectId(invitationId),
      organisationId: orgObjectId
    });

    if (!invitation) {
      throw { statusCode: 404, code: 'INVITATION_NOT_FOUND', message: 'Invitation record not found' };
    }

    // Refresh token and expiration
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = hashToken(rawToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    invitation.token = rawToken;
    invitation.tokenHash = tokenHash;
    invitation.expiresAt = expiresAt;
    invitation.status = 'pending';
    await invitation.save();

    const inviter = await UserModel.findById(actorUserId);
    const inviterName = inviter ? `${inviter.firstName} ${inviter.lastName}` : 'An administrator';
    const inviteUrl = `${ENV.CLIENT_URL}/accept-invitation?token=${rawToken}&email=${encodeURIComponent(invitation.email)}`;

    await sendInvitationEmail({
      email: invitation.email,
      inviterName,
      orgName: org.name,
      roleName: invitation.role,
      inviteUrl,
      expiresAt
    });

    await AuditLogModel.create({
      organisationId: orgObjectId,
      userId: new mongoose.Types.ObjectId(actorUserId),
      action: 'INVITATION_RESENT',
      entityType: 'Invitation',
      entityId: invitation._id,
      changes: { email: invitation.email, expiresAt }
    });

    return invitation;
  }

  /**
   * Cancel / Revoke a pending invitation
   */
  public static async cancelInvitation(organisationId: string, actorUserId: string, invitationId: string) {
    const orgObjectId = new mongoose.Types.ObjectId(organisationId);
    const invitation = await InvitationModel.findOne({
      _id: new mongoose.Types.ObjectId(invitationId),
      organisationId: orgObjectId
    });

    if (!invitation) {
      throw { statusCode: 404, code: 'INVITATION_NOT_FOUND', message: 'Invitation record not found' };
    }

    invitation.status = 'revoked';
    await invitation.save();

    await AuditLogModel.create({
      organisationId: orgObjectId,
      userId: new mongoose.Types.ObjectId(actorUserId),
      action: 'INVITATION_CANCELLED',
      entityType: 'Invitation',
      entityId: invitation._id,
      changes: { email: invitation.email }
    });

    return { cancelled: true, invitationId };
  }

  /**
   * Public retrieval of invitation details by token
   */
  public static async getInvitationByToken(token: string) {
    const tokenHash = hashToken(token);

    const invitation = await InvitationModel.findOne({
      $or: [{ tokenHash }, { token }]
    })
      .populate({
        path: 'organisationId',
        select: 'name slug logoUrl description'
      })
      .populate({
        path: 'invitedBy',
        select: 'firstName lastName email'
      })
      .populate({
        path: 'workspaceIds',
        select: 'name slug themeColor isPrivate'
      });

    if (!invitation) {
      throw { statusCode: 404, code: 'INVITATION_NOT_FOUND', message: 'Invitation token is invalid or does not exist' };
    }

    if (invitation.status === 'revoked') {
      throw { statusCode: 400, code: 'INVITATION_REVOKED', message: 'This invitation has been revoked by an administrator' };
    }

    if (invitation.status === 'accepted') {
      throw { statusCode: 400, code: 'INVITATION_ACCEPTED', message: 'This invitation has already been accepted' };
    }

    if (new Date() > invitation.expiresAt || invitation.status === 'expired') {
      invitation.status = 'expired';
      await invitation.save();
      throw { statusCode: 400, code: 'INVITATION_EXPIRED', message: 'This invitation has expired. Please request a new invite.' };
    }

    return {
      _id: invitation._id,
      email: invitation.email,
      role: invitation.role,
      organisation: invitation.organisationId,
      invitedBy: invitation.invitedBy,
      workspaces: invitation.workspaceIds,
      expiresAt: invitation.expiresAt,
      status: invitation.status
    };
  }

  /**
   * Accept an invitation and provision organization and workspace memberships
   */
  public static async acceptInvitation(userId: string, token: string) {
    const tokenHash = hashToken(token);

    const invitation = await InvitationModel.findOne({
      $or: [{ tokenHash }, { token }]
    });

    if (!invitation) {
      throw { statusCode: 404, code: 'INVITATION_NOT_FOUND', message: 'Invitation token is invalid or not found' };
    }

    if (invitation.status !== 'pending' || new Date() > invitation.expiresAt) {
      if (new Date() > invitation.expiresAt) {
        invitation.status = 'expired';
        await invitation.save();
      }
      throw {
        statusCode: 400,
        code: 'INVITATION_INACTIVE',
        message: `This invitation cannot be accepted because it is ${invitation.status}`
      };
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      throw { statusCode: 404, code: 'USER_NOT_FOUND', message: 'Authenticated user not found' };
    }

    const orgObjectId = invitation.organisationId;
    const userObjectId = user._id;

    // Check if membership already exists
    let orgMembership = await OrganisationMembershipModel.findOne({
      organisationId: orgObjectId,
      userId: userObjectId
    });

    if (!orgMembership) {
      orgMembership = await OrganisationMembershipModel.create({
        organisationId: orgObjectId,
        userId: userObjectId,
        role: invitation.role,
        status: 'active',
        joinedAt: new Date()
      });
    } else {
      // Re-activate if previously suspended
      orgMembership.status = 'active';
      orgMembership.role = invitation.role;
      await orgMembership.save();
    }

    // Provision workspace memberships
    if (invitation.workspaceIds && invitation.workspaceIds.length > 0) {
      await Promise.all(
        invitation.workspaceIds.map(async (wsId: any) => {
          await WorkspaceMembershipModel.findOneAndUpdate(
            {
              workspaceId: wsId,
              userId: userObjectId
            },
            {
              $set: {
                organisationId: orgObjectId,
                role: WORKSPACE_ROLES.MEMBER,
                status: 'active'
              },
              $setOnInsert: {
                joinedAt: new Date()
              }
            },
            { upsert: true }
          );
        })
      );
    }

    // Mark invitation accepted
    invitation.status = 'accepted';
    await invitation.save();

    await AuditLogModel.create({
      organisationId: orgObjectId,
      userId: userObjectId,
      action: 'INVITATION_ACCEPTED',
      entityType: 'Invitation',
      entityId: invitation._id,
      changes: { email: invitation.email, role: invitation.role }
    });

    return {
      accepted: true,
      organisationId: orgObjectId.toString(),
      role: orgMembership.role,
      membership: orgMembership
    };
  }

  /**
   * Retrieve team & membership audit history for an organization
   */
  public static async getTeamAuditHistory(organisationId: string, limit: number = 50) {
    const orgObjectId = new mongoose.Types.ObjectId(organisationId);

    const logs = await AuditLogModel.find({
      organisationId: orgObjectId,
      $or: [
        { entityType: { $in: ['Invitation', 'OrganisationMembership', 'WorkspaceMembership', 'Member'] } },
        { action: { $regex: /^(INVITATION_|MEMBER_|WORKSPACE_MEMBERSHIP_)/ } }
      ]
    })
      .populate({
        path: 'userId',
        select: 'firstName lastName email avatarUrl'
      })
      .sort({ createdAt: -1 })
      .limit(limit);

    return logs;
  }
}

