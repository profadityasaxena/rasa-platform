import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { getBalance, getLedgerHistory, transferCredits } from "@/modules/ledger/service"
import { z } from "zod"

const transferSchema = z.object({
  toUserId: z.string().min(1),
  amount: z.number().int().min(1).max(500),
})

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const includeHistory = req.nextUrl.searchParams.get("history") === "true"
  const [balance, history] = await Promise.all([
    getBalance(session.user.id),
    includeHistory ? getLedgerHistory(session.user.id) : Promise.resolve([]),
  ])

  return NextResponse.json({ balance, history })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const body = await req.json()
    const parsed = transferSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }
    const result = await transferCredits({
      fromUserId: session.user.id,
      toUserId: parsed.data.toUserId,
      amount: parsed.data.amount,
    })
    if (!result.success) return NextResponse.json({ error: result.error }, { status: 400 })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Transfer error:", err)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
