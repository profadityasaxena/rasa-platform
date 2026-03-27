"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle } from "@/components/ui/Card"
import Badge from "@/components/ui/Badge"
import Spinner from "@/components/ui/Spinner"
import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"

interface LedgerEntry {
  id: string
  type: string
  amount: number
  balanceAfter: number
  description: string
  createdAt: string
}

const typeLabels: Record<string, string> = {
  credit_earned: "Earned",
  transfer_out: "Sent",
  transfer_in: "Received",
  redemption: "Redeemed",
  adjustment: "Adjusted",
}

const typeVariant: Record<string, "success" | "danger" | "info" | "default"> = {
  credit_earned: "success",
  transfer_in: "success",
  transfer_out: "danger",
  redemption: "danger",
  adjustment: "info",
}

export default function WalletPage() {
  const [balance, setBalance] = useState<number | null>(null)
  const [history, setHistory] = useState<LedgerEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [toUserId, setToUserId] = useState("")
  const [amount, setAmount] = useState("")
  const [transferring, setTransferring] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  async function load() {
    const res = await fetch("/api/wallet?history=true")
    const json = await res.json()
    setBalance(json.balance)
    setHistory(json.history ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function handleTransfer() {
    setTransferring(true)
    setMessage(null)
    const res = await fetch("/api/wallet", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ toUserId, amount: parseInt(amount, 10) }),
    })
    const json = await res.json()
    setTransferring(false)
    if (res.ok) {
      setMessage({ type: "success", text: "Transfer successful." })
      setToUserId("")
      setAmount("")
      load()
    } else {
      setMessage({ type: "error", text: json.error ?? "Transfer failed." })
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#1F2937]">Wallet</h1>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : (
        <>
          <Card className="bg-[#1E4FA1] text-white" padding="lg">
            <p className="text-sm text-white/70 uppercase tracking-wide">Time Credits</p>
            <p className="text-5xl font-bold mt-1">{balance ?? 0}</p>
            <p className="text-sm text-white/50 mt-1">credits available</p>
          </Card>

          <Card>
            <CardHeader><CardTitle>Transfer Credits</CardTitle></CardHeader>
            <div className="space-y-3">
              <Input
                label="Recipient User ID"
                placeholder="Paste user ID…"
                value={toUserId}
                onChange={(e) => setToUserId(e.target.value)}
              />
              <Input
                label="Amount (max 500/day)"
                type="number"
                placeholder="50"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              {message && (
                <p className={`text-sm px-3 py-2 rounded-lg ${
                  message.type === "success"
                    ? "bg-[#e6f9f2] text-[#2d8a67]"
                    : "bg-[#fde8e8] text-[#9b1c1c]"
                }`}>{message.text}</p>
              )}
              <Button onClick={handleTransfer} loading={transferring} disabled={!toUserId || !amount}>
                Send Credits
              </Button>
            </div>
          </Card>

          <Card>
            <CardHeader><CardTitle>Transaction History</CardTitle></CardHeader>
            {history.length === 0 ? (
              <p className="text-sm text-gray-500">No transactions yet.</p>
            ) : (
              <div className="space-y-2">
                {history.map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-[#1F2937]">{entry.description}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(entry.createdAt).toLocaleDateString()} · Balance after: {entry.balanceAfter}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant={typeVariant[entry.type] ?? "default"}>
                        {entry.amount > 0 ? "+" : ""}{entry.amount}
                      </Badge>
                      <p className="text-xs text-gray-400 mt-0.5">{typeLabels[entry.type] ?? entry.type}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  )
}
