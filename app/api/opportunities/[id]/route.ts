import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { findOpportunityById, updateOpportunity } from "@/modules/opportunity/repository"
import { updateOpportunitySchema } from "@/modules/opportunity/validators"
import { findOrgsByAdminUserId } from "@/modules/organization/repository"

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const opp = await findOpportunityById(id)
  if (!opp) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json({ opportunity: opp })
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params

  try {
    const opp = await findOpportunityById(id)
    if (!opp) return NextResponse.json({ error: "Not found" }, { status: 404 })

    const orgs = await findOrgsByAdminUserId(session.user.id)
    if (!orgs.some((o) => o.id === opp.organizationId)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await req.json()
    const parsed = updateOpportunitySchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const updated = await updateOpportunity(id, parsed.data)
    return NextResponse.json({ opportunity: updated })
  } catch (err) {
    console.error("Update opportunity error:", err)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
