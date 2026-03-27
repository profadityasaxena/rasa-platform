import type { UserRole, UserStatus } from "@/lib/db/models/user.model"

export interface UserDTO {
  id: string
  email: string
  name?: string
  image?: string
  role: UserRole
  status: UserStatus
  emailVerified: boolean
  createdAt: string
}

export interface AuthUserDTO {
  id: string
  email: string
  name?: string
  role: UserRole
}

export interface RegisterResult {
  success: boolean
  userId?: string
  error?: string
}
