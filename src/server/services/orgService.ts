import mongoose from 'mongoose';
import { OrganisationModel, IOrganisationDocument } from '../models/Organisation.js';
import { OrganisationMembershipModel, IOrganisationMembershipDocument } from '../models/OrganisationMembership.js';
import { AuditLogModel } from '../models/AuditLog.js';
import { UserModel } from '../models/User.js';
import { ORG_ROLES } from '../../shared/constants/roles.js';
import { CreateOrgInput, UpdateOrgInput, UpdateOrgSettingsInput } from '../../shared/validation/organization.js';
import { rbacService } from './rbacService.js';

export class OrganisationService {
  /**
   * Helper: Generate a unique URL-friendly slug with collision resolution
   */
  static async generateUniqueSlug(baseName: string): Promise<string> {
    const rawSlug = baseName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'org';

    let candidateSlug = rawSlug;
    let counter = 1;

    while (await OrganisationModel.findOne({ slug: candidateSlug })) {
      candidateSlug = `${rawSlug}-${counter}`;
      counter++;
    }

    return candidateSlug;
  }

  /**
   * 1. Create a new organization and assign creator as initial owner
   */
  static async createOrganisation(
    userId: string,
    input: CreateOrgInput,
    metadata?: { ipAddress?: string; userAgent?: string }
  ): Promise<{ organisation: IOrganisationDocument; membership: IOrganisationMembershipDocument }> {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const user = await UserModel.findById(userObjectId);
    if (!user) {
      const error: any = new Error('User not found');
      error.statusCode = 404;
      error.code = 'USER_NOT_FOUND';
      throw error;
    }

    // Determine unique slug
    let slug = input.slug ? input.slug.toLowerCase().trim() : '';
    if (!slug) {
      slug = await this.generateUniqueSlug(input.name);
    } else {
      const existing = await OrganisationModel.findOne({ slug });
      if (existing) {
        slug = await this.generateUniqueSlug(slug);
      }
    }

    // Create organisation record
    const organisation = await OrganisationModel.create({
      name: input.name.trim(),
      slug,
      description: input.description?.trim(),
      industry: input.industry || 'Technology & Software',
      organizationSize: input.organizationSize || '11-50',
      logoUrl: input.logoUrl,
      website: input.website?.trim(),
      country: input.country || 'United States',
      timezone: input.timezone || 'UTC-05:00 Eastern Time',
      billingEmail: user.email,
      ownerId: userObjectId,
      status: 'active',
      plan: 'starter',
      seats: 5,
      settings: {
        allowedDomains: [],
        enforce2FA: false,
        defaultMemberRole: 'member'
      }
    });

    // Create initial membership with 'owner' role
    const membership = await OrganisationMembershipModel.create({
      organisationId: organisation._id,
      userId: userObjectId,
      role: ORG_ROLES.OWNER,
      status: 'active',
      joinedAt: new Date()
    });

    // Seed Phase 8 RBAC Default Roles and Owner Role Assignment
    try {
      await rbacService.seedDefaultRolesForOrg(organisation._id, userObjectId);
    } catch (e) {
      // non-blocking for org creation resilience
    }

    // Audit log
    await AuditLogModel.create({
      organisationId: organisation._id,
      userId: userObjectId,
      action: 'ORGANISATION_CREATED',
      entityType: 'Organisation',
      entityId: organisation._id,
      ipAddress: metadata?.ipAddress,
      userAgent: metadata?.userAgent,
      changes: { name: organisation.name, slug: organisation.slug }
    });

    return { organisation, membership };
  }

  /**
   * 2. List all organizations accessible to the authenticated user
   */
  static async getUserOrganisations(userId: string) {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const memberships = await OrganisationMembershipModel.find({
      userId: userObjectId,
      status: 'active'
    });

    const orgIds = memberships.map((m) => m.organisationId);

    const organisations = await OrganisationModel.find({
      _id: { $in: orgIds },
      status: 'active'
    }).sort({ createdAt: -1 });

    // Attach caller role to each org payload
    const membershipMap = new Map(memberships.map((m) => [m.organisationId.toString(), m.role]));

    return organisations.map((org) => {
      const orgObj = org.toObject();
      return {
        ...orgObj,
        callerRole: membershipMap.get(org._id.toString()) || 'member'
      };
    });
  }

