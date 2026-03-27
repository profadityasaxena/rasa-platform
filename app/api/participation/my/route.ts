import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { getMyParticipations } from "@/modules/participation/service"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const participations = await getMyParticipations(session.user.id)
  return NextResponse.json({ participations })
}
