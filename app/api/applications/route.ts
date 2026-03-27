import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { applyToOpportunity, getMyApplications, getApplicationsForOpportunity } from "@/modules/application/service"
import { applySchema } from "@/modules/application/validators"
import { findOrgsByAdminUserId } from "@/modules/organization/repository"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const opportunityId = req.nextUrl.searchParams.get("opportunityId")

  if (opportunityId) {
    const orgs = await findOrgsByAdminUserId(session.user.id)
    const result = await getApplicationsForOpportunity(
      opportunityId,
      session.user.id,
      orgs.map((o) => o.id)
    )
    if (!result.success) return NextResponse.json({ error: result.error }, { status: 403 })
    return NextResponse.json({ applications: result.applications })
  }

  const applications = await getMyApplications(session.user.id)
  return NextResponse.json({ applications })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const role = (session.user as { role?: string }).role ?? ""
  if (role !== "volunteer") {
    return NextResponse.json(
      { error: "Only volunteers can apply to missions." },
      { status: 403 }
    )
  }

  try {
    const body = await req.json()
    const parsed = applySchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }
    const result = await applyToOpportunity(session.user.id, parsed.data)
    if (!result.success) return NextResponse.json({ error: result.error }, { status: 400 })
    return NextResponse.json({ application: result.application }, { status: 201 })
  } catch (err) {
    console.error("Apply error:", err)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
