import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { submitOrgRequest, getOrgRequests } from "@/modules/organization/service"
import { submitOrgRequestSchema } from "@/modules/organization/validators"

// Public — no auth required: any visitor can submit an organization request
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = submitOrgRequestSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }
    const result = await submitOrgRequest(parsed.data)
    if (!result.success) return NextResponse.json({ error: result.error }, { status: 400 })
    return NextResponse.json({ request: result.request }, { status: 201 })
  } catch (err) {
    console.error("Org request submit error:", err)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

// Platform admin only — list all requests
export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const role = (session.user as { role?: string }).role ?? ""
  if (!role.startsWith("platform_")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const status = req.nextUrl.searchParams.get("status") as "pending" | "approved" | "rejected" | null
  const requests = await getOrgRequests(status ?? undefined)
  return NextResponse.json({ requests })
}
