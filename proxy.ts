import NextAuth from "next-auth"
import { authConfig } from "@/auth.config"

// Use the lightweight Edge-safe auth config — no Node.js modules, no MongoDB adapter.
// The full auth config (auth.ts) is used only in API route handlers and server components.
export default NextAuth(authConfig).auth

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static
     * - _next/image
     * - favicon.ico
     * - public folder files
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
