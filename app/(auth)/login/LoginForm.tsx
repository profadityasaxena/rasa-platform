"use client"

import { useState, Suspense } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { z } from "zod"
import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"
import { SEED_ACCOUNTS, SEED_PASSWORD } from "@/lib/debug/seed-accounts"

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
})
type FormData = z.infer<typeof schema>

function LoginFormInner({ debugMode }: { debugMode: boolean }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard"
  const [serverError, setServerError] = useState<string | null>(null)
  const [debugOpen, setDebugOpen] = useState(false)
  const [quickLoginLoading, setQuickLoginLoading] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  async function onSubmit(data: FormData) {
    setServerError(null)
    const result = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    })
    if (!result?.ok) {
      setServerError("Invalid email or password.")
      return
    }
    const target = callbackUrl.startsWith("http")
      ? new URL(callbackUrl).pathname
      : callbackUrl
    router.push(target)
    router.refresh()
  }

  async function handleOAuth(provider: "google" | "microsoft-entra-id") {
    await signIn(provider, { redirectTo: callbackUrl })
  }

  async function handleQuickLogin(email: string) {
    setQuickLoginLoading(email)
    setServerError(null)
    const result = await signIn("credentials", {
      email,
      password: SEED_PASSWORD,
      redirect: false,
    })
    setQuickLoginLoading(null)
    if (!result?.ok) {
      setServerError(`Quick login failed for ${email}`)
      return
    }
    router.push("/dashboard")
    router.refresh()
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
      <h2 className="text-xl font-semibold text-[#1F2937] mb-6">Sign in to your account</h2>

      {/* OAuth buttons */}
      <div className="flex flex-col gap-3 mb-6">
        <button
          onClick={() => handleOAuth("google")}
          className="flex items-center justify-center gap-3 w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-[#1F2937] hover:bg-gray-50 transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615Z" fill="#4285F4"/>
            <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
            <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/>
            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>
        <button
          onClick={() => handleOAuth("microsoft-entra-id")}
          className="flex items-center justify-center gap-3 w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-[#1F2937] hover:bg-gray-50 transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 21 21" fill="none">
            <rect x="1" y="1" width="9" height="9" fill="#F35325"/>
            <rect x="11" y="1" width="9" height="9" fill="#81BC06"/>
            <rect x="1" y="11" width="9" height="9" fill="#05A6F0"/>
            <rect x="11" y="11" width="9" height="9" fill="#FFBA08"/>
          </svg>
          Continue with Microsoft
        </button>
      </div>

      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-xs text-gray-400 uppercase">
          <span className="bg-white px-2">or</span>
        </div>
      </div>

      {/* Email / password form */}
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
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
          error={errors.password?.message}
          {...register("password")}
        />

        {serverError && (
          <p className="text-sm text-[#D62828] bg-[#fde8e8] rounded-lg px-3 py-2">{serverError}</p>
        )}

        <Button type="submit" fullWidth loading={isSubmitting}>
          Sign in
        </Button>
      </form>

      <div className="mt-6 flex flex-col items-center gap-1 text-sm text-gray-500">
        <Link href="/register" className="text-[#C96BCF] hover:underline font-medium">
          Create an account
        </Link>
        <Link href="/reset-password" className="hover:text-gray-700">
          Forgot password?
        </Link>
      </div>

      {/* ── Debug quick-login panel (only in debug/dev mode) ── */}
      {debugMode && (
        <div className="mt-6 border border-dashed border-amber-300 rounded-xl bg-amber-50 overflow-hidden">
          <button
            onClick={() => setDebugOpen((o) => !o)}
            className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-semibold text-amber-700 hover:bg-amber-100 transition-colors"
          >
            <span>🛠 Test Accounts (debug mode)</span>
            <span className="text-amber-500">{debugOpen ? "▲" : "▼"}</span>
          </button>

          {debugOpen && (
            <div className="px-3 pb-3 flex flex-col gap-1.5">
              {SEED_ACCOUNTS.map((account) => (
                <button
                  key={account.email}
                  onClick={() => handleQuickLogin(account.email)}
                  disabled={quickLoginLoading !== null}
                  className="w-full text-left flex items-center justify-between rounded-lg px-3 py-2 bg-white border border-amber-200 hover:border-amber-400 hover:bg-amber-50 transition-colors disabled:opacity-50 disabled:cursor-wait"
                >
                  <div>
                    <p className="text-xs font-medium text-gray-800">{account.name}</p>
                    <p className="text-[10px] text-gray-400">{account.email}</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-block text-[10px] font-mono bg-gray-100 text-gray-500 rounded px-1.5 py-0.5">
                      {account.role}
                    </span>
                    {quickLoginLoading === account.email && (
                      <p className="text-[10px] text-amber-600 mt-0.5">signing in…</p>
                    )}
                  </div>
                </button>
              ))}
              <p className="text-[10px] text-amber-600 text-center pt-1">
                Password for all accounts: <span className="font-mono font-semibold">Rasa1234!</span>
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function LoginForm({ debugMode }: { debugMode: boolean }) {
  return (
    <Suspense>
      <LoginFormInner debugMode={debugMode} />
    </Suspense>
  )
}
