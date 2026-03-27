import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { Card, CardHeader, CardTitle } from "@/components/ui/Card"
import Badge from "@/components/ui/Badge"
import Link from "next/link"
import { connectToDatabase } from "@/lib/db/mongoose"
import UserModel from "@/lib/db/models/user.model"
import { OrganizationModel } from "@/lib/db/models/organization.model"
import { OpportunityModel } from "@/lib/db/models/opportunity.model"
import { WalletModel } from "@/lib/db/models/wallet.model"

const PLATFORM_ROLES = ["platform_admin", "platform_moderator", "platform_support", "platform_analyst"]

async function getAdminStats() {
  await connectToDatabase()
  const [totalUsers, activeNGOs, totalMissions, walletAgg] = await Promise.all([
    UserModel.countDocuments({}),
    OrganizationModel.countDocuments({ type: "ngo", status: "active" }),
    OpportunityModel.countDocuments({}),
    WalletModel.aggregate([{ $group: { _id: null, total: { $sum: "$balance" } } }]),
  ])
  const totalCreditsInCirculation = walletAgg[0]?.total ?? 0
  return { totalUsers, activeNGOs, totalMissions, totalCreditsInCirculation }
}

export default async function AdminDashboardPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")
  const role = (session.user as { role?: string }).role ?? "volunteer"
  if (!PLATFORM_ROLES.includes(role)) redirect("/dashboard")

  const name = session.user.name ?? "there"
  const stats = await getAdminStats()

  const roleLabelMap: Record<string, string> = {
    platform_admin:     "Platform Admin",
    platform_moderator: "Moderator",
    platform_support:   "Support",
    platform_analyst:   "Analyst",
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1F2937]">Platform Overview</h1>
        <div className="flex items-center gap-2 mt-1">
          <Badge variant="danger">{roleLabelMap[role] ?? role}</Badge>
          <span className="text-sm text-gray-400">Logged in as {name}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Users" value={stats.totalUsers.toString()} sub="registered" />
        <StatCard label="Active NGOs" value={stats.activeNGOs.toString()} sub="organisations" />
        <StatCard label="Total Missions" value={stats.totalMissions.toString()} sub="created" />
        <StatCard label="Credits in Circulation" value={stats.totalCreditsInCirculation.toString()} sub="across all wallets" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle>Admin Actions</CardTitle></CardHeader>
          <div className="space-y-2 mt-2">
            {role === "platform_admin" && (
              <>
                <ActionLink href="/admin/users" label="Manage users" />
                <ActionLink href="/admin/organisations" label="Manage organisations" />
                <ActionLink href="/admin/settings" label="Platform settings" />
              </>
            )}
            {(role === "platform_moderator") && (
              <ActionLink href="/admin/users" label="Review flagged content" />
            )}
            {(role === "platform_support") && (
              <ActionLink href="/admin/users" label="User management" />
            )}
            <ActionLink href="/admin/analytics" label="Analytics &amp; reports" />
          </div>
        </Card>

        <Card>
          <CardHeader><CardTitle>Access Level</CardTitle></CardHeader>
          <div className="mt-2 space-y-2 text-sm">
            <AccessRow label="User management" allowed={["platform_admin", "platform_support"].includes(role)} />
            <AccessRow label="Organisation management" allowed={role === "platform_admin"} />
            <AccessRow label="Platform settings" allowed={role === "platform_admin"} />
            <AccessRow label="Analytics" allowed={true} />
            <AccessRow label="Content moderation" allowed={["platform_admin", "platform_moderator"].includes(role)} />
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
      <span dangerouslySetInnerHTML={{ __html: label }} />
      <span className="text-gray-300 group-hover:text-[#1E4FA1]">→</span>
    </Link>
  )
}

function AccessRow({ label, allowed }: { label: string; allowed: boolean }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-gray-600">{label}</span>
      <Badge variant={allowed ? "success" : "default"}>{allowed ? "Allowed" : "Restricted"}</Badge>
    </div>
  )
}
