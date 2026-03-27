"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Card, CardHeader, CardTitle } from "@/components/ui/Card"
import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"
import Textarea from "@/components/ui/Textarea"
import Badge from "@/components/ui/Badge"
import { updateVolunteerProfileSchema } from "@/modules/volunteer/validators"
import type { z } from "zod"

type FormData = z.infer<typeof updateVolunteerProfileSchema>

const SKILL_OPTIONS = [
  "Teaching", "Mentoring", "Coding", "Design", "Writing", "Photography",
  "Cooking", "First Aid", "Carpentry", "Translation", "Music", "Sports",
  "Legal Aid", "Medical", "Social Work", "Environmental",
]

const INTEREST_OPTIONS = [
  "Education", "Environment", "Health", "Arts", "Technology", "Sports",
  "Elderly Care", "Youth Support", "Animal Welfare", "Community",
]

const DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"]
const DAY_LABELS: Record<string, string> = {
  mon: "Mon", tue: "Tue", wed: "Wed", thu: "Thu", fri: "Fri", sat: "Sat", sun: "Sun",
}

export default function VolunteerProfilePage() {
  const [profile, setProfile] = useState<FormData | null>(null)
  const [completeness, setCompleteness] = useState(0)
  const [saved, setSaved] = useState(false)
  const [skills, setSkills] = useState<string[]>([])
  const [interests, setInterests] = useState<string[]>([])

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(updateVolunteerProfileSchema) })

  useEffect(() => {
    fetch("/api/volunteer/profile")
      .then((r) => r.json())
      .then(({ profile }) => {
        if (profile) {
          setProfile(profile)
          setSkills(profile.skills ?? [])
          setInterests(profile.interests ?? [])
          setCompleteness(profile.completenessScore ?? 0)
          if (profile.bio) setValue("bio", profile.bio)
          if (profile.location) {
            if (profile.location.street)     setValue("location.street",     profile.location.street)
            if (profile.location.city)       setValue("location.city",       profile.location.city)
            if (profile.location.province)   setValue("location.province",   profile.location.province)
            if (profile.location.postalCode) setValue("location.postalCode", profile.location.postalCode)
            if (profile.location.country)    setValue("location.country",    profile.location.country)
          }
        }
      })
  }, [])

  function toggleSkill(s: string) {
    setSkills((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]))
  }

  function toggleInterest(i: string) {
    setInterests((prev) => (prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]))
  }

  async function onSubmit(data: FormData) {
    const payload = { ...data, skills, interests }
    const res = await fetch("/api/volunteer/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    const json = await res.json()
    if (res.ok) {
      setCompleteness(json.profile.completenessScore)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#1F2937]">My Profile</h1>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Profile completeness:</span>
          <Badge variant={completeness === 100 ? "success" : completeness >= 50 ? "warning" : "danger"}>
            {completeness}%
          </Badge>
        </div>
      </div>

      {completeness < 100 && (
        <div className="bg-[#fff8e0] border border-[#FFD60A] rounded-xl px-4 py-3 text-sm text-[#8a6d00]">
          Complete all 7 sections to unlock mission applications.
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Card>
          <CardHeader><CardTitle>About you</CardTitle></CardHeader>
          <div className="space-y-4">
            <Textarea
              label="Bio"
              placeholder="Tell organisations a bit about yourself…"
              hint="Up to 500 characters"
              error={errors.bio?.message}
              defaultValue={profile?.bio}
              {...register("bio")}
            />
            <p className="text-xs text-gray-400">
              Your location is used for nearby mission matching. Coordinates are resolved automatically.
            </p>
            <div className="grid grid-cols-2 gap-3">
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
          </div>
        </Card>

        <Card>
          <CardHeader><CardTitle>Skills</CardTitle></CardHeader>
          <div className="flex flex-wrap gap-2">
            {SKILL_OPTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => toggleSkill(s)}
                className={[
                  "px-3 py-1.5 rounded-full text-sm border transition-colors",
                  skills.includes(s)
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
          <CardHeader><CardTitle>Interests</CardTitle></CardHeader>
          <div className="flex flex-wrap gap-2">
            {INTEREST_OPTIONS.map((i) => (
              <button
                key={i}
                type="button"
                onClick={() => toggleInterest(i)}
                className={[
                  "px-3 py-1.5 rounded-full text-sm border transition-colors",
                  interests.includes(i)
                    ? "bg-[#1E4FA1] text-white border-[#1E4FA1]"
                    : "bg-white text-[#1F2937] border-gray-200 hover:border-[#1E4FA1]",
                ].join(" ")}
              >
                {i}
              </button>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader><CardTitle>Languages</CardTitle></CardHeader>
          <Input
            label="Languages (comma-separated)"
            placeholder="English, Portuguese, Spanish"
            {...register("languages.0")}
          />
        </Card>

        <div className="flex justify-end">
          <Button type="submit" loading={isSubmitting}>
            {saved ? "Saved ✓" : "Save profile"}
          </Button>
        </div>
      </form>
    </div>
  )
}
