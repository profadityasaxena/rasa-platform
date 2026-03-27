"use client"

import { useState } from "react"
import Button from "@/components/ui/Button"

export function ReseedButton() {
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle")
  const [message, setMessage] = useState("")

  async function handleReseed() {
    setStatus("loading")
    setMessage("")
    try {
      const res = await fetch("/api/debug/seed", { method: "POST" })
      const data = await res.json()
      if (!res.ok) {
        setStatus("error")
        setMessage(data.error ?? "Unknown error")
      } else {
        setStatus("ok")
        setMessage(data.message ?? "Done.")
      }
    } catch {
      setStatus("error")
      setMessage("Network error")
    }
  }

  return (
    <div className="flex items-center gap-4">
      <Button onClick={handleReseed} loading={status === "loading"} variant="secondary">
        Re-run Seed
      </Button>
      {status === "ok" && <span className="text-sm text-green-600">{message}</span>}
      {status === "error" && <span className="text-sm text-red-600">{message}</span>}
    </div>
  )
}
