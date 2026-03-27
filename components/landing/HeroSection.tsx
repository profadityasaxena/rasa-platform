import Link from "next/link"
import NavBar from "./NavBar"

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col bg-[#050508]">

      {/* Ambient light — top purple glow */}
      <div
        className="absolute inset-0 overflow-hidden pointer-events-none"
        aria-hidden="true"
      >
        <div
          className="absolute -top-[160px] left-1/2 -translate-x-1/2 w-[900px] h-[700px]"
          style={{
            background:
              "radial-gradient(ellipse at top, rgba(201,107,207,0.11) 0%, transparent 65%)",
            animation: "slow-pulse 8s ease-in-out infinite",
          }}
        />
        <div
          className="absolute top-1/3 right-[-80px] w-[500px] h-[500px]"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(30,79,161,0.07) 0%, transparent 60%)",
          }}
        />
      </div>

      <NavBar />

      {/* Hero content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-24 pb-36 text-center">

        {/* Eyebrow label */}
        <p
          className="text-[#C96BCF] text-[11px] tracking-[0.45em] uppercase font-medium mb-10"
          style={{ animation: "fade-in-up 0.7s ease-out 0.1s both" }}
        >
          A New Economic System
        </p>

        {/* Headline */}
        <h1
          className="text-[#F5F5F7] font-thin leading-[1.03] tracking-[-0.025em] mb-10"
          style={{
            fontSize: "clamp(2.8rem, 6.5vw, 7.5rem)",
            animation: "fade-in-up 0.8s ease-out 0.2s both",
          }}
        >
          A New Economy<br />
          for Human<br />
          Contribution
        </h1>

        {/* Sub-headline */}
        <p
          className="text-[#86868B] font-light leading-relaxed max-w-xl mx-auto mb-5"
          style={{
            fontSize: "clamp(1.1rem, 2vw, 1.35rem)",
            animation: "fade-in-up 0.8s ease-out 0.35s both",
          }}
        >
          When machines do the work,<br className="hidden md:block" />
          humans can spend their time making the world better.
        </p>

        {/* Supporting copy */}
        <p
          className="text-[#86868B] text-[14px] font-light max-w-sm mx-auto mb-14 leading-relaxed"
          style={{ animation: "fade-in-up 0.8s ease-out 0.45s both" }}
        >
          RASA transforms human contribution into value using
          time credits and contribution memories.
        </p>

        {/* CTAs */}
        <div
          className="flex items-center justify-center gap-4 flex-wrap"
          style={{ animation: "fade-in-up 0.8s ease-out 0.55s both" }}
        >
          <Link
            href="/register"
            className="px-9 py-3.5 rounded-full bg-[#C96BCF] text-white text-[14px] font-medium tracking-wide
                       hover:bg-[#d47fda] active:scale-[0.97] transition-all duration-200
                       shadow-[0_0_32px_rgba(201,107,207,0.25)]"
          >
            Join the Movement
          </Link>
          <Link
            href="#how-it-works"
            className="px-9 py-3.5 rounded-full border border-[#252530] text-[#F5F5F7] text-[14px] font-light tracking-wide
                       hover:border-[#38384a] hover:bg-white/[0.03] transition-all duration-200"
          >
            How It Works
          </Link>
        </div>
      </div>

      {/* Scroll cue */}
      <div
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        style={{ animation: "fade-in 1s ease-out 1.2s both" }}
        aria-hidden="true"
      >
        <div className="w-px h-10 bg-gradient-to-b from-transparent to-[#252530]" />
      </div>
    </section>
  )
}
