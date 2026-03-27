import FadeIn from "./FadeIn"

export default function FutureSection() {
  return (
    <section className="relative bg-[#030305] py-40 md:py-56 px-6 overflow-hidden">

      {/* Centered ambient glow */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
                   w-[700px] h-[350px] pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(201,107,207,0.055) 0%, transparent 65%)",
          animation: "slow-pulse 10s ease-in-out infinite",
        }}
        aria-hidden="true"
      />

      <div className="max-w-4xl mx-auto text-center relative">
        <FadeIn>
          <p className="text-[#C96BCF] text-[11px] tracking-[0.45em] uppercase font-medium mb-8">
            The Future
          </p>
          <h2
            className="text-[#F5F5F7] font-thin leading-[1.05] tracking-tight mb-10"
            style={{ fontSize: "clamp(2rem, 5vw, 5.5rem)" }}
          >
            The Economy<br />After Automation
          </h2>
          <p className="text-[#4a4a5a] text-xl font-light leading-relaxed max-w-xl mx-auto mb-6">
            A society where contribution matters more than employment.
          </p>
          <p className="text-[#252530] text-lg font-light leading-relaxed max-w-lg mx-auto">
            Where people earn recognition for making the world better —
            not just for showing up to work.
          </p>
        </FadeIn>
      </div>
    </section>
  )
}
