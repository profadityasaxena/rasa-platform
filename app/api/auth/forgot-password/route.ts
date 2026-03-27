import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { connectToDatabase } from "@/lib/db/mongoose"
import User from "@/lib/db/models/user.model"

const schema = z.object({ email: z.string().email() })

// Note: In production this would send an email via Postmark.
// For now it simply acknowledges the request without revealing whether the email exists.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: "Invalid email" }, { status: 400 })

    await connectToDatabase()
    const user = await User.findOne({ email: parsed.data.email.toLowerCase() })

    if (user) {
      // TODO: generate reset token, store it, send email via Postmark
      console.log(`[forgot-password] Reset requested for ${parsed.data.email}`)
    }

    // Always return success to avoid email enumeration
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Forgot password error:", err)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
