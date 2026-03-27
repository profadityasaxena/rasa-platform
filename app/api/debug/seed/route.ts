/**
 * POST /api/debug/seed
 * Manually re-run the debug seeder from the UI.
 * Gated: debug mode only + platform_admin role.
 */

import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { isDebugMode } from "@/lib/debug/guard"

export async function POST() {
  if (!isDebugMode) {
    return NextResponse.json({ error: "Not available" }, { status: 404 })
  }

  const session = await auth()
  if (!session?.user || (session.user as { role?: string }).role !== "platform_admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const { autoSeedDebugAccounts } = await import("@/lib/debug/auto-seed")
    await autoSeedDebugAccounts()
    return NextResponse.json({ ok: true, message: "Seed accounts refreshed." })
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 }
    )
  }
}
