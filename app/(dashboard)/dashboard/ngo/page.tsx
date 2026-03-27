import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { Card, CardHeader, CardTitle } from "@/components/ui/Card"
import Badge from "@/components/ui/Badge"
import Link from "next/link"
import { findOrgsByAdminUserId } from "@/modules/organization/repository"
import { findOpportunitiesByOrg } from "@/modules/opportunity/repository"
import { findApplicationsByOpportunity } from "@/modules/application/repository"

export default async function NGODashboardPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")
  const role = (session.user as { role?: string }).role ?? "volunteer"
  if (role !== "ngo_admin") redirect("/dashboard")

  const userId = (session.user as { id?: string }).id!
  const name = session.user.name ?? "there"

  const orgs = await findOrgsByAdminUserId(userId)
  const org = orgs[0] ?? null

  let totalMissions = 0
  let activeMissions = 0
  let pendingApplications = 0

  if (org) {
    const missions = await findOpportunitiesByOrg(org.id)
    totalMissions = missions.length
    activeMissions = missions.filter((m) => m.status === "open" || m.status === "in_progress").length

    const appCounts = await Promise.all(
      missions.filter((m) => m.status === "open").map((m) => findApplicationsByOpportunity(m.id))
    )
    pendingApplications = appCounts.flat().filter((a) => a.status === "pending").length
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1F2937]">Welcome, {name.split(" ")[0]}</h1>
        <div className="flex items-center gap-2 mt-1">
          <Badge variant="info">NGO Admin</Badge>
          {org && <Badge variant="default">{org.name}</Badge>}
        </div>
      </div>

      {!org && (
        <div className="bg-[#fff8e0] border border-[#FFD60A] rounded-xl px-4 py-3 text-sm text-[#8a6d00]">
          Your organisation is not yet linked to this account. Contact your platform administrator,
          or{" "}
          <Link href="/register/organization" className="underline font-medium">
            submit an organisation request
          </Link>{" "}
          if your organisation is not yet registered.
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Total Missions" value={totalMissions.toString()} sub="created" />
        <StatCard label="Active Missions" value={activeMissions.toString()} sub="open or in progress" />
        <StatCard label="Pending Applications" value={pendingApplications.toString()} sub="awaiting review" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader>
          <div className="space-y-2 mt-2">
            <ActionLink href="/opportunity/create" label="Create a new mission" />
            <ActionLink href="/opportunity" label="Manage missions" />
            <ActionLink href="/application" label="Review applications" />
            <ActionLink href="/participation" label="Participation records" />
            <ActionLink href="/feedback" label="Volunteer feedback" />
            <ActionLink href="/gaia" label="AI assistant" />
          </div>
        </Card>

        <Card>
          <CardHeader><CardTitle>Organisation</CardTitle></CardHeader>
          {org ? (
            <div className="mt-2 space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span className="text-gray-400">Name</span>
                <span className="font-medium">{org.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Type</span>
                <Badge variant="default">{org.type}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Status</span>
                <Badge variant={org.status === "active" ? "success" : "warning"}>{org.status}</Badge>
              </div>
              <Link href="/organization" className="mt-3 inline-block text-[#1E4FA1] hover:underline font-medium">
                Manage organisation profile →
              </Link>
            </div>
          ) : (
            <p className="text-sm text-gray-400 mt-2">No organisation linked.</p>
          )}
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
