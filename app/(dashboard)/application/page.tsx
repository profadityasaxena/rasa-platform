"use client"

import { useState, useEffect } from "react"
import { ClipboardList } from "lucide-react"
import { Card } from "@/components/ui/Card"
import Badge from "@/components/ui/Badge"
import Button from "@/components/ui/Button"
import Spinner from "@/components/ui/Spinner"

interface Application {
  id: string
  opportunityId: string
  status: string
  matchScore: number
  motivation?: string
  createdAt: string
}

const statusVariant: Record<string, "success" | "warning" | "danger" | "info" | "default"> = {
  pending: "warning",
  accepted: "success",
  rejected: "danger",
  withdrawn: "default",
  attended: "success",
  no_show: "danger",
}

export default function ApplicationPage() {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [withdrawing, setWithdrawing] = useState<string | null>(null)

  async function load() {
    const res = await fetch("/api/applications")
    const json = await res.json()
    setApplications(json.applications ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function withdraw(id: string) {
    setWithdrawing(id)
    const res = await fetch(`/api/applications/${id}/withdraw`, { method: "POST" })
    setWithdrawing(null)
    if (res.ok) load()
    else alert("Could not withdraw application.")
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#1F2937]">My Applications</h1>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : applications.length === 0 ? (
        <Card className="text-center py-12">
          <ClipboardList className="mx-auto text-gray-300 mb-3" size={40} />
          <p className="text-gray-500">No applications yet. Explore missions to apply.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {applications.map((app) => (
            <Card key={app.id}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={statusVariant[app.status] ?? "default"}>
                      {app.status.replace("_", " ")}
                    </Badge>
                    <span className="text-xs text-gray-400">
                      Match: {Math.round(app.matchScore * 100)}%
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">
                    Opportunity: {app.opportunityId}
                  </p>
                  {app.motivation && (
                    <p className="text-sm text-gray-600 mt-1 line-clamp-1">{app.motivation}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    Applied: {new Date(app.createdAt).toLocaleDateString()}
                  </p>
                </div>
                {app.status === "pending" && (
                  <Button
                    size="sm"
                    variant="ghost"
                    loading={withdrawing === app.id}
                    onClick={() => withdraw(app.id)}
                  >
                    Withdraw
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
