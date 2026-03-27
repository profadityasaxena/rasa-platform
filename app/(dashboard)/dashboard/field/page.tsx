import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { Card, CardHeader, CardTitle } from "@/components/ui/Card"
import Badge from "@/components/ui/Badge"
import Link from "next/link"
import { connectToDatabase } from "@/lib/db/mongoose"
import { ParticipationModel } from "@/lib/db/models/participation.model"

async function getTodayStats() {
  await connectToDatabase()
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  const [checkedInToday, completedToday] = await Promise.all([
    ParticipationModel.countDocuments({ checkInAt: { $gte: todayStart }, status: "checked_in" }),
    ParticipationModel.countDocuments({ checkOutAt: { $gte: todayStart }, status: "completed" }),
  ])
  return { checkedInToday, completedToday }
}

export default async function FieldRepDashboardPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")
  const role = (session.user as { role?: string }).role ?? "volunteer"
  if (role !== "field_rep") redirect("/dashboard")

  const name = session.user.name ?? "there"
  const stats = await getTodayStats()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1F2937]">Field Operations</h1>
        <div className="flex items-center gap-2 mt-1">
          <Badge variant="warning">Field Rep</Badge>
          <span className="text-sm text-gray-400">Welcome, {name.split(" ")[0]}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard label="Checked In Today" value={stats.checkedInToday.toString()} sub="active at site" />
        <StatCard label="Completed Today" value={stats.completedToday.toString()} sub="checked out" />
      </div>

      <Card>
        <CardHeader><CardTitle>QR Check-in Management</CardTitle></CardHeader>
        <div className="mt-3 space-y-3 text-sm text-gray-600">
          <p>As a field rep, you manage on-site attendance using QR codes.</p>
          <div className="space-y-2">
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <span className="text-lg">1.</span>
              <div>
                <p className="font-medium text-[#1F2937]">Generate Check-in QR</p>
                <p className="text-gray-400">Go to Participation → Generate a check-in QR code for a mission.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <span className="text-lg">2.</span>
              <div>
                <p className="font-medium text-[#1F2937]">Volunteers Scan</p>
                <p className="text-gray-400">Display the QR code on a screen. Volunteers scan it on arrival.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <span className="text-lg">3.</span>
              <div>
                <p className="font-medium text-[#1F2937]">Generate Check-out QR</p>
                <p className="text-gray-400">At end of session, generate a new check-out QR. Credits are awarded automatically.</p>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-4">
          <Link
            href="/participation"
            className="inline-flex items-center gap-2 bg-[#1E4FA1] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#1a3f88] transition-colors"
          >
            Open QR Management →
          </Link>
        </div>
      </Card>
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