  /**
   * 3. Get organization details by ID with caller context
   */
  static async getOrganisationById(orgId: string, userId: string) {
    const org = await OrganisationModel.findById(orgId);
    if (!org || org.status === 'archived') {
      const error: any = new Error('Organization not found or has been archived');
      error.statusCode = 404;
      error.code = 'ORGANISATION_NOT_FOUND';
      throw error;
    }

    const membership = await OrganisationMembershipModel.findOne({
      organisationId: org._id,
      userId: new mongoose.Types.ObjectId(userId),
      status: 'active'
    });

    if (!membership) {
      const error: any = new Error('Access forbidden: You do not belong to this organization tenant');
      error.statusCode = 403;
      error.code = 'FORBIDDEN_CROSS_TENANT';
      throw error;
    }

    const memberCount = await OrganisationMembershipModel.countDocuments({
      organisationId: org._id,
      status: 'active'
    });

    const orgObj = org.toObject();
    return {
      ...orgObj,
      callerRole: membership.role,
      isOwner: org.ownerId.toString() === userId,
      memberCount
    };
  }

  /**
   * 4. Update organization details (restricted to owner)
   */
  static async updateOrganisation(
    orgId: string,
    userId: string,
    input: UpdateOrgInput,
    metadata?: { ipAddress?: string; userAgent?: string }
  ) {
    const org = await OrganisationModel.findById(orgId);
    if (!org || org.status === 'archived') {
      const error: any = new Error('Organization not found');
      error.statusCode = 404;
      error.code = 'ORGANISATION_NOT_FOUND';
      throw error;
    }

    if (org.ownerId.toString() !== userId) {
      const error: any = new Error('Only the organization owner can modify organization details');
      error.statusCode = 403;
      error.code = 'FORBIDDEN_NOT_OWNER';
      throw error;
    }

    if (input.name !== undefined) org.name = input.name.trim();
    if (input.description !== undefined) org.description = input.description.trim();
    if (input.industry !== undefined) org.industry = input.industry;
    if (input.organizationSize !== undefined) org.organizationSize = input.organizationSize;
    if (input.website !== undefined) org.website = input.website.trim();
    if (input.country !== undefined) org.country = input.country;
    if (input.timezone !== undefined) org.timezone = input.timezone;
    if (input.billingEmail !== undefined) org.billingEmail = input.billingEmail.trim().toLowerCase();
    if (input.logoUrl !== undefined) org.logoUrl = input.logoUrl;

    await org.save();

    await AuditLogModel.create({
      organisationId: org._id,
      userId: new mongoose.Types.ObjectId(userId),
      action: 'ORGANISATION_UPDATED',
      entityType: 'Organisation',
      entityId: org._id,
      ipAddress: metadata?.ipAddress,
      userAgent: metadata?.userAgent,
      changes: input
    });

    return org;
  }

  /**
   * 5. Update organization settings (restricted to owner)
   */
  static async updateSettings(
    orgId: string,
    userId: string,
    input: UpdateOrgSettingsInput,
    metadata?: { ipAddress?: string; userAgent?: string }
  ) {
    const org = await OrganisationModel.findById(orgId);
    if (!org || org.status === 'archived') {
      const error: any = new Error('Organization not found');
      error.statusCode = 404;
      error.code = 'ORGANISATION_NOT_FOUND';
      throw error;
    }

    if (org.ownerId.toString() !== userId) {
      const error: any = new Error('Only the organization owner can modify organization settings');
      error.statusCode = 403;
      error.code = 'FORBIDDEN_NOT_OWNER';
      throw error;
    }

    if (input.allowedDomains !== undefined) {
      org.settings.allowedDomains = input.allowedDomains;
    }
    if (input.enforce2FA !== undefined) {
      org.settings.enforce2FA = input.enforce2FA;
    }
    if (input.defaultMemberRole !== undefined) {
      org.settings.defaultMemberRole = input.defaultMemberRole;
    }
    if (input.timezone !== undefined) {
      org.timezone = input.timezone;
    }

    await org.save();

    await AuditLogModel.create({
      organisationId: org._id,
      userId: new mongoose.Types.ObjectId(userId),
      action: 'ORGANISATION_SETTINGS_UPDATED',
      entityType: 'Organisation',
      entityId: org._id,
      ipAddress: metadata?.ipAddress,
      userAgent: metadata?.userAgent,
      changes: input
    });

    return org;
  }

  /**
   * 6. Update organization logo (restricted to owner)
   */
  static async updateLogo(orgId: string, userId: string, logoUrl: string) {
    return this.updateOrganisation(orgId, userId, { logoUrl });
  }

