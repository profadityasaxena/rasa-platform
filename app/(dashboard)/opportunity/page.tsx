"use client"

import { useState, useEffect } from "react"
import { ClipboardList, Plus, MapPin, Clock, Users } from "lucide-react"
import Link from "next/link"
import { Card } from "@/components/ui/Card"
import Button from "@/components/ui/Button"
import Badge from "@/components/ui/Badge"
import Spinner from "@/components/ui/Spinner"
import Select from "@/components/ui/Select"

interface Opportunity {
  id: string
  title: string
  status: string
  location: { city: string }
  schedule: { date: string; startTime: string; endTime: string }
  capacity: number
  estimatedDurationMinutes: number
  applicationCount: number
  confirmedCount: number
}

const statusVariant: Record<string, "success" | "warning" | "danger" | "info" | "default"> = {
  open: "success",
  draft: "warning",
  in_progress: "info",
  completed: "default",
  cancelled: "danger",
}

export default function OpportunityPage() {
  const [orgs, setOrgs] = useState<{ id: string; name: string }[]>([])
  const [selectedOrgId, setSelectedOrgId] = useState("")
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch("/api/organizations")
      .then((r) => r.json())
      .then(({ organizations }) => {
        setOrgs(organizations ?? [])
        if (organizations?.length > 0) {
          setSelectedOrgId(organizations[0].id)
        }
      })
  }, [])

  useEffect(() => {
    if (!selectedOrgId) return
    setLoading(true)
    fetch(`/api/opportunities?orgId=${selectedOrgId}`)
      .then((r) => r.json())
      .then(({ opportunities }) => {
        setOpportunities(opportunities ?? [])
        setLoading(false)
      })
  }, [selectedOrgId])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#1F2937]">Missions</h1>
        <Link href="/opportunity/create">
          <Button>
            <Plus size={15} /> New Mission
          </Button>
        </Link>
      </div>

      {orgs.length > 1 && (
        <Select
          label="Organisation"
          options={orgs.map((o) => ({ value: o.id, label: o.name }))}
          value={selectedOrgId}
          onChange={(e) => setSelectedOrgId(e.target.value)}
        />
      )}

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : opportunities.length === 0 ? (
        <Card className="text-center py-12">
          <ClipboardList className="mx-auto text-gray-300 mb-3" size={40} />
          <p className="text-gray-500 mb-4">No missions yet. Create your first one.</p>
          <Link href="/opportunity/create">
            <Button>Create mission</Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-3">
          {opportunities.map((opp) => (
            <Card key={opp.id}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-[#1F2937]">{opp.title}</h3>
                    <Badge variant={statusVariant[opp.status] ?? "default"}>
                      {opp.status.replace("_", " ")}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-3 text-xs text-gray-500 mt-1">
                    <span className="flex items-center gap-1">
                      <MapPin size={11} /> {opp.location.city}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={11} /> {opp.schedule.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users size={11} /> {opp.applicationCount} applications · {opp.confirmedCount}/{opp.capacity} confirmed
                    </span>
                    <Badge variant="success">~{opp.estimatedDurationMinutes} credits</Badge>
                  </div>
                </div>
                <Link href={`/opportunity/${opp.id}`}>
                  <Button size="sm" variant="secondary">Manage</Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
