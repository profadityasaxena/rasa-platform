import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { redeemOffer } from "@/modules/marketplace/service"

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params

  try {
    const result = await redeemOffer(session.user.id, id)
    if (!result.success) return NextResponse.json({ error: result.error }, { status: 400 })
    return NextResponse.json({ code: result.code })
  } catch (err) {
    console.error("Redeem error:", err)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
