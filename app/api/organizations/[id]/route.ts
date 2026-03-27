import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { getOrgById, updateOrgProfile } from "@/modules/organization/service"
import { updateOrganizationSchema } from "@/modules/organization/validators"

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const org = await getOrgById(id)
  if (!org) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json({ organization: org })
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params

  try {
    const body = await req.json()
    const parsed = updateOrganizationSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }
    const result = await updateOrgProfile(id, session.user.id, parsed.data)
    if (!result.success) return NextResponse.json({ error: result.error }, { status: 400 })
    return NextResponse.json({ organization: result.org })
  } catch (err) {
    console.error("Update org profile error:", err)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
