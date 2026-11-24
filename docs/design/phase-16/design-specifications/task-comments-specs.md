# WORKZEN — PHASE 16: TASK COMMENTS & DISCUSSIONS SPECIFICATION

## 1. Executive Summary & Domain Scope

Phase 16 introduces enterprise-grade discussion capabilities directly within task workflows. Collaborators can asynchronously discuss requirements, post formatted markdown updates, tag team members using `@mentions`, and reply to comments in structured 1-level threads.

Key architectural tenants:
- **Zero Dummy Data**: All comments, author identities, mentions, and timestamps originate from validated MongoDB documents.
- **Multi-Tenant Isolation**: Comments inherit organization, workspace, and project boundaries from their parent task. Access is strictly governed via RBAC permissions (`task:read`, `comment:create`, `comment:update`, `comment:delete`).
- **Audit Preservation & Soft-Deletion**: To prevent breaking conversation flow, parent comments with active replies are marked soft-deleted (`isDeleted: true`), replacing text with a placeholder badge while keeping replies intact.
- **Deterministic Mention Dispatch**: Mentioning `@username` automatically resolves against the task's eligible project/workspace roster and triggers instant in-app notifications.

---

## 2. Information Architecture & Data Model

### Comment Schema Definition (`Comment.ts`)

| Field | Type | Validation / Index | Description |
|---|---|---|---|
| `_id` | ObjectId | Primary Key | Unique comment identifier |
| `taskId` | ObjectId | Indexed, ref: 'Task' | Target task being discussed |
| `projectId` | ObjectId | ref: 'Project' | Project context |
| `workspaceId` | ObjectId | ref: 'Workspace' | Workspace boundary |
| `organisationId` | ObjectId | Indexed, ref: 'Organisation' | Multi-tenant tenant boundary |
| `authorId` | ObjectId | ref: 'User' | Authenticated user who posted |
| `content` | String | 1–5,000 characters | Sanitized markdown / text |
| `parentId` | ObjectId / null | Indexed, ref: 'Comment' | Root comment for 1-level reply thread |
| `mentions` | ObjectId[] | Array of User IDs | Extracted user references |
| `isEdited` | Boolean | Default `false` | True if edited post-creation |
| `editedAt` | Date | Optional | Timestamp of last content update |
| `isDeleted` | Boolean | Indexed, Default `false` | Soft-deletion flag |
| `deletedAt` | Date | Optional | Timestamp of deletion |
| `deletedBy` | ObjectId | ref: 'User' | User who requested deletion |
| `replyCount` | Number | Default `0` | Live count of direct child replies |
| `createdAt` | Date | Indexed (chronological sort) | Creation timestamp |
| `updatedAt` | Date | Standard timestamp | Last document mutation |

---

## 3. UI/UX Interaction Design

### A. Discussion Feed & Navigation
- Located prominently inside `TaskDetailsPage.tsx` beneath the Task Details card.
- Displays live comment count badge (`N comments`).
- Chronological ordering (oldest first) ensures natural reading flow.

### B. Rich Comment Composer
- Markdown formatting toolbar: Bold (`Ctrl+B`), Italic (`Ctrl+I`), Code block, Link (`Ctrl+K`), Quote, Bullet List, and `@mention` trigger.
- Real-time character counter (`X / 5,000`).
- Shortcut hint: `Ctrl + Enter` to submit immediately.
- Disabled state with spinner during active transmission.

### C. 1-Level Threaded Replies
- When clicking "Reply" on any root comment, an inline reply composer expands directly beneath that comment.
- Replies render with a clean 1-level indentation and a subtle vertical thread guide line.
- Deep nesting beyond 1 level is prevented: replying to a reply threads into the root comment with automatic `@mention` of the reply author.

### D. User Mentions & Autocomplete
- Typing `@` opens an accessible floating autocomplete popup showing member avatar, name, and project role.
- Keyboard navigation (Up/Down arrow keys + Enter/Tab) selects the mention.
- In rendered comments, mentions display as interactive high-visibility pills (`@Sarah Connor`).

### E. Editing & Deletion Safeguards
- Only the original comment author or users with administrative moderation permissions can edit or delete a comment.
- Inline edit mode allows in-place updates with "Save Changes" and "Cancel" buttons.
- Edited comments display a clear `(edited)` timestamp badge.
- Deletion triggers a Workzen confirmation modal explaining that replies will remain intact while the comment text is safely replaced with a soft-deleted placeholder.

---

## 4. Multi-Tenant Security & Permission Controls

1. **Task Boundary Verification**: Before creating or viewing comments, the backend verifies that the requested `taskId` belongs to the active `x-organisation-id` and the user possesses project membership or workspace access.
2. **Mention Authorization**: Users cannot mention individuals outside their organization or workspace.
3. **No Frontend Spoofing**: `authorId` is extracted strictly from `req.user.userId` via authenticated JWT session context.

