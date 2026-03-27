# RASA Platform — Manual Testing Guide

## Overview

The RASA platform ships with a debug mode system that creates test accounts for all 8 user roles and provides login conveniences for manual testing. This guide explains how to activate debug mode, which accounts are available, and how to test each major user flow.

---

## Activating Debug Mode

Add the following to your `.env` file:

```env
DEBUG_MODE=true
```

**Safety guarantees:**
- Debug mode is **never active in production** — the check is `DEBUG_MODE === "true" && NODE_ENV !== "production"`, enforced in code at `lib/debug/guard.ts`
- All debug API routes (`/api/debug/*`) return 404 in production or when `DEBUG_MODE` is not set
- The login quick-login panel only renders when `DEBUG_MODE=true` server-side

---

## Seed Accounts

All 8 system roles have a dedicated test account. Password for every account: **`Rasa1234!`**

| Email | Role | Description | Credits |
|---|---|---|---|
| `admin@rasa.dev` | `platform_admin` | Full platform access, user management, system settings | 0 |
| `moderator@rasa.dev` | `platform_moderator` | Content moderation, review flagged items | 0 |
| `support@rasa.dev` | `platform_support` | User support, account assistance | 0 |
| `analyst@rasa.dev` | `platform_analyst` | Read-only analytics and reporting access | 0 |
| `ngo@rasa.dev` | `ngo_admin` | NGO admin — create missions, review applications | 0 |
| `fieldrep@rasa.dev` | `field_rep` | On-site QR generation and check-in management | 0 |
| `volunteer@rasa.dev` | `volunteer` | Volunteer with completed profile | 150 |
| `partner@rasa.dev` | `reward_partner` | Reward partner — manages marketplace offers | 0 |

---

## How Seed Accounts Are Created

### Option A — Automatic (recommended for dev)

When `DEBUG_MODE=true`, accounts are created automatically on server startup via Next.js instrumentation (`instrumentation.ts` → `lib/debug/auto-seed.ts`).

Just start the dev server:
```bash
npm run dev
```

The seeder is idempotent — it only creates accounts that do not already exist.

### Option B — Manual script

Run the full seed script to wipe and re-create all accounts plus sample data (3 missions, 3 marketplace offers):

```bash
npm run seed
```

This also seeds:
- **Lisbon Community Foundation** (NGO) — linked to `ngo@rasa.dev` + `fieldrep@rasa.dev`
- **Café Verde** (Reward Partner) — linked to `partner@rasa.dev`
- 3 missions: Beach Clean-Up, After-School Tutoring, Community Garden Day
- 3 marketplace offers: Free Coffee, 10% Discount, Tote Bag

### Option C — Debug Panel UI

While logged in as `admin@rasa.dev`, visit `/debug` and click **Re-run Seed** to trigger `POST /api/debug/seed`.

---

## Login Quick-Login Panel

When `DEBUG_MODE=true`, the login page (`/login`) shows a collapsible **Test Accounts** panel below the standard login form.

- Click the panel header to expand it
- Click any account row to sign in instantly (no typing required)
- The panel is hidden in production — it is rendered server-side and the prop is `false` when `NODE_ENV=production`

---

## Debug Panel (`/debug`)

Accessible only to `platform_admin` users when `DEBUG_MODE=true`.

Shows:
- **Database connectivity** — live check on page load
- **Seed account status table** — which of the 8 accounts exist in the DB, with a Re-run Seed button
- **Current session** — full NextAuth session object as JSON
- **Environment summary** — which env vars are configured (values are never exposed, only presence)

---

## Testing Each User Flow

### Flow 1 — NGO Posts a Mission

1. Sign in as `ngo@rasa.dev`
2. Go to **Organizations** — verify "Lisbon Community Foundation" is listed
3. Go to **Opportunities** → **Create Mission**
4. Fill in title, description, date, capacity, credits/hour
5. Submit — mission should appear in the list with status `open`

### Flow 2 — Volunteer Discovers and Applies

1. Sign in as `volunteer@rasa.dev` (150 credits pre-loaded)
2. Go to **Discovery** — missions should appear with match scores
3. Click **Apply** on any open mission
4. Go to **Applications** — application should appear with status `pending`

### Flow 3 — NGO Reviews Application

1. Sign in as `ngo@rasa.dev`
2. Go to **Opportunities** → select a mission → **Applications**
3. **Approve** or **Reject** the application
4. Sign back in as `volunteer@rasa.dev` — application status should update

### Flow 4 — Field Rep Generates QR / Volunteer Checks In

1. Sign in as `fieldrep@rasa.dev`
2. Go to **Participation** → select a mission → **Generate QR**
3. Copy the token shown
4. Sign in as `volunteer@rasa.dev`
5. Go to **Participation** → **Check In** → paste token
6. Repeat for **Check Out** with the checkout QR
7. Credits should be awarded to volunteer's wallet

### Flow 5 — Volunteer Leaves Feedback

1. Sign in as `volunteer@rasa.dev`
2. Go to **Feedback** → select a completed participation
3. Submit a star rating and comment

### Flow 6 — Volunteer Redeems Marketplace Offer

1. Sign in as `volunteer@rasa.dev` (must have credits)
2. Go to **Marketplace** — offers from Café Verde should be listed
3. Click **Redeem** on "Free Coffee at Café Verde" (costs 30 credits)
4. Go to **Wallet** — balance should have decreased, redemption shown in history

### Flow 7 — Platform Admin Reviews Users

1. Sign in as `admin@rasa.dev`
2. Go to **Admin → Users** — all 8 seed accounts should be listed
3. Verify roles are correct

### Flow 8 — Reward Partner Manages Offers

1. Sign in as `partner@rasa.dev`
2. Go to **Organization** — Café Verde should be listed
3. Go to **Marketplace** — verify offers are visible and stock counts correct

---

## Resetting Test Data

To reset all seed data to a clean state:

```bash
npm run seed
```

This **deletes** all existing seed accounts (by email) and recreates them with fresh data. Non-seed user accounts (any email not in `SEED_ACCOUNTS`) are not affected.

---

## Production Safety Checklist

Before deploying to production, verify:

- [ ] `DEBUG_MODE` is **not set** (or set to `false`) in production `.env`
- [ ] `NODE_ENV=production` is set
- [ ] No `MONGODB_URI_DEBUG` is pointing to a production database
- [ ] `/api/debug/*` routes return 404 (automatic when `DEBUG_MODE` is not `true`)
- [ ] Login page shows no quick-login panel (automatic, server-rendered)
- [ ] `/debug` dashboard page is inaccessible (returns "debug mode disabled" message)
