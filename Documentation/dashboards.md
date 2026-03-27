# RASA Platform — Dashboard Architecture

## Routing

| Role | Route |
|------|-------|
| `volunteer` | `/dashboard/volunteer` |
| `ngo_admin` | `/dashboard/ngo` |
| `field_rep` | `/dashboard/field` |
| `reward_partner` | `/dashboard/partner` |
| `platform_*` | `/dashboard/admin` |

`/dashboard` (root) is a redirect dispatcher — it reads the session role and redirects to the appropriate route.

---

## File Structure

```
app/(dashboard)/
  dashboard/
    page.tsx              ← redirect dispatcher (reads role, redirects)
    volunteer/page.tsx    ← Volunteer dashboard
    ngo/page.tsx          ← NGO Admin dashboard
    admin/page.tsx        ← All platform_* roles
    partner/page.tsx      ← Reward Partner dashboard
    field/page.tsx        ← Field Rep dashboard
```

All dashboard pages are React Server Components — they call `auth()` directly and fetch data from DB modules.

---

## Volunteer Dashboard (`/dashboard/volunteer`)

**Data fetched:**
- Wallet balance — `getBalance(userId)` from `modules/ledger/service`
- Applications — `findApplicationsByUser(userId)` from `modules/application/repository`
- Volunteer profile — `findVolunteerByUserId(userId)` from `modules/volunteer/repository`

**Displayed:**
- Time credits balance, total hours volunteered, total credits earned all-time, open applications count
- Quick action links to all volunteer-relevant pages
- Profile completeness progress bar with a link to edit profile

---

## NGO Admin Dashboard (`/dashboard/ngo`)

**Data fetched:**
- Organisations — `findOrgsByAdminUserId(userId)` from `modules/organization/repository`
- Missions — `findOpportunitiesByOrg(orgId)` for the first org
- Pending applications — `findApplicationsByOpportunity(missionId)` for all open missions

**Displayed:**
- Total missions, active missions, pending applications counts
- Quick action links (create mission, review applications, etc.)
- Organisation info card (name, type, status)

---

## Admin Dashboard (`/dashboard/admin`)

**Accessible by:** `platform_admin`, `platform_moderator`, `platform_support`, `platform_analyst`

**Data fetched (direct DB queries):**
- `UserModel.countDocuments({})` — total users
- `OrganizationModel.countDocuments({ type: "ngo", status: "active" })` — active NGOs
- `OpportunityModel.countDocuments({})` — total missions
- `WalletModel.aggregate([{ $group: ... }])` — total credits in circulation

**Displayed:**
- Platform-wide stats
- Role-specific action links (admin sees user management, moderator sees flagged content, etc.)
- Access level matrix showing what this specific role can do

---

## Reward Partner Dashboard (`/dashboard/partner`)

**Data fetched:**
- Organisations — `findOrgsByAdminUserId(userId)`
- Offer and redemption counts via `MarketplaceOfferModel` / `RedemptionModel`

**Displayed:**
- Active offers, this month's redemptions, total redemptions
- Quick action links
- Explanation of the reward partner workflow

---

## Field Rep Dashboard (`/dashboard/field`)

**Data fetched:**
- Today's check-ins and check-outs from `ParticipationModel`

**Displayed:**
- Live count of volunteers currently checked in and completed today
- Step-by-step QR workflow guide
- Link to Participation QR management

---

## Layout

All dashboard pages render inside `app/(dashboard)/layout.tsx` which:
1. Calls `auth()` — redirects to `/login` if no session
2. Renders `<Sidebar>` (role-aware nav) + `<main>` content area

The Sidebar (`components/layout/Sidebar.tsx`) selects its nav items based on role and highlights the active route.
