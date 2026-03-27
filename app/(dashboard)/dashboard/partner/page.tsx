import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { Card, CardHeader, CardTitle } from "@/components/ui/Card"
import Badge from "@/components/ui/Badge"
import Link from "next/link"
import { connectToDatabase } from "@/lib/db/mongoose"
import { MarketplaceOfferModel, RedemptionModel } from "@/lib/db/models/marketplace.model"
import { LedgerModel } from "@/lib/db/models/ledger.model"
import mongoose from "mongoose"
import { findOrgsByAdminUserId } from "@/modules/organization/repository"
import { getBalance } from "@/modules/ledger/service"

async function getPartnerStats(orgIds: string[], userId: string) {
  if (orgIds.length === 0) {
    return { activeOffers: 0, totalRedemptions: 0, thisMonthRedemptions: 0, salesRevenue: 0, walletBalance: 0 }
  }
  await connectToDatabase()
  const oids = orgIds.map((id) => new mongoose.Types.ObjectId(id))

  const orgOffers = await MarketplaceOfferModel.find({ organizationId: { $in: oids } }).select("_id").lean()
  const offerIds = orgOffers.map((o) => o._id)

  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1)

  const [activeOffers, totalRedemptions, thisMonthRedemptions, salesAgg, walletBalance] = await Promise.all([
    MarketplaceOfferModel.countDocuments({ organizationId: { $in: oids }, status: "active" }),
    RedemptionModel.countDocuments({ offerId: { $in: offerIds } }),
    RedemptionModel.countDocuments({
      offerId: { $in: offerIds },
      createdAt: { $gte: monthStart },
    }),
    // Total credits received from marketplace sales (marketplace_sale ledger entries)
    LedgerModel.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          type: "marketplace_sale",
        },
      },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    getBalance(userId),
  ])

  const salesRevenue = salesAgg[0]?.total ?? 0
  return { activeOffers, totalRedemptions, thisMonthRedemptions, salesRevenue, walletBalance }
}

export default async function PartnerDashboardPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")
  const role = (session.user as { role?: string }).role ?? "volunteer"
  if (role !== "reward_partner") redirect("/dashboard")

  const userId = (session.user as { id?: string }).id!
  const name = session.user.name ?? "there"

  const orgs = await findOrgsByAdminUserId(userId)
  const org = orgs[0] ?? null
  const stats = await getPartnerStats(orgs.map((o) => o.id), userId)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1F2937]">Reward Partner Hub</h1>
        <div className="flex items-center gap-2 mt-1">
          <Badge variant="primary">Reward Partner</Badge>
          {org && <Badge variant="default">{org.name}</Badge>}
        </div>
        <p className="text-sm text-gray-500 mt-1">Welcome back, {name.split(" ")[0]}</p>
      </div>

      {!org && (
        <div className="bg-[#fff8e0] border border-[#FFD60A] rounded-xl px-4 py-3 text-sm text-[#8a6d00]">
          Your organisation is not yet linked to this account. Contact your platform administrator,
          or{" "}
          <Link href="/register/organization" className="underline font-medium">
            submit an organisation request
          </Link>{" "}
          to register your organisation.
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Wallet Balance" value={stats.walletBalance.toString()} sub="credits available" />
        <StatCard label="Sales Revenue" value={stats.salesRevenue.toString()} sub="total credits received" />
        <StatCard label="Active Offers" value={stats.activeOffers.toString()} sub="in marketplace" />
        <StatCard label="This Month" value={stats.thisMonthRedemptions.toString()} sub="redemptions" />
      </div>
      <p className="text-xs text-gray-400 bg-gray-50 rounded-lg px-3 py-2">
        Your wallet receives credits when volunteers purchase your offers. Credits can be transferred or spent in the RASA marketplace.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader>
          <div className="space-y-2 mt-2">
            <ActionLink href="/marketplace" label="Manage offers" />
            <ActionLink href="/organization" label="Organisation profile" />
            <ActionLink href="/wallet" label="Credit ledger" />
          </div>
        </Card>

        <Card>
          <CardHeader><CardTitle>How it works</CardTitle></CardHeader>
          <div className="mt-2 space-y-2 text-sm text-gray-600">
            <p>1. Create offers in the Marketplace — volunteers spend their earned credits.</p>
            <p>2. Set credit cost, stock, and optional expiry for each offer.</p>
            <p>3. When a volunteer redeems, they receive a unique code — you honour the reward.</p>
            <p>4. Review redemption history in your Ledger.</p>
          </div>
        </Card>
      </div>
    </div>
  )
}

function StatCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <Card>
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
      <p className="mt-1 text-3xl font-bold text-[#1F2937]">{value}</p>
      <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
    </Card>
  )
}

function ActionLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-50 text-sm text-[#1F2937] group"
    >
      <span>{label}</span>
      <span className="text-gray-300 group-hover:text-[#1E4FA1]">→</span>
    </Link>
  )
}
