/**
 * Canonical list of debug/test seed accounts.
 * Used by the seed script, auto-seeder, and login page debug panel.
 * Every role defined in the system has one account.
 */

export interface SeedAccount {
  email: string
  name: string
  role: string
  password: string
  description: string
  walletBalance: number
}

export const SEED_PASSWORD = "Rasa1234!"

export const SEED_ACCOUNTS: SeedAccount[] = [
  {
    email: "admin@rasa.dev",
    name: "Platform Admin",
    role: "platform_admin",
    password: SEED_PASSWORD,
    description: "Full platform access, user management, system settings",
    walletBalance: 0,
  },
  {
    email: "moderator@rasa.dev",
    name: "Platform Moderator",
    role: "platform_moderator",
    password: SEED_PASSWORD,
    description: "Content moderation, review flagged items",
    walletBalance: 0,
  },
  {
    email: "support@rasa.dev",
    name: "Platform Support",
    role: "platform_support",
    password: SEED_PASSWORD,
    description: "User support, account assistance",
    walletBalance: 0,
  },
  {
    email: "analyst@rasa.dev",
    name: "Platform Analyst",
    role: "platform_analyst",
    password: SEED_PASSWORD,
    description: "Read-only analytics and reporting access",
    walletBalance: 0,
  },
  {
    email: "ngo@rasa.dev",
    name: "NGO Manager",
    role: "ngo_admin",
    password: SEED_PASSWORD,
    description: "NGO admin — create missions, review applications",
    walletBalance: 0,
  },
  {
    email: "fieldrep@rasa.dev",
    name: "Field Representative",
    role: "field_rep",
    password: SEED_PASSWORD,
    description: "On-site QR generation and check-in management",
    walletBalance: 0,
  },
  {
    email: "volunteer@rasa.dev",
    name: "Ana Volunteer",
    role: "volunteer",
    password: SEED_PASSWORD,
    description: "Volunteer with completed profile — 150 credits",
    walletBalance: 150,
  },
  {
    email: "partner@rasa.dev",
    name: "Partner Admin",
    role: "reward_partner",
    password: SEED_PASSWORD,
    description: "Reward partner — manages marketplace offers",
    walletBalance: 0,
  },
]
