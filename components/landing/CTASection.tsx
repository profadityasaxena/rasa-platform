import Link from "next/link"
import FadeIn from "./FadeIn"

export default function CTASection() {
  return (
    <section
      className="relative py-40 md:py-56 px-6 overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse 120% 70% at 50% 110%, rgba(201,107,207,0.07) 0%, #050508 55%)",
      }}
    >
      <div className="max-w-3xl mx-auto text-center">
        <FadeIn>
          <p className="text-[#C96BCF] text-[11px] tracking-[0.45em] uppercase font-medium mb-8">
            Begin
          </p>
          <h2
            className="text-[#F5F5F7] font-thin leading-tight tracking-tight mb-8"
            style={{ fontSize: "clamp(2rem, 4.5vw, 5rem)" }}
          >
            Join the First<br />Contribution Economy
          </h2>
          <p className="text-[#4a4a5a] text-lg font-light max-w-sm mx-auto mb-14 leading-relaxed">
            Become part of a movement that recognizes human contribution
            as the foundation of a new economy.
          </p>

          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link
              href="/register"
              className="px-10 py-3.5 rounded-full bg-[#C96BCF] text-white text-[14px] font-medium tracking-wide
                         hover:bg-[#d47fda] active:scale-[0.97] transition-all duration-200
                         shadow-[0_0_40px_rgba(201,107,207,0.28)]"
            >
              Join RASA
            </Link>
            <Link
              href="/discovery"
              className="px-10 py-3.5 rounded-full border border-[#252530] text-[#86868B] text-[14px] font-light tracking-wide
                         hover:border-[#38384a] hover:text-[#F5F5F7] transition-all duration-200"
            >
              Explore Missions
            </Link>
          </div>
        </FadeIn>

        {/* Footer */}
        <div className="mt-28 pt-8 border-t border-[#0d0d16]">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-[#1e1e28]">
            <span className="text-[13px] font-light tracking-tight">RASA</span>
            <span className="text-[12px] font-light">
              © {new Date().getFullYear()} RASA Platform. All rights reserved.
            </span>
            <div className="flex items-center gap-6">
              <Link href="/login"    className="text-[12px] font-light hover:text-[#555565] transition-colors duration-200">Sign In</Link>
              <Link href="/register" className="text-[12px] font-light hover:text-[#555565] transition-colors duration-200">Register</Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
