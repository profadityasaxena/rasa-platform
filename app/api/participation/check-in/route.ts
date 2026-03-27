import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { checkIn } from "@/modules/participation/service"
import { z } from "zod"

const schema = z.object({ token: z.string().min(1) })

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: "Token required" }, { status: 400 })

    const result = await checkIn({ token: parsed.data.token, userId: session.user.id })
    if (!result.success) return NextResponse.json({ error: result.error }, { status: 400 })
    return NextResponse.json({ participationId: result.participationId })
  } catch (err) {
    console.error("Check-in error:", err)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
