import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { MongoDBAdapter } from "@auth/mongodb-adapter"
import clientPromise from "@/lib/db/mongodb"
import { loginSchema } from "@/modules/identity/validators"
import { verifyCredentials } from "@/modules/identity/service"
import { authConfig } from "@/auth.config"
import type { UserRole } from "@/lib/db/models/user.model"

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,

  adapter: MongoDBAdapter(clientPromise),

  // Override the Credentials provider stub from authConfig with the real implementation
  providers: [
    ...authConfig.providers.filter((p) => {
      const id = (p as { id?: string }).id
      return id !== "credentials"
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials)
        if (!parsed.success) return null
        const user = await verifyCredentials(parsed.data.email, parsed.data.password)
        return user
      },
    }),
  ],

  session: {
    // IMPORTANT: Must be "jwt" — the Credentials provider always issues a JWT cookie.
    // Using "database" causes a silent loop: the JWT cookie is issued on login but
    // the database strategy tries to look it up as a session token → finds nothing
    // → returns null session → user is redirected back to /login.
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },

  callbacks: {
    // Persist role and id in the JWT on sign-in.
    // Called during sign-in (user is available) and on every subsequent request (user is undefined).
    async jwt({ token, user }) {
      if (user) {
        token.id   = user.id
        token.role = (user as { role?: UserRole }).role
      }
      return token
    },

    // Build the session object from the JWT token.
    // With JWT strategy, `token` holds the claims; `user` is undefined (no DB lookup per-request).
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id   = token.id   as string
        session.user.role = (token.role as UserRole) ?? "volunteer"
      }
      return session
    },

    async signIn({ user, account }) {
      if (account?.type === "oauth")       return true
      if (account?.type === "credentials") return !!user
      return true
    },
  },

  pages: {
    signIn: "/login",
    error:  "/login",
  },
})

// ── Type extensions ────────────────────────────────────────────────────────

declare module "next-auth" {
  interface Session {
    user: {
      id:     string
      role:   UserRole
      email:  string
      name?:  string | null
      image?: string | null
    }
  }
  interface User {
    role?: UserRole
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id?:   string
    role?: UserRole
  }
}
