"use client"

import { useState, useEffect } from "react"
import { CalendarCheck, Clock, Award } from "lucide-react"
import { Card } from "@/components/ui/Card"
import Badge from "@/components/ui/Badge"
import Spinner from "@/components/ui/Spinner"

interface Participation {
  _id: string
  status: string
  checkInAt?: string
  checkOutAt?: string
  actualHours: number
  creditsAwarded: number
  opportunityId?: {
    title?: string
    schedule?: { date?: string }
    location?: { city?: string }
  }
}

const statusVariant: Record<string, "success" | "warning" | "danger" | "info"> = {
  completed: "success",
  checked_in: "warning",
  incomplete: "danger",
}

export default function ParticipationPage() {
  const [participations, setParticipations] = useState<Participation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/participation/my")
      .then((r) => r.json())
      .then(({ participations }) => {
        setParticipations(participations ?? [])
        setLoading(false)
      })
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1F2937]">My Participation</h1>
        <p className="text-sm text-gray-500 mt-1">Your check-in history and credits earned</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : participations.length === 0 ? (
        <Card className="text-center py-12">
          <CalendarCheck className="mx-auto text-gray-300 mb-3" size={40} />
          <p className="text-gray-500">No participations yet. Apply to missions to get started.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {participations.map((p) => (
            <Card key={p._id}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-[#1F2937]">
                      {p.opportunityId?.title ?? "Mission"}
                    </h3>
                    <Badge variant={statusVariant[p.status] ?? "default"}>
                      {p.status.replace("_", " ")}
                    </Badge>
                  </div>
                  {p.opportunityId?.location?.city && (
                    <p className="text-xs text-gray-400">{p.opportunityId.location.city}</p>
                  )}
                  <div className="flex gap-4 mt-2 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Clock size={12} /> {p.actualHours}h worked
                    </span>
                    <span className="flex items-center gap-1">
                      <Award size={12} /> {p.creditsAwarded} credits
                    </span>
                  </div>
                </div>
                <div className="text-right text-xs text-gray-400">
                  {p.checkInAt && <p>In: {new Date(p.checkInAt).toLocaleTimeString()}</p>}
                  {p.checkOutAt && <p>Out: {new Date(p.checkOutAt).toLocaleTimeString()}</p>}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