  /**
   * 7. Transfer organization ownership (restricted to owner)
   */
  static async transferOwnership(
    orgId: string,
    currentOwnerId: string,
    newOwnerId: string,
    metadata?: { ipAddress?: string; userAgent?: string }
  ) {
    if (currentOwnerId === newOwnerId) {
      const error: any = new Error('Target new owner must be different from current owner');
      error.statusCode = 400;
      error.code = 'INVALID_TRANSFER_TARGET';
      throw error;
    }

    const org = await OrganisationModel.findById(orgId);
    if (!org || org.status === 'archived') {
      const error: any = new Error('Organization not found');
      error.statusCode = 404;
      error.code = 'ORGANISATION_NOT_FOUND';
      throw error;
    }

    if (org.ownerId.toString() !== currentOwnerId) {
      const error: any = new Error('Only the current organization owner can transfer ownership');
      error.statusCode = 403;
      error.code = 'FORBIDDEN_NOT_OWNER';
      throw error;
    }

    // Verify recipient is an active member in this tenant
    const recipientObjectId = new mongoose.Types.ObjectId(newOwnerId);
    const recipientMembership = await OrganisationMembershipModel.findOne({
      organisationId: org._id,
      userId: recipientObjectId,
      status: 'active'
    });

    if (!recipientMembership) {
      const error: any = new Error('Recipient must be an active member of this organization');
      error.statusCode = 400;
      error.code = 'RECIPIENT_NOT_MEMBER';
      throw error;
    }

    // Update organization owner
    org.ownerId = recipientObjectId;
    await org.save();

    // Promote recipient to 'owner' role
    recipientMembership.role = ORG_ROLES.OWNER;
    await recipientMembership.save();

    // Demote previous owner to 'admin' role
    await OrganisationMembershipModel.findOneAndUpdate(
      {
        organisationId: org._id,
        userId: new mongoose.Types.ObjectId(currentOwnerId)
      },
      { $set: { role: ORG_ROLES.ADMIN } }
    );

    // Audit log
    await AuditLogModel.create({
      organisationId: org._id,
      userId: new mongoose.Types.ObjectId(currentOwnerId),
      action: 'OWNERSHIP_TRANSFERRED',
      entityType: 'Organisation',
      entityId: org._id,
      ipAddress: metadata?.ipAddress,
      userAgent: metadata?.userAgent,
      changes: { previousOwner: currentOwnerId, newOwner: newOwnerId }
    });

    return {
      message: 'Organization ownership transferred successfully',
      organisation: org
    };
  }

  /**
   * 8. Safe organization deletion / archival (restricted to owner)
   */
  static async archiveOrganisation(
    orgId: string,
    userId: string,
    confirmedName: string,
    metadata?: { ipAddress?: string; userAgent?: string }
  ) {
    const org = await OrganisationModel.findById(orgId);
    if (!org || org.status === 'archived') {
      const error: any = new Error('Organization not found');
      error.statusCode = 404;
      error.code = 'ORGANISATION_NOT_FOUND';
      throw error;
    }

    if (org.ownerId.toString() !== userId) {
      const error: any = new Error('Only the organization owner can archive or delete the organization');
      error.statusCode = 403;
      error.code = 'FORBIDDEN_NOT_OWNER';
      throw error;
    }

    // Exact confirmation check
    if (org.name.trim().toLowerCase() !== confirmedName.trim().toLowerCase()) {
      const error: any = new Error(
        `Confirmation mismatch: You must type '${org.name}' exactly to delete the organization`
      );
      error.statusCode = 400;
      error.code = 'CONFIRMATION_MISMATCH';
      throw error;
    }

    // Safe archival: Mark status as 'archived' and record timestamp
    org.status = 'archived';
    org.archivedAt = new Date();
    await org.save();

    // Audit log
    await AuditLogModel.create({
      organisationId: org._id,
      userId: new mongoose.Types.ObjectId(userId),
      action: 'ORGANISATION_ARCHIVED',
      entityType: 'Organisation',
      entityId: org._id,
      ipAddress: metadata?.ipAddress,
      userAgent: metadata?.userAgent,
      changes: { archivedAt: org.archivedAt }
    });

    return {
      message: `Organization '${org.name}' has been safely archived and deleted from active workspaces.`
    };
  }

  /**
   * 9. List organization members (overview for dashboard)
   */
  static async getOrganisationMembers(orgId: string) {
    const memberships = await OrganisationMembershipModel.find({
      organisationId: new mongoose.Types.ObjectId(orgId),
      status: 'active'
    }).populate('userId', 'firstName lastName email avatarUrl status');

    return memberships.map((m) => {
      const u: any = m.userId;
      return {
        _id: m._id.toString(),
        userId: u?._id?.toString() || m.userId.toString(),
        name: u ? `${u.firstName} ${u.lastName}` : 'Team Member',
        email: u?.email || '',
        avatarUrl: u?.avatarUrl,
        role: m.role,
        status: m.status,
        joinedAt: m.joinedAt
      };
    });
  }
}

