import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { reviewOrgRequest } from "@/modules/organization/service"
import { reviewOrgRequestSchema } from "@/modules/organization/validators"

// Platform admin only — approve or reject an organization request
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const role = (session.user as { role?: string }).role ?? ""
  if (!role.startsWith("platform_")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { id } = await params

  try {
    const body = await req.json()
    const parsed = reviewOrgRequestSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }
    const result = await reviewOrgRequest(id, session.user.id, parsed.data)
    if (!result.success) return NextResponse.json({ error: result.error }, { status: 400 })
    return NextResponse.json({ request: result.request, organization: result.org ?? null })
  } catch (err) {
    console.error("Org request review error:", err)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
