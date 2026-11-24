# WORKZEN — Authentication, Authorization & Security Architecture

**Product:** WORKZEN  
**Security Level:** Enterprise Commercial Grade  
**Standard Compliance:** OWASP Top 10, Multi-Tenant Defense-in-Depth  

---

## 1. Authentication Architecture

Workzen implements a robust, stateless dual-token JSON Web Token (JWT) architecture accompanied by cryptographic One-Time Password (OTP) verification for high-risk and sensitive lifecycle actions.

### 1. Token Lifecycles & Encryption
- **Access Token:**
  - Lifespan: **15 minutes**.
  - Transport: Sent in HTTP Authorization header as `Bearer <token>`.
  - Contents: `{ userId, email, defaultOrgId, roles: [...] }`.
  - Signed with: `JWT_ACCESS_SECRET` using HMAC SHA-256 (`HS256`).
- **Refresh Token:**
  - Lifespan: **7 days**.
  - Transport: Stored in an `HttpOnly`, `Secure`, `SameSite=Strict` cookie (`/api/v1/auth/refresh`).
  - Storage: SHA-256 hashed in database session table with explicit family tracking for token rotation and reuse detection.
  - Signed with: `JWT_REFRESH_SECRET`.

### 2. Authentication Flows

#### A. Registration & Email Verification
1. User submits `{ email, password, firstName, lastName, organisationName }`.
2. Backend validates payload with Zod schema.
3. System checks for email uniqueness across the global `users` collection.
4. Password is encrypted using `bcryptjs` with **12 salt rounds**.
5. User is created with `isEmailVerified: false`.
6. A cryptographically secure 6-digit numeric OTP is generated (valid for 15 minutes) and hashed in the DB.
7. System sends activation email with the 6-digit OTP via SMTP.
8. Upon valid OTP submission to `/api/v1/auth/verify-email`, `isEmailVerified` is set to `true`, and initial Organisation + Workspace are provisioned.

#### B. Enterprise Login & Token Issuance
1. User provides `{ email, password }`.
2. System rate-limits requests (max 5 failed attempts per 15-minute window per IP/email).
3. System fetches user record and compares password hash via `bcrypt.compare`.
4. If two-factor authentication (2FA) is enabled, system issues a short-lived `pre_auth_token` and requests the TOTP code.
5. On successful authentication, server issues:
   - Access Token in response JSON.
   - Refresh Token in `HttpOnly` cookie.
   - User profile and active organization context.

#### C. Token Refresh & Reuse Detection
1. Client makes an automated background call to `/api/v1/auth/refresh`.
2. Backend extracts cookie, verifies signature, and matches hash in DB.
3. If token reuse is detected (attempting to use an invalidated refresh token), the entire token family is immediately revoked, forcing re-authentication to prevent session hijacking.
4. On success, a new Access Token and rotated Refresh Token are returned.

#### D. Password Reset via Secure OTP
1. User requests password reset via `/api/v1/auth/forgot-password`.
2. A random 6-digit OTP is generated with a 10-minute expiry and sent to the verified email.
3. User submits `/api/v1/auth/reset-password` with `{ email, otp, newPassword }`.
4. System validates the OTP, invalidates all existing active sessions for that user across all devices, updates the password hash, and writes an audit log entry.

---

## 2. Authorization Architecture (RBAC + PBAC)

Workzen utilizes a hybrid **Role-Based (RBAC)** and **Permission-Based Access Control (PBAC)** model structured hierarchically:

```
Organisation Tier (Tenant)
  └── Workspace Tier (Department / Division)
        └── Project Tier (Initiative / Board)
```

### 1. Hierarchy & Roles

| Tier | Role | Capabilities |
| :--- | :--- | :--- |
| **Organisation** | **Owner** | Full billing control, delete organisation, manage enterprise security, transfer ownership. |
| | **Admin** | Manage all workspaces, invite/remove users, configure integrations, view audit logs. |
| | **Manager** | Create projects, allocate workspace budgets, manage team assignments. |
| | **Member** | Create and complete tasks, comment, collaborate in permitted workspaces. |
| | **Guest** | Read-only or single-project constrained access. |
| **Workspace** | **Workspace Admin** | Configure workspace settings, archive workspace, manage workspace membership. |
| | **Workspace Member**| Access and edit all projects contained within the workspace. |
| | **Workspace Viewer**| Read-only view of workspace boards and project timelines. |
| **Project** | **Project Lead** | Edit project metadata, manage columns, assign tasks, configure automations. |
| | **Contributor** | Create, edit, and move assigned tasks. |
| | **Observer** | View task statuses, participate in comments. |

### 2. Authorization Guard Middleware
The authorization middleware checks both role tier and granular permission keys:
```typescript
export const requirePermission = (permission: PermissionKey) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { permissions } = req.tenant;
    if (!permissions.includes(permission) && !permissions.includes('ALL')) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: `Missing required permission: ${permission}` }
      });
    }
    next();
  };
};
```

---

## 3. Comprehensive Security & Scalability Architecture

### 1. Input Validation & Sanitization
- All incoming payloads are validated via Zod schemas before hitting business logic.
- Strings are trimmed and sanitized against XSS injection.
- MongoDB queries strictly avoid unsanitized `$where` or raw object ingestion.

### 2. HTTP Security & Headers
- **Helmet Middleware:** Enforces strict HTTP headers:
  - `Content-Security-Policy` (CSP)
  - `Strict-Transport-Security` (HSTS: max-age 31536000, includeSubDomains)
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `Referrer-Policy: strict-origin-when-cross-origin`
- **CORS:** Strictly whitelisted to trusted frontend origin (`CLIENT_URL`).

### 3. Rate Limiting Strategy
- Express rate limiter applied globally (100 requests per 15 minutes per IP).
- Dedicated strict limiter on `/api/v1/auth/*` (5 requests per 15 minutes per IP) to neutralize brute-force credential stuffing.

### 4. File Upload Security (Cloudinary)
- File types restricted by MIME whitelist (`image/jpeg`, `image/png`, `image/webp`, `application/pdf`).
- Maximum file size capped at 15MB.
- Server uploads directly to Cloudinary using signed upload presets. Private credentials (`CLOUDINARY_API_SECRET`) are never exposed to client code.

### 5. Database Scalability & Query Optimization
- **Compound Tenant Indexing:** Every query filters by `organisationId`.
- **Projection Whitelisting:** Queries explicitly select needed fields (e.g., omitting `passwordHash`).
- **Cursor-Based Pagination:** Feeds, audit logs, and message histories use cursor pagination (`createdAt` + `_id`) to avoid performance degradation with large offsets.

### 6. Audit Logging & Compliance
- Immutable `audit_logs` record every sensitive tenant mutation (user role change, project deletion, billing modification, API key creation).
- Records capture timestamp, user ID, tenant ID, action name, IP address, and JSON diffs of modified fields.

