import FadeIn from "./FadeIn"

const MEMORIES = [
  { label: "Beach Clean-Up",    color: "#C96BCF" },
  { label: "After-School Tutor", color: "#5ED3A5" },
  { label: "Garden Day",         color: "#1E4FA1" },
  { label: "Food Bank",          color: "#FFD60A" },
  { label: "Tree Planting",      color: "#5ED3A5" },
  { label: "Cultural Festival",  color: "#C96BCF" },
]

export default function WalletSection() {
  return (
    <section className="bg-[#050508] py-28 md:py-40 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 lg:gap-16 items-center">

          {/* Left — copy */}
          <FadeIn>
            <p className="text-[#C96BCF] text-[11px] tracking-[0.45em] uppercase font-medium mb-5">
              Your Wallet
            </p>
            <h2
              className="text-[#F5F5F7] font-thin leading-tight tracking-tight mb-8"
              style={{ fontSize: "clamp(2rem, 4vw, 4rem)" }}
            >
              Your Contribution<br />Wallet
            </h2>
            <p className="text-[#86868B] text-lg font-light leading-relaxed mb-12">
              Every participant receives a personal wallet. Inside, two distinct types of value.
            </p>

            <div className="space-y-7">
              <div className="flex items-start gap-5">
                <div className="w-0.5 h-12 bg-[#C96BCF] rounded-full flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-[#F5F5F7] text-[15px] font-light mb-1">Time Credits</p>
                  <p className="text-[#3a3a4a] text-[13px] font-light leading-relaxed">
                    Fungible. Spendable. Earnable. Your time made liquid — usable across the RASA ecosystem.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-5">
                <div className="w-0.5 h-12 bg-[#5ED3A5] rounded-full flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-[#F5F5F7] text-[15px] font-light mb-1">Contribution Memories</p>
                  <p className="text-[#3a3a4a] text-[13px] font-light leading-relaxed">
                    Non-fungible. Permanent. A record of every mission you completed — your lasting legacy.
                  </p>
                </div>
              </div>
            </div>
          </FadeIn>

          {/* Right — wallet card mockup */}
          <FadeIn delay={150}>
            <div className="flex items-center justify-center">
              <div className="relative w-[300px] sm:w-[340px]">

                {/* Glow behind card */}
                <div
                  className="absolute -inset-4 rounded-[3rem] blur-3xl opacity-25"
                  style={{
                    background: "linear-gradient(135deg, #C96BCF 0%, #1E4FA1 100%)",
                  }}
                  aria-hidden="true"
                />

                {/* Card */}
                <div
                  className="relative rounded-[2rem] p-8"
                  style={{
                    background:
                      "linear-gradient(145deg, rgba(201,107,207,0.07) 0%, rgba(30,79,161,0.05) 100%)",
                    border: "1px solid rgba(255,255,255,0.055)",
                    boxShadow:
                      "0 32px 64px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.04)",
                  }}
                >
                  {/* Card header */}
                  <div className="flex items-center justify-between mb-10">
                    <span className="text-[10px] tracking-[0.35em] uppercase text-[#2e2e3e] font-medium">
                      RASA Wallet
                    </span>
                    <div
                      className="w-7 h-7 rounded-full"
                      style={{
                        background:
                          "radial-gradient(circle at 35% 35%, #e08ce6, #C96BCF)",
                      }}
                    />
                  </div>

                  {/* Credits balance */}
                  <div className="mb-10">
                    <p className="text-[10px] tracking-[0.3em] uppercase text-[#22222e] mb-2">
                      Time Credits
                    </p>
                    <p className="text-[#F5F5F7] text-5xl font-thin tracking-tight leading-none">
                      1,240
                    </p>
                  </div>

                  {/* Memory tokens */}
                  <div>
                    <p className="text-[10px] tracking-[0.3em] uppercase text-[#22222e] mb-4">
                      Memories
                    </p>
                    <div className="flex gap-2.5 flex-wrap">
                      {MEMORIES.map((m) => (
                        <div
                          key={m.label}
                          className="w-9 h-9 rounded-xl flex items-center justify-center text-[10px]"
                          style={{
                            backgroundColor: `${m.color}14`,
                            border: `1px solid ${m.color}30`,
                            color: m.color,
                          }}
                          title={m.label}
                          aria-label={m.label}
                        >
                          ◆
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  )
}
