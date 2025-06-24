"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { FlickeringGrid } from "@/components/magicui/flickering-grid";
import { ArrowRight, TrendingUp, Shield, Zap } from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.3,
      staggerChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { y: 50, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 12,
    },
  },
};

const fadeInUp = {
  hidden: { opacity: 0, y: 60 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 80,
      damping: 20,
    },
  },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 15,
    },
  },
};

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-prop-scholar-deep-navy via-slate-900 to-prop-scholar-deep-navy">
      {/* Flickering Grid Background with Subtle Shadow */}
      <div className="absolute inset-0">
        <FlickeringGrid
          className="z-0 opacity-40"
          squareSize={4}
          gridGap={6}
          color="rgb(36, 107, 253)"
          maxOpacity={0.2}
          flickerChance={0.1}
        />
        {/* Subtle backdrop shadow */}
        <div className="absolute inset-0 bg-gradient-to-t from-prop-scholar-deep-navy/80 via-transparent to-prop-scholar-deep-navy/60 z-10" />
      </div>

      {/* Main Content */}
      <motion.div
        className="relative z-20 max-w-7xl mx-auto px-4 py-20 text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Badge */}
        <motion.div
          variants={scaleIn}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-prop-scholar-royal-blue/20 border border-prop-scholar-royal-blue/30 text-prop-scholar-electric-blue text-sm font-medium mb-8 backdrop-blur-sm"
        >
          <Zap className="h-4 w-4" />
          <span>Revolutionary Prop Trading Platform</span>
        </motion.div>

        {/* Main Heading */}
        <motion.h1
          variants={itemVariants}
          className="text-5xl md:text-7xl lg:text-8xl font-black mb-8 leading-tight"
        >
          <span className="bg-gradient-to-r from-white via-prop-scholar-electric-blue to-prop-scholar-royal-blue bg-clip-text text-transparent">
            Master Prop Trading
          </span>
          <br />
          <span className="text-prop-scholar-main-text">
            Pay{" "}
            <span className="bg-gradient-to-r from-prop-scholar-amber-yellow to-orange-400 bg-clip-text text-transparent">
              4x Less
            </span>
          </span>
        </motion.h1>

        {/* Tagline */}
        <motion.p
          variants={fadeInUp}
          className="text-xl md:text-2xl text-prop-scholar-secondary-text max-w-4xl mx-auto mb-12 leading-relaxed"
        >
          Pass our comprehensive evaluations and we&apos;ll cover the difference. 
          <br className="hidden md:block" />
          <span className="text-prop-scholar-electric-blue font-semibold">
            Transform your trading career with proven strategies and reduced costs.
          </span>
        </motion.p>

        {/* Stats */}
        <motion.div
          variants={fadeInUp}
          className="flex flex-col md:flex-row items-center justify-center gap-8 mb-12"
        >
          {[
            { icon: TrendingUp, label: "Success Rate", value: "89%" },
            { icon: Shield, label: "Traders Approved", value: "2,500+" },
            { icon: Zap, label: "Average Savings", value: "$2,400" },
          ].map((stat, index) => (
            <motion.div
              key={index}
              variants={scaleIn}
              className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/5 border border-prop-scholar-royal-blue/20 backdrop-blur-sm"
            >
              <stat.icon className="h-6 w-6 text-prop-scholar-electric-blue" />
              <div className="text-left">
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-sm text-prop-scholar-secondary-text">{stat.label}</div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          variants={fadeInUp}
          className="flex flex-col sm:flex-row gap-6 justify-center items-center"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="group"
          >
            <Button
              size="lg"
              className="bg-primary-gradient hover:opacity-90 px-12 py-6 text-lg font-bold shadow-[0_0_40px_rgba(36,107,253,0.4)] hover:shadow-[0_0_60px_rgba(36,107,253,0.6)] border-0 group-hover:-translate-y-1 transition-all duration-300"
            >
              Start Your Evaluation
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              variant="outline"
              size="lg"
              className="px-12 py-6 text-lg border-2 border-prop-scholar-royal-blue/50 text-prop-scholar-secondary-text hover:text-prop-scholar-main-text hover:bg-prop-scholar-royal-blue/10 hover:border-prop-scholar-electric-blue/70 backdrop-blur-sm"
            >
              Watch Demo
            </Button>
          </motion.div>
        </motion.div>

        {/* Trust Indicators */}
        <motion.div
          variants={fadeInUp}
          className="mt-16 pt-8 border-t border-prop-scholar-secondary-text/20"
        >
          <p className="text-prop-scholar-secondary-text text-sm mb-6">
            Trusted by traders worldwide
          </p>
          <div className="flex items-center justify-center gap-8 opacity-60">
            {/* Placeholder for partner logos */}
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="w-24 h-8 bg-gradient-to-r from-prop-scholar-secondary-text/20 to-prop-scholar-secondary-text/10 rounded-lg"
              />
            ))}
          </div>
        </motion.div>
      </motion.div>

      {/* Floating Elements */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-64 h-64 bg-prop-scholar-royal-blue/10 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-prop-scholar-electric-blue/10 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
      />
    </section>
  );
} 