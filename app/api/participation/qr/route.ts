import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { generateQRToken } from "@/modules/participation/service"
import { z } from "zod"

const schema = z.object({
  opportunityId: z.string().min(1),
  type: z.enum(["check_in", "check_out"]),
  participationId: z.string().optional(),
})

// Only field_rep or ngo_admin can generate QR tokens
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const user = session.user as { id: string; role?: string }
  if (!["ngo_admin", "field_rep", "platform_admin"].includes(user.role ?? "")) {
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
    const result = await generateQRToken(parsed.data)
    return NextResponse.json(result)
  } catch (err) {
    console.error("QR generate error:", err)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
