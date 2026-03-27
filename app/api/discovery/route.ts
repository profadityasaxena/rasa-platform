import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { getRecommendations, searchOpportunities } from "@/modules/discovery/service"

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const mode = searchParams.get("mode") ?? "search" // "recommend" | "search"
  const city = searchParams.get("city") ?? undefined
  const skills = searchParams.get("skills")?.split(",").filter(Boolean)
  const page = parseInt(searchParams.get("page") ?? "1", 10)

  if (mode === "recommend") {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const results = await getRecommendations(session.user.id, { city, skills, page })
    return NextResponse.json({ opportunities: results })
  }

  const results = await searchOpportunities({ city, skills, page })
  return NextResponse.json({ opportunities: results })
}
