import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { submitFeedback, submitFeedbackSchema } from "@/modules/feedback/service"

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const user = session.user as { id: string; role?: string }
  const role = user.role === "ngo_admin" ? "ngo_admin" : "volunteer"

  try {
    const body = await req.json()
    const parsed = submitFeedbackSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }
    const result = await submitFeedback(session.user.id, role, parsed.data)
    if (!result.success) return NextResponse.json({ error: result.error }, { status: 400 })
    return NextResponse.json({ success: true }, { status: 201 })
  } catch (err) {
    console.error("Feedback error:", err)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
