import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { getMyOrgs } from "@/modules/organization/service"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const orgs = await getMyOrgs(session.user.id)
  return NextResponse.json({ organizations: orgs })
}
