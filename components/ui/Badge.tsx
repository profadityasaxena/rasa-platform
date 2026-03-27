type Variant = "default" | "primary" | "success" | "warning" | "danger" | "info"

interface BadgeProps {
  children: React.ReactNode
  variant?: Variant
  className?: string
}

const variantClasses: Record<Variant, string> = {
  default: "bg-gray-100 text-gray-700",
  primary: "bg-[#f3e8f4] text-[#8b3d92]",
  success: "bg-[#e6f9f2] text-[#2d8a67]",
  warning: "bg-[#fff8e0] text-[#8a6d00]",
  danger: "bg-[#fde8e8] text-[#9b1c1c]",
  info: "bg-[#e8f0fc] text-[#1e4fa1]",
}

export default function Badge({ children, variant = "default", className = "" }: BadgeProps) {
  return (
    <span
      className={[
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variantClasses[variant],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </span>
  )
}
