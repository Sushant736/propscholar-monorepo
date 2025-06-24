import { PropScholarNavbar } from "@/components/PropScholarNavbar";
import { HeroSection } from "@/components/HeroSection";
import { GoogleGeminiEffectDemo } from "@/components/PropScholarGeminiWrapper";
import { PlatformShowcase } from "@/components/PlatformShowcase";
import { EvaluationRules } from "@/components/EvaluationRules";
import { DiscordCommunity } from "@/components/DiscordCommunity";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <PropScholarNavbar />
      <HeroSection />
      
      {/* New sections below hero */}
      <GoogleGeminiEffectDemo />
      <PlatformShowcase />
      <EvaluationRules />
      <DiscordCommunity />
      
      {/* Additional sections for testing scroll behavior */}
      <section className="min-h-screen bg-gradient-to-b from-prop-scholar-deep-navy to-slate-900 p-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-prop-scholar-main-text mb-8 text-center">
            Features & Benefits
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white/10 rounded-xl p-6 backdrop-blur-sm">
                <h3 className="text-xl font-semibold text-prop-scholar-main-text mb-4">
                  Feature {i}
                </h3>
                <p className="text-prop-scholar-secondary-text">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      <section className="min-h-screen bg-gradient-to-b from-slate-900 to-prop-scholar-deep-navy p-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-prop-scholar-main-text mb-8">
            Why Choose Prop Scholar?
          </h2>
          <div className="space-y-8">
            <div className="bg-white/5 rounded-xl p-8">
              <h3 className="text-2xl font-semibold text-prop-scholar-electric-blue mb-4">
                Expert Analysis
              </h3>
              <p className="text-prop-scholar-secondary-text text-lg">
                Get detailed insights and analysis from experienced prop traders.
              </p>
            </div>
            <div className="bg-white/5 rounded-xl p-8">
              <h3 className="text-2xl font-semibold text-prop-scholar-amber-yellow mb-4">
                Proven Strategies
              </h3>
              <p className="text-prop-scholar-secondary-text text-lg">
                Learn from successful trading strategies that actually work.
              </p>
            </div>
            <div className="bg-white/5 rounded-xl p-8">
              <h3 className="text-2xl font-semibold text-prop-scholar-electric-blue mb-4">
                Community Support
              </h3>
              <p className="text-prop-scholar-secondary-text text-lg">
                Join a community of like-minded traders working towards the same goals.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
