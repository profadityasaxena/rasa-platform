import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { createOpportunity, findOpportunitiesByOrg, listOpenOpportunities } from "@/modules/opportunity/repository"
import { createOpportunitySchema } from "@/modules/opportunity/validators"
import { findOrgsByAdminUserId } from "@/modules/organization/repository"
import { geocodeAddress } from "@/adapters/maps/google"

async function resolveCoords(location: {
  street?: string; city: string; province?: string; postalCode?: string; country?: string
}): Promise<{ lat: number; lng: number; address?: string }> {
  const parts = [location.street, location.city, location.province, location.postalCode, location.country]
    .filter(Boolean).join(", ")
  const result = await geocodeAddress(parts)
  if (result) return { lat: result.lat, lng: result.lng, address: result.formattedAddress }
  return { lat: 0, lng: 0 }
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const orgId = searchParams.get("orgId")
  const city = searchParams.get("city") ?? undefined
  const page = parseInt(searchParams.get("page") ?? "1", 10)

  if (orgId) {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const opps = await findOpportunitiesByOrg(orgId)
    return NextResponse.json({ opportunities: opps })
  }

  const opps = await listOpenOpportunities({ city, page })
  return NextResponse.json({ opportunities: opps })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const body = await req.json()
    const parsed = createOpportunitySchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    // Verify user admins the org
    const orgs = await findOrgsByAdminUserId(session.user.id)
    const orgIds = orgs.map((o) => o.id)
    if (!orgIds.includes(parsed.data.organizationId)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const coords = await resolveCoords(parsed.data.location)
    const opportunity = await createOpportunity({
      ...parsed.data,
      location: { ...parsed.data.location, ...coords },
    })
    return NextResponse.json({ opportunity }, { status: 201 })
  } catch (err) {
    console.error("Create opportunity error:", err)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
