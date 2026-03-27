# RASA Platform — User Roles

## Overview

The platform has 8 roles, divided into two categories: **public-facing** (interact with missions/credits) and **platform administration** (manage the platform itself).

---

## Public-Facing Roles

### `volunteer`
The core user. Volunteers discover missions, apply, check in/out with QR codes, earn time credits, and spend them in the marketplace.

**Capabilities:**
- Browse and search missions (`/discovery`)
- Apply to missions (requires 100% profile completeness)
- QR check-in and check-out at mission sites
- Earn time credits based on hours worked
- Transfer credits to other users (500/day cap)
- Redeem credits for rewards in the marketplace
- Give and receive feedback on missions
- Upload documents to Vault (for AI processing)
- Chat with GAIA (AI assistant)

**Dashboard route:** `/dashboard/volunteer`

---

### `ngo_admin`
Manages a non-governmental organisation. Creates missions, reviews volunteer applications, oversees participation.

**Capabilities:**
- Create and manage organisations
- Publish, edit, and cancel missions
- Review applications (accept / reject with reason)
- Monitor participation and check-in/check-out status
- Give feedback to volunteers
- Use GAIA AI assistant for document intelligence

**Dashboard route:** `/dashboard/ngo`

---

### `field_rep`
On-site representative. Generates QR codes for check-in/check-out at mission venues. Does not create missions or manage applications.

**Capabilities:**
- Generate check-in and check-out QR codes
- View today's attendance counts

**Dashboard route:** `/dashboard/field`

---

### `reward_partner`
Commercial or NGO partner that provides rewards in the marketplace. Volunteers spend credits on their offers.

**Capabilities:**
- Create and manage organisations (type: `reward_partner`)
- Add offers to the marketplace (credit cost, stock, expiry)
- View redemption counts and history
- Honour redemption codes shown to volunteers

**Dashboard route:** `/dashboard/partner`

---

## Platform Administration Roles

All platform roles share the same dashboard (`/dashboard/admin`) but with different access levels.

### `platform_admin`
Full control over the platform.

**Capabilities:** All — user management, organisation management, settings, analytics, content moderation.

### `platform_moderator`
Content and community moderation.

**Capabilities:** Review flagged content, analytics.

### `platform_support`
User-facing support.

**Capabilities:** User management (view/edit accounts), analytics.

### `platform_analyst`
Read-only reporting.

**Capabilities:** Analytics only.

---

## Role Assignment

Roles are set at registration and stored in `users.role` (MongoDB). The role is embedded in the JWT session token (7-day expiry). Changing a user's role in the database requires them to log out and back in.

**Database field:** `users.role` — type `UserRole` enum in `lib/db/models/user.model.ts`

**Session field:** `session.user.role` — read from JWT via `auth()` server function or `useSession()` client hook.

---

## Role Hierarchy (for reference)

```
platform_admin
  └── platform_moderator
  └── platform_support
  └── platform_analyst
ngo_admin
field_rep
reward_partner
volunteer
```

These are flat roles, not hierarchical in the code — each role has its own explicit permission checks.
