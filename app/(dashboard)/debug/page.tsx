import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { isDebugMode } from "@/lib/debug/guard"
import { Card, CardHeader, CardTitle } from "@/components/ui/Card"
import Badge from "@/components/ui/Badge"
import { SEED_ACCOUNTS } from "@/lib/debug/seed-accounts"
import { ReseedButton } from "./DebugActions"

async function getSeedAccountStatuses() {
  try {
    const mongoose = (await import("mongoose")).default
    const uri = process.env.MONGODB_URI
    if (!uri) return null

    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(uri, { bufferCommands: false })
    }

    const UserModel =
      mongoose.models.User ??
      mongoose.model(
        "User",
        new mongoose.Schema(
          { email: { type: String }, role: { type: String } },
          { collection: "users" }
        )
      )

    const emails = SEED_ACCOUNTS.map((a) => a.email)
    const found = await UserModel.find({ email: { $in: emails } })
      .select("email role")
      .lean()

    const foundEmails = new Set((found as { email: string }[]).map((u) => u.email))
    return SEED_ACCOUNTS.map((a) => ({ ...a, exists: foundEmails.has(a.email) }))
  } catch {
    return null
  }
}

export default async function DebugPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const user = session.user as { id: string; role?: string }
  if (!isDebugMode || !["platform_admin"].includes(user.role ?? "")) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Debug mode is disabled in this environment.</p>
      </div>
    )
  }

  const accountStatuses = await getSeedAccountStatuses()
  const dbConnected = accountStatuses !== null

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold text-[#1F2937]">Debug Panel</h1>
        <Badge variant="danger">DEBUG ONLY</Badge>
      </div>

      {/* DB Connectivity */}
      <Card>
        <CardHeader><CardTitle>Database Connectivity</CardTitle></CardHeader>
        <div className="flex items-center gap-2 text-sm">
          <span className={`inline-block w-2.5 h-2.5 rounded-full ${dbConnected ? "bg-green-500" : "bg-red-500"}`} />
          <span>{dbConnected ? "Connected" : "Not connected — check MONGODB_URI in .env"}</span>
        </div>
      </Card>

      {/* Seed Accounts */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Seed Accounts</CardTitle>
            <ReseedButton />
          </div>
        </CardHeader>
        {accountStatuses ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-400 border-b border-gray-100">
                <th className="pb-2 font-medium">Email</th>
                <th className="pb-2 font-medium">Role</th>
                <th className="pb-2 font-medium">Credits</th>
                <th className="pb-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {accountStatuses.map((a) => (
                <tr key={a.email} className="border-b border-gray-50 last:border-0">
                  <td className="py-2 font-mono text-xs text-gray-700">{a.email}</td>
                  <td className="py-2">
                    <span className="inline-block text-[10px] font-mono bg-gray-100 text-gray-500 rounded px-1.5 py-0.5">
                      {a.role}
                    </span>
                  </td>
                  <td className="py-2 text-xs text-gray-500">
                    {a.walletBalance > 0 ? `${a.walletBalance}` : "—"}
                  </td>
                  <td className="py-2">
                    <Badge variant={a.exists ? "success" : "warning"}>
                      {a.exists ? "seeded" : "missing"}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-sm text-gray-400">Could not connect to database.</p>
        )}
        <p className="mt-3 text-xs text-gray-400">
          All passwords: <span className="font-mono font-semibold text-gray-600">Rasa1234!</span>
        </p>
      </Card>

      {/* Session */}
      <Card>
        <CardHeader><CardTitle>Session</CardTitle></CardHeader>
        <pre className="text-xs bg-gray-50 rounded-lg p-3 overflow-auto">
          {JSON.stringify(session, null, 2)}
        </pre>
      </Card>

      {/* Environment */}
      <Card>
        <CardHeader><CardTitle>Environment</CardTitle></CardHeader>
        <div className="text-sm space-y-1">
          <p><span className="font-medium">NODE_ENV:</span> {process.env.NODE_ENV}</p>
          <p><span className="font-medium">DEBUG_MODE:</span> {process.env.DEBUG_MODE}</p>
          <p><span className="font-medium">MongoDB URI set:</span> {!!process.env.MONGODB_URI ? "Yes" : "No"}</p>
          <p><span className="font-medium">R2 set:</span> {!!process.env.R2_ACCOUNT_ID ? "Yes" : "No"}</p>
          <p><span className="font-medium">Claude API set:</span> {!!process.env.CLAUDE_API_KEY ? "Yes" : "No"}</p>
          <p><span className="font-medium">Postmark set:</span> {!!process.env.POSTMARK_API_KEY ? "Yes" : "No"}</p>
          <p><span className="font-medium">Google OAuth set:</span> {!!process.env.GOOGLE_CLIENT_ID ? "Yes" : "No"}</p>
        </div>
      </Card>
    </div>
  )
}
