import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { Card, CardHeader, CardTitle } from "@/components/ui/Card"
import Badge from "@/components/ui/Badge"
import Link from "next/link"
import { getBalance } from "@/modules/ledger/service"
import { findApplicationsByUser } from "@/modules/application/repository"
import { findVolunteerByUserId } from "@/modules/volunteer/repository"

export default async function VolunteerDashboardPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")
  const role = (session.user as { role?: string }).role ?? "volunteer"
  if (role !== "volunteer") redirect("/dashboard")

  const userId = (session.user as { id?: string }).id!
  const name = session.user.name ?? "there"

  const [balance, applications, profile] = await Promise.all([
    getBalance(userId),
    findApplicationsByUser(userId),
    findVolunteerByUserId(userId),
  ])

  const pendingApps  = applications.filter((a) => a.status === "pending").length
  const totalHours   = profile?.totalHours ?? 0
  const totalCredits = profile?.totalCredits ?? 0
  const completeness = profile?.completenessScore ?? 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1F2937]">Welcome back, {name.split(" ")[0]}</h1>
        <div className="flex items-center gap-2 mt-1">
          <Badge variant="info">Volunteer</Badge>
          {completeness < 100 && (
            <Badge variant="warning">Profile {completeness}% complete</Badge>
          )}
        </div>
      </div>

      {completeness < 100 && (
        <div className="bg-[#fff8e0] border border-[#FFD60A] rounded-xl px-4 py-3 text-sm text-[#8a6d00]">
          Your profile is incomplete.{" "}
          <Link href="/volunteer" className="underline font-medium">
            Complete it now
          </Link>{" "}
          to unlock mission applications.
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Time Credits" value={balance.toString()} sub="current balance" />
        <StatCard label="Hours Volunteered" value={totalHours.toString()} sub="total hours" />
        <StatCard label="Credits Earned" value={totalCredits.toString()} sub="all time" />
        <StatCard label="Open Applications" value={pendingApps.toString()} sub="pending review" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader>
          <div className="space-y-2 mt-2">
            <ActionLink href="/discovery" label="Find missions near you" />
            <ActionLink href="/application" label="View my applications" />
            <ActionLink href="/participation" label="My participation history" />
            <ActionLink href="/wallet" label="View wallet &amp; transfer credits" />
            <ActionLink href="/marketplace" label="Redeem credits in marketplace" />
          </div>
        </Card>

        <Card>
          <CardHeader><CardTitle>Profile Completeness</CardTitle></CardHeader>
          <div className="mt-3">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Overall</span>
              <span className="font-semibold">{completeness}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#1E4FA1] rounded-full transition-all"
                style={{ width: `${completeness}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Complete all 7 sections (bio, skills, interests, location, availability, languages, photo) to reach 100%.
            </p>
            <Link href="/volunteer" className="mt-3 inline-block text-sm text-[#1E4FA1] hover:underline font-medium">
              Edit profile →
            </Link>
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
