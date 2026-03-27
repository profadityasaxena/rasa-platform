import FadeIn from "./FadeIn"

const CARDS = [
  {
    num: "01",
    title: "The Automation Wave",
    body: "AI and automation are rapidly replacing traditional employment across every sector of the economy.",
  },
  {
    num: "02",
    title: "The Old Measure",
    body: "Our economic systems still measure human value only through jobs and money — a model built for a different age.",
  },
  {
    num: "03",
    title: "The Invisible Value",
    body: "Millions of hours of teaching, caring, building, and healing go unrecognized and uncompensated.",
  },
]

export default function ProblemSection() {
  return (
    <section className="bg-[#070710] py-28 md:py-40 px-6">
      <div className="max-w-6xl mx-auto">

        <FadeIn>
          <p className="text-[#C96BCF] text-[11px] tracking-[0.45em] uppercase font-medium mb-5">
            The Problem
          </p>
          <h2
            className="text-[#F5F5F7] font-thin leading-tight tracking-tight mb-20 md:mb-28"
            style={{ fontSize: "clamp(2rem, 4.5vw, 4.5rem)" }}
          >
            The World Is Changing
          </h2>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-3">
          {CARDS.map((card, i) => (
            <FadeIn key={card.num} delay={i * 120}>
              <div
                className={`bg-[#070710] p-10 md:p-12 hover:bg-[#0a0a18] transition-colors duration-300 h-full
                            ${i < CARDS.length - 1 ? "border-b md:border-b-0 md:border-r border-[#12121e]" : ""}`}
              >
                <p className="text-[#1a1a28] text-6xl font-thin leading-none mb-12 select-none">
                  {card.num}
                </p>
                <h3 className="text-[#F5F5F7] text-xl font-light mb-4">{card.title}</h3>
                <p className="text-[#86868B] text-[14px] font-light leading-relaxed">{card.body}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}
