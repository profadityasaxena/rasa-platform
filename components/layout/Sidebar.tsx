"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import {
  LayoutDashboard,
  Search,
  CalendarCheck,
  MessageSquare,
  Wallet,
  ShoppingBag,
  Users,
  Building2,
  BarChart3,
  Settings,
  LogOut,
  ClipboardList,
  Sparkles,
} from "lucide-react"

interface NavItem {
  href: string
  label: string
  icon: React.ElementType
}

const volunteerNav: NavItem[] = [
  { href: "/dashboard/volunteer", label: "Dashboard", icon: LayoutDashboard },
  { href: "/discovery", label: "Find Missions", icon: Search },
  { href: "/participation", label: "My Participation", icon: CalendarCheck },
  { href: "/feedback", label: "Feedback", icon: MessageSquare },
  { href: "/wallet", label: "Wallet", icon: Wallet },
  { href: "/marketplace", label: "Marketplace", icon: ShoppingBag },
]

const ngoAdminNav: NavItem[] = [
  { href: "/dashboard/ngo", label: "Dashboard", icon: LayoutDashboard },
  { href: "/organization", label: "Organisation", icon: Building2 },
  { href: "/opportunity", label: "Missions", icon: ClipboardList },
  { href: "/application", label: "Applications", icon: Users },
  { href: "/participation", label: "Participation", icon: CalendarCheck },
  { href: "/feedback", label: "Feedback", icon: MessageSquare },
  { href: "/gaia", label: "AI Assistant", icon: Sparkles },
]

const rewardPartnerNav: NavItem[] = [
  { href: "/dashboard/partner", label: "Dashboard", icon: LayoutDashboard },
  { href: "/organization", label: "Organisation", icon: Building2 },
  { href: "/marketplace", label: "Offers", icon: ShoppingBag },
  { href: "/wallet", label: "Ledger", icon: Wallet },
]

const adminNav: NavItem[] = [
  { href: "/dashboard/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/organisations", label: "Organisations", icon: Building2 },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/settings", label: "Settings", icon: Settings },
]

const fieldRepNav: NavItem[] = [
  { href: "/dashboard/field", label: "Dashboard", icon: LayoutDashboard },
  { href: "/participation", label: "QR Management", icon: CalendarCheck },
]

function getNav(role: string): NavItem[] {
  switch (role) {
    case "ngo_admin":      return ngoAdminNav
    case "reward_partner": return rewardPartnerNav
    case "field_rep":      return fieldRepNav
    case "platform_admin":
    case "platform_moderator":
    case "platform_support":
    case "platform_analyst":
      return adminNav
    default:
      return volunteerNav
  }
}

interface SidebarProps {
  role: string
  userName: string
  userEmail: string
}

export default function Sidebar({ role, userName, userEmail }: SidebarProps) {
  const pathname = usePathname()
  const nav = getNav(role)

  return (
    <aside className="flex flex-col w-56 bg-[#1E4FA1] text-white min-h-screen shrink-0">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/10">
        <span className="text-xl font-bold text-white tracking-tight">RASA</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {nav.map(({ href, label, icon: Icon }) => {
          const isDashboardLink = href.startsWith("/dashboard/")
          const active = pathname === href || (!isDashboardLink && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={[
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-white/20 text-white"
                  : "text-white/70 hover:bg-white/10 hover:text-white",
              ].join(" ")}
            >
              <Icon size={16} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* User section */}
      <div className="px-3 py-4 border-t border-white/10">
        <div className="px-3 mb-2">
          <p className="text-sm font-medium text-white truncate">{userName}</p>
          <p className="text-xs text-white/50 truncate">{userEmail}</p>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-3 w-full rounded-lg px-3 py-2 text-sm text-white/70 hover:bg-white/10 hover:text-white transition-colors"
        >
          <LogOut size={16} />
          Sign out
        </button>
      </div>
    </aside>
  )
}
