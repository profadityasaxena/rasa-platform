import { redirect } from "next/navigation"
import { auth } from "@/auth"
import Sidebar from "@/components/layout/Sidebar"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const role = (session.user as { role?: string }).role ?? "volunteer"
  const name = session.user.name ?? "User"
  const email = session.user.email ?? ""

  return (
    <div className="flex h-screen bg-[#F7F9FC] overflow-hidden">
      <Sidebar role={role} userName={name} userEmail={email} />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-6 py-8">{children}</div>
      </main>
    </div>
  )
}
