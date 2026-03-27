import Link from "next/link"

export default function NavBar() {
  return (
    <nav className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-8 md:px-12 py-7">
      <Link href="/" className="text-[#F5F5F7] text-lg font-semibold tracking-tight">
        RASA
      </Link>

      <div className="hidden md:flex items-center gap-8 text-[13px] font-light text-[#86868B]">
        <Link href="#how-it-works" className="hover:text-[#F5F5F7] transition-colors duration-200">
          How It Works
        </Link>
        <Link href="#organizations" className="hover:text-[#F5F5F7] transition-colors duration-200">
          For Organizations
        </Link>
      </div>

      <div className="flex items-center gap-2">
        <Link
          href="/login"
          className="px-4 py-2 text-[13px] font-light text-[#86868B] hover:text-[#F5F5F7] transition-colors duration-200"
        >
          Sign In
        </Link>
        <Link
          href="/register"
          className="px-5 py-2 rounded-full text-[13px] font-light text-[#F5F5F7]
                     bg-white/[0.07] border border-white/[0.1]
                     hover:bg-white/[0.12] transition-all duration-200"
        >
          Join RASA
        </Link>
      </div>
    </nav>
  )
}
