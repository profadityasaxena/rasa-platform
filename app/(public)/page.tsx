import type { Metadata } from "next"
import HeroSection          from "@/components/landing/HeroSection"
import ProblemSection       from "@/components/landing/ProblemSection"
import IdeaSection          from "@/components/landing/IdeaSection"
import HowItWorksSection    from "@/components/landing/HowItWorksSection"
import WalletSection        from "@/components/landing/WalletSection"
import OrganizationsSection from "@/components/landing/OrganizationsSection"
import FutureSection        from "@/components/landing/FutureSection"
import CTASection           from "@/components/landing/CTASection"

export const metadata: Metadata = {
  title: "RASA — A New Economy for Human Contribution",
  description:
    "When machines do the work, humans can spend their time making the world better. RASA transforms human contribution into value using time credits and contribution memories.",
}

export default function LandingPage() {
  return (
    <main>
      <HeroSection />
      <ProblemSection />
      <IdeaSection />
      <HowItWorksSection />
      <WalletSection />
      <OrganizationsSection />
      <FutureSection />
      <CTASection />
    </main>
  )
}
