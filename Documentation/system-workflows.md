# RASA Platform — System Workflows

## 1. Volunteer Registration → First Mission

```
1. Volunteer visits /register
   → Selects role: "volunteer"
   → Creates account (email + password or OAuth)
   → Account created with role=volunteer, status=active

2. Volunteer visits /volunteer (Profile Editor)
   → Fills bio, skills, interests, location, availability, languages
   → Completeness score updates: 100% required to apply

3. Volunteer visits /discovery (Find Missions)
   → Discovery API fetches open missions
   → Each mission is scored by the matching algorithm
   → Missions displayed sorted by match score

4. Volunteer clicks "Apply" on a mission
   → POST /api/applications
   → System checks: profile completeness must be 100%
   → System checks: no duplicate application for same mission
   → Application created with status=pending, matchScore recorded

5. NGO Admin reviews the application at /application
   → POST /api/applications/[id]/review
   → Status changed to: accepted | rejected
   → Volunteer is notified (email via Postmark if configured)

6. On mission day — Field Rep generates QR code
   → POST /api/participation/qr (type: check_in)
   → QR token created with 10-minute expiry

7. Volunteer scans QR → POST /api/participation/check-in
   → ParticipationModel created, status=checked_in, checkInAt recorded

8. After mission — Field Rep generates check-out QR
   → POST /api/participation/qr (type: check_out)

9. Volunteer scans check-out QR → POST /api/participation/check-out
   → ParticipationModel updated: status=completed, checkOutAt recorded
   → actualHours = floor((checkOut - checkIn) / 3600)
   → creditsAwarded = actualHours × opportunity.creditsPerHour
   → Wallet credited, ledger entry created
   → volunteer.totalHours and totalCredits updated

10. Volunteer visits /feedback
    → Submits a star rating for the mission
    → NGO Admin can also submit feedback for the volunteer
```

---

## 2. NGO Admin Creates and Manages a Mission

```
1. NGO Admin registers with role=ngo_admin

2. Creates organisation at /organization
   → POST /api/organizations
   → org.type = "ngo", status = "draft"

3. Creates mission at /opportunity/create
   → POST /api/opportunities
   → Fills title, description, location (geocoded), schedule, skills, capacity, credits/hour
   → Mission created with status=draft

4. Reviews and publishes mission
   → PATCH /api/opportunities/[id] { status: "open" }
   → Mission now appears in /discovery for volunteers

5. Reviews incoming applications at /application
   → GET /api/applications (filtered by org's missions)
   → Applications sorted by matchScore (best-fit first)
   → Accepts or rejects each application

6. On mission day — generates QR codes via /participation
   → QR tokens issued per mission, displayed on-screen for volunteers to scan

7. After mission — views participation records
   → GET /api/participation
   → Can see all check-ins and check-outs

8. Submits feedback for volunteers at /feedback
```

---

## 3. Volunteer Redeems Credits in Marketplace

```
1. Volunteer visits /marketplace
   → GET /api/marketplace — lists active offers sorted by credit cost

2. Volunteer clicks "Redeem" on an offer
   → POST /api/marketplace/[id]/redeem
   → System checks: volunteer.wallet.balance >= offer.creditCost
   → System checks: offer.stock > 0 (if stock is limited)
   → System checks: offer.expiresAt not in the past

3. If valid:
   → Wallet debited by creditCost
   → Ledger entry created (type: redemption)
   → Unique redemption code generated
   → offer.stock decremented (if limited)
   → Redemption record saved

4. Volunteer shows code to Reward Partner to claim the reward
```

---

## 4. Reward Partner Manages Offers

```
1. Reward Partner creates organisation (type: reward_partner) at /organization

2. Creates offers at /marketplace
   → POST /api/marketplace
   → Sets: title, description, creditCost, stock (optional), expiresAt (optional)

3. Monitors redemptions at /wallet (Ledger view)
   → Can see all redemption transactions

4. Honours redemption codes presented by volunteers
```

---

## 5. Platform Admin Manages Users

```
1. Platform Admin logs in → redirected to /dashboard/admin

2. Visits /admin/users
   → GET /api/admin/users (paginated user table)
   → Can search, view, and edit user roles/status

3. Can deactivate accounts (sets user.status = "suspended")
   → Suspended users cannot log in (checked in Credentials provider)
```

---

## Session & Auth Flow

```
User enters email/password → POST /api/auth/callback/credentials
→ Credentials provider verifies bcrypt hash
→ Auth.js v5 issues encrypted JWT cookie (authjs.session-token)
→ JWT contains: sub, email, name, role, id
→ 7-day expiry

On every authenticated request:
→ auth() in Server Component reads JWT cookie
→ session.user.role available server-side

Role change in DB:
→ User must log out and back in (role is in JWT, not re-fetched per request)
```

---

## Email Notifications (Postmark)

Emails are sent via `adapters/email/postmark.ts` when `POSTMARK_API_KEY` is set.

Triggered for:
- Application accepted / rejected (to volunteer)
- Password reset link (to user)

If `POSTMARK_API_KEY` is not set, emails are silently skipped (no crash).

---

## AI Features

### GAIA Chat (`/gaia`)
- `POST /api/gaia` — sends user message to Claude (Anthropic API)
- Requires `ANTHROPIC_API_KEY` environment variable
- NGO Admins can use GAIA for document intelligence

### Document Vault
- `POST /api/vault` — uploads file to Cloudflare R2, triggers async AI processing
- Requires `CLOUDFLARE_R2_*` and `ANTHROPIC_API_KEY`
- AI extracts metadata, summaries, or classifications from uploaded documents
