import FadeIn from "./FadeIn"

const PILLARS = [
  {
    num: "01",
    title: "Participate",
    body: "Join missions organized by NGOs and communities around the world. Find causes that match your skills.",
    accent: "#C96BCF",
  },
  {
    num: "02",
    title: "Earn Credits",
    body: "Your time becomes fungible time credits — a new form of value that you can spend, save, or exchange.",
    accent: "#5ED3A5",
  },
  {
    num: "03",
    title: "Build Memories",
    body: "Each contribution becomes a permanent memory token — an immutable record of your impact on the world.",
    accent: "#1E4FA1",
  },
]

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="bg-[#080810] py-28 md:py-40 px-6">
      <div className="max-w-6xl mx-auto">

        <FadeIn>
          <p className="text-[#C96BCF] text-[11px] tracking-[0.45em] uppercase font-medium mb-5">
            How It Works
          </p>
          <h2
            className="text-[#F5F5F7] font-thin leading-tight tracking-tight mb-20 md:mb-28"
            style={{ fontSize: "clamp(2rem, 4.5vw, 4.5rem)" }}
          >
            Three Simple Steps
          </h2>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-12">
          {PILLARS.map((pillar, i) => (
            <FadeIn key={pillar.num} delay={i * 140}>
              <div className="flex flex-col">
                {/* Icon badge */}
                <div
                  className="w-11 h-11 rounded-2xl mb-10 flex items-center justify-center"
                  style={{
                    backgroundColor: `${pillar.accent}15`,
                    border: `1px solid ${pillar.accent}25`,
                  }}
                >
                  <span
                    className="text-[10px] font-semibold tracking-wider"
                    style={{ color: pillar.accent }}
                  >
                    {pillar.num}
                  </span>
                </div>

                <h3 className="text-[#F5F5F7] text-2xl font-thin mb-4">{pillar.title}</h3>
                <p className="text-[#4a4a5a] text-[14px] font-light leading-relaxed flex-1">
                  {pillar.body}
                </p>

                {/* Accent rule */}
                <div
                  className="mt-10 w-8 h-px"
                  style={{ backgroundColor: `${pillar.accent}40` }}
                />
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}
