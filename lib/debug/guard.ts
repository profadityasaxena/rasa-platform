// CRITICAL: Debug mode is NEVER active in production.
// This check is enforced in code — cannot be overridden by env vars alone.
export const isDebugMode =
  process.env.DEBUG_MODE === "true" && process.env.NODE_ENV !== "production"
