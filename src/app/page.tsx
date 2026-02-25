import { Navbar } from "@/components/marketing/navbar";
import { HeroSection } from "@/components/marketing/hero";
import { FeaturesSection } from "@/components/marketing/features-section";
import { PricingSection } from "@/components/marketing/pricing-section";
import { TestimonialsSection } from "@/components/marketing/testimonials-section";
import { CtaSection } from "@/components/marketing/cta-section";
import { Footer } from "@/components/marketing/footer";
import { CookieConsent } from "@/components/shared/cookie-consent";
import { ChatWidget } from "@/components/shared/chat-widget";

// ---------------------------------------------------------------------------
// Marketing landing page (server component)
// ---------------------------------------------------------------------------

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section – above the fold CTA */}
        <HeroSection />

        {/* Features breakdown */}
        <FeaturesSection />

        {/* Pricing tiers */}
        <PricingSection />

        {/* Social proof */}
        <TestimonialsSection />

        {/* Final call to action */}
        <CtaSection />
      </main>

      <Footer />

      {/* Overlays rendered at the bottom so they sit on top */}
      <CookieConsent />
      <ChatWidget />
    </div>
  );
}
