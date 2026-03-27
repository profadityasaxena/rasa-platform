import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { reviewApplication } from "@/modules/application/service"
import { reviewApplicationSchema } from "@/modules/application/validators"

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params

  try {
    const body = await req.json()
    const parsed = reviewApplicationSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }
    const result = await reviewApplication(id, session.user.id, parsed.data)
    if (!result.success) return NextResponse.json({ error: result.error }, { status: 400 })
    return NextResponse.json({ application: result.application })
  } catch (err) {
    console.error("Review application error:", err)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
