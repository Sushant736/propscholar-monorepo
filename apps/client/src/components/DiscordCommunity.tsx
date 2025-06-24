"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { MessageCircle, Users, Zap, Trophy, Target, TrendingUp } from "lucide-react";

// Discord Icon Component
const DiscordIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
  </svg>
);

const CommunityLampContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-slate-900 to-prop-scholar-deep-navy w-full z-0",
        className
      )}
    >
      <div className="relative flex w-full flex-1 scale-y-125 items-center justify-center isolate z-0">
        {/* Left lamp beam */}
        <motion.div
          initial={{ opacity: 0.5, width: "15rem" }}
          whileInView={{ opacity: 1, width: "30rem" }}
          transition={{
            delay: 0.3,
            duration: 0.8,
            ease: "easeInOut",
          }}
          style={{
            backgroundImage: `conic-gradient(var(--conic-position), var(--tw-gradient-stops))`,
          }}
          className="absolute inset-auto right-1/2 h-56 overflow-visible w-[30rem] bg-gradient-conic from-prop-scholar-royal-blue via-transparent to-transparent text-white [--conic-position:from_70deg_at_center_top]"
        >
          <div className="absolute w-[100%] left-0 bg-gradient-to-t from-slate-900 to-prop-scholar-deep-navy h-40 bottom-0 z-20 [mask-image:linear-gradient(to_top,white,transparent)]" />
          <div className="absolute w-40 h-[100%] left-0 bg-gradient-to-r from-slate-900 to-prop-scholar-deep-navy bottom-0 z-20 [mask-image:linear-gradient(to_right,white,transparent)]" />
        </motion.div>

        {/* Right lamp beam */}
        <motion.div
          initial={{ opacity: 0.5, width: "15rem" }}
          whileInView={{ opacity: 1, width: "30rem" }}
          transition={{
            delay: 0.3,
            duration: 0.8,
            ease: "easeInOut",
          }}
          style={{
            backgroundImage: `conic-gradient(var(--conic-position), var(--tw-gradient-stops))`,
          }}
          className="absolute inset-auto left-1/2 h-56 w-[30rem] bg-gradient-conic from-transparent via-transparent to-prop-scholar-royal-blue text-white [--conic-position:from_290deg_at_center_top]"
        >
          <div className="absolute w-40 h-[100%] right-0 bg-gradient-to-l from-slate-900 to-prop-scholar-deep-navy bottom-0 z-20 [mask-image:linear-gradient(to_left,white,transparent)]" />
          <div className="absolute w-[100%] right-0 bg-gradient-to-t from-slate-900 to-prop-scholar-deep-navy h-40 bottom-0 z-20 [mask-image:linear-gradient(to_top,white,transparent)]" />
        </motion.div>

        {/* Blur effects */}
        <div className="absolute top-1/2 h-48 w-full translate-y-12 scale-x-150 bg-gradient-to-b from-slate-900 to-prop-scholar-deep-navy blur-2xl"></div>
        <div className="absolute top-1/2 z-50 h-48 w-full bg-transparent opacity-10 backdrop-blur-md"></div>
        
        {/* Discord royal blue glow */}
        <div className="absolute inset-auto z-50 h-36 w-[28rem] -translate-y-1/2 rounded-full bg-prop-scholar-royal-blue opacity-50 blur-3xl"></div>
        <motion.div
          initial={{ width: "8rem" }}
          whileInView={{ width: "16rem" }}
          transition={{
            delay: 0.3,
            duration: 0.8,
            ease: "easeInOut",
          }}
          className="absolute inset-auto z-30 h-36 w-64 -translate-y-[6rem] rounded-full bg-prop-scholar-electric-blue blur-2xl"
        ></motion.div>

        {/* Main light beam */}
        <motion.div
          initial={{ width: "15rem" }}
          whileInView={{ width: "30rem" }}
          transition={{
            delay: 0.3,
            duration: 0.8,
            ease: "easeInOut",
          }}
          className="absolute inset-auto z-50 h-0.5 w-[30rem] -translate-y-[7rem] bg-prop-scholar-electric-blue"
        ></motion.div>

        <div className="absolute inset-auto z-40 h-44 w-full -translate-y-[12.5rem] bg-gradient-to-b from-slate-900 to-prop-scholar-deep-navy"></div>
      </div>

      <div className="relative z-50 flex -translate-y-80 flex-col items-center px-5">
        {children}
      </div>
    </div>
  );
};

