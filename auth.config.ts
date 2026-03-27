/**
 * Lightweight auth config for Edge Runtime (middleware).
 * No adapter, no Node.js modules — only providers and callbacks
 * that work in the Edge Runtime.
 *
 * The full config (with MongoDB adapter) lives in auth.ts.
 */
import type { NextAuthConfig } from "next-auth"
import Google from "next-auth/providers/google"
import MicrosoftEntraId from "next-auth/providers/microsoft-entra-id"
import Credentials from "next-auth/providers/credentials"

export const authConfig: NextAuthConfig = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    MicrosoftEntraId({
      clientId: process.env.MICROSOFT_CLIENT_ID!,
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET!,
      ...(process.env.MICROSOFT_TENANT_ID && process.env.MICROSOFT_TENANT_ID !== "common"
        ? { issuer: `https://login.microsoftonline.com/${process.env.MICROSOFT_TENANT_ID}/v2.0` }
        : {}),
    }),
    // Credentials provider stub — actual validation happens in auth.ts at runtime
    Credentials({ credentials: {} }),
  ],

  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const { pathname } = nextUrl

      const PUBLIC_ROUTES = ["/", "/login", "/register", "/register/organization", "/verify-email", "/reset-password"]
      const PUBLIC_PREFIXES = ["/api/auth", "/api/organization-requests"]
      const DEBUG_PREFIXES = ["/api/debug"]

      // Block debug routes in production
      if (DEBUG_PREFIXES.some((p) => pathname.startsWith(p))) {
        if (process.env.NODE_ENV === "production" || process.env.DEBUG_MODE !== "true") {
          return false
        }
      }

      // Allow public routes and static files
      if (
        PUBLIC_ROUTES.includes(pathname) ||
        PUBLIC_PREFIXES.some((p) => pathname.startsWith(p)) ||
        pathname.startsWith("/_next") ||
        pathname.startsWith("/favicon")
      ) {
        return true
      }

      return isLoggedIn
    },
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },
}
