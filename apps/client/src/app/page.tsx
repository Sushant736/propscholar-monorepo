import { PropScholarNavbar } from "@/components/PropScholarNavbar";
import { HeroSection } from "@/components/HeroSection";
import { GoogleGeminiEffectDemo } from "@/components/PropScholarGeminiWrapper";
import { PlatformShowcase } from "@/components/PlatformShowcase";
import { EvaluationRules } from "@/components/EvaluationRules";
import { DiscordCommunity } from "@/components/DiscordCommunity";
import { BentoGrid, BentoCard } from "@/components/magicui/bento-grid";
import { Users, Trophy, Zap, Target, TrendingUp } from "lucide-react";

export default function Home() {
  return (
    <div className='min-h-screen bg-background scroll-smooth'>
      <PropScholarNavbar />
      <HeroSection />

      {/* New sections below hero */}
      <GoogleGeminiEffectDemo />
      <PlatformShowcase />
      <EvaluationRules />
      <DiscordCommunity />

      {/* Additional sections for testing scroll behavior */}
      <section className='relative min-h-screen bg-gradient-to-b from-prop-scholar-deep-navy to-slate-900 p-8 overflow-hidden'>
        {/* Hi-tech animated background */}
        <div className='pointer-events-none absolute inset-0 z-0'>
          <div className='absolute left-1/4 top-1/4 w-1/2 h-1/2 bg-gradient-to-tr from-prop-scholar-electric-blue/20 to-prop-scholar-royal-blue/10 rounded-full blur-3xl animate-pulse' />
          <div className='absolute right-0 bottom-0 w-1/3 h-1/3 bg-gradient-to-br from-prop-scholar-amber-yellow/10 to-prop-scholar-electric-blue/10 rounded-full blur-2xl animate-pulse' />
        </div>
        <div className='relative z-10 max-w-6xl mx-auto'>
          <h2 className='text-4xl font-bold text-prop-scholar-main-text mb-8 text-center drop-shadow-[0_2px_16px_rgba(36,107,253,0.15)]'>
            Features & Benefits
          </h2>
          <BentoGrid className='grid-cols-1 md:grid-cols-3 gap-6 md:auto-rows-[22rem]'>
            <BentoCard
              name='Active Community'
              className='col-span-1 row-span-1 bg-white/10 dark:bg-white/5 backdrop-blur-xl border border-prop-scholar-electric-blue/30 shadow-[0_4px_32px_0_rgba(36,107,253,0.08)] hover:shadow-[0_8px_48px_0_rgba(36,107,253,0.18)] transition-all duration-300 group'
              background={
                <div className='absolute inset-0 bg-prop-scholar-electric-blue/10' />
              }
              Icon={(props) => (
                <Users
                  {...props}
                  className='h-14 w-14 text-prop-scholar-electric-blue drop-shadow-[0_0_16px_rgba(36,107,253,0.7)] brightness-150 animate-pulse-slow'
                />
              )}
              description={
                <>
                  Join{" "}
                  <span className='font-bold text-prop-scholar-electric-blue'>
                    15,000+ active traders
                  </span>{" "}
                  and get real-time support, mentorship, and networking
                  opportunities. <br />
                  <span className='text-prop-scholar-main-text font-semibold'>
                    Collaborate, learn, and grow together.
                  </span>
                </>
              }
              href='#community'
              cta='Meet the Community'
            />
            <BentoCard
              name='Success Stories'
              className='col-span-1 row-span-1 bg-white/10 dark:bg-white/5 backdrop-blur-xl border border-prop-scholar-amber-yellow/30 shadow-[0_4px_32px_0_rgba(253,186,36,0.08)] hover:shadow-[0_8px_48px_0_rgba(253,186,36,0.18)] transition-all duration-300 group'
              background={
                <div className='absolute inset-0 bg-prop-scholar-amber-yellow/10' />
              }
              Icon={(props) => (
                <Trophy
                  {...props}
                  className='h-14 w-14 text-prop-scholar-amber-yellow drop-shadow-[0_0_16px_rgba(253,186,36,0.7)] brightness-150 animate-pulse-slow'
                />
              )}
              description={
                <>
                  <span className='font-bold text-prop-scholar-amber-yellow'>
                    500+ traders funded
                  </span>{" "}
                  and counting. <br />
                  Read inspiring journeys and discover how PropScholar has
                  transformed lives.
                  <br />
                  <span className='text-prop-scholar-main-text font-semibold'>
                    Your success story could be next!
                  </span>
                </>
              }
              href='#success'
              cta='See Stories'
            />
            <BentoCard
              name='Live Signals'
              className='col-span-1 row-span-1 bg-white/10 dark:bg-white/5 backdrop-blur-xl border border-green-400/30 shadow-[0_4px_32px_0_rgba(34,197,94,0.08)] hover:shadow-[0_8px_48px_0_rgba(34,197,94,0.18)] transition-all duration-300 group'
              background={<div className='absolute inset-0 bg-green-400/10' />}
              Icon={(props) => (
                <Zap
                  {...props}
                  className='h-14 w-14 text-green-400 drop-shadow-[0_0_16px_rgba(34,197,94,0.7)] brightness-150 animate-pulse-slow'
                />
              )}
              description={
                <>
                  <span className='font-bold text-green-400'>
                    24/7 live trading signals
                  </span>{" "}
                  from verified experts.
                  <br />
                  Never miss a market opportunity with instant alerts and
                  actionable insights.
                  <br />
                  <span className='text-prop-scholar-main-text font-semibold'>
                    Stay ahead of the curve.
                  </span>
                </>
              }
              href='#signals'
              cta='Get Signals'
            />
            <BentoCard
              name='Trading Signals'
              className='col-span-2 row-span-1 bg-white/10 dark:bg-white/5 backdrop-blur-xl border border-prop-scholar-royal-blue/30 shadow-[0_4px_32px_0_rgba(36,107,253,0.08)] hover:shadow-[0_8px_48px_0_rgba(36,107,253,0.18)] transition-all duration-300 group'
              background={
                <div className='absolute inset-0 bg-prop-scholar-royal-blue/10' />
              }
              Icon={(props) => (
                <Target
                  {...props}
                  className='h-14 w-14 text-prop-scholar-royal-blue drop-shadow-[0_0_16px_rgba(36,107,253,0.7)] brightness-150 animate-pulse-slow'
                />
              )}
              description={
                <>
                  <span className='font-bold text-prop-scholar-royal-blue'>
                    Real-time trading alerts
                  </span>{" "}
                  and actionable insights.
                  <br />
                  Get notified instantly about high-probability setups and
                  market moves.
                  <br />
                  <span className='text-prop-scholar-main-text font-semibold'>
                    Maximize your trading edge.
                  </span>
                </>
              }
              href='#trading'
              cta='View Alerts'
            />
            <BentoCard
              name='Market Analysis'
              className='col-span-1 row-span-1 bg-white/10 dark:bg-white/5 backdrop-blur-xl border border-prop-scholar-main-text/30 shadow-[0_4px_32px_0_rgba(30,41,59,0.08)] hover:shadow-[0_8px_48px_0_rgba(30,41,59,0.18)] transition-all duration-300 group'
              background={
                <div className='absolute inset-0 bg-prop-scholar-main-text/10' />
              }
              Icon={(props) => (
                <TrendingUp
                  {...props}
                  className='h-14 w-14 text-prop-scholar-main-text drop-shadow-[0_0_16px_rgba(30,41,59,0.7)] brightness-150 animate-pulse-slow'
                />
              )}
              description={
                <>
                  <span className='font-bold text-prop-scholar-main-text'>
                    Daily market breakdowns
                  </span>{" "}
                  and educational content.
                  <br />
                  Learn from in-depth analysis, webinars, and expert commentary.
                  <br />
                  <span className='text-prop-scholar-electric-blue font-semibold'>
                    Upgrade your trading knowledge.
                  </span>
                </>
              }
              href='#analysis'
              cta='See Analysis'
            />
          </BentoGrid>
        </div>
      </section>

      <section className='min-h-screen bg-gradient-to-b from-slate-900 to-prop-scholar-deep-navy p-8'>
        <div className='max-w-4xl mx-auto text-center'>
          <h2 className='text-4xl font-bold text-prop-scholar-main-text mb-8'>
            Why Choose Prop Scholar?
          </h2>
          <div className='space-y-8'>
            <div className='bg-white/5 rounded-xl p-8'>
              <h3 className='text-2xl font-semibold text-prop-scholar-electric-blue mb-4'>
                Expert Analysis
              </h3>
              <p className='text-prop-scholar-secondary-text text-lg'>
                Get detailed insights and analysis from experienced prop
                traders.
              </p>
            </div>
            <div className='bg-white/5 rounded-xl p-8'>
              <h3 className='text-2xl font-semibold text-prop-scholar-amber-yellow mb-4'>
                Proven Strategies
              </h3>
              <p className='text-prop-scholar-secondary-text text-lg'>
                Learn from successful trading strategies that actually work.
              </p>
            </div>
            <div className='bg-white/5 rounded-xl p-8'>
              <h3 className='text-2xl font-semibold text-prop-scholar-electric-blue mb-4'>
                Community Support
              </h3>
              <p className='text-prop-scholar-secondary-text text-lg'>
                Join a community of like-minded traders working towards the same
                goals.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