export const DiscordCommunity = ({ className }: { className?: string }) => {
  const communityStats = [
    { icon: Users, label: "Active Members", value: "15,000+", color: "text-prop-scholar-electric-blue" },
    { icon: MessageCircle, label: "Daily Messages", value: "2,500+", color: "text-prop-scholar-royal-blue" },
    { icon: Trophy, label: "Success Stories", value: "500+", color: "text-prop-scholar-amber-yellow" },
    { icon: Zap, label: "Live Signals", value: "24/7", color: "text-green-400" },
  ];

  const features = [
    { icon: Target, title: "Trading Signals", description: "Real-time trading alerts from verified traders" },
    { icon: TrendingUp, title: "Market Analysis", description: "Daily market breakdowns and educational content" },
    { icon: Users, title: "Community Support", description: "Get help from experienced prop traders" },
    { icon: Trophy, title: "Success Sharing", description: "Celebrate wins and learn from funded traders" },
  ];

  return (
    <section className={cn("relative mt-20", className)}>
      <CommunityLampContainer>
        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0.5, y: 100 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.3,
            duration: 0.8,
            ease: "easeInOut",
          }}
          className="text-center max-w-5xl mx-auto"
        >
          {/* Discord Icon with Glow */}
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-prop-scholar-royal-blue rounded-full blur-3xl opacity-30 scale-150"></div>
            <motion.div
              initial={{ scale: 0.8, rotate: -10 }}
              whileInView={{ scale: 1, rotate: 0 }}
              transition={{
                delay: 0.5,
                duration: 0.6,
                ease: "easeOut",
              }}
              className="relative bg-prop-scholar-royal-blue/20 backdrop-blur-sm border border-prop-scholar-electric-blue/30 rounded-3xl p-8 w-fit mx-auto"
            >
              <DiscordIcon className="h-20 w-20 text-prop-scholar-electric-blue" />
            </motion.div>
          </div>

          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.4,
              duration: 0.8,
              ease: "easeInOut",
            }}
            className="text-4xl md:text-6xl lg:text-7xl font-black mb-6"
          >
            <span className="bg-gradient-to-r from-prop-scholar-royal-blue via-prop-scholar-electric-blue to-prop-scholar-main-text bg-clip-text text-transparent">
              Join Our Elite
            </span>
            <br />
            <span className="text-prop-scholar-amber-yellow">Trading Community</span>
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.6,
              duration: 0.8,
              ease: "easeInOut",
            }}
            className="text-lg md:text-xl text-prop-scholar-secondary-text max-w-3xl mx-auto leading-relaxed mb-12"
          >
            Connect with <span className="text-prop-scholar-electric-blue font-semibold">15,000+ traders</span> in our exclusive Discord community. 
            Get real-time signals, market analysis, and support from funded prop traders.
          </motion.p>

          {/* Stats Grid */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.8,
              duration: 0.8,
              ease: "easeInOut",
            }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12"
          >
            {communityStats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{
                  delay: 0.9 + index * 0.1,
                  duration: 0.5,
                  ease: "easeOut",
                }}
                className="bg-white/5 border border-prop-scholar-electric-blue/20 rounded-2xl p-6 text-center backdrop-blur-sm"
              >
                <stat.icon className={`h-8 w-8 mx-auto mb-3 ${stat.color}`} />
                <div className={`text-2xl font-bold ${stat.color} mb-1`}>{stat.value}</div>
                <div className="text-sm text-prop-scholar-secondary-text">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{
              delay: 1.2,
              duration: 0.6,
              ease: "easeOut",
            }}
            className="mb-16"
          >
            <motion.button
              whileHover={{ 
                scale: 1.05, 
                boxShadow: "0 0 50px rgba(36, 107, 253, 0.5)",
              }}
              whileTap={{ scale: 0.95 }}
              className="group relative bg-gradient-to-r from-prop-scholar-royal-blue to-prop-scholar-electric-blue hover:from-prop-scholar-electric-blue hover:to-prop-scholar-royal-blue px-12 py-6 rounded-2xl font-bold text-xl text-white shadow-[0_0_30px_rgba(36,107,253,0.4)] transition-all duration-300 flex items-center gap-4 mx-auto"
            >
              <DiscordIcon className="h-8 w-8" />
              <span>Join Discord Community</span>
              <motion.div
                className="absolute inset-0 rounded-2xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                initial={false}
              />
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Features Grid - Outside lamp area */}
      </CommunityLampContainer>

      {/* Features Section */}
      <div className="relative py-20 bg-gradient-to-b from-prop-scholar-deep-navy to-slate-900">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="text-center mb-16"
          >
            <h3 className="text-3xl md:text-4xl font-bold text-prop-scholar-main-text mb-4">
              What You&apos;ll Get Inside
            </h3>
            <p className="text-prop-scholar-secondary-text text-lg">
              Exclusive benefits for PropScholar Discord members
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{
                  delay: index * 0.1,
                  duration: 0.6,
                  ease: "easeOut",
                }}
                className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-prop-scholar-electric-blue/20 rounded-2xl p-6 text-center hover:border-prop-scholar-electric-blue/40 transition-all duration-300"
              >
                <div className="bg-prop-scholar-royal-blue/20 rounded-xl p-4 w-fit mx-auto mb-4">
                  <feature.icon className="h-8 w-8 text-prop-scholar-electric-blue" />
                </div>
                <h4 className="text-xl font-bold text-prop-scholar-main-text mb-3">
                  {feature.title}
                </h4>
                <p className="text-prop-scholar-secondary-text text-sm leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}; 