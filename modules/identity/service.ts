import { findUserByEmail, createUser, verifyPassword } from "./repository"
import type { RegisterInput } from "./validators"
import type { RegisterResult } from "./types"

// Called by NextAuth Credentials provider authorize()
export async function verifyCredentials(email: string, password: string) {
  const user = await findUserByEmail(email)
  if (!user) return null
  if (user.status === "suspended") return null

  const valid = await verifyPassword(user._id.toString(), password)
  if (!valid) return null

  // Return the user object NextAuth expects
  return {
    id: user._id.toString(),
    email: user.email,
    name: user.name,
    image: user.image,
    role: user.role,
  }
}

// Called by the registration API route
export async function registerUser(input: RegisterInput): Promise<RegisterResult> {
  try {
    const user = await createUser({
      email: input.email,
      name: input.name,
      password: input.password,
      role: input.role,
    })

    return { success: true, userId: user._id.toString() }
  } catch (err) {
    if (err instanceof Error) {
      if (err.message === "EMAIL_EXISTS") {
        return { success: false, error: "An account with this email already exists." }
      }
    }
    console.error("Registration error:", err)
    return { success: false, error: "Registration failed. Please try again." }
  }
}
