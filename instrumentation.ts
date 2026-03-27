/**
 * Next.js Instrumentation Hook
 * Runs once on server startup (both dev and prod).
 * Used to auto-seed debug accounts when DEBUG_MODE=true.
 *
 * Docs: https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */

export async function register() {
  // Only auto-seed in Node.js runtime (not Edge), and only in debug mode
  if (process.env.NEXT_RUNTIME === "nodejs") {
    if (process.env.DEBUG_MODE === "true" && process.env.NODE_ENV !== "production") {
      try {
        const { autoSeedDebugAccounts } = await import("@/lib/debug/auto-seed")
        await autoSeedDebugAccounts()
      } catch (err) {
        // Non-fatal — app still starts if seeding fails (e.g. DB not yet configured)
        console.warn("[instrumentation] Auto-seed skipped:", (err as Error).message)
      }
    }
  }
}
