import FadeIn from "./FadeIn"

const CONTRIBUTIONS = [
  "Teaching",
  "Planting Trees",
  "Helping Communities",
  "Mentoring Youth",
  "Restoring Ecosystems",
  "Caring for the Elderly",
  "Building Shelters",
  "Preserving Culture",
  "Supporting Mental Health",
  "Feeding the Hungry",
]

export default function IdeaSection() {
  return (
    <section className="bg-[#050508] py-28 md:py-40 px-6">
      <div className="max-w-5xl mx-auto text-center">

        <FadeIn>
          <p className="text-[#C96BCF] text-[11px] tracking-[0.45em] uppercase font-medium mb-5">
            The Idea
          </p>
          <h2
            className="text-[#F5F5F7] font-thin leading-tight tracking-tight mb-8"
            style={{ fontSize: "clamp(1.9rem, 4vw, 4.2rem)" }}
          >
            What If Contribution<br />Was the Economy?
          </h2>
          <p className="text-[#86868B] text-lg font-light leading-relaxed max-w-lg mx-auto mb-20">
            Every hour someone contributes to society can generate real
            value — recognized, rewarded, and permanently remembered.
          </p>
        </FadeIn>

        <FadeIn delay={200}>
          <div className="flex flex-wrap justify-center gap-3">
            {CONTRIBUTIONS.map((item) => (
              <span
                key={item}
                className="px-5 py-2.5 rounded-full border border-[#18181f] text-[#3a3a4a] text-[13px] font-light
                           hover:border-[rgba(201,107,207,0.3)] hover:text-[#86868B] transition-all duration-300 cursor-default"
              >
                {item}
              </span>
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
