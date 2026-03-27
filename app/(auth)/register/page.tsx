"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { z } from "zod"
import { Users, Building2 } from "lucide-react"
import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must include an uppercase letter")
    .regex(/[0-9]/, "Must include a number"),
})
type FormData = z.infer<typeof schema>

type Path = "choose" | "volunteer"

export default function RegisterPage() {
  const router = useRouter()
  const [path, setPath] = useState<Path>("choose")
  const [serverError, setServerError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  async function onSubmit(data: FormData) {
    setServerError(null)
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, role: "volunteer" }),
    })
    const json = await res.json()
    if (!res.ok) {
      setServerError(json.error ?? "Registration failed.")
      return
    }
    setSuccess(true)
    setTimeout(() => router.push("/login"), 2000)
  }

  if (success) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
        <div className="text-4xl mb-3">✓</div>
        <h2 className="text-lg font-semibold text-[#1F2937] mb-1">Account created!</h2>
        <p className="text-sm text-gray-500">Redirecting you to sign in…</p>
      </div>
    )
  }

  if (path === "choose") {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <h2 className="text-xl font-semibold text-[#1F2937] mb-2">Get started with RASA</h2>
        <p className="text-sm text-gray-500 mb-8">How would you like to join the platform?</p>

        <div className="space-y-3">
          <button
            onClick={() => setPath("volunteer")}
            className="w-full flex items-start gap-4 p-4 rounded-xl border-2 border-gray-100 hover:border-[#1E4FA1] hover:bg-blue-50 transition-colors text-left group"
          >
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0 group-hover:bg-blue-200 transition-colors">
              <Users size={20} className="text-[#1E4FA1]" />
            </div>
            <div>
              <p className="font-semibold text-[#1F2937]">Register as Volunteer</p>
              <p className="text-sm text-gray-500 mt-0.5">
                Contribute to missions, earn credits, and build your impact record.
              </p>
            </div>
          </button>

          <Link
            href="/register/organization"
            className="w-full flex items-start gap-4 p-4 rounded-xl border-2 border-gray-100 hover:border-[#C96BCF] hover:bg-purple-50 transition-colors text-left group"
          >
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center shrink-0 group-hover:bg-purple-200 transition-colors">
              <Building2 size={20} className="text-[#C96BCF]" />
            </div>
            <div>
              <p className="font-semibold text-[#1F2937]">Submit Organisation Request</p>
              <p className="text-sm text-gray-500 mt-0.5">
                NGOs, corporations, governments, universities, and marketplace partners
                submit an onboarding request for platform review.
              </p>
            </div>
          </Link>
        </div>

        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link href="/login" className="text-[#C96BCF] hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    )
  }

  // Volunteer registration form
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
      <button
        onClick={() => setPath("choose")}
        className="text-sm text-gray-400 hover:text-gray-600 mb-6 flex items-center gap-1"
      >
        ← Back
      </button>
      <h2 className="text-xl font-semibold text-[#1F2937] mb-1">Create volunteer account</h2>
      <p className="text-sm text-gray-500 mb-6">Start contributing and earning credits for your time.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input
          label="Full name"
          type="text"
          placeholder="Ana Carvalho"
          error={errors.name?.message}
          {...register("name")}
        />
        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register("email")}
        />
        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          hint="Min 8 chars, one uppercase, one number"
          error={errors.password?.message}
          {...register("password")}
        />

        {serverError && (
          <p className="text-sm text-[#D62828] bg-[#fde8e8] rounded-lg px-3 py-2">{serverError}</p>
        )}

        <Button type="submit" fullWidth loading={isSubmitting}>
          Create volunteer account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        Already have an account?{" "}
        <Link href="/login" className="text-[#C96BCF] hover:underline font-medium">
          Sign in
        </Link>
      </p>
    </div>
  )
}
