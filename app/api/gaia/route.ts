import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { gaiaChat } from "@/modules/ai/service"
import { findOrgsByAdminUserId } from "@/modules/organization/repository"
import { z } from "zod"

const schema = z.object({
  message: z.string().min(1).max(2000),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string(),
      })
    )
    .max(20)
    .optional(),
  orgId: z.string().optional(),
})

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const user = session.user as { id: string; role?: string }
  if (user.role !== "ngo_admin" && !user.role?.startsWith("platform_")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    // Get org name for context
    let orgName = "your organisation"
    if (parsed.data.orgId) {
      const orgs = await findOrgsByAdminUserId(session.user.id)
      const org = orgs.find((o) => o.id === parsed.data.orgId)
      if (org) orgName = org.name
    } else {
      const orgs = await findOrgsByAdminUserId(session.user.id)
      if (orgs.length > 0) orgName = orgs[0].name
    }

    const response = await gaiaChat({
      orgName,
      history: parsed.data.history ?? [],
      userMessage: parsed.data.message,
    })

    return NextResponse.json({ response })
  } catch (err) {
    console.error("GAIA error:", err)
    return NextResponse.json({ error: "AI service unavailable" }, { status: 503 })
  }
}
