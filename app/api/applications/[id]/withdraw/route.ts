import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { withdrawMyApplication } from "@/modules/application/service"

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params

  const result = await withdrawMyApplication(id, session.user.id)
  if (!result.success) return NextResponse.json({ error: result.error }, { status: 400 })
  return NextResponse.json({ success: true })
}
