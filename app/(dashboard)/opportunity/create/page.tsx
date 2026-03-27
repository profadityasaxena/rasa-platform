"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Card, CardHeader, CardTitle } from "@/components/ui/Card"
import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"
import Textarea from "@/components/ui/Textarea"
import Select from "@/components/ui/Select"
import { createOpportunitySchema } from "@/modules/opportunity/validators"

type FormData = z.infer<typeof createOpportunitySchema>

const SKILL_OPTIONS = [
  "Teaching", "Mentoring", "Coding", "Design", "Writing", "Photography",
  "Cooking", "First Aid", "Carpentry", "Translation", "Music", "Sports",
]

export default function CreateOpportunityPage() {
  const router = useRouter()
  const [orgs, setOrgs] = useState<{ id: string; name: string }[]>([])
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [serverError, setServerError] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/organizations")
      .then((r) => r.json())
      .then(({ organizations }) => setOrgs(organizations ?? []))
  }, [])

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(createOpportunitySchema) })

  function toggleSkill(s: string) {
    setSelectedSkills((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]))
  }

  async function onSubmit(data: FormData) {
    setServerError(null)
    const payload = { ...data, skills: selectedSkills }
    const res = await fetch("/api/opportunities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    if (res.ok) {
      router.push("/opportunity")
    } else {
      const json = await res.json()
      setServerError(json.error ?? "Failed to create mission.")
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" onClick={() => router.back()} size="sm">← Back</Button>
        <h1 className="text-2xl font-bold text-[#1F2937]">Create Mission</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Card>
          <CardHeader><CardTitle>Basic information</CardTitle></CardHeader>
          <div className="space-y-4">
            {orgs.length > 0 && (
              <Select
                label="Organisation"
                options={orgs.map((o) => ({ value: o.id, label: o.name }))}
                error={errors.organizationId?.message}
                {...register("organizationId")}
              />
            )}
            <Input
              label="Mission title"
              placeholder="Beach clean-up in Cascais"
              error={errors.title?.message}
              {...register("title")}
            />
            <Textarea
              label="Description"
              placeholder="Describe the mission, requirements, and what volunteers will do…"
              error={errors.description?.message}
              {...register("description")}
            />
          </div>
        </Card>

        <Card>
          <CardHeader><CardTitle>Location</CardTitle></CardHeader>
          <p className="text-xs text-gray-400 -mt-1 mb-3">
            Enter a real address — coordinates are resolved automatically.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Street (optional)"
              placeholder="Rua do Ouro, 123"
              className="col-span-2"
              {...register("location.street")}
            />
            <Input
              label="City"
              placeholder="Lisbon"
              error={errors.location?.city?.message}
              {...register("location.city")}
            />
            <Input
              label="Province / State (optional)"
              placeholder="Lisboa"
              {...register("location.province")}
            />
            <Input
              label="Postal Code (optional)"
              placeholder="1100-001"
              {...register("location.postalCode")}
            />
            <Input
              label="Country (optional)"
              placeholder="Portugal"
              {...register("location.country")}
            />
          </div>
        </Card>

        <Card>
          <CardHeader><CardTitle>Schedule</CardTitle></CardHeader>
          <div className="grid grid-cols-3 gap-4">
            <Input
              label="Date"
              type="date"
              error={errors.schedule?.date?.message}
              {...register("schedule.date")}
            />
            <Input
              label="Start time"
              type="time"
              error={errors.schedule?.startTime?.message}
              {...register("schedule.startTime")}
            />
            <Input
              label="End time"
              type="time"
              error={errors.schedule?.endTime?.message}
              {...register("schedule.endTime")}
            />
          </div>
        </Card>

        <Card>
          <CardHeader><CardTitle>Skills needed</CardTitle></CardHeader>
          <div className="flex flex-wrap gap-2">
            {SKILL_OPTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => toggleSkill(s)}
                className={[
                  "px-3 py-1.5 rounded-full text-sm border transition-colors",
                  selectedSkills.includes(s)
                    ? "bg-[#C96BCF] text-white border-[#C96BCF]"
                    : "bg-white text-[#1F2937] border-gray-200 hover:border-[#C96BCF]",
                ].join(" ")}
              >
                {s}
              </button>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader><CardTitle>Capacity &amp; Duration</CardTitle></CardHeader>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Volunteer capacity"
              type="number"
              placeholder="20"
              hint="Maximum number of volunteers"
              error={errors.capacity?.message}
              {...register("capacity", { valueAsNumber: true })}
            />
            <Input
              label="Estimated duration (minutes)"
              type="number"
              placeholder="120"
              hint="Expected work time per volunteer"
              error={errors.estimatedDurationMinutes?.message}
              {...register("estimatedDurationMinutes", { valueAsNumber: true })}
            />
          </div>
          <p className="text-xs text-gray-400 mt-3 bg-gray-50 rounded-lg px-3 py-2">
            Credits are automatically calculated by the platform based on verified participation time.
            Volunteers earn 1 credit per minute of confirmed attendance.
          </p>
        </Card>

        {serverError && (
          <p className="text-sm text-[#D62828] bg-[#fde8e8] rounded-lg px-3 py-2">{serverError}</p>
        )}

        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" loading={isSubmitting}>Create Mission</Button>
        </div>
      </form>
    </div>
  )
}
