import connectToDatabase from "@/lib/db/mongoose"
import User, { type IUser, type UserRole } from "@/lib/db/models/user.model"
import Password from "@/lib/db/models/password.model"
import bcrypt from "bcryptjs"

export async function findUserByEmail(email: string): Promise<IUser | null> {
  await connectToDatabase()
  return User.findOne({ email: email.toLowerCase(), deletedAt: null })
}

export async function findUserById(id: string): Promise<IUser | null> {
  await connectToDatabase()
  return User.findById(id)
}

export async function createUser(data: {
  email: string
  name: string
  password: string
  role: UserRole
}): Promise<IUser> {
  await connectToDatabase()

  const existing = await findUserByEmail(data.email)
  if (existing) {
    throw new Error("EMAIL_EXISTS")
  }

  const user = await User.create({
    email: data.email.toLowerCase(),
    name: data.name,
    role: data.role,
    status: "pending_verification",
  })

  // Store password separately
  const hash = await bcrypt.hash(data.password, 12)
  await Password.create({ userId: user._id, hash })

  return user
}

export async function verifyPassword(userId: string, password: string): Promise<boolean> {
  await connectToDatabase()
  const record = await Password.findOne({ userId })
  if (!record) return false
  return bcrypt.compare(password, record.hash)
}

export async function updateUserStatus(
  userId: string,
  status: "active" | "suspended" | "pending_verification"
): Promise<void> {
  await connectToDatabase()
  await User.findByIdAndUpdate(userId, { status })
}

export async function markEmailVerified(userId: string): Promise<void> {
  await connectToDatabase()
  await User.findByIdAndUpdate(userId, {
    emailVerified: new Date(),
    status: "active",
  })
}
