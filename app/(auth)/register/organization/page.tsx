"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { z } from "zod"
import { CheckCircle } from "lucide-react"
import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"
import Textarea from "@/components/ui/Textarea"
import Select from "@/components/ui/Select"
import { submitOrgRequestSchema } from "@/modules/organization/validators"
import { ORG_TYPE_LABELS } from "@/modules/organization/types"

type FormData = z.infer<typeof submitOrgRequestSchema>

const ORG_TYPE_OPTIONS = Object.entries(ORG_TYPE_LABELS).map(([value, label]) => ({
  value,
  label,
}))

export default function OrganizationRequestPage() {
  const [submitted, setSubmitted] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(submitOrgRequestSchema) })

  async function onSubmit(data: FormData) {
    setServerError(null)
    const res = await fetch("/api/organization-requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    const json = await res.json()
    if (!res.ok) {
      setServerError(json.error ?? "Submission failed. Please try again.")
      return
    }
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
        <CheckCircle className="mx-auto text-[#4CAF50] mb-4" size={48} />
        <h2 className="text-lg font-semibold text-[#1F2937] mb-2">Request submitted</h2>
        <p className="text-sm text-gray-500 mb-4">
          Thank you. Our team will review your organisation request and contact
          you at the email address you provided.
        </p>
        <p className="text-sm text-gray-400">
          Questions?{" "}
          <Link href="/login" className="text-[#1E4FA1] hover:underline">
            Sign in
          </Link>{" "}
          if you already have an account.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
      <Link
        href="/register"
        className="text-sm text-gray-400 hover:text-gray-600 mb-6 flex items-center gap-1"
      >
        ← Back
      </Link>

      <h2 className="text-xl font-semibold text-[#1F2937] mb-1">Organisation Registration</h2>
      <p className="text-sm text-gray-500 mb-6">
        Submit your organisation for platform review. Once approved, you will receive
        access to complete your organisation profile and onboard your team.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Select
          label="Organisation type"
          options={ORG_TYPE_OPTIONS}
          placeholder="Select type…"
          error={errors.organizationType?.message}
          {...register("organizationType")}
        />

        <Input
          label="Organisation name"
          placeholder="e.g. Green Future Foundation"
          error={errors.name?.message}
          {...register("name")}
        />

        <Textarea
          label="Description"
          placeholder="Briefly describe your organisation's work and purpose."
          error={errors.description?.message}
          {...register("description")}
        />

        <Textarea
          label="Mission / Purpose statement"
          placeholder="What is your organisation's core mission?"
          error={errors.mission?.message}
          {...register("mission")}
        />

        <Input
          label="Website (optional)"
          placeholder="https://example.org"
          error={errors.website?.message}
          {...register("website")}
        />

        <div className="border-t border-gray-100 pt-4 mt-1">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
            Primary Contact
          </p>
          <div className="flex flex-col gap-4">
            <Input
              label="Contact name"
              placeholder="Full name of the primary contact"
              error={errors.contactName?.message}
              {...register("contactName")}
            />
            <Input
              label="Contact email"
              type="email"
              placeholder="contact@organisation.org"
              error={errors.contactEmail?.message}
              {...register("contactEmail")}
            />
            <Input
              label="Contact phone (optional)"
              placeholder="+351 912 345 678"
              error={errors.contactPhone?.message}
              {...register("contactPhone")}
            />
          </div>
        </div>

        <div className="border-t border-gray-100 pt-4 mt-1">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
            Headquarters
          </p>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="City"
              placeholder="Lisbon"
              error={errors.headquartersCity?.message}
              {...register("headquartersCity")}
            />
            <Input
              label="Country"
              placeholder="Portugal"
              error={errors.headquartersCountry?.message}
              {...register("headquartersCountry")}
            />
          </div>
        </div>

        <Textarea
          label="Why do you want to join RASA? (optional)"
          placeholder="Tell us how your organisation plans to use the platform."
          error={errors.purposeStatement?.message}
          {...register("purposeStatement")}
        />

        {serverError && (
          <p className="text-sm text-[#D62828] bg-[#fde8e8] rounded-lg px-3 py-2">{serverError}</p>
        )}

        <Button type="submit" fullWidth loading={isSubmitting}>
          Submit Organisation Request
        </Button>
      </form>

      <p className="mt-4 text-xs text-center text-gray-400">
        Already have an account?{" "}
        <Link href="/login" className="text-[#C96BCF] hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  )
}
