import { NextRequest, NextResponse } from "next/server"
import { registerSchema } from "@/modules/identity/validators"
import { registerUser } from "@/modules/identity/service"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = registerSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const result = await registerUser(parsed.data)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json(
      { message: "Account created. Please sign in.", userId: result.userId },
      { status: 201 }
    )
  } catch (err) {
    console.error("Register route error:", err)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
