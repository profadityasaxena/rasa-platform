"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Search, MapPin, Clock, Users, Star } from "lucide-react"
import { Card } from "@/components/ui/Card"
import Badge from "@/components/ui/Badge"
import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"
import Spinner from "@/components/ui/Spinner"
import type { OpportunityWithScore } from "@/modules/discovery/service"

export default function DiscoveryPage() {
  const { data: session } = useSession()
  const isVolunteer = (session?.user as { role?: string })?.role === "volunteer"

  const [opportunities, setOpportunities] = useState<OpportunityWithScore[]>([])
  const [loading, setLoading] = useState(true)
  const [city, setCity] = useState("")
  const [applying, setApplying] = useState<string | null>(null)

  async function load(cityFilter?: string) {
    setLoading(true)
    const params = new URLSearchParams({ mode: "recommend" })
    if (cityFilter) params.set("city", cityFilter)
    const res = await fetch(`/api/discovery?${params}`)
    const json = await res.json()
    setOpportunities(json.opportunities ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function applyToMission(opportunityId: string) {
    setApplying(opportunityId)
    const res = await fetch("/api/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ opportunityId }),
    })
    setApplying(null)
    if (res.ok) {
      alert("Application submitted!")
    } else {
      const json = await res.json()
      alert(json.error ?? "Could not apply.")
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1F2937]">Find Missions</h1>
        <p className="text-sm text-gray-500 mt-1">Missions matched to your skills and location</p>
      </div>

      <div className="flex gap-3">
        <div className="flex-1">
          <Input
            placeholder="Filter by city…"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
        </div>
        <Button onClick={() => load(city)} variant="secondary">
          <Search size={15} /> Search
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : opportunities.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-gray-500">No missions found. Try a different city or complete your profile.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {opportunities.map((opp) => (
            <Card key={opp.id} className="hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-[#1F2937] truncate">{opp.title}</h3>
                    {opp.matchScore !== undefined && (
                      <Badge variant="primary">
                        <Star size={10} className="mr-0.5" />
                        {Math.round(opp.matchScore * 100)}% match
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 line-clamp-2 mb-3">{opp.description}</p>
                  <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <MapPin size={12} /> {opp.location.city}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={12} /> {opp.schedule.date} · {opp.schedule.startTime}–{opp.schedule.endTime}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users size={12} /> {opp.confirmedCount}/{opp.capacity} volunteers
                    </span>
                    <Badge variant="success">~{opp.estimatedDurationMinutes} credits</Badge>
                  </div>
                  {opp.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {opp.skills.slice(0, 4).map((s) => (
                        <Badge key={s} variant="default">{s}</Badge>
                      ))}
                    </div>
                  )}
                </div>
                {isVolunteer && (
                  <Button
                    size="sm"
                    loading={applying === opp.id}
                    onClick={() => applyToMission(opp.id)}
                  >
                    Apply
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
