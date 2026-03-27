import { NextResponse } from "next/server"
import { listActiveOffers } from "@/modules/marketplace/service"

export async function GET() {
  const offers = await listActiveOffers()
  return NextResponse.json({ offers })
}
