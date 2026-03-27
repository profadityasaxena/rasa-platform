import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { connectToDatabase } from "@/lib/db/mongoose"
import User from "@/lib/db/models/user.model"
import { Card, CardHeader, CardTitle } from "@/components/ui/Card"
import Badge from "@/components/ui/Badge"

export default async function AdminUsersPage() {
  const session = await auth()
  const user = session?.user as { id?: string; role?: string } | undefined
  if (!user?.id || !user.role?.startsWith("platform_")) redirect("/dashboard")

  await connectToDatabase()
  const users = await User.find({}).sort({ createdAt: -1 }).limit(100).lean()

  const roleVariant: Record<string, "primary" | "success" | "warning" | "danger" | "info"> = {
    volunteer: "default" as "info",
    ngo_admin: "primary",
    field_rep: "info",
    reward_partner: "success",
    platform_admin: "danger",
    platform_moderator: "warning",
    platform_support: "info",
    platform_analyst: "default" as "info",
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#1F2937]">Users ({users.length})</h1>
      <Card padding="none">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Email</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Role</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Joined</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id.toString()} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="px-4 py-3 text-[#1F2937] font-medium">{u.name ?? "—"}</td>
                <td className="px-4 py-3 text-gray-500">{u.email}</td>
                <td className="px-4 py-3">
                  <Badge variant={roleVariant[u.role] ?? "default"}>{u.role}</Badge>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={u.status === "active" ? "success" : u.status === "suspended" ? "danger" : "warning"}>
                    {u.status}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-gray-400 text-xs">
                  {new Date(u.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  )
}
