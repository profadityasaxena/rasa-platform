import FadeIn from "./FadeIn"

const STEPS = [
  {
    num: "1",
    label: "Publish",
    detail: "Organizations post missions with requirements, location, and credit rewards.",
  },
  {
    num: "2",
    label: "Apply",
    detail: "Matched volunteers discover and apply instantly through intelligent recommendations.",
  },
  {
    num: "3",
    label: "Verify",
    detail: "QR-based check-in confirms real, on-site participation — no guesswork.",
  },
  {
    num: "4",
    label: "Measure",
    detail: "Impact becomes visible, quantified, and shareable — in real time.",
  },
]

export default function OrganizationsSection() {
  return (
    <section id="organizations" className="bg-[#070710] py-28 md:py-40 px-6">
      <div className="max-w-6xl mx-auto">

        <FadeIn>
          <p className="text-[#C96BCF] text-[11px] tracking-[0.45em] uppercase font-medium mb-5">
            For Organizations
          </p>
          <h2
            className="text-[#F5F5F7] font-thin leading-tight tracking-tight mb-6"
            style={{ fontSize: "clamp(2rem, 4.5vw, 4.5rem)" }}
          >
            NGOs Find Volunteers<br />Instantly
          </h2>
          <p className="text-[#4a4a5a] text-lg font-light max-w-lg mb-20 md:mb-28">
            Publish missions. Attract volunteers. Verify participation. Measure impact.
          </p>
        </FadeIn>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, i) => (
            <FadeIn key={step.num} delay={i * 100}>
              <div
                className={`bg-[#070710] p-10 hover:bg-[#090918] transition-colors duration-300 h-full
                            ${i < STEPS.length - 1
                              ? "border-b sm:border-b-0 sm:border-r lg:border-r border-[#10101c] last:border-0"
                              : ""}`}
              >
                <p
                  className="text-3xl font-thin mb-6 leading-none"
                  style={{ color: "rgba(201,107,207,0.6)" }}
                >
                  {step.num}
                </p>
                <h3 className="text-[#F5F5F7] text-xl font-light mb-4">{step.label}</h3>
                <p className="text-[#3a3a4a] text-[13px] font-light leading-relaxed">{step.detail}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}
