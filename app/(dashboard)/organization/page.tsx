"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Building2, Users, CheckCircle } from "lucide-react"
import { Card, CardHeader, CardTitle } from "@/components/ui/Card"
import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"
import Textarea from "@/components/ui/Textarea"
import Badge from "@/components/ui/Badge"
import Spinner from "@/components/ui/Spinner"
import { updateOrganizationSchema } from "@/modules/organization/validators"
import { ORG_TYPE_LABELS } from "@/modules/organization/types"
import type { OrganizationDTO } from "@/modules/organization/types"

type UpdateOrgForm = z.infer<typeof updateOrganizationSchema>

const STATUS_VARIANT: Record<string, "success" | "warning" | "danger"> = {
  active: "success",
  pending_approval: "warning",
  suspended: "danger",
}

export default function OrganizationPage() {
  const [orgs, setOrgs] = useState<OrganizationDTO[]>([])
  const [selected, setSelected] = useState<OrganizationDTO | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateOrgForm>({ resolver: zodResolver(updateOrganizationSchema) })

  async function load() {
    const res = await fetch("/api/organizations")
    const json = await res.json()
    const list: OrganizationDTO[] = json.organizations ?? []
    setOrgs(list)
    if (list.length > 0) {
      setSelected(list[0])
      populateForm(list[0])
    }
    setLoading(false)
  }

  function populateForm(org: OrganizationDTO) {
    reset({
      name: org.name ?? "",
      description: org.description ?? "",
      mission: org.mission ?? "",
      website: org.website ?? "",
      contactEmail: org.contactEmail ?? "",
      contactPhone: org.contactPhone ?? "",
    })
  }

  useEffect(() => { load() }, [])

  async function onSave(data: UpdateOrgForm) {
    if (!selected) return
    setSaving(true)
    setSaved(false)
    setServerError(null)
    const res = await fetch(`/api/organizations/${selected.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    setSaving(false)
    if (res.ok) {
      const json = await res.json()
      setSelected(json.organization)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } else {
      const json = await res.json()
      setServerError(json.error ?? "Save failed.")
    }
  }

  if (loading) {
    return <div className="flex justify-center py-20"><Spinner size="lg" /></div>
  }

  if (orgs.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-[#1F2937]">Organisation</h1>
        <Card className="text-center py-12">
          <Building2 className="mx-auto text-gray-300 mb-3" size={40} />
          <p className="text-gray-500 mb-2">Your organisation is not yet linked to this account.</p>
          <p className="text-sm text-gray-400 mb-6">
            If your organisation has been approved, contact your platform administrator
            to link your account. New organisations must submit a registration request.
          </p>
          <a
            href="/register/organization"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1E4FA1] text-white text-sm font-medium hover:bg-[#183d81] transition-colors"
          >
            Submit Organisation Request
          </a>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1F2937]">Organisation Profile</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your organisation&apos;s public profile and contact information.</p>
      </div>

      {orgs.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {orgs.map((org) => (
            <button
              key={org.id}
              onClick={() => { setSelected(org); populateForm(org) }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                selected?.id === org.id
                  ? "bg-[#1E4FA1] text-white border-[#1E4FA1]"
                  : "bg-white text-gray-700 border-gray-200 hover:border-[#1E4FA1]"
              }`}
            >
              {org.name}
            </button>
          ))}
        </div>
      )}

      {selected && (
        <>
          <div className="flex items-center gap-3">
            <Building2 size={20} className="text-gray-400" />
            <div>
              <p className="font-semibold text-[#1F2937]">{selected.name}</p>
              <p className="text-xs text-gray-400">
                {ORG_TYPE_LABELS[selected.type] ?? selected.type}
              </p>
            </div>
            <Badge variant={STATUS_VARIANT[selected.status] ?? "default"}>
              {selected.status.replace("_", " ")}
            </Badge>
          </div>

          <form onSubmit={handleSubmit(onSave)} className="space-y-6">
            <Card>
              <CardHeader><CardTitle>Basic Information</CardTitle></CardHeader>
              <div className="space-y-4 mt-3">
                <Input
                  label="Organisation name"
                  error={errors.name?.message}
                  {...register("name")}
                />
                <Textarea
                  label="Description"
                  placeholder="Describe your organisation's work."
                  error={errors.description?.message}
                  {...register("description")}
                />
                <Textarea
                  label="Mission / Purpose"
                  placeholder="Your organisation's core mission statement."
                  error={errors.mission?.message}
                  {...register("mission")}
                />
                <Input
                  label="Website"
                  placeholder="https://example.org"
                  error={errors.website?.message}
                  {...register("website")}
                />
              </div>
            </Card>

            <Card>
              <CardHeader><CardTitle>Contact Information</CardTitle></CardHeader>
              <div className="space-y-4 mt-3">
                <Input
                  label="Contact email"
                  type="email"
                  placeholder="contact@organisation.org"
                  error={errors.contactEmail?.message}
                  {...register("contactEmail")}
                />
                <Input
                  label="Contact phone"
                  placeholder="+351 912 345 678"
                  error={errors.contactPhone?.message}
                  {...register("contactPhone")}
                />
              </div>
            </Card>

            {serverError && (
              <p className="text-sm text-[#D62828] bg-[#fde8e8] rounded-lg px-3 py-2">{serverError}</p>
            )}

            <div className="flex items-center gap-3">
              <Button type="submit" loading={saving}>
                Save Profile
              </Button>
              {saved && (
                <span className="flex items-center gap-1 text-sm text-[#4CAF50]">
                  <CheckCircle size={14} /> Saved
                </span>
              )}
            </div>
          </form>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Users size={16} className="text-gray-400" />
                <CardTitle>Team Members</CardTitle>
              </div>
            </CardHeader>
            <p className="text-sm text-gray-500 mt-2">
              Team member management is coming soon. To invite colleagues, contact your platform administrator.
            </p>
          </Card>
        </>
      )}
    </div>
  )
}
