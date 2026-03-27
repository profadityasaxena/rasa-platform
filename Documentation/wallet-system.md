# RASA Platform — Wallet & Credits System

## Overview

The wallet system is the economic engine of the platform. Volunteers earn **time credits** by attending missions, and spend them in the marketplace. Credits are tracked with a full immutable ledger (audit trail).

---

## Data Models

### `wallets` collection
One wallet per user, created on-demand.

| Field | Type | Description |
|-------|------|-------------|
| `userId` | ObjectId | References `users._id` |
| `balance` | Number | Current credit balance |
| `dailyTransferDate` | String | Date of last transfer (YYYY-MM-DD) |
| `dailyTransferTotal` | Number | Credits transferred today |

### `ledger` collection
Every balance change creates an immutable ledger entry. Never deleted.

| Field | Type | Description |
|-------|------|-------------|
| `userId` | ObjectId | Wallet owner |
| `type` | String | `credit_earned` / `redemption` / `transfer_out` / `transfer_in` / `adjustment` |
| `amount` | Number | Positive = credit, negative = debit |
| `balanceAfter` | Number | Balance snapshot after transaction |
| `referenceId` | ObjectId | Source (Participation, Offer, etc.) |
| `referenceType` | String | Type of source |
| `description` | String | Human-readable note |

---

## How Credits are Earned

Credits are awarded automatically at check-out:

```
creditsAwarded = floor(actualHours) × opportunity.creditsPerHour
```

The `checkOut()` function in `modules/participation/service.ts`:
1. Reads `checkInAt` from the participation record
2. Calculates `actualHours = floor((checkOutAt - checkInAt) / 3600000)`
3. Calls `creditCredits()` with a `Participation` reference
4. Updates `volunteer.totalCredits` and `volunteer.totalHours`

Credits are **floor-rounded** — partial hours are not counted.

---

## Transfers

Volunteers can transfer credits to other users.

**Limits:**
- Maximum per transfer: 500 credits
- Daily cap: 500 credits total per sender (resets at midnight)

**Implementation:** `transferCredits()` in `modules/ledger/service.ts`

The daily cap is tracked in the wallet document (`dailyTransferDate` / `dailyTransferTotal`). On a new day, the counter resets.

---

## Marketplace Redemptions

When a volunteer redeems an offer:
1. `debitCredits()` is called with `type: "redemption"`
2. Stock is decremented on `MarketplaceOffer`
3. A unique redemption code is generated and stored in `Redemption`
4. The volunteer shows the code to the partner to receive the reward

---

## API Routes

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/wallet` | Get balance + ledger history |
| `POST` | `/api/wallet` | Transfer credits to another user |
| `POST` | `/api/marketplace/[id]/redeem` | Redeem an offer |

---

## Security

- Balance never goes below 0 (enforced in `debitCredits`)
- All debits check balance before writing
- Transfers check daily cap before writing
- Ledger entries are never updated or deleted (append-only)
- MongoDB does not enforce atomicity across wallet + ledger writes — the ledger write happens after the wallet update. A partial failure would leave the wallet updated but the ledger entry missing. For MVP this is acceptable; production should use a MongoDB transaction.
