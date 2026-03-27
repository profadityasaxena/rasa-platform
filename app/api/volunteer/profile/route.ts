import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { getMyProfile, updateMyProfile } from "@/modules/volunteer/service"
import { updateVolunteerProfileSchema } from "@/modules/volunteer/validators"
import { geocodeAddress } from "@/adapters/maps/google"
import type { UpdateVolunteerProfileInput } from "@/modules/volunteer/types"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const profile = await getMyProfile(session.user.id)
  return NextResponse.json({ profile })
}

export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const body = await req.json()
    const parsed = updateVolunteerProfileSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }
    const input: UpdateVolunteerProfileInput = { ...parsed.data }
    if (input.location) {
      const parts = [input.location.street, input.location.city, input.location.province, input.location.postalCode, input.location.country]
        .filter(Boolean).join(", ")
      const geo = await geocodeAddress(parts)
      input.location = { ...input.location, lat: geo?.lat ?? 0, lng: geo?.lng ?? 0 }
    }
    const profile = await updateMyProfile(session.user.id, input)
    return NextResponse.json({ profile })
  } catch (err) {
    console.error("Volunteer profile update error:", err)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
