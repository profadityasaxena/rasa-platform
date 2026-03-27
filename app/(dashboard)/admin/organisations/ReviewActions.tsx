"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Button from "@/components/ui/Button"

interface Props {
  requestId: string
}

export default function ReviewActions({ requestId }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState<"approved" | "rejected" | null>(null)
  const [notes, setNotes] = useState("")
  const [open, setOpen] = useState(false)
  const [decision, setDecision] = useState<"approved" | "rejected" | null>(null)

  async function submit(d: "approved" | "rejected") {
    setLoading(d)
    const res = await fetch(`/api/organization-requests/${requestId}/review`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ decision: d, reviewNotes: notes }),
    })
    setLoading(null)
    if (res.ok) {
      router.refresh()
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-xs text-[#1E4FA1] hover:underline font-medium"
      >
        Review →
      </button>
    )
  }

  return (
    <div className="flex flex-col gap-2 min-w-[220px]">
      <textarea
        className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 resize-none h-16 focus:outline-none focus:border-[#1E4FA1]"
        placeholder="Notes (optional)"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />
      <div className="flex gap-2">
        <button
          onClick={() => submit("approved")}
          disabled={loading !== null}
          className="flex-1 text-xs bg-[#4CAF50] text-white rounded-lg py-1.5 font-medium hover:bg-[#43a047] disabled:opacity-50 transition-colors"
        >
          {loading === "approved" ? "…" : "Approve"}
        </button>
        <button
          onClick={() => submit("rejected")}
          disabled={loading !== null}
          className="flex-1 text-xs bg-[#D62828] text-white rounded-lg py-1.5 font-medium hover:bg-[#b71c1c] disabled:opacity-50 transition-colors"
        >
          {loading === "rejected" ? "…" : "Reject"}
        </button>
        <button
          onClick={() => setOpen(false)}
          className="text-xs text-gray-400 hover:text-gray-600 px-1"
        >
          ✕
        </button>
      </div>
    </div>
  )
}
