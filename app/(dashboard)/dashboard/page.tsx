import { redirect } from "next/navigation"
import { auth } from "@/auth"

export default async function DashboardPage() {
  const session = await auth()
  const role = (session?.user as { role?: string })?.role ?? "volunteer"

  if (role === "volunteer")        redirect("/dashboard/volunteer")
  if (role === "ngo_admin")        redirect("/dashboard/ngo")
  if (role === "field_rep")        redirect("/dashboard/field")
  if (role === "reward_partner")   redirect("/dashboard/partner")
  if (role.startsWith("platform_")) redirect("/dashboard/admin")

  redirect("/dashboard/volunteer")
}
